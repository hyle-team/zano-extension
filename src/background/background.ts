/*global chrome*/
import { ZANO_ASSET_ID } from "../constants";
import {
  fetchData,
  getWalletData,
  getWallets,
  transfer,
  burnBridge,
  ionicSwap,
  ionicSwapAccept,
  signMessage,
  validateConnectKey,
  getAliasDetails,
  getSwapProposalInfo,
  getWhiteList,
  getAssetInfo,
  createAlias,
  addAssetToWhitelist,
  burnAsset
} from "./wallet";
import JSONbig from "json-bigint";

const POPUP_HEIGHT = 630;
const POPUP_WIDTH = 370;

const ZANO_ID =
  ZANO_ASSET_ID;

interface Asset {
  asset_id: string;
  ticker: string;
  full_name: string;
  decimal_point: number;
}

async function getAsset(assetId: string): Promise<Asset | undefined> {
  if (assetId === ZANO_ID) {
    return {
      asset_id: ZANO_ID,
      ticker: "ZANO",
      full_name: "Zano",
      decimal_point: 12,
    };
  } else {
    const assetRsp = await getAssetInfo(assetId);
    const asset = assetRsp?.result?.asset_descriptor;

    if (!asset) {
      return undefined;
    }

    return asset;
  }
}

interface PopupRequest {
  windowId: number;
  finalizer: (data: unknown) => void;
  [key: string]: unknown;
}

interface RequestResponse {
  error?: string;
  data?: unknown;
}

interface ErrorMessages {
  console: string;
  response: string;
  reqNotFound: string;
}

class PopupRequestsMethods {
  static onRequestCreate(
    requestType: keyof typeof savedRequests,
    request: { timeout?: number },
    sendResponse: (response: RequestResponse) => void,
    reqParams: PopupRequest
  ): void {
    console.log("Creating request", reqParams);

    openWindow().then((requestWindow) => {
      const reqId = crypto.randomUUID();
      const req = {
        ...reqParams,
        windowId: requestWindow.id,
        finalizer: (data: unknown) => sendResponse(data as any),
      };

      allPopupIds.push(requestWindow.id as number);
      (savedRequests[requestType][reqId] as any) = req;

      if (typeof request.timeout === "number") {
        setTimeout(() => {
          delete savedRequests[requestType][reqId];
          sendResponse({ error: "Timeout exceeded" });
        }, request.timeout);
      }
    });
  }

  static getRequestsList(
    requestType: keyof typeof savedRequests,
    sendResponse: (response: { data: PopupRequest[] }) => void
  ): void {
    sendResponse({
      data: Object.entries(savedRequests[requestType]).map(([id, req]) => ({
        ...req,
        id,
        finalize: undefined,
      })),
    });
  }

  static onRequestFinalize(
    requestType: keyof typeof savedRequests,
    request: { id: string; success: boolean },
    sendResponse: (response: RequestResponse) => void,
    apiCallFunc: (req: PopupRequest) => Promise<unknown>,
    errorMessages: ErrorMessages
  ): void {
    const reqId = request.id;
    const success = request.success;
    const req = savedRequests[requestType][reqId];

    if (req) {
      function finalize(data: unknown) {
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
      sendResponse({ error: errorMessages.reqNotFound });
    }
  }
}

chrome.windows.onBoundsChanged.addListener((window) => {
  if (
    allPopupIds.includes(window.id as number) &&
    window.width !== POPUP_WIDTH &&
    window.height !== POPUP_HEIGHT
  ) {
    chrome.windows.update(window.id as number, {
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT,
    });
  }
});

// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

interface Credentials {
  port: number;
  token?: string;
}

const defaultCredentials: Credentials = {
  port: 11211,
};

export let apiCredentials: Credentials = { ...defaultCredentials };

interface pendingTxTypes {
  assetId: string,
  amount: string,
  destinationAddress: string | undefined,
  destinationChainId: string | undefined,
}

let pendingTx: pendingTxTypes | null = null;

interface UserData {
  password?: string;
  apiCredentials?: Credentials;
}

const defaultUserData: UserData = { password: undefined };

async function setUserData(state: UserData): Promise<void> {
  await new Promise((resolve) => {
    chrome.storage.local.set({ userData: state }, resolve as (() => void));
  });
}

async function getUserData(): Promise<UserData> {
  return new Promise((resolve) => {
    chrome.storage.local.get("userData", (result) => {
      resolve(result.userData || defaultUserData);
    });
  });
}

async function updateUserData(newData: Partial<UserData>): Promise<void> {
  const currentData = await getUserData();
  return setUserData({ ...currentData, ...newData });
}

async function recoverApiCredentials(): Promise<void> {
  apiCredentials = (await getUserData()).apiCredentials || defaultCredentials;
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.remove("userData", () => {
    console.log("State cleared on browser startup");
  });
});

