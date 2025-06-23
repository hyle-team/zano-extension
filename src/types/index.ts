export type dispatchType = () => void;
export type destinationsType = { address: string; amount: number }[];

export type transferType = {
	id?: string;
	transfer: {
		sender: string;
		destination: string;
		destinations: destinationsType;
		amount: string;
		asset: {
			ticker: string;
		};
		comment?: string;
	};
};

type serviceEntriesType = {
	body: string;
	flags: number;
	instruction: string;
	security?: string;
	service_id: string;
};

export type BurnAssetRequestType = {
	method: string;
	assetId: string;
	amount: string;
	destinationAddress: string;
	destinationChainId: string;
	burnAmount: string;
	nativeAmount?: number;
	pointTxToAddress?: string;
	serviceEntries?: serviceEntriesType[];
};

export type SwapRequest = {
	id: string;
	swap: {
		destinationAddress: string;
		destinationAsset: string;
		destinationAssetAmount: string;
		currentAsset: string;
		currentAssetAmount: string;
	};
};

export type SwapProposal = {
	to_finalizer: { amount: Big }[];
	to_initiator: { amount: Big }[];
};

export type Asset = {
	decimal_point: number;
	[key: string]: unknown;
};

export type AcceptSwapReq = {
	id: string;
	hex_raw_proposal: string;
	swapProposal: SwapProposal;
	receivingAsset: Asset;
	sendingAsset: Asset;
};

export type AssetWhitelistReq = {
	id: string;
	asset_id: string;
	asset_name: string;
};

export interface BurnAssetRequest {
	params: {
		assetId: string;
		burnAmount: number;
		nativeAmount?: number;
		pointTxToAddress?: string;
		serviceEntries?: serviceEntriesType[];
	};
}

export interface BurnAssetDataType {
	assetId: string;
	burnAmount: string;
	decimalPoint?: number;
	nativeAmount?: string;
	pointTxToAddress?: string;
	serviceEntries?: serviceEntriesType[];
}

export interface BurnAssetParamsType {
	asset_id: string;
	burn_amount: string;
	native_amount?: string;
	point_tx_to_address?: string;
	service_entries?: serviceEntriesType[];
}

export interface ionicSwapType {
	destinationAssetID: string;
	destinationAssetAmount: string;
	destinationAsset: {
		decimal_point: number;
	};
	currentAssetID: string;
	currentAssetAmount: string;
	currentAsset: {
		decimal_point: number;
	};
	expirationTimestamp: string;
	destinationAddress: string;
}

interface AssetInfo {
	full_name: string;
	ticker: string;
	asset_id: string;
	decimal_point: number;
}

interface BalanceItem {
	asset_info: AssetInfo;
	total: string;
	unlocked: string;
}

export interface ParsedBalance {
	result: {
		balances: BalanceItem[];
	};
}

export interface ParsedAddress {
	result: {
		address: string;
	};
}

interface TransferRaw {
	amount: string;
	asset_id: string;
	is_income: boolean;
}

export interface TransactionRaw {
	tx_hash: string;
	tx_blob_size: number;
	timestamp: number;
	height: number;
	payment_id: string;
	comment?: string;
	fee: string;
	remote_addresses: string[];
	is_service: boolean;
	subtransfers: TransferRaw[];
	employed_entries?: {
		spent?: { index: number }[];
	};
}

export interface Transaction {
	isConfirmed: boolean;
	txHash: string;
	blobSize: number;
	timestamp: number;
	height: number;
	paymentId: string;
	comment?: string;
	fee: string;
	addresses: string[];
	isInitiator: boolean;
	transfers: {
		amount: string;
		assetId: string;
		incoming: boolean;
	}[];
}

export interface WalletAsset {
	name: string;
	ticker: string;
	assetId: string;
	decimalPoint: number;
	balance: string;
	unlockedBalance: string;
}

interface AssetInfo {
	asset_id: string;
	full_name: string;
	ticker: string;
	decimal_point: number;
}

interface Balance {
	total: string;
	unlocked: string;
	asset_info: AssetInfo;
}

interface WalletWI {
	address: string;
	balances: Balance[];
	is_watch_only?: boolean;
}

export interface WalletRaw {
	wallet_id: string;
	wi: WalletWI;
}

export interface WalletDataResponse {
	result: {
		wallets: WalletRaw[];
	};
}

interface AssetDataType {
	asset_id: string;
	ticker: string;
	full_name: string;
	decimal_point: number;
}

export interface RequestType {
	method: string;
	credentials: object;
	id: string;
	assetId: string;
	destination: string;
	amount: string;
	decimalPoint: number;
	success: boolean;
	destinationAssetID: string;
	currentAssetID: string;
	currentAsset: AssetDataType;
	destinationAsset: AssetDataType;
	hex_raw_proposal?: string;
	alias?: string;
	sender?: string;
	transfer?: unknown;
	swapProposal?: unknown;
	password?: string;
	key?: string;
	aliasDetails?: unknown;
	signReqs?: unknown[];
	windowId?: number;
	message?: string;
	timeout?: number;
	destinationChainId?: string;
	destinationAddress?: string;
	receivingAsset?: unknown;
	sendingAsset?: unknown;
	asset?: AssetDataType;
	asset_id?: string;
	asset_name?: string;
	comment: string;
	burnAmount: number;
	nativeAmount?: number;
	pointTxToAddress?: string;
	serviceEntries?: serviceEntriesType[];
}

export interface TransferDataType {
	destination: string;
	amount: string;
	decimalPoint: number;
	comment?: string;
	destinations: { address: string; amount: number }[];
	assetId: string;
	asset: {
		decimal_point: number;
	};
}
