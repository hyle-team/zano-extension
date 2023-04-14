import copy from "copy-to-clipboard";
import React, { useState } from "react";
import copyIcon from "../../assets/svg/copy.svg";
import dotsIcon from "../../assets/svg/dots.svg";
import receiveIcon from "../../assets/svg/receive.svg";
import sendIcon from "../../assets/svg/send.svg";
import s from "./Wallet.module.scss";

const walletConnected = true;
const percentChange = false;
const walletAddress =
  "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7EPnwKFPa9Hy5frFbQoT6KQaR7";

const Wallet = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const copyToClipboard = (text) => {
    copy(text);
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000);
  };

  return (
    <div className={s.wallet}>
      <div className={s.infoWallet}>
        <div className={s.infoTop}>
          <div>Wallet Name 1</div>
          <button className={`${s.dotsButton} round-button`}>
            <img src={dotsIcon} alt="dots icon" />
          </button>
        </div>

        <div className={s.infoBalance}>
          <span>$1224.15</span>
          <span
            style={{ color: percentChange ? "#16D1D6" : "#FFCBCB" }}
            className={s.percentСhange}
          >
            -4.6%
          </span>
        </div>

        <div className={s.infoAddress}>
          <span>{walletAddress}</span>
          <button
            onClick={() => copyToClipboard(walletAddress)}
            className={`${s.copyButton} round-button`}
          >
            <img src={copyIcon} alt="SendIcon" />
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

