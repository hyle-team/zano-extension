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
        <TableRow
          label="Transaction ID"
          value={props.transactionID}
          copyButton
        />
        <TableRow label="Blob size" value={props.blobSize + " bytes"} />
        <TableRow label="Date" value={props.date} />
        <TableRow label="Height" value={props.height} />
        <TableRow label="Inputs" value={props.inputs} />
        <TableRow label="Outputs" value={props.outputs} />
        <TableRow label="Payment ID" value={props.paymentID} copyButton />
        <TableRow label="Comment" value={props.comment} copyButton />
      </div>
    </div>
  );
};

export default TransactionDetails;
