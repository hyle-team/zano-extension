import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { StoreProvider } from ".app/store/store-reducer";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
