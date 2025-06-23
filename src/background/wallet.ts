import forge from 'node-forge';
import { Buffer } from 'buffer';
import JSONbig from 'json-bigint';
import { apiCredentials } from './background';
import { addZeros, removeZeros } from '../app/utils/utils';
import { ZANO_ASSET_ID } from '../constants';
import {
	BurnAssetDataType,
	BurnAssetParamsType,
	ionicSwapType,
	ParsedAddress,
	ParsedBalance,
	Transaction,
	TransactionRaw,
	WalletAsset,
	WalletRaw,
} from '../types';
// window.Buffer = Buffer;

interface JWTPayload {
	body_hash: string;
	user: string;
	salt: string;
	exp: number;
}

function createJWSToken(payload: JWTPayload, secretStr: string): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
	const encodedPayload = Buffer.from(JSON.stringify(payload))
		.toString('base64')
		.replace(/=/g, '');

	const signature = forge.hmac.create();
	signature.start('sha256', secretStr);
	signature.update(`${encodedHeader}.${encodedPayload}`);
	const encodedSignature = forge.util.encode64(signature.digest().getBytes()).replace(/=/g, '');

	return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function generateRandomString(length: number) {
	const bytes = forge.random.getBytesSync(Math.ceil(length / 2));
	const hexString = forge.util.bytesToHex(bytes);
	return hexString.substring(0, length);
}

function generateAccessToken(httpBody: string) {
	if (!apiCredentials?.token) {
		throw new Error('No API credentials found, extension is not connected');
	}

	// Calculate the SHA-256 hash of the HTTP body
	const md = forge.md.sha256.create();
	md.update(httpBody);
	const bodyHash = md.digest().toHex();

	// Example payload
	const payload = {
		body_hash: bodyHash,
		user: 'zano_extension',
		salt: generateRandomString(64),
		exp: Math.floor(Date.now() / 1000) + 60, // Expires in 1 minute
	};

	return createJWSToken(payload, apiCredentials?.token);
}

interface fetchDataProps {
	offset: number;
	update_provision_info: boolean;
	exclude_mining_txs: boolean;
	count: number;
	order: string;
	exclude_unconfirmed: boolean;
}

export const fetchData = async (
	method: string,
	params: string | fetchDataProps | object = {},
): Promise<Response> => {
	const httpBody: string = JSON.stringify({
		jsonrpc: '2.0',
		id: '0',
		method,
		params,
	});

	return fetch(`http://localhost:${apiCredentials.port}/json_rpc`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Zano-Access-Token': generateAccessToken(httpBody),
		},
		body: httpBody,
	});
};

