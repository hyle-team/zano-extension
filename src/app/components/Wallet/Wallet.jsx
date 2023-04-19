import { useContext } from "react";
import { Link } from "react-chrome-extension-router";
import copyIcon from "../../assets/svg/copy.svg";
import dotsIcon from "../../assets/svg/dots.svg";
import receiveIcon from "../../assets/svg/receive.svg";
import sendIcon from "../../assets/svg/send.svg";
import { useCopy } from "../../hooks/useCopy";
import { Store } from "../../store/store-reducer";
import WalletReceive from "../WalletReceive/WalletReceive";
import s from "./Wallet.module.scss";

const Wallet = () => {
  const { state } = useContext(Store);
  const { SuccessCopyModal, copyToClipboard } = useCopy();

  const sendTransfer = async () => {
    // eslint-disable-next-line no-undef
    if (chrome.runtime.sendMessage) {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        {
          message: "SEND_TRANSFER",
          destination:
            "ZxDTZ8LJ88ZK6Ja1P9iqDNgCiBM6FhiBKdDoTAoEp9nY9q8d846iePAGYGjNvrU9uFHDXD3by5CooSBrsXBDfE9M11WBwAxQ9",
          amount: 1,
        },
        (response) => {
          if (response.data) {
            console.log("Sent", response.data);
          }
        }
      );
    }
  };

  const renderBalance = () => {
    if (state.displayUsd) {
      return (
        <div className={s.infoBalance}>
          <span>${state.wallet.balance * state.priceUsd}</span>
          <span
            style={{ color: state.percentChange > 0 ? "#16D1D6" : "#FFCBCB" }}
            className={s.percentСhange}
          >
            {state.percentChange}%
          </span>
        </div>
      );
    } else {
      return (
        <div className={s.infoBalance}>
          <span>{state.wallet.balance} ZANO</span>
        </div>
      );
    }
  };

  return (
    <div className={s.wallet}>
      {SuccessCopyModal}

      <div className={s.infoWallet}>
        <div className={s.infoTop}>
          <div>
            {state.wallet.alias ? "@" + state.wallet.alias : "Wallet 1"}
          </div>
          <button className={`${s.dotsButton} round-button`}>
            <img src={dotsIcon} alt="dots icon" />
          </button>
        </div>

        {renderBalance()}

        <div className={s.infoAddress}>
          <span>{state.wallet.address}</span>
          <button
            onClick={() => copyToClipboard(state.wallet.address)}
            className={`${s.copyButton} round-button`}
          >
            <img src={copyIcon} alt="copy icon" />
          </button>
        </div>
      </div>

      <div className={s.actionsWallet}>
        {/*<Link
          component={WalletSend}
          props={{ message: "I came from Wallet component" }}
          className={s.actionsButton}
        >
          <img src={sendIcon} alt="send icon" /> Send
        </Link>*/}
        <button className={s.actionsButton}>
          <img src={sendIcon} alt="send icon" /> Send
        </button>
        <Link
          component={WalletReceive}
          props={{ message: "I came from Wallet component" }}
          className={s.actionsButton}
        >
          <img src={receiveIcon} alt="receive icon" /> Receive
        </Link>
      </div>
    </div>
  );
};

export default Wallet;