interface SignReqFinalizer {
  [key: string]: (data: unknown) => void;
}

const signReqFinalizers: SignReqFinalizer = {};
const signReqs: unknown[] = [];

const savedRequests: Record<
  "IONIC_SWAP" | "ACCEPT_IONIC_SWAP" | "CREATE_ALIAS" | "TRANSFER" | "ASSETS_WHITELIST_ADD" | "BURN_ASSET",
  Record<string, PopupRequest>
> = {
  IONIC_SWAP: {},
  ACCEPT_IONIC_SWAP: {},
  CREATE_ALIAS: {},
  TRANSFER: {},
  ASSETS_WHITELIST_ADD: {},
  BURN_ASSET: {},
};

const allPopupIds: number[] = [];

chrome.storage.local.get("pendingTx", (result) => {
  if (result.pendingTx) {
    pendingTx = result.pendingTx;
  }
});

function openWindow(): Promise<chrome.windows.Window> {
  return chrome.windows.create({
    url: chrome.runtime.getURL("index.html"),
    type: "popup",
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
  });
}

// requests that can only be made by the extension frontend
const SELF_ONLY_REQUESTS = [
  "SET_API_CREDENTIALS",
  "VALIDATE_CONNECT_KEY",
  "GET_PASSWORD",
  "GET_SIGN_REQUESTS",
  "FINALIZE_MESSAGE_SIGN",
  "GET_IONIC_SWAP_REQUESTS",
  "GET_ALIAS_CREATE_REQUESTS",
  "FINALIZE_IONIC_SWAP_REQUEST",
  "GET_ACCEPT_IONIC_SWAP_REQUESTS",
  "FINALIZE_ACCEPT_IONIC_SWAP_REQUEST",
  "FINALIZE_ALIAS_CREATE",
  "SET_PASSWORD",
  "SEND_TRANSFER",
  "EXECUTE_BRIDGING_TRANSFER",
  "PING_WALLET",
  "SET_ACTIVE_WALLET",
  "GET_WALLETS",
  "FINALIZE_TRANSFER_REQUEST",
  "GET_ASSETS_WHITELIST_ADD_REQUESTS",
  "FINALIZE_ASSETS_WHITELIST_ADD_REQUESTS",
  "GET_BURN_ASSET_REQUESTS",
  "FINALIZE_BURN_ASSET_REQUEST",
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  processRequest(request, sender as any, sendResponse);
  return true;
});

interface RequestType {
  method: string;
  credentials: Object;
  id: string;
  assetId: string;
  destination: string;
  amount: string;
  decimalPoint: string;
  success: boolean;
  destinationAssetID: string;
  currentAssetID: string;
  currentAsset: Asset;
  destinationAsset: Asset;
  hex_raw_proposal?: string;
  alias?: string;
  sender?: string;
  transfer?: any;
  swapProposal?: any;
  password?: string;
  key?: string;
  aliasDetails?: any;
  signReqs?: any[];
  windowId?: number;
  message?: string;
  timeout?: number;
  destinationChainId?: string;
  destinationAddress?: string;
  receivingAsset?: any;
  sendingAsset?: any;
  asset?: Asset;
  asset_id?: string;
  asset_name?: string;
  comment: string;
  burnAmount: number;
  nativeAmount?: number;
  pointTxToAddress?: string;
  serviceEntries?: any[];
}

interface Sender {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  [key: string]: any;
}

interface SendResponse {
  (response: any): void;
}

