import React, { useEffect } from "react";
import copyIcon from "../../assets/svg/copy-blue.svg";
import { useCopy } from "../../hooks/useCopy";
import RoutersNav from "../UI/RoutersNav/RoutersNav";

const TransactionDetails = (props) => {
  const { copyToClipboard, SuccessCopyModal } = useCopy();

  useEffect(() => {
    document.body.scrollTo(0, 0);
  }, []);

  const TableRow = ({ label, value, copyButton }) => {
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
      </div>
    );
  };

  return (
    <div>
      {SuccessCopyModal}

      <RoutersNav title="Transaction details" />

      <div className="table">
        <TableRow label="Amount" value={props.amount + " ZANO"} />
        <TableRow label="Transaction hash" value={props.txHash} copyButton />
        <TableRow label="Blob size" value={props.blobSize + " bytes"} />
        <TableRow label="Timestamp" value={props.timestamp} />
        <TableRow label="Height" value={props.height} />
        <TableRow
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
        />
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
