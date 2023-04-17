import copy from "copy-to-clipboard";
import { useState, useContext } from "react";
import copyIcon from "../../assets/svg/copy.svg";
import dotsIcon from "../../assets/svg/dots.svg";
import receiveIcon from "../../assets/svg/receive.svg";
import sendIcon from "../../assets/svg/send.svg";
import s from "./Wallet.module.scss";
import { Store } from "../../store/store-reducer";

const Wallet = () => {
  const { state } = useContext(Store);
  const [modalVisible, setModalVisible] = useState(false);

  const copyToClipboard = (text) => {
    copy(text);
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000);
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
        <button className={s.actionsButton}>
          <img src={sendIcon} alt="send icon" /> Send
        </button>
        <button className={s.actionsButton}>
          <img src={receiveIcon} alt="receive icon" /> Receive
        </button>
      </div>

      {modalVisible && (
        <div className={s.clipboardModal}>Copied to clipboard!</div>
      )}
    </div>
  );
};

export default Wallet;
