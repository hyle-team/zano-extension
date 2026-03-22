export interface GetAliasByAdderssParams {
	method: string;
	address: string;
}

export interface TransferAliasParams {
	method: string;
	address: string;
	alias: string;
	comment?: string;
}
