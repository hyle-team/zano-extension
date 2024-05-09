/*global chrome*/
import {
  fetchData,
  getWalletData,
  getWallets,
  transfer,
  transferBridge,
  ionicSwap,
  ionicSwapAccept
} from "./wallet";

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

const REQUEST_TIMEOUT = 30000;

let pendingTx = null;

const userData = { login: false };

const signReqFinalizers = {};
const signReqs = [];

// eslint-disable-next-line no-undef
chrome.storage.local.get("pendingTx", (result) => {
  if (result.pendingTx) {
    pendingTx = result.pendingTx;
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.method) {
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
    
    case "SET_LOGIN": {
      userData.login = request.login;
      sendResponse({ success: true });
      break;
    }

    case "GET_LOGIN": {
      sendResponse({ login: userData.login });
      break;
    }

    case "GET_SIGN_REQUESTS": {
      sendResponse({ data: signReqs });
      break;
    }

    case "FINALIZE_MESSAGE_SIGN": {
      const reqId = request.id;
      const success = request.success;
      const signReq = signReqs.find((req) => req.id === reqId);

      if (signReq && signReqFinalizers[reqId]) {
        signReqs.splice(signReqs.indexOf(signReq), 1);
        signReqFinalizers[reqId](success ? { data: "TEST_SIGN" } : { error: "Sign request denied by user" });
        delete signReqFinalizers[reqId];
      } else {
        sendResponse({ error: "Sign request not found" });
      }

      sendResponse({ data: true });

      break;
    }

    case "REQUEST_MESSAGE_SIGN": {
      chrome.windows.create({
        url: chrome.runtime.getURL("index.html"),
        type: "popup",
        width: 360,
        height: 600,
      });

      const signReqId = crypto.randomUUID();

      signReqFinalizers[signReqId] = (result) => {
        sendResponse(result);
      };

      signReqs.push({id: signReqId, message: request.message});

      setTimeout(() => {
        const signReqIndex = signReqs.findIndex((req) => req.id === signReqId);

        if (signReqIndex === -1) {
          return;
        }

        signReqs.splice(signReqIndex, 1);
        delete signReqFinalizers[signReqId];
      }, REQUEST_TIMEOUT);

      break;
    }

    default:
      console.error("Unknown message method:", request.method);
      sendResponse({ error: `Unknown method: ${request.method}` });
  }

  return true;
});
