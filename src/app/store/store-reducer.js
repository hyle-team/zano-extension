import { createContext, useReducer } from "react";

const initialState = {};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.payload };
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