async function processRequest(request: RequestType, sender: Sender, sendResponse: SendResponse) {
  const isFromExtensionFrontend =
    sender.url && sender.url.includes(chrome.runtime.getURL("/"));

  if (SELF_ONLY_REQUESTS.includes(request.method) && !isFromExtensionFrontend) {
    console.error("Unauthorized request from", sender.url);
    return sendResponse({ error: "Unauthorized request" });
  }

  if (!isFromExtensionFrontend) {
    console.log("Updating API credentials");
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
        apiCredentials: apiCredentials,
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
        .then((response) => response.text())
        .then((response) => JSONbig.parse(response))
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
      getWalletData() // removed request.id
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
      transfer(
        request.assetId,
        request.destination,
        request.amount,
        request.decimalPoint,
        request.comment ?? undefined
      )
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

    case "GET_ALIAS_CREATE_REQUESTS":
      PopupRequestsMethods.getRequestsList("CREATE_ALIAS", sendResponse);
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
          reqNotFound: "Ionic swap request not found",
        }
      );

      break;
    }

    case "IONIC_SWAP": {
      try {
        const destinationAsset = await getAsset(request.destinationAssetID);
        const currentAsset = await getAsset(request.currentAssetID);

        if (!destinationAsset || !currentAsset) {
          throw new Error("One or both assets not found");
        }

        request.currentAsset = currentAsset;
        request.destinationAsset = destinationAsset;
      } catch {
        return sendResponse({ error: "Failed to fetch one or both of assets" });
      }

      PopupRequestsMethods.onRequestCreate(
        "IONIC_SWAP",
        request,
        sendResponse,
        { swap: request } as any
      );
      break;
    }

    case "GET_TRANSFER_REQUEST": {
      PopupRequestsMethods.getRequestsList("TRANSFER", sendResponse);
      break;
    }

    case "TRANSFER": {
      try {
        const asset = await getAsset(request.assetId);
        const walletData = await getWalletData();
        const { address } = walletData;
        console.log('asset to transfer:', asset);

        request.asset = asset || (await getAsset(ZANO_ID));
        request.sender = address || "";
      } catch (e: unknown) {
        if (e instanceof Error) {
          return sendResponse({ error: e.message });
        } else {
          return sendResponse({ error: 'Unknown error occurred' });
        }
      }

      PopupRequestsMethods.onRequestCreate("TRANSFER", request, sendResponse, {
        transfer: request,
      } as any);
      break;
    }

    case "FINALIZE_TRANSFER_REQUEST": {
      PopupRequestsMethods.onRequestFinalize(
        "TRANSFER",
        request,
        sendResponse,
        (req) => {
          const transferData: any = req.transfer;
          const { assetId, destination, amount, asset, comment, destinations } = transferData;

          const hasMultipleDestinations = Array.isArray(destinations) && destinations.length > 0;

          return transfer(
            assetId,
            hasMultipleDestinations ? undefined : destination,
            hasMultipleDestinations ? undefined : amount,
            asset?.decimal_point ?? 12,
            comment ?? undefined,
            hasMultipleDestinations ? destinations : []
          );
        },
        {
          console: "Error transfer:",
          response: "An error occurred while sending transfer",
          reqNotFound: "transfer request not found",
        }
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
          reqNotFound: "Ionic swap accept request not found",
        }
      );

      break;
    }

    case "FINALIZE_ALIAS_CREATE": {
      PopupRequestsMethods.onRequestFinalize(
        "CREATE_ALIAS",
        request,
        sendResponse,
        async (req) =>
          createAlias({
            alias: req.alias,
            address: (await getWalletData()).address,
          }),
        {
          console: "Error creating alias",
          response: "An error occurred while creating alias",
          reqNotFound: "Alias create request not found",
        }
      );

      break;
    }

    case "IONIC_SWAP_ACCEPT": {
      try {
        const swapProposalRsp = await getSwapProposalInfo(
          request.hex_raw_proposal
        );
        const swapProposal = swapProposalRsp.result.proposal;

        if (!swapProposal) {
          throw new Error("Swap proposal not found");
        }

        request.swapProposal = swapProposal;

        const receivingAssetID = swapProposal?.to_finalizer?.[0]?.asset_id;
        const sendingAssetID = swapProposal?.to_initiator?.[0]?.asset_id;

        if (!receivingAssetID || !sendingAssetID) {
          throw new Error("Invalid swap proposal");
        }

        const receivingAsset = await getAsset(receivingAssetID);
        const sendingAsset = await getAsset(sendingAssetID);

        if (!receivingAsset || !sendingAsset) {
          throw new Error("One or both assets not found");
        }

        request.receivingAsset = receivingAsset;
        request.sendingAsset = sendingAsset;
      } catch {
        return sendResponse({
          error: "Failed to fetch proposal or assets info",
        });
      }
      PopupRequestsMethods.onRequestCreate(
        "ACCEPT_IONIC_SWAP",
        request,
        sendResponse,
        request as any
      );
      break;
    }

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
        burnBridge(
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
      getUserData().then((userData) => {
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
      getAliasDetails(String(request.alias))
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
      const signReq: any = signReqs.find((req: any) => req.id === reqId);

      if (signReq && signReqFinalizers[reqId]) {
        function finalize(data: any) {
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
            .then((data) => {
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
      openWindow().then((requestWindow) => {
        const signReqId = crypto.randomUUID();

        signReqFinalizers[signReqId] = (result) => {
          sendResponse(result);
        };

        allPopupIds.push(Number(requestWindow.id));

        signReqs.push({
          id: signReqId,
          windowId: requestWindow.id,
          message: request.message,
        });

        if (typeof request.timeout === "number") {
          setTimeout(() => {
            const signReqIndex = signReqs.findIndex(
              (req: any) => req.id === signReqId
            );

            if (signReqIndex === -1) {
              return;
            }

            signReqs.splice(signReqIndex, 1);
            delete signReqFinalizers[signReqId];
            sendResponse({ error: "Timeout exceeded" });
          }, request.timeout);
        }
      });

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
          sendResponse({
            error: "An error occurred while getting ionic swap proposal info",
          });
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

    case "CREATE_ALIAS": {
      try {
        if (!request.alias || request.alias.length < 6) {
          throw new Error("Alias too short");
        }

        const aliasExists = await getAliasDetails(request.alias);

        if (aliasExists) {
          throw new Error("Alias already exists");
        }

        const alreadyHaveAlias = (await getWalletData()).alias;

        if (alreadyHaveAlias) {
          throw new Error("Wallet already have an alias");
        }
      } catch {
        return sendResponse({ error: "Alias already exists or incorrect" });
      }

      PopupRequestsMethods.onRequestCreate(
        "CREATE_ALIAS",
        request,
        sendResponse,
        ({ alias: request.alias } as any)
      );
      break;
    }

    case "GET_ASSETS_WHITELIST_ADD_REQUESTS": {
      PopupRequestsMethods.getRequestsList("ASSETS_WHITELIST_ADD", sendResponse);
      break
    }

    case "ASSETS_WHITELIST_ADD": {
      try {
        const assetToAdd = await getAsset(request.asset_id || "");
        if (!assetToAdd) throw new Error("Failed to fetch asset");
        request.asset_name = assetToAdd.full_name;
      } catch (error) {
        return sendResponse({ error });
      }
      PopupRequestsMethods.onRequestCreate(
        "ASSETS_WHITELIST_ADD",
        request,
        sendResponse,
        request as any
      );
      break;

    }

    case "FINALIZE_ASSETS_WHITELIST_ADD_REQUESTS": {
      PopupRequestsMethods.onRequestFinalize(
        'ASSETS_WHITELIST_ADD',
        request,
        sendResponse,
        (req) => addAssetToWhitelist(req?.asset_id as string),
        {
          console: "Error accepting finalize add asset to whitelist:",
          response: "An error occurred while finalize add asset to whitelist",
          reqNotFound: "finalize add asset to whitelist accept request not found",
        }
      )
      break
    }
    case "BURN_ASSET":
      PopupRequestsMethods.onRequestCreate(
        "BURN_ASSET",
        request,
        sendResponse,
        {
          method: "FINALIZE_BURN_ASSET_REQUEST",
          name: "Burn asset",
          burn: request,
        } as any
      );
      break;

    case "GET_BURN_ASSET_REQUESTS":
      PopupRequestsMethods.getRequestsList("BURN_ASSET", sendResponse);
      break;

    case "FINALIZE_BURN_ASSET_REQUEST":
      PopupRequestsMethods.onRequestFinalize(
        "BURN_ASSET",
        request,
        sendResponse,
        async (req) => {
          const burnReq = req.burn as any;
          return burnAsset({
            assetId: burnReq.assetId,
            burnAmount: burnReq.burnAmount,
            nativeAmount: burnReq.nativeAmount,
            pointTxToAddress: burnReq.pointTxToAddress,
            serviceEntries: burnReq.serviceEntries,
          });
        },
        {
          console: "Burn asset error:",
          response: "Failed to burn asset",
          reqNotFound: "Burn asset request not found",
        }
      );
      break;


    default:
      console.error("Unknown message method:", request.method);
      sendResponse({ error: `Unknown method: ${request.method}` });
  }
}