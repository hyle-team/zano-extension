import React, { useEffect, useContext } from "react";
import Big from "big.js";
import copyIcon from "../../assets/svg/copy-blue.svg";
import incomingIcon from "../../assets/svg/incoming_ico.svg";
import outgoingIcon from "../../assets/svg/outgoing_ico.svg";
import { useCopy } from "../../hooks/useCopy";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import { Store } from "../../store/store-reducer";
import styles from "./TransactionDetails.module.scss";

const TransactionDetails = (props) => {
  const { state } = useContext(Store);
  const { copyToClipboard, SuccessCopyModal } = useCopy();

  useEffect(() => {
    document.body.scrollTo(0, 0);
  }, []);

  const TableRow = ({ label, value, copyButton, children }) => {
    return (
      <div className={`${copyButton && "table__row_button"} table__row`}>
        <div className="table__label">
          {label}:
          {copyButton && (
            <button
              className="round-button"
              onClick={() => copyToClipboard(value)}
            >
              <img src={copyIcon} alt="copy icon" />
            </button>
          )}
        </div>
        <div className="table__value">{value}</div>
        {children}
      </div>
    );
  };

  return (
    <div>
      {SuccessCopyModal}

      <RoutersNav title="Transaction details" />

      <div className="table">
        <TableRow label="Transfers">
          <div className={styles.transaction__transfers}>
            {props?.transfers?.map((transfer) => {
              if (transfer.amount === props.fee) return null;
              const amount = new Big(transfer.amount);
              const fixedFee = new Big(props.fee);
              return (
                <div className={styles.transaction__transfer}>
                  <p className="table__value">
                    {transfer.assetId ===
                      "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
                      ? !props.isInitiator
                        ? amount.toFixed()
                        : amount.minus(fixedFee).toFixed()
                      : amount.toFixed()
                    }{" "}
                    {
                      state.whitelistedAssets.find(
                        (asset) => asset.asset_id === transfer.assetId
                      )?.ticker ?? "***"
                    }
                  </p>
                  <div className="table__icon">
                    <img
                      src={transfer.incoming ? incomingIcon : outgoingIcon}
                      alt="transfer icon"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
        </TableRow>
        <TableRow label="Fee" value={props.fee + " ZANO"} />
        {props.addresses && (
          <TableRow
            label="Remote address"
            value={props.addresses[0]}
            copyButton
          />
        )}
        <TableRow label="Transaction hash" value={props.txHash} copyButton />
        <TableRow label="Blob size" value={props.blobSize + " bytes"} />
        <TableRow label="Timestamp" value={props.timestamp} />
        <TableRow label="Height" value={props.height} />
        {props.paymentId ? (
          <TableRow label="Payment Id" value={props.paymentId} copyButton />
        ) : (
          <TableRow label="Payment Id" value={props.paymentId} />
        )}
        <TableRow label="Comment" value={props.comment} />
      </div>
    </div>
  );
};

export default TransactionDetails;
