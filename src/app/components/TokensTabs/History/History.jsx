import { useContext } from "react";
import { Link } from "react-chrome-extension-router";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
import { Store } from "../../../store/store-reducer";
import TransactionDetails from "../../TransactionDetails/TransactionDetails";
import s from "./History.module.scss";

const data = {
  amount: 0.06,
  transactionID:
    "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  blobSize: 1160,
  date: "19.10.2022 15:45:16",
  height: 1807962,
  inputs: "[0.01]",
  outputs: "[0.08]",
  paymentID:
    "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  comment: "Test!",
};

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
            props={data}
          >
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
          </Link>
        );
      })}
    </div>
  );
};

export default History;
