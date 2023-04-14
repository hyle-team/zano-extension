import React from "react";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
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
        const icon = historyItem.type === "send" ? sendIcon : receiveIcon;

        return (
          <button key={index} className={s.historyItem}>
            {historyItem.inProcess && (
              <div className={s.historyLoading}>
                <img src={LoadingIcon} alt="LoadingIcon" />
              </div>
            )}

            <div className={s.historyTop}>
              <div className={s.historyIcon}>
                <img src={icon} alt="ArrowIcon" />
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
