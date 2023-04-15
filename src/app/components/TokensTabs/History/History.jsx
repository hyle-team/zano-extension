import { useContext } from "react";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
import s from "./History.module.scss";
import { Store } from "../../../store/store-reducer";

const History = () => {
  const { state } = useContext(Store);
  return (
    <div>
      {state.wallet.transactions.map((tx, index) => {
        const icon = tx.incoming ? receiveIcon : sendIcon;

        return (
          <button key={index} className={s.historyItem}>
            {tx.isConfirming && (
              <div className={s.historyLoading}>
                <img src={LoadingIcon} alt="LoadingIcon" />
              </div>
            )}

            <div className={s.historyTop}>
              <div className={s.historyIcon}>
                <img src={icon} alt="ArrowIcon" />
              </div>
              <span>{[tx.value, tx.ticker].join(" ")}</span>
            </div>

            <span className={s.historyAddress}>{tx.address}</span>
          </button>
        );
      })}
    </div>
  );
};

export default History;
