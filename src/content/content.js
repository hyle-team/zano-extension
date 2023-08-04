async function fetchData(data) {
  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(data, (response) => {
        // eslint-disable-next-line no-undef
        if (chrome.runtime.lastError) {
          // eslint-disable-next-line no-undef
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

document.addEventListener("zano_request", async (e) => {
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
    // Dispatch an event with the error
    document.dispatchEvent(
      new CustomEvent(`zano_response_${data.listenerID}`, {
        detail: { error: error.message },
      })
    );
  }
});

console.log("Zano wallet loaded");
