/*global chrome*/
import { useContext, useEffect, useState, useCallback } from "react";
import { Router } from "react-chrome-extension-router";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import AppLoader from "./components/UI/AppLoader/AppLoader";
import Wallet from "./components/Wallet/Wallet";
import ModalConfirmation from "./components/ModalConfirmation/ModalConfirmation";
import { comparePasswords, fetchBackground, getSessionLogIn, passwordExists, setPassword, setSessionLogIn } from "./utils/utils";
import {
  updateWalletConnected,
  updateActiveWalletId,
  updateWalletsList,
  updateWalletData,
  updatePriceData,
  updateLoading,
  updateConfirmationModal,
  updateTransactionStatus,
} from "./store/actions";
import { Store } from "./store/store-reducer";
import { getZanoPrice } from "./api/coingecko";
import "./styles/App.scss";
import PasswordPage from "./components/PasswordPage/PasswordPage";
import PasswordCreatePage from "./components/PasswordCreatePage/PasswordCreatePage";

function App() {
  const { state, dispatch } = useContext(Store);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // Flags of display
  // creatingPassword flag has an effect only in case of loggedIn flag is false.
  // creatingPassword flag means whether to show the password create screen or existing password enter screen.
  const creatingPassword = !passwordExists();

  useEffect(() => {
    async function loadLogin() {
      const sessionLoggedIn = await getSessionLogIn();
      setLoggedIn(sessionLoggedIn);
    }
    loadLogin();
  }, []);
  
  const executeTransfer = useCallback(async () => {
    try {
      const response = await fetchBackground({
        method: "EXECUTE_BRIDGING_TRANSFER",
      });
      if (response.data.error) {
        return { sent: false, status: response.data.error };
      } else {
        return { sent: true, status: response.data.result };
      }
    } catch (error) {
      return { sent: false, status: error };
    }
  }, []);

  const closeModal = () => {
    setConfirmationModalOpen(false);
    updateConfirmationModal(dispatch, null);
    chrome.storage?.local?.remove?.(["pendingTx"]);
    chrome.action.setBadgeText({ text: "" });
  };

  const handleConfirm = async () => {
    try {
      const response = await executeTransfer();
      if (response.sent) {
        closeModal();
      } else {
        closeModal();
        console.log(response.status);
        updateTransactionStatus(dispatch, {
          visible: true,
          type: "error",
          code: response.status.code || 0,
          message: response.status.message || "Insufficient balance",
        });
      }
    } catch (error) {
      console.log("Error during transfer confirmation:", error);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (!chrome?.runtime?.sendMessage) return;

      const balanceData = await fetchBackground({
        method: "GET_WALLET_BALANCE",
      });
      updateWalletConnected(dispatch, !!balanceData.data);
    };

    const getWalletData = async () => {
      if (!chrome?.runtime?.sendMessage) return;

      const walletsList = await fetchBackground({ method: "GET_WALLETS" });
      if (!walletsList.data) return;
      updateWalletsList(dispatch, walletsList.data);

      const walletData = await fetchBackground({
        method: "GET_WALLET_DATA",
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
    const listener = (request, sender, sendResponse) => {
      if (
        !(
          "assetId" in request &&
          "amount" in request &&
          "destinationAddress" in request &&
          "destinationChainId" in request
        )
      ) {
        console.error("Invalid BRIDGING_TRANSFER request", request);
        return;
      }

      if (request.method === "BRIDGING_TRANSFER") {
        updateConfirmationModal(dispatch, {
          method: "SEND_TRANSFER",
          params: [
            request.assetId,
            request.amount,
            request.destinationAddress,
            request.destinationChainId,
          ],
        });
        chrome.storage?.local?.set?.({ pendingTx: request });
        setConfirmationModalOpen(true);
        sendResponse({ status: "confirmation_pending" });
      }
      return true;
    };

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(listener);
    }

    return () => {
      if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    chrome.storage?.local?.get?.(["pendingTx"], function (result) {
      if (result.pendingTx) {
        updateConfirmationModal(dispatch, {
          method: "SEND_TRANSFER",
          params: [
            result.pendingTx.assetId,
            result.pendingTx.amount,
            result.pendingTx.destinationAddress,
            result.pendingTx.destinationChainId,
          ],
        });
        setConfirmationModalOpen(true);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    chrome.storage?.local?.get?.(["key"], function (result) {
      let walletId = 0;
      if (!result.key) {
        chrome.storage?.local?.set?.({ key: walletId }, function () {
          console.log("Active wallet set to", walletId);
        });
      } else {
        walletId = result.key;
      }
      fetchBackground({
        method: "SET_ACTIVE_WALLET",
        id: walletId,
      });
      updateActiveWalletId(dispatch, walletId);
    });
  }, [dispatch]);

  return (
    <div className="App">
      <AppPlug />
      {state.isConnected && (
        <>
          <ModalConfirmation
            isOpen={confirmationModalOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
          />
          {loggedIn  && <Header />}
          <AppLoader />
          {
            loggedIn 
            ?
            (
              <div className="container">
                <Router>
                  <Wallet />
                  <TokensTabs />
                </Router>
              </div>
            ) 
            :
            (
              creatingPassword ? 
              <PasswordCreatePage 
                incorrectPassword={incorrectPassword} 
                setIncorrectPassword={setIncorrectPassword} 
                onConfirm={(password) => {
                  setPassword(password);
                  setLoggedIn(true);
                  setSessionLogIn(true);
                }}
              /> : 
              <PasswordPage 
                incorrectPassword={incorrectPassword} 
                setIncorrectPassword={setIncorrectPassword} 
                onConfirm={(password) => {
                  if (comparePasswords(password)) {
                    setLoggedIn(true);
                    setSessionLogIn(true);
                  } else {
                    setIncorrectPassword(true);
                  }
                }}
              />
            ) 
          }
          
        </>
      )}
    </div>
  );
}

export default App;
