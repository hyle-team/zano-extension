import { useContext, useEffect } from "react";
import { Router } from "react-chrome-extension-router";
import { getWalletData } from "../background/wallet";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import Loader from "./components/UI/Loader/Loader";
import Wallet from "./components/Wallet/Wallet";
import {
  updateWalletConnected,
  updateWalletData,
  updatePriceData,
  updateLoading,
} from "./store/actions";
import { Store } from "./store/store-reducer";
import { getZanoPrice } from "./api/coingecko";
import "./styles/App.scss";

function App() {
  const { state, dispatch } = useContext(Store);

  useEffect(() => {
    const checkConnection = async () => {
      // eslint-disable-next-line no-undef
      if (chrome.runtime.sendMessage) {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(
          { message: "GET_WALLET_BALANCE" },
          (response) => {
            if (response.data) {
              updateWalletConnected(dispatch, true);
            } else {
              updateWalletConnected(dispatch, false);
            }
          }
        );
      }
    };

    const getWalletData = async () => {
      // eslint-disable-next-line no-undef
      if (chrome.runtime.sendMessage) {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(
          { message: "GET_WALLET_DATA" },
          (response) => {
            if (response.data) {
              const { address, balance, transactions, assets } = response.data;
              updateWalletData(dispatch, {
                address,
                alias: "alias",
                balance,
                assets,
                transactions,
              });
              console.log("wallet data updated");
              updateLoading(dispatch, false);
            }
          }
        );
      }
    };

    const intervalId = setInterval(async () => {
      await checkConnection();
      console.log("connected", state.isConnected);
      if (state.isConnected) {
        await getWalletData();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, state.isConnected]);

  useEffect(() => {
    getZanoPrice().then((priceData) => {
      console.log("price data", priceData);
      updatePriceData(dispatch, priceData);
    });
  }, [dispatch]);

  return (
    <div className="App">
      <AppPlug />
      {state.isConnected && (
        <>
          <Header />
          <Loader />
          <div className="container">
            <Router>
              <Wallet />
              <TokensTabs />
            </Router>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
