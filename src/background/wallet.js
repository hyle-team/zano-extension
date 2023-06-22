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

export const getAlias = async (address) => {
  //test data
  if (
    address ===
    "ZxCQeYtezjhMG2yV39jZBkapvXR2BVDJMMypBy1rFpvJLCnsShGHTYEG6juohsDMQCHgjiz5TAGMt5zQhE7uv24K1yM6bHP9u"
  ) {
    return "ravaga";
  } else if (
    address ===
    "ZxCSxg539Wohg9gGmqB4VNJaRi6oSH2stHinSi3mxmTEQwwiJ1eprLFg7BEZZcGX7e8BAnbJRC3VxFvzATec1ykw2zLMZfeus "
  ) {
    return "jejolare";
  } else if (
    address ===
    "ZxBuu7kJ2h2YWLcB8oRTu1euEvjpzFnLENoozd7LMoMv62pe5qE59mqDq8oX71N5XHf4jERyDEuudaQ7crEPKw2f2XB5nirvv"
  ) {
    return "andrew";
  }
  const response = await fetchData("get_alias_by_address", address);
  const data = await response.json();
  if (data.result.status === "OK") {
    return data.result.alias;
  } else {
    return "";
  }
};

export const getAliasDetails = async (alias) => {
  //test data
  if (alias === "ravaga") {
    return "ZxCQeYtezjhMG2yV39jZBkapvXR2BVDJMMypBy1rFpvJLCnsShGHTYEG6juohsDMQCHgjiz5TAGMt5zQhE7uv24K1yM6bHP9u";
  } else if (alias === "jejolare") {
    return "ZxCSxg539Wohg9gGmqB4VNJaRi6oSH2stHinSi3mxmTEQwwiJ1eprLFg7BEZZcGX7e8BAnbJRC3VxFvzATec1ykw2zLMZfeus";
  } else if (alias === "andrew") {
    return "ZxBuu7kJ2h2YWLcB8oRTu1euEvjpzFnLENoozd7LMoMv62pe5qE59mqDq8oX71N5XHf4jERyDEuudaQ7crEPKw2f2XB5nirvv";
  }
  const response = await fetchData("get_alias_details", { alias });
  const data = await response.json();
  if (data.result.status === "OK") {
    return data.result.address;
  } else {
    return "";
  }
};

export const getWallets = async () => {
  try {
    const response = await fetchData("mw_get_wallets");
    const data = await response.json();
    const wallets = await Promise.all(
      data.result.wallets.map(async (wallet) => {
        const alias = await getAlias(wallet.wi.address);
        const balance =
          wallet.wi.balances.find(
            (asset) =>
              asset.asset_info.asset_id ===
              "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
          ).total /
          10 ** 12;
        return {
          address: wallet.wi.address,
          alias: alias,
          balance: balance,
        };
      })
    );
    return wallets;
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    throw error;
  }
};

export const getWalletData = async () => {
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
  const txDataResponse = await fetchTxData();
  const txData = txDataResponse.result.transfers;
  let transactions = [];

  if (txData) {
    transactions = txData
      .filter((tx) => !tx.is_service)
      .map((tx) => ({
        isConfirmed: tx.height === 0 ? false : true,
        txHash: tx.tx_hash,
        blobSize: tx.tx_blob_size,
        timestamp: tx.timestamp,
        height: tx.height,
        paymentId: tx.payment_id,
        comment: tx.comment,
        transfers: tx.subtransfers.map((transfer) => ({
          amount: transfer.amount / 10 ** 12,
          assetId: transfer.asset_id,
          incoming: transfer.is_income,
        })),
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

  const alias = await getAlias(address);
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
