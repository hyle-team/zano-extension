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
    assets: [],
    transactions: [],
  },
  displayUsd: true,
  isConnected: true,
  priceUsd: 1,
  percentChange: -4.6,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "WALLETS_LIST_UPDATED":
      return { ...state, walletsList: action.payload };
    case "WALLET_UPDATED":
      return { ...state, wallet: action.payload };
    case "PRICE_UPDATED":
      return { ...state, price: action.payload };
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
