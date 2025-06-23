// Define types for the structure of your state
interface WalletState {
	wallets: string[];
	walletData: object;
	isConnected: boolean;
	activeWalletId: string | number;
	priceData: object;
	displayCurrency: string;
	isLoading: boolean;
	balancesHidden: boolean;
	confirmationModalOpen: boolean | null | { method: string; params: string[] };
	transactionStatus: string;
	connectData: object;
	whiteList: string[];
}

export type DispatchFunction = (_saction: {
	type: string;
	payload: WalletState[keyof WalletState];
}) => void;

export const updateWalletsList = (
	dispatch: DispatchFunction,
	state: WalletState['wallets'],
): void =>
	dispatch({
		type: 'WALLETS_LIST_UPDATED',
		payload: state,
	});

export const updateWalletData = (
	dispatch: DispatchFunction,
	state: WalletState['walletData'],
): void =>
	dispatch({
		type: 'WALLET_DATA_UPDATED',
		payload: state,
	});

export const updateWalletConnected = (
	dispatch: DispatchFunction,
	state: WalletState['isConnected'],
): void =>
	dispatch({
		type: 'WALLET_CONNECTED_UPDATED',
		payload: state,
	});

export const updateActiveWalletId = (
	dispatch: DispatchFunction,
	state: WalletState['activeWalletId'],
): void =>
	dispatch({
		type: 'ACTIVE_WALLET_ID_UPDATED',
		payload: state,
	});

export const updatePriceData = (
	dispatch: DispatchFunction,
	state: WalletState['priceData'],
): void =>
	dispatch({
		type: 'PRICE_DATA_UPDATED',
		payload: state,
	});

export const updateDisplay = (
	dispatch: DispatchFunction,
	state: WalletState['displayCurrency'],
): void =>
	dispatch({
		type: 'DISPLAY_CURRENCY_UPDATED',
		payload: state,
	});

export const updateLoading = (dispatch: DispatchFunction, state: WalletState['isLoading']): void =>
	dispatch({
		type: 'LOADING_UPDATED',
		payload: state,
	});

export const updateBalancesHidden = (
	dispatch: React.Dispatch<{ type: 'BALANCES_HIDDEN_UPDATED'; payload: boolean }>,
	state: boolean,
): void =>
	dispatch({
		type: 'BALANCES_HIDDEN_UPDATED',
		payload: state,
	});

export const updateConfirmationModal = (
	dispatch: DispatchFunction,
	state: WalletState['confirmationModalOpen'],
): void =>
	dispatch({
		type: 'CONFIRMATION_MODAL_UPDATED',
		payload: state,
	});

export const updateTransactionStatus = (
	dispatch: DispatchFunction,
	state: WalletState['transactionStatus'] | object,
): void =>
	dispatch({
		type: 'TRANSACTION_STATUS_UPDATED',
		payload: state,
	});

interface ConnectCredentials {
	token: string;
	port: string;
}

export const setConnectData = (dispatch: DispatchFunction, state: ConnectCredentials): void =>
	dispatch({
		type: 'SET_CONNECT_DATA',
		payload: state,
	});

export const setWhiteList = (dispatch: DispatchFunction, state: WalletState['whiteList']): void =>
	dispatch({
		type: 'SET_WHITE_LIST',
		payload: state,
	});
