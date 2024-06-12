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

class PopupRequestsMethods {
  static onRequestCreate(
    requestType,
    request,
    sendResponse,
    reqParams
  ) {
    openWindow().then(requestWindow => {
      const reqId = crypto.randomUUID();
      const req = {windowId: requestWindow.id, finalizer: (data) => sendResponse(data), ...reqParams};
      allPopupIds.push(requestWindow.id);
      savedRequests[requestType][reqId] = req;

      if (typeof request.timeout === "number") {
        setTimeout(() => {
          delete savedRequests[requestType][reqId];
          sendResponse({ error: "Timeout exceeded" });
        }, request.timeout);
      }
    });
  }

  static getRequestsList(
    requestType,
    sendResponse
  ) {
    sendResponse({ 
      data: Object.entries(savedRequests[requestType]).map(([id, req]) => ({ ...req, id, finalize: undefined })) 
    });
  }

  static onRequestFinalize(
    requestType,
    request,
    sendResponse,
    apiCallFunc,
    errorMessages
  ) {
    const reqId = request.id;
    const success = request.success;
    const req = savedRequests[requestType][reqId];

    if (req) {
      function finalize(data) {
        req.finalizer(data);
        delete savedRequests[requestType][reqId];
        chrome.windows.remove(req.windowId);
      }

      if (!success) {
        finalize({ error: "Request denied by user" });
        sendResponse({ data: true });
      } else {

        apiCallFunc(req)
          .then((data) => {
            finalize({ data });
            sendResponse({ data: true });
          })
          .catch((error) => {
            console.error(errorMessages.console, error);
            finalize({ error: errorMessages.response });
            sendResponse({ error: errorMessages.response });
          });
      }
      
    } else {
      return sendResponse({ error: errorMessages.reqNotFound });
    }
  }
}

chrome.windows.onBoundsChanged.addListener((window) => {
  if (allPopupIds.includes(window.id) && window.width !== POPUP_WIDTH && window.height !== POPUP_HEIGHT) {
    chrome.windows.update(window.id, {
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT
    });
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

const defaultCredentials = {
  port: 11211,
};

export let apiCredentials = JSON.parse(JSON.stringify(defaultCredentials));

let pendingTx = null;

const defaultUserData = { password: undefined };

async function setUserData(state) {
  await new Promise((resolve) => {
    chrome.storage.local.set({ userData: state }, resolve);
  });
}

async function getUserData() {
  return new Promise((resolve) => {
    chrome.storage.local.get("userData", (result) => {
      resolve(result.userData || defaultUserData);
    });
  });
}

async function updateUserData(newData) {
  const currentData = await getUserData();
  return setUserData({...currentData, ...newData});
}

async function recoverApiCredentials() {
  apiCredentials = (await getUserData()).apiCredentials || defaultCredentials;
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.remove('userData', function() {
      console.log('State cleared on browser startup');
  });
});



const signReqFinalizers = {};
const signReqs = [];

const savedRequests = {
  "IONIC_SWAP": {},
  "ACCEPT_IONIC_SWAP": {},
};


const allPopupIds = [];

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
  'EXECUTE_BRIDGING_TRANSFER',
  'PING_WALLET',
  'SET_ACTIVE_WALLET',
  'GET_WALLETS'
];


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  processRequest(request, sender, sendResponse);
  return true;
});

async function processRequest(request, sender, sendResponse) {
  const isFromExtensionFrontend = sender.url && sender.url.includes(chrome.runtime.getURL('/'));

  if (SELF_ONLY_REQUESTS.includes(request.method) && !isFromExtensionFrontend) {
    console.error("Unauthorized request from", sender.url);
    return sendResponse({ error: "Unauthorized request" });
  }

  if (!isFromExtensionFrontend) {
    console.log('Updating API credentials');
    await recoverApiCredentials();
  }

  switch (request.method) {
    case "SET_API_CREDENTIALS":
      console.log("Setting API credentials", request.credentials);
      apiCredentials = {
        ...(apiCredentials || {}),
        ...request.credentials,
      };
      sendResponse({ success: true });
      updateUserData({
        apiCredentials: apiCredentials
      }).then(() => {
        console.log("API credentials set to", apiCredentials);
        sendResponse({ success: true });
      });
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
      PopupRequestsMethods.getRequestsList("IONIC_SWAP", sendResponse);
      break;

    case "FINALIZE_IONIC_SWAP_REQUEST": {
      PopupRequestsMethods.onRequestFinalize(
        "IONIC_SWAP",
        request,
        sendResponse,
        (req) => ionicSwap(req.swap),
        {
          console: "Error creating ionic swap:",
          response: "An error occurred while creating ionic swap",
          reqNotFound: "Ionic swap request not found"
        }
      )

      break;
    }
      
    case "IONIC_SWAP": {
      PopupRequestsMethods.onRequestCreate(
        "IONIC_SWAP",
        request,
        sendResponse,
        {swap: request}
      );
      break;
    }
     

    case "GET_ACCEPT_IONIC_SWAP_REQUESTS":
      PopupRequestsMethods.getRequestsList("ACCEPT_IONIC_SWAP", sendResponse);
      break;

    case "FINALIZE_ACCEPT_IONIC_SWAP_REQUEST": {
      PopupRequestsMethods.onRequestFinalize(
        "ACCEPT_IONIC_SWAP",
        request,
        sendResponse,
        (req) => ionicSwapAccept({ hex_raw_proposal: req.hex_raw_proposal }),
        {
          console: "Error accepting ionic swap:",
          response: "An error occurred while accepting ionic swap",
          reqNotFound: "Ionic swap accept request not found"
        }
      )


      break;
    }
      
    case "IONIC_SWAP_ACCEPT":
      PopupRequestsMethods.onRequestCreate(
        "ACCEPT_IONIC_SWAP",
        request,
        sendResponse,
        {hex_raw_proposal: request.hex_raw_proposal}
      );
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
      updateUserData({ password: request.password }).then(() => {
        sendResponse({ success: true });
      });
      break;
    }

    case "GET_PASSWORD": {
      getUserData()
      .then((userData) => {
        sendResponse({ password: userData?.password });
      });
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

        allPopupIds.push(requestWindow.id);

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

}