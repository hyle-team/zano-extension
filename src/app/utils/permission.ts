import { getWalletData } from '../../background/wallet';
import { METHOD_EXTRA_PERMISSIONS, PERMISSION_PUBLIC_METHODS } from '../../constants';
import { PermissionType, RequestType, Sender, SendResponse } from '../../types';
import { normalizeOrigin, raceTimeout } from './utils';

export async function getPermissions(origin: string, address: string): Promise<PermissionType[]> {
	const stored = await chrome.storage.local.get('permissions');
	const map = stored.permissions || {};

	return (map?.[origin]?.[address] || []).map((p: { type: PermissionType }) => p.type);
}

export function hasPermission(userPerms: PermissionType[], required: PermissionType) {
	return userPerms.includes(required);
}

export async function permissionMiddleware(
	request: RequestType,
	sender: Sender,
	sendResponse: SendResponse,
): Promise<boolean> {
	const isFromExtensionFrontend = sender.url && sender.url.includes(chrome.runtime.getURL('/'));

	if (PERMISSION_PUBLIC_METHODS.includes(request.method) || isFromExtensionFrontend) return true;

	if (!sender.origin && !sender.url) {
		sendResponse({ error: 'Unknown origin' });
		return false;
	}

	const origin = normalizeOrigin(sender.origin || new URL(sender.url!).origin);

	let address;

	try {
		const wallet = await raceTimeout(getWalletData());

		if (wallet?.address) {
			address = wallet.address;
		}
	} catch {
		sendResponse({ error: 'Wallet is offline!' });
		return false;
	}

	if (!address) {
		sendResponse({ error: 'Wallet is offline!' });
		return false;
	}

	const perms = await getPermissions(origin, address);

	if (!hasPermission(perms, 'general')) {
		sendResponse({ error: 'General permission required' });
		return false;
	}

	const extra = METHOD_EXTRA_PERMISSIONS[request.method];

	if (extra) {
		const ok = extra.every((p) => hasPermission(perms, p as PermissionType));

		if (!ok) {
			sendResponse({ error: 'Permission denied' });
			return false;
		}
	}

	return true;
}
