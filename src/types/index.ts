// Types
export type dispatchType = () => void;
export type destinationsType = { address: string; amount: number }[];

export type transferType = {
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

export type RequestType = {
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
	burnAmount: number;
	decimalPoint?: number;
	nativeAmount?: number;
	pointTxToAddress?: string;
	serviceEntries?: serviceEntriesType[];
}
