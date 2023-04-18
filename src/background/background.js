// eslint-disable-next-line no-undef
chrome.runtime.onStartup.addListener(() => {
  console.log("Background script loaded on startup");
});

// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded on installation");
});

const fetchData = async (method) =>
  fetch("http://localhost:11112/json_rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "0",
      method,
    }),
  });

const fetchTxData = async () => {
  try {
    const response = await fetch("http://localhost:11112/json_rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "get_recent_txs_and_info",
        params: {
          offset: 0,
          update_provision_info: true,
          exclude_mining_txs: true,
          count: 10,
          order: "FROM_END_TO_BEGIN",
          exclude_unconfirmed: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const getWalletData = async () => {
  const addressResponse = await fetchData("getaddress");
  const addressParsed = await addressResponse.json();
  const address = addressParsed.result.address;

  const balanceResponse = await fetchData("getbalance");
  const balanceParsed = await balanceResponse.json();
  const balance = balanceParsed.result.balance / 10 ** 12;
  const txDataResponse = await fetchTxData();
  const txData = txDataResponse.result.transfers;
  let transactions = [];
  if (txData) {
    transactions = txData
      .filter((tx) => !tx.is_service)
      .map((tx) => ({
        isConfirmed: true,
        incoming: tx.is_income ? true : false,
        value: tx.amount / 10 ** 12,
        ticker: "ZANO",
        address: tx.remote_addresses ? tx.remote_addresses[0] : "Hidden",
      }));
  } else {
    transactions = [];
  }
  const assets = [{ name: "ZANO", ticker: "ZANO", balance, value: balance }];

  return { address, balance, transactions, assets };
};

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "GET_WALLET_ADDRESS") {
    fetchData("getaddress")
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
  if (request.message === "GET_WALLET_BALANCE") {
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

const transferRequestData = {
  jsonrpc: "2.0",
  id: 0,
  method: "transfer",
  params: {
    destinations: [
      {
        address:
          "ZxBvJDuQjMG9R2j4WnYUhBYNrwZPwuyXrC7FHdVmWqaESgowDvgfWtiXeNGu8Px9B24pkmjsA39fzSSiEQG1ekB225ZnrMTBp",
        amount: 10000000000,
      },
      {
        address:
          "ZxBvJDuQjMG9R2j4WnYUhBYNrwZPwuyXrC7FHdVmWqaESgowDvgfWtiXeNGu8Px9B24pkmjsA39fzSSiEQG1ekB225ZnrMTBq",
        amount: 20000000000,
      },
    ],
    fee: 10000000000,
    mixin: 0,
  },
};

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "GET_WALLET_DATA") {
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
