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
  validateConnectKey,
  getAliasDetails,
  getSwapProposalInfo,
  getWhiteList
} from "./wallet";

const POPUP_HEIGHT = 630;
const POPUP_WIDTH = 370;

chrome.windows.onBoundsChanged.addListener((window) => {
  chrome.windows.update(window.id, {
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT
  });
});

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

export let apiCredentials = {
  port: 11211,
};

let pendingTx = null;

const userData = { password: undefined };

const signReqFinalizers = {};
const signReqs = [];

const ionicSwapReqs = {};
const acceptIonicSwapReqs = {};

// eslint-disable-next-line no-undef
chrome.storage.local.get("pendingTx", (result) => {
  if (result.pendingTx) {
    pendingTx = result.pendingTx;
  }
});

function openWindow() {
  return chrome.windows.create({
    url: chrome.runtime.getURL("index.html"),
    type: "popup",
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
  });
}


// requests that can only be made by the extension frontend
const SELF_ONLY_REQUESTS = [
  'SET_API_CREDENTIALS', 
  'VALIDATE_CONNECT_KEY', 
  'GET_PASSWORD',
  'GET_SIGN_REQUESTS',
  'FINALIZE_MESSAGE_SIGN',
  'GET_IONIC_SWAP_REQUESTS',
  'FINALIZE_IONIC_SWAP_REQUEST',
  'GET_ACCEPT_IONIC_SWAP_REQUESTS',
  'FINALIZE_ACCEPT_IONIC_SWAP_REQUEST',
  'SET_PASSWORD',
  'SEND_TRANSFER',
  'EXECUTE_BRIDGING_TRANSFER'
];

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  const isFromExtensionFrontend = sender.url && sender.url.includes(chrome.runtime.getURL('/'));

  if (SELF_ONLY_REQUESTS.includes(request.method) && !isFromExtensionFrontend) {
    console.error("Unauthorized request from", sender.url);
    return sendResponse({ error: "Unauthorized request" });
  }

  switch (request.method) {
    case "SET_API_CREDENTIALS":
      apiCredentials = {
        ...(apiCredentials || {}),
        ...request.credentials,
      };
      console.log("API credentials set to", apiCredentials);
      sendResponse({ success: true });
      break;

    case "PING_WALLET":
      fetch(`http://localhost:${apiCredentials.port}/ping`)
        .then((res) => res.json())
        .then((res) => sendResponse({ data: true }))
        .catch((err) => sendResponse({ data: false }));
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

    case "GET_IONIC_SWAP_REQUESTS":
      sendResponse({ 
        data: Object.entries(ionicSwapReqs).map(([id, req]) => ({ ...req, id, finalize: undefined })) 
      });
      break;

    case "FINALIZE_IONIC_SWAP_REQUEST": {
      const reqId = request.id;
      const success = request.success;
      const req = ionicSwapReqs[reqId];

      if (req) {
        function finalize(data) {
          req.finalizer(data);
          delete ionicSwapReqs[reqId];
          chrome.windows.remove(req.windowId);
        }

        if (!success) {
          finalize({ error: "Request denied by user" });
          sendResponse({ data: true });
        } else {
          const swap = req.swap;
          
          ionicSwap(swap)
            .then((data) => {
              finalize({ data });
              sendResponse({ data: true });
            })
            .catch((error) => {
              console.error("Error creating ionic swap:", error);
              finalize({ error: "An error occurred while creating ionic swap" });
              sendResponse({ error: "An error occurred while creating ionic swap" });
            });
        }
        
      } else {
        return sendResponse({ error: "Sign request not found" });
      }

      break;
    }
      
    case "IONIC_SWAP": {
      openWindow().then(requestWindow => {
        const reqId = crypto.randomUUID();
        const req = {windowId: requestWindow.id, swap: request, finalizer: (data) => sendResponse(data)};
        ionicSwapReqs[reqId] = req;

        if (typeof request.timeout === "number") {
          setTimeout(() => {
            delete ionicSwapReqs[reqId];
            sendResponse({ error: "Timeout exceeded" });
          }, request.timeout);
        }
      });

      break;
    }
     

    case "GET_ACCEPT_IONIC_SWAP_REQUESTS":
      sendResponse({ 
        data: Object.entries(acceptIonicSwapReqs).map(([id, req]) => ({ ...req, id, finalize: undefined })) 
      });
      break;

    case "FINALIZE_ACCEPT_IONIC_SWAP_REQUEST": {
      const reqId = request.id;
      const success = request.success;
      const req = acceptIonicSwapReqs[reqId];

      if (req) {
        function finalize(data) {
          req.finalizer(data);
          delete acceptIonicSwapReqs[reqId];
          chrome.windows.remove(req.windowId);
        }

        if (!success) {
          finalize({ error: "Request denied by user" });
          sendResponse({ data: true });
        } else {
          const hex = req.hex;
          
          ionicSwapAccept({ hex_raw_proposal: hex })
            .then((data) => {
              finalize({ data });
              sendResponse({ data: true });
            })
            .catch((error) => {
              console.error("Error accepting ionic swap:", error);
              finalize({ error: "An error occurred while accepting ionic swap" });
              sendResponse({ error: "An error occurred while accepting ionic swap" });
            });
        }
        
      } else {
        return sendResponse({ error: "Ionic swap accept request not found" });
      }

      break;
    }
      
    case "IONIC_SWAP_ACCEPT":
      openWindow().then(requestWindow => {
        const reqId = crypto.randomUUID();
        const req = {windowId: requestWindow.id, hex_raw_proposal: request.hex_raw_proposal, finalizer: (data) => sendResponse(data)};
        acceptIonicSwapReqs[reqId] = req;

        if (typeof request.timeout === "number") {
          setTimeout(() => {
            delete acceptIonicSwapReqs[reqId];
            sendResponse({ error: "Timeout exceeded" });
          }, request.timeout);
        }
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
      openWindow().then(requestWindow => {
        const signReqId = crypto.randomUUID();

        signReqFinalizers[signReqId] = (result) => {
          sendResponse(result);
        };

        signReqs.push({id: signReqId, windowId: requestWindow.id, message: request.message});

        if (typeof request.timeout === "number") {
          setTimeout(() => {
            const signReqIndex = signReqs.findIndex((req) => req.id === signReqId);
  
            if (signReqIndex === -1) {
              return;
            }
  
            signReqs.splice(signReqIndex, 1);
            delete signReqFinalizers[signReqId];
            sendResponse({ error: "Timeout exceeded" });
          }, request.timeout);
        }
      })

      

      break;
    }

    case "GET_IONIC_SWAP_PROPOSAL_INFO": {
      const hex = request.hex_raw_proposal;

      getSwapProposalInfo(hex)
        .then((data) => {
          sendResponse({ data });
        })
        .catch((error) => {
          console.error("Error getting ionic swap proposal info:", error);
          sendResponse({ error: "An error occurred while getting ionic swap proposal info" });
        });

      break;
    }

    case "GET_WHITELIST": {
      getWhiteList()
      .then((data) => {
        sendResponse({ data });
      })
      .catch((error) => {
        console.error("Error getting whitelist:", error);
        sendResponse({ error: "An error occurred while getting whitelist" });
      });
      break;
    }

    default:
      console.error("Unknown message method:", request.method);
      sendResponse({ error: `Unknown method: ${request.method}` });
  }

  return true;
});
