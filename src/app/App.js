import { useContext, useEffect } from "react";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import Wallet from "./components/Wallet/Wallet";
import "./styles/App.scss";
import { Store } from "./store/store-reducer";
import { updateWalletConnected, updateWalletData } from "./store/actions";
function App() {
  const { state, dispatch } = useContext(Store);

  useEffect(() => {
    const fetchData = async () => {
      // eslint-disable-next-line no-undef
      if (chrome.runtime.sendMessage) {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(
          { message: "GET_WALLET_BALANCE" },
          (response) => {
            if (response.data) {
              console.log("Wallet connected");
              updateWalletConnected(dispatch, true);
            }
          }
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // eslint-disable-next-line no-undef
      if (chrome.runtime.sendMessage) {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(
          { message: "GET_WALLET_DATA" },
          (response) => {
            if (response.data) {
              const { address, balance, transactions } = response.data;
              updateWalletData(dispatch, {
                address,
                alias: "alias",
                balance,
                assets: [],
                transactions,
              });
            }
          }
        );
      }
    };

    fetchData();
  }, [state.wallet.isConnected]);

  return (
    <div className="App">
      {state.isConnected ? (
        <>
          <Header />
          <div className="container">
            <Wallet />
            <TokensTabs />
          </div>
        </>
      ) : (
        <AppPlug />
      )}
    </div>
  );
}

export default App;
