import React, { useContext, useState } from "react";
import { goTo, popToTop } from "react-chrome-extension-router";
import App from "../../App";
import failedImage from "../../assets/images/failed-round.png";
import successImage from "../../assets/images/success-round.png";
import { useCheckbox } from "../../hooks/useCheckbox";
import { useInput } from "../../hooks/useInput";
import { Store } from "../../store/store-reducer";
import MyButton from "../UI/MyButton/MyButton";
import MyInput from "../UI/MyInput/MyInput";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import AdditionalDetails from "./AdditionalDetails/AdditionalDetails";
import AddressInput from "./AddressInput/AddressInput";
import AssetsSelect from "./AssetsSelect/AssetsSelect";
import s from "./WalletSend.module.scss";

const WalletSend = () => {
  const { state, dispatch } = useContext(Store);
  const [activeStep, setActiveStep] = useState(0);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  // Form data
  const address = useInput("");
  const [asset, setAsset] = useState(state.wallet.assets[0]);
  const amount = useInput("");
  const comment = useInput("");
  const mixin = useInput(10);
  const fee = useInput(0.01);
  const isSenderInfo = useCheckbox(false);
  const isReceiverInfo = useCheckbox(false);

  const TableRow = ({ label, value }) => {
    return (
      <div className="table__row">
        <div className="table__label">{label}:</div>
        <div className="table__value">{value}</div>
      </div>
    );
  };

  return (
    <>
      {(() => {
        switch (activeStep) {
          // Send form
          case 0:
            return (
              <div>
                <RoutersNav title="Send" />

                <div className={s.sendForm}>
                  <AddressInput address={address} />

                  <AssetsSelect value={asset} setValue={setAsset} />

                  <MyInput
                    type="number"
                    placeholder="Enter how much you want to transfer"
                    label="Amount:"
                    value={amount.value}
                    onChange={amount.onChange}
                  />

                  <MyInput
                    placeholder="Enter the comment"
                    label="Comment:"
                    value={comment.value}
                    onChange={comment.onChange}
                  />

                  <AdditionalDetails
                    mixin={mixin}
                    fee={fee}
                    isSenderInfo={isSenderInfo}
                    isReceiverInfo={isReceiverInfo}
                  />

                  <MyButton
                    disabled={!address.value || !amount.value}
                    onClick={() => setActiveStep(1)}
                  >
                    Send
                  </MyButton>
                </div>
              </div>
            );
          // Confirm
          case 1:
            return (
              <div>
                <RoutersNav onClick={() => setActiveStep(0)} title="Confirm" />

                <div style={{ minHeight: "410px" }} className="table">
                  <TableRow
                    label="Amount"
                    value={amount.value + " " + asset.ticker}
                  />
                  <TableRow label="From" value={state.wallet.address} />
                  <TableRow label="To" value={address.value} />
                  <TableRow label="Comment" value={comment.value} />
                  <TableRow label="Fee" value={fee.value} />
                </div>

                <MyButton onClick={() => setActiveStep(2)}>Confirm</MyButton>
              </div>
            );
          // Transaction status
          case 2:
            return (
              <div>
                <RoutersNav
                  onClick={transactionSuccess ? "none" : () => setActiveStep(1)}
                  title="Transaction"
                />

                <div className={s.transactionContent}>
                  <div className={s.transactionIcon}>
                    <img
                      src={transactionSuccess ? successImage : failedImage}
                      alt="transaction status icon"
                    />
                  </div>
                  <div className={s.transactionText}>
                    {transactionSuccess
                      ? "Successfully sent!"
                      : "Sending failed"}
                  </div>
                </div>

                <MyButton onClick={() => popToTop()}>Close</MyButton>
              </div>
            );
          default:
            return;
        }
      })()}
    </>
  );
};

export default WalletSend;



