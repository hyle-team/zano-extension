import { useContext, useEffect } from "react";
import { Router } from "react-chrome-extension-router";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import Loader from "./components/UI/Loader/Loader";
import Wallet from "./components/Wallet/Wallet";
import { fetchBackground } from "./utils/utils";
import {
  updateWalletConnected,
  updateActiveWalletId,
  updateWalletsList,
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
      if (!chrome?.runtime?.sendMessage) return;

      const balanceData = await fetchBackground({
        method: "GET_WALLET_BALANCE",
      });
      updateWalletConnected(dispatch, !!balanceData.data);
    };

    const getWalletData = async () => {
      // eslint-disable-next-line no-undef
      if (!chrome?.runtime?.sendMessage) return;

      const walletsList = await fetchBackground({ method: "GET_WALLETS" });
      if (!walletsList.data) return;
      updateWalletsList(dispatch, walletsList.data);

      const walletData = await fetchBackground({
        method: "GET_WALLET_DATA",
        id: state.activeWalletId,
      });
      if (!walletData.data) return;
      const { address, alias, balance, transactions, assets } = walletData.data;
      updateWalletData(dispatch, {
        address,
        alias,
        balance,
        assets,
        transactions,
      });

      console.log("wallet data updated");
      updateLoading(dispatch, false);
    };

    const intervalId = setInterval(async () => {
      await checkConnection();
      console.log("connected", state.isConnected);
      if (state.isConnected) {
        await getWalletData();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, state.isConnected, state.activeWalletId]);

  useEffect(() => {
    getZanoPrice().then((priceData) => {
      console.log("price data", priceData);
      updatePriceData(dispatch, priceData);
    });
  }, [dispatch]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.get(["key"], function (result) {
      if (!result.key) return;
      updateActiveWalletId(dispatch, result.key);
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
