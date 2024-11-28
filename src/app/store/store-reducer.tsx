import React, { createContext, useReducer, ReactNode, useContext } from "react";

// Define the types for the state
interface Asset {
  name: string;
  ticker: string;
  balance: number;
  lockedBalance?: number;
  value: number;
  decimalPoint?: number;
  assetId?: string;
}

interface Transfer {
  assetId?: string;
  amount?: number;
}

interface Transaction {
  txHash?: string;
  isConfirmed: boolean;
  incoming: boolean;
  amount?: number;
  value?: number;
  ticker: string;
  address: string;
  transfers?: Transfer[];
  isInitiator?: boolean;
  fee?: number | string;
}

interface Wallet {
  address: string;
  alias: string;
  balance: number;
  lockedBalance?: number;
  assets: Asset[];
  transactions: Transaction[];
}

interface TransactionStatus {
  visible: boolean;
  type: string;
  code: number;
  message: string;
}

interface ConnectCredentials {
  token: string | null;
  port: string | null;
}

interface PriceData {
  price: number;
  change: number;
}

interface State {
  walletsList: { address: string; alias: string; balance: number, wallet_id?: number; }[];
  activeWalletId: number;
  wallet: Wallet;
  displayUsd: boolean;
  isLoading: boolean;
  isConnected: boolean | undefined;
  isBalancesHidden: boolean;
  priceData: PriceData;
  confirmationModal: string | null | any;
  transactionStatus: TransactionStatus;
  connectCredentials: ConnectCredentials;
  whitelistedAssets: string[];
  walletAddress?: string;
  walletBalance?: number;
}

// Initial state
const initialState: State = {
  walletsList: [
    {
      address:
        "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
      alias: "ravaga",
      balance: 1337,
    },
    {
      address:
        "ZxDCEeVaHsYXEJotN8Q5y4PW7Y4inrNaibqpmU7P9KGCZ76LBPYkn9Gf8BzCSLSJfpVDJ7GzBPApGEK4BVbogZwN2opPAQDfU",
      alias: "test",
      balance: 27,
    },
  ],
  activeWalletId: 0,
  wallet: {
    address:
      "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
    alias: "ravaga",
    balance: 1337,
    lockedBalance: 0,
    assets: [
      {
        name: "Zano",
        ticker: "ZANO",
        balance: 1337,
        lockedBalance: 0,
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
  displayUsd: false,
  isLoading: true,
  isConnected: undefined,
  isBalancesHidden: false,
  priceData: { price: 1, change: -4.6 },
  confirmationModal: null,
  transactionStatus: {
    visible: false,
    type: "",
    code: 0,
    message: "",
  },
  connectCredentials: {
    token: null,
    port: null,
  },
  whitelistedAssets: [],
};

type Action =
  | { type: "WALLET_ADDRESS_UPDATED"; payload: string }
  | { type: "WALLET_BALANCE_UPDATED"; payload: number }
  | { type: "WALLET_CONNECTED_UPDATED"; payload: boolean | undefined }
  | { type: "WALLETS_LIST_UPDATED"; payload: { address: string; alias: string; balance: number }[] }
  | { type: "ACTIVE_WALLET_ID_UPDATED"; payload: number }
  | { type: "WALLET_DATA_UPDATED"; payload: Wallet }
  | { type: "PRICE_DATA_UPDATED"; payload: PriceData }
  | { type: "DISPLAY_CURRENCY_UPDATED"; payload: boolean }
  | { type: "LOADING_UPDATED"; payload: boolean }
  | { type: "BALANCES_HIDDEN_UPDATED"; payload: boolean }
  | { type: "CONFIRMATION_MODAL_UPDATED"; payload: string | null }
  | { type: "TRANSACTION_STATUS_UPDATED"; payload: TransactionStatus }
  | { type: "SET_CONNECT_DATA"; payload: ConnectCredentials }
  | { type: "SET_WHITE_LIST"; payload: string[] }
  | { type: "SET_BALANCES_HIDDEN"; payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "WALLET_ADDRESS_UPDATED":
      return { ...state, walletAddress: action.payload };
    case "WALLET_BALANCE_UPDATED":
      return { ...state, walletBalance: action.payload };
    case "WALLET_CONNECTED_UPDATED":
      return { ...state, isConnected: action.payload };
    case "WALLETS_LIST_UPDATED":
      return { ...state, walletsList: action.payload };
    case "ACTIVE_WALLET_ID_UPDATED":
      return { ...state, activeWalletId: action.payload };
    case "WALLET_DATA_UPDATED":
      return { ...state, wallet: action.payload };
    case "PRICE_DATA_UPDATED":
      return { ...state, priceData: action.payload };
    case "DISPLAY_CURRENCY_UPDATED":
      return { ...state, displayUsd: action.payload };
    case "LOADING_UPDATED":
      return { ...state, isLoading: action.payload };
    case "BALANCES_HIDDEN_UPDATED":
      return { ...state, isBalancesHidden: action.payload };
    case "CONFIRMATION_MODAL_UPDATED":
      return { ...state, confirmationModal: action.payload };
    case "TRANSACTION_STATUS_UPDATED":
      return { ...state, transactionStatus: action.payload };
    case "SET_CONNECT_DATA":
      return { ...state, connectCredentials: action.payload };
    case "SET_WHITE_LIST":
      return { ...state, whitelistedAssets: action.payload };
    default:
      return state;
  }
};

export const Store = createContext<{ state: State; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => { },
});

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Store.Provider value={{ state, dispatch }}>{children}</Store.Provider>;
};

export const useStore = () => useContext(Store);

const updateWhiteList = (dispatch: React.Dispatch<Action>, whiteList: string[]) => {
  dispatch({
    type: "SET_WHITE_LIST",
    payload: whiteList,
  });
};

// Usage in a component:
const ExampleComponent = () => {
  const { state, dispatch } = useStore();

  const handleUpdateWhiteList = () => {
    updateWhiteList(dispatch, ["asset1", "asset2"]);
  };

  return (
    <div>
      <button onClick={handleUpdateWhiteList}>Update WhiteList</button>
    </div>
  );
};
