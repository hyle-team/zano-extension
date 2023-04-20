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

export const fetchData = async (method) =>
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

export const getWalletData = async () => {
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
        isConfirmed: tx.height === 0 ? false : true,
        incoming: tx.is_income ? true : false,
        amount: tx.amount / 10 ** 12,
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
  const assets = [{ name: "ZANO", ticker: "ZANO", balance, value: balance }];
  return { address, balance, transactions, assets };
};

export const transfer = async (destination, amount) => {
  const destinations = [
    {
      address: destination,
      amount: amount * 10 ** 12,
    },
  ];
  const response = await fetch("http://localhost:11112/json_rpc", {
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
