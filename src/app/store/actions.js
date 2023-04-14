export const updateWalletsList = (dispatch, state) => {
  return dispatch({
    type: "WALLETS_LIST_UPDATED",
    payload: state,
  });
};

export const updateWallet = (dispatch, state) => {
  return dispatch({
    type: "WALLET_UPDATED",
    payload: state,
  });
};

export const updatePrice = (dispatch, state) => {
  return dispatch({
    type: "PRICE_UPDATED",
    payload: state,
  });
};
