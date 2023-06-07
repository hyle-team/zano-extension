const fetchTxData = async () => {
  try {
    const response = await fetch("http://localhost:12111/json_rpc", {
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
          count: 20,
          order: "FROM_END_TO_BEGIN",
          exclude_unconfirmed: false,
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

export const fetchData = async (method, params = {}) =>
  fetch("http://localhost:12111/json_rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "0",
      method,
      params,
    }),
  });

export const getWallets = async () => {
  try {
    const response = await fetchData("mw_get_wallets");
    const data = await response.json();
    // await selectWallet(id);
    const wallets = data.result.wallets.map((wallet) => ({
      address: wallet.wi.address,
      alias: "todo",
      balance:
        wallet.wi.balances.find(
          (asset) =>
            asset.asset_info.asset_id ===
            "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
        ).total /
        10 ** 12,
    }));
    return wallets;
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    throw error;
  }
};

export const selectWallet = async (id) => {
  const response = await fetchData("mw_select_wallet", { wallet_id: id });
  const data = await response.json();
  if (data.result.status !== "OK") {
    console.log("Error selecting wallet:", data.result.status);
  }
};

export const getWalletData = async (id) => {
  console.log("Wallet id", id);
  await selectWallet(id);
  const addressResponse = await fetchData("getaddress");
  const addressParsed = await addressResponse.json();
  const address = addressParsed.result.address;
  const balanceResponse = await fetchData("getbalance");
  const balanceParsed = await balanceResponse.json();
  const balance =
    balanceParsed.result.balances.find(
      (asset) =>
        asset.asset_info.asset_id ===
        "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
    ).total /
    10 ** 12;
  //TODO: get balance for all assets - blocked by api
  const txDataResponse = await fetchTxData();
  const txData = txDataResponse.result.transfers;
  let transactions = [];
  if (txData) {
    transactions = txData
      .filter((tx) => !tx.is_service)
      .map((tx) => ({
        isConfirmed: tx.height === 0 ? false : true,
        incoming: tx.is_income ? true : false,
        amount: tx.amount / 10 ** 12,
        //TODO: get ticker from asset id
        ticker: "ZANO",
        address: tx.remote_addresses ? tx.remote_addresses[0] : "Hidden",
        txHash: tx.tx_hash,
        blobSize: tx.tx_blob_size,
        timestamp: tx.timestamp,
        height: tx.height,
        inputs: Array.isArray(tx.td.rcv)
          ? tx.td.rcv.map((input) => input / 10 ** 12)
          : "",
        outputs: Array.isArray(tx.td.spn)
          ? tx.td.spn.map((output) => output / 10 ** 12)
          : "",
        paymentId: tx.payment_id,
        comment: tx.comment,
      }));
  } else {
    transactions = [];
  }

  const assets = balanceParsed.result.balances
    .map((asset) => ({
      name: asset.asset_info.full_name,
      ticker: asset.asset_info.ticker,
      assetId: asset.asset_info.asset_id,
      balance: asset.total / 10 ** 12,
    }))
    .sort((a, b) => {
      if (
        a.assetId ===
        "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
      ) {
        return -1;
      } else if (
        b.assetId ===
        "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
      ) {
        return 1;
      }
      return 0;
    });

  //TODO: fetch alias from wallet
  const alias = "todo";

  return { address, alias, balance, transactions, assets };
};

// TODO: add assets support to trasnfer
export const transfer = async (destination, amount) => {
  const destinations = [
    {
      address: destination,
      amount: amount * 10 ** 12,
    },
  ];
  const response = await fetch("http://localhost:12111/json_rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "0",
      method: "transfer",
      params: {
        destinations,
        fee: 10000000000,
        mixin: 10,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
