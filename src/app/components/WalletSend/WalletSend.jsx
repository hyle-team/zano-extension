import React, { useCallback, useContext, useEffect, useState } from "react";
import { popToTop } from "react-chrome-extension-router";
import failedImage from "../../assets/images/failed-round.png";
import successImage from "../../assets/images/success-round.png";
import { useCheckbox } from "../../hooks/useCheckbox";
import { useInput } from "../../hooks/useInput";
import { Store } from "../../store/store-reducer";
import Button from "../UI/Button/Button";
import MyInput from "../UI/MyInput/MyInput";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import AdditionalDetails from "./AdditionalDetails/AdditionalDetails";
import AssetsSelect from "./AssetsSelect/AssetsSelect";
import s from "./WalletSend.module.scss";
import { fetchBackground } from "../../utils/utils";
import { getAliasDetails } from "../../../background/wallet";
// import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";

const WalletSend = () => {
  const { state } = useContext(Store);
  const [activeStep, setActiveStep] = useState(0);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [txId, setTxId] = useState("");
  // const [confirmationModalOpen, setConfirmationModalOpen] = useState(true);

  // Form data
  const [address, setAddress] = useState("");
  const [asset, setAsset] = useState(state.wallet.assets[0]);
  const [submitAddress, setSubmitAddress] = useState("");

  const amount = useInput("");
  const comment = useInput("");
  const mixin = useInput(10);
  const fee = useInput(0.01);
  const isSenderInfo = useCheckbox(false);
  const isReceiverInfo = useCheckbox(false);

  // const closeConfirmationModal = useCallback(() => {
  //   setConfirmationModalOpen(false);
  // }, [setConfirmationModalOpen]);

  const sendTransfer = (destination, amount, comment, assetId) => {
    return new Promise(async (resolve, reject) => {
      // eslint-disable-next-line no-undef
      if (chrome.runtime.sendMessage) {
        // eslint-disable-next-line no-undef
        const response = await fetchBackground({
          method: "SEND_TRANSFER",
          assetId,
          destination,
          amount,
          comment,
        });

        if (response.data) {
          resolve(response.data);
        } else if (response.error) {
          reject(response.error);
        } else {
          reject("No data or error received in response.");
        }
      } else {
        reject("chrome.runtime.sendMessage is not available.");
      }
    });
  };

  const openExplorer = (txId) => {
    // eslint-disable-next-line no-undef
    chrome.tabs.create({
      url: `https://explorer.zano.org/block/${txId}`,
    });
  };

  const TableRow = ({ label, value }) => {
    return (
      <div className="table__row">
        <div className="table__label">{label}:</div>
        <div className="table__value">{value}</div>
      </div>
    );
  };

  useEffect(() => {
    (async () => {
      if (address.startsWith("@")) {
        const alias = address.slice(1);
        const resolvedAddress = await fetchAddress(alias);
        if (resolvedAddress) {
          setSubmitAddress(resolvedAddress);
        } else {
          setSubmitAddress("");
        }
      } else {
        if (address.length === 97) {
          setSubmitAddress(address);
        } else {
          setSubmitAddress("");
        }
      }
    })();
  }, [address]);

  const fetchAddress = async (alias) => await getAliasDetails(alias);

  const checkAvailableBalance = (amount, asset) =>
    asset.unlockedBalance !== asset.balance
      ? +amount <= asset.unlockedBalance - fee.value
      : true;

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
                  <MyInput
                    placeholder="Address or alias"
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    isValid={submitAddress ? true : false}
                  />
                  <AssetsSelect value={asset} setValue={setAsset} />
                  <MyInput
                    type="number"
                    placeholder="Amount to transfer"
                    label="Amount:"
                    value={amount.value}
                    onChange={amount.onChange}
                    isValid={
                      !isNaN(amount.value) &&
                      amount.value >= 0.000000000001 &&
                      amount.value <= 1000000000
                    }
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

                  <Button
                    disabled={
                      !submitAddress ||
                      !amount.value ||
                      !checkAvailableBalance(amount.value, asset)
                    }
                    onClick={() => setActiveStep(1)}
                  >
                    Send
                  </Button>
                </div>
              </div>
            );
          // Confirm
          case 1:
            return (
              <div>
                {/* <ConfirmationModal
                  isOpen={confirmationModalOpen}
                  onClose={closeConfirmationModal}
                /> */}

                <RoutersNav onClick={() => setActiveStep(0)} title="Confirm" />

                <div style={{ minHeight: "410px" }} className="table">
                  <TableRow
                    label="Amount"
                    value={amount.value + " " + asset.ticker}
                  />
                  <TableRow label="From" value={state.wallet.address} />
                  <TableRow label="To" value={address} />
                  <TableRow label="Comment" value={comment.value} />
                  <TableRow label="Fee" value={fee.value} />
                </div>

                <Button
                  onClick={async () => {
                    const transferStatus = await sendTransfer(
                      submitAddress,
                      amount.value,
                      comment.value,
                      asset.assetId
                    );
                    console.log("transfer status", transferStatus);
                    if (transferStatus.result) {
                      setTxId(transferStatus.result.tx_hash);
                      setTransactionSuccess(true);
                    }
                    setActiveStep(2);
                  }}
                >
                  Confirm
                </Button>
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
                    {transactionSuccess ? (
                      <div>
                        Sent in <span>{txId}</span>
                      </div>
                    ) : (
                      "Sending failed"
                    )}
                  </div>
                  {transactionSuccess && (
                    <button
                      className={s.link}
                      onClick={() => openExplorer(txId)}
                    >
                      See details
                    </button>
                  )}
                </div>

                <Button onClick={() => popToTop()}>Close</Button>
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
