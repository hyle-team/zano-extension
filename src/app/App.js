import { useContext } from "react";
import { Router } from "react-chrome-extension-router";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import Wallet from "./components/Wallet/Wallet";
import { Store } from "./store/store-reducer";
import "./styles/App.scss";

function App() {
  const { state, dispatch } = useContext(Store);

  // useEffect(() => {
  //   const checkConnection = async () => {
  //     // eslint-disable-next-line no-undef
  //     if (chrome.runtime.sendMessage) {
  //       // eslint-disable-next-line no-undef
  //       chrome.runtime.sendMessage(
  //         { message: "GET_WALLET_BALANCE" },
  //         (response) => {
  //           if (response.data) {
  //             updateWalletConnected(dispatch, true);
  //           } else {
  //             updateWalletConnected(dispatch, false);
  //           }
  //         }
  //       );
  //     }
  //   };
  //
  //   const getWalletData = async () => {
  //     // eslint-disable-next-line no-undef
  //     if (chrome.runtime.sendMessage) {
  //       // eslint-disable-next-line no-undef
  //       chrome.runtime.sendMessage(
  //         { message: "GET_WALLET_DATA" },
  //         (response) => {
  //           if (response.data) {
  //             const { address, balance, transactions, assets } = response.data;
  //             updateWalletData(dispatch, {
  //               address,
  //               alias: "alias",
  //               balance,
  //               assets,
  //               transactions,
  //             });
  //             console.log("wallet data updated");
  //           }
  //         }
  //       );
  //     }
  //   };
  //
  //   const intervalId = setInterval(async () => {
  //     await checkConnection();
  //     console.log("connected", state.isConnected);
  //     if (state.isConnected) {
  //       await getWalletData();
  //     }
  //   }, 1000);
  //
  //   return () => clearInterval(intervalId);
  // }, [dispatch, state.isConnected]);

  // state.isConnected && setInterval(() => getWalletData(), 1000);

  return (
    <div className="App">
      {state.isConnected ? (
        <>
          <Header />
          <div className="container">
            <Router>
              <Wallet />
              <TokensTabs />
            </Router>
          </div>
        </>
      ) : (
        <AppPlug />
      )}
    </div>
  );
}

export default App;
