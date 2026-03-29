import { getUserData } from '../../background/background';
import { RequestType, Sender, SendResponse } from '../../types';
import { permissionMiddleware } from './permission';

async function preprocessRequest(
	request: RequestType,
	sender: Sender,
	sendResponse: SendResponse,
): Promise<boolean> {
	const userData = await getUserData();
	if (!userData.password) {
		sendResponse({ error: 'Wallet is locked!' });
		return false;
	}

	const allowed = await permissionMiddleware(request, sender, sendResponse);
	if (!allowed) return false;

	return true;
}

export default preprocessRequest;
