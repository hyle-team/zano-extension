import React, { useEffect } from "react";
import copyIcon from "../../assets/svg/copy-blue.svg";
import incomingIcon from "../../assets/svg/incoming_ico.svg";
import outgoingIcon from "../../assets/svg/outgoing_ico.svg";
import { useCopy } from "../../hooks/useCopy";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import { whitelistedAssets } from "../../config/config";

const TransactionDetails = (props) => {
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
        {/* <TableRow label="Amount" value={props.amount + " ZANO"} /> */}
        <TableRow label="Transfers">
          {props.transfers.map((transfer) => {
            return (
              <>
                <div className="table__value">
                  {transfer.amount}{" "}
                  {
                    whitelistedAssets.find(
                      (asset) => asset.asset_id === transfer.assetId
                    ).ticker
                  }
                </div>
                <div className="table__icon">
                  <img
                    src={transfer.incoming ? incomingIcon : outgoingIcon}
                    alt="transfer icon"
                  />
                </div>
              </>
            );
          })}
        </TableRow>
        <TableRow label="Transaction hash" value={props.txHash} copyButton />
        <TableRow label="Blob size" value={props.blobSize + " bytes"} />
        <TableRow label="Timestamp" value={props.timestamp} />
        <TableRow label="Height" value={props.height} />
        {/* <TableRow
          label="Inputs"
          value={
            Array.isArray(props.inputs) ? props.inputs.join(" ") : props.inputs
          }
        />
        <TableRow
          label="Outputs"
          value={
            Array.isArray(props.outputs)
              ? props.outputs.join(" ")
              : props.outputs
          }
        /> */}
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
