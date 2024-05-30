import { addZeros, removeZeros } from "../app/utils/utils";
import { apiCredentials } from "./background";
import forge from "node-forge";
import { Buffer } from 'buffer';
// window.Buffer = Buffer;

function createJWSToken(payload, secrete_str) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
  
    const signature = forge.hmac.create();
    signature.start('sha256', secrete_str);
    signature.update(`${encodedHeader}.${encodedPayload}`);
    const encodedSignature = forge.util.encode64(signature.digest().getBytes()).replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }
  
  function generateRandomString(length) {
      const bytes = forge.random.getBytesSync(Math.ceil(length / 2));
      const hexString = forge.util.bytesToHex(bytes);
      return hexString.substring(0, length);
  }
  
  function generateAccessToken(httpBody) {
  
    if (!apiCredentials?.token) {
      throw new Error("No API credentials found, extension is not connected");
    }

    // Calculate the SHA-256 hash of the HTTP body
    const md = forge.md.sha256.create();
    md.update(httpBody);
    const bodyHash = md.digest().toHex();
      
    // Example payload
    const payload = {
      body_hash: bodyHash,
      user: 'zano_extension',
      salt: generateRandomString(64),
      exp: Math.floor(Date.now() / 1000) + (60), // Expires in 1 minute
    };
    
    return createJWSToken(payload, apiCredentials?.token);
  }

export const fetchData = async (method, params = {}) => {

  const httpBody = JSON.stringify({
      jsonrpc: "2.0",
      id: "0",
      method,
      params,
    }); 
    
  return fetch(`http://localhost:${apiCredentials.port}/json_rpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Zano-Access-Token": generateAccessToken(httpBody)
    },
    body: httpBody,
  });
}
  
const fetchTxData = async () => {
  try {
    const response = await fetchData("get_recent_txs_and_info2", {
      offset: 0,
      update_provision_info: true,
      exclude_mining_txs: true,
      count: 20,
      order: "FROM_END_TO_BEGIN",
      exclude_unconfirmed: false,
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

export const getAlias = async (address) => {
  const response = await fetchData("get_alias_by_address", address);
  const data = await response.json();
  if (data.result?.status === "OK") {
    return data.result.alias_info_list[0].alias;
  } else {
    return "";
  }
};

export const getAliasDetails = async (alias) => {
  const response = await fetchData("get_alias_details", { alias });
  const data = await response.json();
  if (data.result.status === "OK") {
    return data.result.alias_details.address;
  } else {
    return "";
  }
};

export const getWallets = async () => {
  try {
    const response = await fetchData("mw_get_wallets");
    const data = await response.json();

    if (!data?.result?.wallets) {
      return [];
    }

    console.log('wallets:', data.result.wallets);

    const wallets = await Promise.all(
      data.result.wallets.filter(e => !e?.wi?.is_watch_only).map(async (wallet) => {
        const alias = await getAlias(wallet.wi.address);
        const balance = wallet.wi.balances.find(
          (asset) =>
            asset.asset_info.asset_id ===
            "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
        ).total;

        return {
          address: wallet.wi.address,
          alias: alias,
          balance: removeZeros(balance),
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
  const balance = removeZeros(
    balanceParsed.result.balances.find(
      (asset) =>
        asset.asset_info.asset_id ===
        "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
    ).total
  );
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
        fee: removeZeros(tx.fee),
        addresses: tx.remote_addresses,
        transfers: tx.subtransfers.map((transfer) => ({
          amount: removeZeros(transfer.amount),
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
      balance: removeZeros(asset.total),
      unlockedBalance: removeZeros(asset.unlocked),
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

  console.log('get alias:', address);

  const alias = await getAlias(address);
  return { address, alias, balance, transactions, assets };
};

export const ionicSwap = async (swapParams) => {

  const swapRequest = {
    jsonrpc: "2.0",
    id: "0",
    method: "ionic_swap_generate_proposal",
    params: {
      proposal: {
        to_initiator: [
          {
            asset_id: swapParams.destinationAssetID,
            amount: swapParams.destinationAssetAmount * 1e12,
          },
        ],
        to_finalizer: [
          {
            asset_id: swapParams.currentAssetID,
            amount: swapParams.currentAssetAmount * 1e12,
          },
        ],
        mixins: 10,
        fee_paid_by_a: 10000000000,
        expiration_time: swapParams.expirationTimestamp,
      },
      destination_address: swapParams.destinationAddress,
    }
  };

  console.log('send swap request:', swapRequest);

  const response = await fetchData("ionic_swap_generate_proposal", {
    proposal: {
      to_initiator: [
        {
          asset_id: swapParams.destinationAssetID,
          amount: swapParams.destinationAssetAmount * 1e12,
        },
      ],
      to_finalizer: [
        {
          asset_id: swapParams.currentAssetID,
          amount: swapParams.currentAssetAmount * 1e12,
        },
      ],
      mixins: 10,
      fee_paid_by_a: 10000000000,
      expiration_time: swapParams.expirationTimestamp,
    },
    destination_address: swapParams.destinationAddress,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const ionicSwapAccept = async (swapParams) => {

  console.log(swapParams.hex_raw_proposal);

  const response = await fetchData("ionic_swap_accept_proposal", {
    hex_raw_proposal: swapParams.hex_raw_proposal,
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
      amount: addZeros(amount),
      asset_id: assetId,
    },
  ];

  const response = await fetchData("transfer", {
    destinations,
    fee: 10000000000,
    mixin: 10,
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
      amount: addZeros(amount),
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

  const response = await fetchData("transfer", {
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
  });

  // console.log(response);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const createConnectKey = async () => {
  return await fetch(`http://localhost:${apiCredentials.port}/connect-api-consumer`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
  }).then(r => r.json());
}

export const validateConnectKey = async (key) => {
  return await fetch(`http://localhost:${apiCredentials.port}/validate-connection-key`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key })
  }).then(r => r.json());
}
