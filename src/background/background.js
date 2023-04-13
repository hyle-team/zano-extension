// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded on installation");
});
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getInfo") {
    fetch("http://localhost:11112/json_rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "mw_get_wallets",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data from the API call
        console.log(data);
        sendResponse({ data: data });
      })
      .catch((error) => {
        console.error("Error fetching wallets:", error);
        sendResponse({ error: "An error occurred while fetching wallets" });
      });

    // This line is necessary for async sendResponse to work
    return true;
  }
});
