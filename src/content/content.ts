import browser from '../app/utils/browserApi';

interface DocumentEventMap {
  "zano_request": CustomEvent<ZanoRequestData>;
}

interface ZanoRequestData {
  method: string;
  listenerID: string;
  timeout?: number | null;
  [key: string]: string | number | boolean | null | undefined;
}

interface ZanoResponse {
  error?: string;
  [key: string]: string | number | boolean | null | undefined;
}

async function fetchData(data: ZanoRequestData): Promise<ZanoResponse> {
  try {
    return await browser.runtime.sendMessage(data);
  } catch (error) {
    console.error(`Error while fetching data (${data.method}):`, error);
    throw error;
  }
}

document.addEventListener("zano_request", async (e: Event) => {
  const customEvent = e as CustomEvent<ZanoRequestData>;
  const data = customEvent.detail;

  try {
    const response = await fetchData(data);

    document.dispatchEvent(
      new CustomEvent(`zano_response_${data.listenerID}`, {
        detail: response,
      })
    );
  } catch (error) {
    console.error(`Error while processing zano_request:`, error);
    document.dispatchEvent(
      new CustomEvent(`zano_response_${data.listenerID}`, {
        detail: { error: error instanceof Error ? error.message : String(error) },
      })
    );
  }
});

console.log("Zano wallet loaded");
