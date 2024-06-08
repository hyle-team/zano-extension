export const updateWalletsList = (dispatch, state) => {
  return dispatch({
    type: "WALLETS_LIST_UPDATED",
    payload: state,
  });
};

export const updateWalletData = (dispatch, state) => {
  return dispatch({
    type: "WALLET_DATA_UPDATED",
    payload: state,
  });
};

export const updateWalletConnected = (dispatch, state) => {
  return dispatch({
    type: "WALLET_CONNECTED_UPDATED",
    payload: state,
  });
};

export const updateActiveWalletId = (dispatch, state) => {
  return dispatch({
    type: "ACTIVE_WALLET_ID_UPDATED",
    payload: state,
  });
};

export const updatePriceData = (dispatch, state) => {
  return dispatch({
    type: "PRICE_DATA_UPDATED",
    payload: state,
  });
};

export const updateDisplay = (dispatch, state) => {
  return dispatch({
    type: "DISPLAY_CURRENCY_UPDATED",
    payload: state,
  });
};

export const updateLoading = (dispatch, state) => {
  return dispatch({
    type: "LOADING_UPDATED",
    payload: state,
  });
};

export const updateBalancesHidden = (dispatch, state) => {
  return dispatch({
    type: "BALANCES_HIDDEN_UPDATED",
    payload: state,
  });
};

export const updateConfirmationModal = (dispatch, state) => {
  return dispatch({
    type: "CONFIRMATION_MODAL_UPDATED",
    payload: state,
  });
};

export const updateTransactionStatus = (dispatch, state) => {
  return dispatch({
    type: "TRANSACTION_STATUS_UPDATED",
    payload: state,
  });
};

export const setConnectData = (dispatch, state) => {
  return dispatch({
    type: "SET_CONNECT_DATA",
    payload: state
  });
};

export const setWhiteList = (dispatch, state) => {
  return dispatch({
    type: "SET_WHITE_LIST",
    payload: state
  });
}