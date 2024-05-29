import {
  fetchData,
  getWalletData,
  getWallets,
  transfer,
  transferBridge,
  ionicSwap,
  ionicSwapAccept,
  validateConnectKey,
  getAliasDetails
} from "./wallet";

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

export let apiCredentials = {
  port: 12111,
};

let pendingTx = null;

const userData = { password: undefined };

// eslint-disable-next-line no-undef
chrome.storage.local.get("pendingTx", (result) => {
  if (result.pendingTx) {
    pendingTx = result.pendingTx;
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.method) {
    case "SET_API_CREDENTIALS":
      apiCredentials = {
        ...(apiCredentials || {}),
        ...request.credentials
      };
      console.log("API credentials set to", apiCredentials);
      sendResponse({ success: true });
      break;

    case "PING_WALLET": 
      fetch(`http://localhost:${apiCredentials.port}/ping`)
      .then(res => res.json())
      .then(res => sendResponse({ data: true }))
      .catch(err => sendResponse({ data: false }));
      break;
      

    case "SET_ACTIVE_WALLET":
      fetchData("mw_select_wallet", { wallet_id: request.id })
        .then((response) => response.json())
        .then((data) => {
          sendResponse({ data: data });
        })
        .catch((error) => {
          console.error("Error fetching wallets:", error);
          sendResponse({ error: "An error occurred while fetching wallets" });
        });
      break;

    case "GET_WALLET_BALANCE":
      fetchData("getbalance")
        .then((response) => response.json())
        .then((data) => {
          sendResponse({ data: data });
        })
        .catch((error) => {
          console.error("Error fetching wallets:", error);
          sendResponse({ error: "An error occurred while fetching wallets" });
        });
      break;

    case "GET_WALLETS":
      getWallets()
        .then((data) => {
          sendResponse({ data: data });
        })
        .catch((error) => {
          console.error("Error fetching wallets:", error);
          sendResponse({ error: "An error occurred while fetching wallets" });
        });
      break;

    case "GET_WALLET_DATA":
      getWalletData(request.id)
        .then((data) => {
          sendResponse({ data });
        })
        .catch((error) => {
          console.error("Error fetching wallet data:", error);
          sendResponse({
            error: "An error occurred while fetching wallet data",
          });
        });
      break;

    case "SEND_TRANSFER":
      transfer(request.assetId, request.destination, request.amount)
        .then((data) => {
          sendResponse({ data });
        })
        .catch((error) => {
          console.error("Error sending transfer:", error);
          sendResponse({ error: "An error occurred while sending transfer" });
        });
      break;

    case "IONIC_SWAP":
      ionicSwap(request)
        .then((data) => {
          sendResponse({ data });
        })
        .catch((error) => {
          console.error("Error sending transfer:", error);
          sendResponse({ error: "An error occurred while sending transfer" });
        });
      break;

    case "IONIC_SWAP_ACCEPT":
      ionicSwapAccept(request)
        .then((data) => {
          sendResponse({ data });
        })
        .catch((error) => {
          console.error("Error sending transfer:", error);
          sendResponse({ error: "An error occurred while sending transfer" });
        });
      break;


    case "BRIDGING_TRANSFER":
      pendingTx = {
        assetId: request.assetId,
        amount: request.amount,
        destinationAddress: request.destinationAddress,
        destinationChainId: request.destinationChainId,
      };
      // eslint-disable-next-line no-undef
      chrome.storage.local.set({ pendingTx: pendingTx });
      sendResponse({ status: "confirmation_pending" });
      // eslint-disable-next-line no-undef
      chrome.action.setBadgeText({ text: "1" });
      break;

    case "EXECUTE_BRIDGING_TRANSFER":
      if (pendingTx) {
        console.log("Executing bridging transfer", pendingTx);
        transferBridge(
          pendingTx.assetId,
          pendingTx.amount,
          pendingTx.destinationAddress,
          pendingTx.destinationChainId
        )
          .then((data) => {
            sendResponse({ data });
            pendingTx = null;
            // eslint-disable-next-line no-undef
            chrome.storage.local.remove("pendingTx");
            // eslint-disable-next-line no-undef
            chrome.action.setBadgeText({ text: "" });
          })
          .catch((error) => {
            console.error("Error bridging transfer:", error);
            sendResponse({
              error: "An error occurred while bridging transfer",
            });
          });
      } else {
        sendResponse({ error: "No pending transaction" });
      }
      break;
    
    case "SET_PASSWORD": {
      userData.password = request.password;
      sendResponse({ success: true });
      break;
    }

    case "GET_PASSWORD": {
      sendResponse({ password: userData.password });
      break;
    }

    case "VALIDATE_CONNECT_KEY": {
      validateConnectKey(request.key)
        .then((res) => sendResponse(res))
        .catch(() => sendResponse({ error: "Internal error" }));
      break;
    }

    case "GET_ALIAS_DETAILS": {
      getAliasDetails(request.alias)
        .then((res) => sendResponse(res))
        .catch(() => sendResponse({ error: "Internal error" }));
      break;
    }

    default:
      console.error("Unknown message method:", request.method);
      sendResponse({ error: `Unknown method: ${request.method}` });
  }

  return true;
});
