export const updateState = (dispatch, state) => {
  return dispatch({
    type: "SET_STATE",
    payload: state,
  });
};
