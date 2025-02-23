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
      console.error(`Error while fetching data (${data.method}):`, error);
      reject(error);
    }
  });
}

document.addEventListener("zano_request", async (e: CustomEvent<ZanoRequestData>) => {
  const data = e.detail;

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
