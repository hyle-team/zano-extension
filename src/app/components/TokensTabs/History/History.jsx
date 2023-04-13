import { ReactComponent as ArrowIcon } from "../../../assets/svg/arrow-square.svg";
import { ReactComponent as LoadingIcon } from "../../../assets/svg/loading.svg";
import React from "react";
import s from "./History.module.scss";

const historyMap = [
  {
    value: 112412,
    type: "send", // or "receive"
    ticker: "ZANO",
    address: "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7oT6KQaR7gbog7",
    inProcess: false,
  },
  {
    value: 10,
    type: "receive", // or "send"
    ticker: "ZANO",
    address: "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7oT6KQaR7gbog7",
    inProcess: true,
  },
];

const History = () => {
  return (
    <div>
      {historyMap.map((historyItem, index) => {
        const iconClasses =
          historyItem.type === "send"
            ? s.historyIcon
            : [s.historyIcon, s.receiveVariant].join(" ");

        return (
          <button key={index} className={s.historyItem}>
            {historyItem.inProcess && (
              <div className={s.historyLoading}>
                <LoadingIcon />
              </div>
            )}

            <div className={s.historyTop}>
              <div className={iconClasses}>
                <ArrowIcon />
              </div>
              <span>{[historyItem.value, historyItem.ticker].join(" ")}</span>
            </div>

            <span className={s.historyAddress}>{historyItem.address}</span>
          </button>
        );
      })}
    </div>
  );
};

export default History;
