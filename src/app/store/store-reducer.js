import { createContext, useReducer } from "react";

const initialState = {
  walletsList: [
    {
      address:
        "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
      alias: "ravaga",
      balance: 1000,
    },
    {
      address:
        "ZxDCEeVaHsYXEJotN8Q5y4PW7Y4inrNaibqpmU7P9KGCZ76LBPYkn9Gf8BzCSLSJfpVDJ7GzBPApGEK4BVbogZwN2opPAQDfU",
      alias: "test",
      balance: 27,
    },
  ],
  wallet: {
    address:
      "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
    alias: "ravaga",
    balance: 1000,
    assets: [
      {
        name: "ZANO",
        ticker: "ZANO",
        balance: 1000,
        value: 1000,
      },
      {
        name: "Wrapped Bitcoin",
        ticker: "WBTC",
        balance: 0.212,
        value: 4096.96,
      },
      {
        name: "Wrapped Ethereum",
        ticker: "WETH",
        balance: 2.1,
        value: 3020.12,
      },
      {
        name: "Confidential Token",
        ticker: "CT",
        balance: 15.52,
        value: 672.84,
      },
    ],
    transactions: [
      {
        isConfirmed: true,
        incoming: true,
        amount: 100,
        ticker: "ZANO",
        address:
          "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
      },
      {
        isConfirmed: false,
        incoming: false,
        value: 17,
        ticker: "ZANO",
        address:
          "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
      },
    ],
  },
  displayUsd: true,
  isLoading: true,
  isConnected: true,
  priceData: { price: 1, change: -4.6 },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "WALLET_ADDRESS_UPDATED":
      return { ...state, walletAddress: action.payload };
    case "WALLET_BALANCE_UPDATED":
      return { ...state, walletBalance: action.payload };
    case "WALLET_CONNECTED_UPDATED":
      return { ...state, isConnected: action.payload };
    case "WALLETS_LIST_UPDATED":
      return { ...state, walletsList: action.payload };
    case "WALLET_DATA_UPDATED":
      return { ...state, wallet: action.payload };
    case "PRICE_DATA_UPDATED":
      return { ...state, priceData: action.payload };
    case "DISPLAY_CURRENCY_UPDATED":
      return { ...state, displayUsd: action.payload };
    case "LOADING_UPDATED":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const Store = createContext(initialState);

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Store.Provider value={{ state, dispatch }}>{children}</Store.Provider>
  );
};
