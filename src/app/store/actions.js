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

export const updatePriceData = (dispatch, state) => {
  return dispatch({
    type: "PRICE_DATA_UPDATED",
    payload: state,
  });
};
