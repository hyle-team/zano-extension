export interface AliasManagePageProps {
	mode?: 'edit' | 'create';
}

export interface RegisterAliasParams {
	method: string;
	address: string;
	alias: string;
	comment?: string;
}
