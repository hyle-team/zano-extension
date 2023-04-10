import { ReactComponent as CopyIcon } from "assets/svg/copy.svg";
import { ReactComponent as ReceiveIcon } from "assets/svg/receive.svg";
import { ReactComponent as SendIcon } from "assets/svg/send.svg";
import s from "components/Wallet/Wallet.module.scss";
import copy from "copy-to-clipboard";
import React, { useState } from "react";

const Wallet = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const walletConnected = true;
  const percentChange = false;
  const walletAddress =
    "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7EPnwKFPa9Hy5frFbQoT6KQaR7";

  const getWalletStatusColor = () => {
    return walletConnected ? "#16D1D6" : "#FFCBCB";
  };

  const getWalletPercentColor = () => {
    return percentChange ? "#16D1D6" : "#FFCBCB";
  };

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
          <div
            className={s.infoWalletStatus}
            style={{ backgroundColor: getWalletStatusColor() }}
          >
            <StatusModal
              walletConnected={walletConnected}
              getWalletStatusColor={getWalletStatusColor}
            />
          </div>
        </div>

        <div className={s.infoBalance}>
          <span>$1224.15</span>
          <span
            style={{ color: getWalletPercentColor() }}
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
            <CopyIcon />
          </button>
        </div>
      </div>

      <div className={s.actionsWallet}>
        <button className={s.actionsButton}>
          <SendIcon /> Send
        </button>
        <button className={s.actionsButton}>
          <ReceiveIcon /> Receive
        </button>
      </div>

      {modalVisible && (
        <div className={s.clipboardModal}>Copied to clipboard!</div>
      )}
    </div>
  );
};

export default Wallet;

// Components
const StatusModal = ({ walletConnected, getWalletStatusColor }) => (
  <div className={s.status}>
    <div style={{ color: getWalletStatusColor() }} className={s.statusTitle}>
      {walletConnected ? "Connected" : "Disconnected"}
    </div>
    <div className={s.statusContent}>
      <div className={s.statusAddress}>website.com</div>
      <div className={s.statusText}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit
      </div>
    </div>
  </div>
);
