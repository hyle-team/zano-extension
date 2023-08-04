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
  } else if (
    address ===
    "ZxC9QP7typsY26RpkkPjDNjGocUyxcvSB7SDvFyuWW2EXF4cDiYjtFoVzZFZQjGmmUU7hUtSYQ3QyfZ3nBjmwdqC2Pp5F4AVV"
  ) {
    return "sega";
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
  } else if (alias === "sega") {
    return "ZxC9QP7typsY26RpkkPjDNjGocUyxcvSB7SDvFyuWW2EXF4cDiYjtFoVzZFZQjGmmUU7hUtSYQ3QyfZ3nBjmwdqC2Pp5F4AVV";
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

  // console.log(txData);

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
        fee: tx.fee / 10 ** 12,
        addresses: tx.remote_addresses,
        transfers: tx.subtransfers.map((transfer) => ({
          amount: transfer.amount / 10 ** 12,
          assetId: transfer.asset_id,
          incoming: transfer.is_income,
        })),
      }));
  }

  const assets = balanceParsed.result.balances
    .map((asset) => ({
      name: asset.asset_info.full_name,
      ticker: asset.asset_info.ticker,
      assetId: asset.asset_info.asset_id,
      balance: asset.total / 10 ** 12,
      unlockedBalance: asset.unlocked / 10 ** 12,
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

  // console.log(assets);

  const alias = await getAlias(address);
  return { address, alias, balance, transactions, assets };
};

export const IonicSwap = async (swapParams) => {
  const response = await fetch("http://localhost:12111/json_rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": "0",
      "method": "ionic_swap_generate_proposal",
      "params": {
        "proposal": {
          "to_bob": [{
            "asset_id": swapParams.destinationAssetID,
            "amount": swapParams.destinationAssetAmount*1e12
          }],
          "to_alice": [{
            "asset_id": swapParams.currentAssetID,
            "amount": swapParams.currentAssetAmount*1e12 
          }],
          "mixins": 10,
          "fee_paid_by_a": 10000000000,
          "expiration_time": swapParams.expirationTimestamp,
        },
        "destination_address": swapParams.destinationAddress
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const transfer = async (
  assetId = "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a",
  destination,
  amount
) => {
  const destinations = [
    {
      address: destination,
      amount: amount * 10 ** 12,
      asset_id: assetId,
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

export const transferBridge = async (
  assetId = "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a",
  amount,
  destinationAddress,
  destinationChainId
) => {
  const destinations = [
    {
      address:
        "ZxCzikmFWMZEX8z3nojPyzcFUeEYcihX2jFvhLLYvJqtdgne2RLFd6UDaPgmzMNgDZP71E7citLPei4pLCWDjUWS1qGzMuagu",
      amount: amount * 10 ** 12,
      asset_id: assetId,
    },
  ];

  const bodyData = {
    service_id: "B",
    instruction: "BI",
    dst_add: destinationAddress,
    dst_net_id: destinationChainId,
    uniform_padding: "    ",
  };

  const jsonString = JSON.stringify(bodyData);
  const bytes = new TextEncoder().encode(jsonString);
  const bodyHex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

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
        service_entries_permanent: true,
        service_entries: [
          {
            service_id: "X",
            instruction: "",
            body: bodyHex,
            flags: 5,
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
