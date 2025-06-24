interface ZanoRequestData {
	method: string;
	listenerID: string;
	timeout?: number | null;
	[key: string]: string | number | boolean | null | undefined;
}
interface DocumentEventMap {
	zano_request: CustomEvent<ZanoRequestData>;
}

interface ZanoResponse {
	error?: string;
	[key: string]: string | number | boolean | null | undefined;
}

async function fetchData(data: ZanoRequestData): Promise<ZanoResponse> {
	return new Promise((resolve, reject) => {
		try {
			chrome.runtime.sendMessage(data, (response: ZanoResponse) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
}

document.addEventListener('zano_request', async (e: CustomEvent<ZanoRequestData>) => {
	const data = e.detail;

	try {
		const response = await fetchData(data);

		document.dispatchEvent(
			new CustomEvent(`zano_response_${data.listenerID}`, {
				detail: response,
			}),
		);
	} catch (error) {
		document.dispatchEvent(
			new CustomEvent(`zano_response_${data.listenerID}`, {
				detail: { error: error instanceof Error ? error.message : String(error) },
			}),
		);
	}
});
