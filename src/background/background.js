import { fetchData, getWalletData, getWallets, transfer } from "./wallet";

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "GET_WALLET_BALANCE") {
    fetchData("getbalance")
      .then((response) => response.json())
      .then((data) => {
        sendResponse({ data: data });
      })
      .catch((error) => {
        console.error("Error fetching wallets:", error);
        sendResponse({ error: "An error occurred while fetching wallets" });
      });

    return true;
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "GET_WALLETS") {
    getWallets()
      .then((data) => {
        sendResponse({ data: data });
      })
      .catch((error) => {
        console.error("Error fetching wallets:", error);
        sendResponse({ error: "An error occurred while fetching wallets" });
      });

    return true;
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "GET_WALLET_DATA") {
    console.log("Getting wallet data");
    getWalletData()
      .then((data) => {
        sendResponse({ data });
      })
      .catch((error) => {
        console.error("Error fetching wallet data:", error);
        sendResponse({ error: "An error occurred while fetching wallet data" });
      });
    return true;
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "SEND_TRANSFER") {
    console.log("Sending transfer");
    console.log("destination", request.destination, "amount", request.amount);
    transfer(request.destination, request.amount)
      .then((data) => {
        sendResponse({ data });
      })
      .catch((error) => {
        console.error("Error sending transfer:", error);
        sendResponse({ error: "An error occurred while sending transfer" });
      });
    return true;
  }
});
