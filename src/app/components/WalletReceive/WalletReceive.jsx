import React from "react";
// import QRCodeImage from "../../assets/images/qr.png";
import copyIcon from "../../assets/svg/copy.svg";
import { useCopy } from "../../hooks/useCopy";
import MyButton from "../UI/MyButton/MyButton";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import s from "./WalletReceive.module.scss";

const address =
  "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbogZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7GZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7GZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7G";

const WalletReceive = () => {
  const { SuccessCopyModal, copyToClipboard } = useCopy();
  return (
    <div>
      {SuccessCopyModal}

      <RoutersNav title="Receive" />

      <div className={s.content}>
        <div className={s.QRCode}>
          {/* <img src={QRCodeImage} alt="QR code for tokens receiving" /> */}
        </div>

        <div className={s.receiveAddress}>{address}</div>

        <MyButton onClick={() => copyToClipboard(address)}>
          <img src={copyIcon} alt="copy icon" /> Copy
        </MyButton>
      </div>
    </div>
  );
};

export default WalletReceive;