const fetchTxData = async () => {
	const response = await fetchData('get_recent_txs_and_info2', {
		offset: 0,
		update_provision_info: true,
		exclude_mining_txs: true,
		count: 20,
		order: 'FROM_END_TO_BEGIN',
		exclude_unconfirmed: false,
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.text();

	return JSONbig.parse(data);
};

export const getAlias = async (address: string | fetchDataProps | object = {}) => {
	const response = await fetchData('get_alias_by_address', address);
	const data = await response.json();
	if (data.result?.status === 'OK') {
		return data.result.alias_info_list[0].alias;
	}
	return '';
};

export const getAliasDetails = async (alias: string) => {
	const response = await fetchData('get_alias_details', { alias });
	const data = await response.json();
	if (data.result.status === 'OK') {
		return data.result.alias_details.address;
	}
	return '';
};

export const getWallets = async () => {
	const response = await fetchData('mw_get_wallets');
	const data = await response.json();

	if (!data?.result?.wallets) {
		return [];
	}

	// console.log("wallets:", data.result.wallets);

	const wallets = await Promise.all(
		data.result.wallets.map(async (wallet: WalletRaw) => {
			const alias = await getAlias(wallet.wi.address);
			const balanceRaw =
				wallet.wi.balances.find((asset) => asset.asset_info.asset_id === ZANO_ASSET_ID)
					?.total || '0';

			return {
				address: wallet.wi.address,
				alias,
				balance: removeZeros(balanceRaw),
				is_watch_only: wallet.wi.is_watch_only,
				wallet_id: wallet.wallet_id,
			};
		}),
	);

	return wallets
		.filter((e) => !e.is_watch_only)
		.map((e) => {
			delete e.is_watch_only;
			return e;
		});
};

export const getWalletData = async () => {
	const addressResponse = await fetchData('getaddress');
	const addressParsed: ParsedAddress = await addressResponse.json();
	const { address } = addressParsed.result;

	const balanceResponse = await fetchData('getbalance');
	const balanceParsed: ParsedBalance = JSONbig.parse(await balanceResponse.text());

	const assets: WalletAsset[] = balanceParsed.result.balances
		.map((asset) => ({
			name: asset.asset_info.full_name,
			ticker: asset.asset_info.ticker,
			assetId: asset.asset_info.asset_id,
			decimalPoint: asset.asset_info.decimal_point,
			balance: removeZeros(asset.total, asset.asset_info.decimal_point),
			unlockedBalance: removeZeros(asset.unlocked, asset.asset_info.decimal_point),
		}))
		.sort((a, b) => {
			if (a.assetId === ZANO_ASSET_ID) return -1;
			if (b.assetId === ZANO_ASSET_ID) return 1;
			return 0;
		});

	function getAssetDecimalPoint(assetId: string): number | undefined {
		return assets.find((asset) => asset.assetId === assetId)?.decimalPoint;
	}

	const balance = removeZeros(
		balanceParsed.result.balances.find((asset) => asset.asset_info.asset_id === ZANO_ASSET_ID)
			?.total || '0',
	);

	const txDataResponse = await fetchTxData();
	const txData: TransactionRaw[] = txDataResponse.result.transfers;

	let transactions: Transaction[] = [];

	if (txData) {
		transactions = txData
			.filter((tx) => !tx.is_service)
			.map((tx) => ({
				isConfirmed: tx.height !== 0,
				txHash: tx.tx_hash,
				blobSize: tx.tx_blob_size,
				timestamp: tx.timestamp,
				height: tx.height,
				paymentId: tx.payment_id,
				comment: tx.comment,
				fee: removeZeros(tx.fee),
				addresses: tx.remote_addresses,
				isInitiator: !!tx.employed_entries?.spent?.some((e) => e?.index === 0),
				transfers: tx.subtransfers.map((transfer) => ({
					amount: removeZeros(
						transfer.amount,
						getAssetDecimalPoint(transfer.asset_id) || 12,
					),
					assetId: transfer.asset_id,
					incoming: transfer.is_income,
				})),
			}));
	}

	const alias = await getAlias(address);

	return {
		address,
		alias,
		balance,
		transactions,
		assets,
	};
};

export const ionicSwap = async (swapParams: ionicSwapType) => {
	const response = await fetchData('ionic_swap_generate_proposal', {
		proposal: {
			to_initiator: [
				{
					asset_id: swapParams.destinationAssetID,
					amount: addZeros(
						swapParams.destinationAssetAmount,
						swapParams.destinationAsset.decimal_point,
					),
				},
			],
			to_finalizer: [
				{
					asset_id: swapParams.currentAssetID,
					amount: addZeros(
						swapParams.currentAssetAmount,
						swapParams.currentAsset.decimal_point,
					),
				},
			],
			mixins: 10,
			fee_paid_by_a: 10000000000,
			expiration_time: swapParams.expirationTimestamp,
		},
		destination_address: swapParams.destinationAddress,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
};

export const ionicSwapAccept = async (swapParams: { hex_raw_proposal: unknown }) => {
	console.log(swapParams.hex_raw_proposal);

	const response = await fetchData('ionic_swap_accept_proposal', {
		hex_raw_proposal: swapParams.hex_raw_proposal,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
};

export const createAlias = async ({ alias, address }: { address: string; alias: string }) => {
	const response = await fetchData('register_alias', {
		al: {
			address,
			alias,
		},
	});
	const data = await response.json();

	return data;
};

export const transfer = async (
	assetId = ZANO_ASSET_ID,
	destination: string | undefined,
	amount: string | undefined,
	decimalPoint: number,
	comment?: string,
	destinations: { address: string; amount: number }[] = [],
) => {
	const allDestinations =
		destinations.length > 0
			? destinations.map((dest) => ({
					address: dest.address,
					amount: addZeros(
						dest.amount,
						typeof decimalPoint === 'number' ? decimalPoint : 12,
					),
					asset_id: assetId,
				}))
			: [
					{
						address: destination,
						amount: addZeros(
							String(amount),
							typeof decimalPoint === 'number' ? decimalPoint : 12,
						),
						asset_id: assetId,
					},
				];

	const options: {
		destinations: typeof allDestinations;
		fee: number;
		mixin: number;
		comment?: string;
	} = {
		destinations: allDestinations,
		fee: 10000000000,
		mixin: 10,
	};

	if (comment) options.comment = comment;

	const response = await fetchData('transfer', options);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

// TODO: move bridge address to the config
export const burnBridge = async (
	amount: string,
	destinationAddress: string,
	destinationChainId: string,
	assetId = ZANO_ASSET_ID,
) => {
	const bodyData = {
		service_id: 'B',
		instruction: 'BI',
		dst_add: destinationAddress,
		dst_net_id: destinationChainId,
		uniform_padding: '    ',
	};

	const jsonString = JSON.stringify(bodyData);
	const bytes = new TextEncoder().encode(jsonString);
	const bodyHex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

	const response = await fetchData('burn_asset', {
		fee: 10000000000,
		mixin: 15,
		service_entries_permanent: true,
		asset_id: assetId,
		burn_amount: addZeros(amount),
		service_entries: [
			{
				service_id: 'X',
				instruction: '',
				security: '',
				body: bodyHex,
				flags: 5,
			},
		],
		point_tx_to_address:
			'ZxCzikmFWMZEX8z3nojPyzcFUeEYcihX2jFvhLLYvJqtdgne2RLFd6UDaPgmzMNgDZP71E7citLPei4pLCWDjUWS1qGzMuagu',
		native_amount: 10000000000,
	});

	// console.log(response);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
};

export const signMessage = async (message: string) => {
	const base64 = Buffer.from(message).toString('base64');

	const signRequest = {
		buff: base64,
	};

	const response = await fetchData('sign_message', signRequest);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
};
export const createConnectKey = async () =>
	fetch(`http://localhost:${apiCredentials.port}/connect-api-consumer`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((r) => r.json());

export const validateConnectKey = async (key: string | undefined) =>
	fetch(`http://localhost:${apiCredentials.port}/validate-connection-key`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ key }),
	}).then((r) => r.json());

export const getSwapProposalInfo = async (hex: string | undefined) => {
	const response = await fetchData('ionic_swap_get_proposal_info', {
		hex_raw_proposal: hex,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return data;
};

export async function getWhiteList() {
	const fetchedWhiteList = await fetch('https://api.zano.org/assets_whitelist.json')
		.then((response) => response.json())
		.then((data) => data.assets);

	if (fetchedWhiteList.every((e: { asset_id: string }) => e.asset_id !== ZANO_ASSET_ID)) {
		fetchedWhiteList.push({
			asset_id: ZANO_ASSET_ID,
			ticker: 'ZANO',
			full_name: 'Zano',
			decimal_point: 12,
		});
	}

	return fetchedWhiteList;
}

export async function getAssetInfo(assetId: string) {
	const response = await fetchData('get_asset_info', { asset_id: assetId });

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return data;
}

export async function addAssetToWhitelist(assetId: string) {
	const response = await fetchData('assets_whitelist_add', {
		asset_id: assetId,
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data;
}

export const burnAsset = async ({
	assetId,
	burnAmount,
	decimalPoint = 12,
	nativeAmount = '0',
	pointTxToAddress,
	serviceEntries = [],
}: BurnAssetDataType) => {
	const params: BurnAssetParamsType = {
		asset_id: assetId,
		burn_amount: addZeros(burnAmount, decimalPoint).toFixed(0),
	};

	if (nativeAmount) {
		params.native_amount = addZeros(nativeAmount, 12).toFixed(0);
	}

	if (pointTxToAddress) {
		params.point_tx_to_address = pointTxToAddress;
	}

	if (serviceEntries.length > 0) {
		params.service_entries = serviceEntries;
	}

	const response = await fetchData('burn_asset', params);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
};
