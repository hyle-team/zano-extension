import { useContext } from "react";
import { Link } from "react-chrome-extension-router";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
import { Store } from "../../../store/store-reducer";
import TransactionDetails from "../../TransactionDetails/TransactionDetails";
import s from "./History.module.scss";

const History = () => {
  const { state } = useContext(Store);

  return (
    <div>
      {state.wallet.transactions.map((tx, index) => {
        const icon = tx.incoming ? receiveIcon : sendIcon;

        return (
          <Link
            key={index}
            className={s.historyItem}
            component={TransactionDetails}
            props={tx}
          >
            {!tx.isConfirmed && (
              <div className={s.historyLoading}>
                <img src={LoadingIcon} alt="LoadingIcon" />
              </div>
            )}

            <div className={s.historyTop}>
              <div className={s.historyIcon}>
                <img src={icon} alt="ArrowIcon" />
              </div>
              <span>{[tx.amount, tx.ticker].join(" ")}</span>
            </div>

            <span className={s.historyAddress}>{tx.address}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default History;
