/*global chrome*/
import {
  fetchData,
  getWalletData,
  getWallets,
  transfer,
  transferBridge,
  ionicSwap,
  ionicSwapAccept,
  signMessage,
  validateConnectKey
} from "./wallet";

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

const REQUEST_TIMEOUT = 30000;
export let apiCredentials = {
  port: 12111,
};

let pendingTx = null;

const userData = { password: undefined };

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

    case "GET_SIGN_REQUESTS": {
      sendResponse({ data: signReqs });
      break;
    }

    case "FINALIZE_MESSAGE_SIGN": {
      const reqId = request.id;
      const success = request.success;
      const signReq = signReqs.find((req) => req.id === reqId);

      

      if (signReq && signReqFinalizers[reqId]) {

        function finalize(data) {
          signReqFinalizers[reqId](data);
          signReqs.splice(signReqs.indexOf(signReq), 1);
          delete signReqFinalizers[reqId];
          chrome.windows.remove(signReq.windowId);
        }

        if (!success) {
          finalize({ error: "Sign request denied by user" });
          sendResponse({ data: true });
        } else {
          const message = signReq.message;

          signMessage(message)
            .then(data => {
              finalize({ data });
              sendResponse({ data: true });
            })
            .catch((error) => {
              console.error("Error signing message:", error);

              finalize({
                error: "An error occurred while signing message",
              });
              
              sendResponse({
                error: "An error occurred while signing message",
              });
            });
        }

        
      } else {
        return sendResponse({ error: "Sign request not found" });
      }

      break;
    }

    case "REQUEST_MESSAGE_SIGN": {
      chrome.windows.create({
        url: chrome.runtime.getURL("index.html"),
        type: "popup",
        width: 370,
        height: 630,
      }).then(requestWindow => {
        const signReqId = crypto.randomUUID();

        signReqFinalizers[signReqId] = (result) => {
          sendResponse(result);
        };

        signReqs.push({id: signReqId, windowId: requestWindow.id, message: request.message});

        setTimeout(() => {
          const signReqIndex = signReqs.findIndex((req) => req.id === signReqId);

          if (signReqIndex === -1) {
            return;
          }

          signReqs.splice(signReqIndex, 1);
          delete signReqFinalizers[signReqId];
        }, REQUEST_TIMEOUT);
      })

      

      break;
    }

    default:
      console.error("Unknown message method:", request.method);
      sendResponse({ error: `Unknown method: ${request.method}` });
  }

  return true;
});
