export type PermissionItem = {
	type: string;
};

export type PermissionsState = Record<string, Record<string, PermissionItem[]>>;
