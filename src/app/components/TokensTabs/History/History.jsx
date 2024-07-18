import { useContext } from "react";
import Big from "big.js";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
import { Store } from "../../../store/store-reducer";
import TransactionDetails from "../../TransactionDetails/TransactionDetails";
import s from "./History.module.scss";
import NavLink from '../../UI/NavLink/NavLink';


const HistoryItem = ({ transfer, fee, isInitiator }) => {
  const { state } = useContext(Store);

  if (transfer.amount === fee) return null;
  const amount = new Big(transfer.amount);
  const fixedFee = new Big(fee);

  return (
    <div className={s.historyTop}>
      <div className={s.historyIcon}>
        <img src={transfer.incoming ? receiveIcon : sendIcon} alt="ArrowIcon" />
      </div>
      <span>
        {transfer.assetId ===
            "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a"
            ? !isInitiator
              ? amount.toFixed()
              : amount.minus(fixedFee).toFixed()
            : amount.toFixed()
        }{" "}
        {
          state.whitelistedAssets.find((asset) => asset.asset_id === transfer.assetId)
            ?.ticker || '***'
        }
      </span>
    </div>
  );
};

const History = () => {
  const { state } = useContext(Store);

  return (
    <div>
      {state.wallet.transactions.map((tx) => {
        return (
          <NavLink
            key={tx.txHash}
            className={s.historyItem}
            component={TransactionDetails}
            props={tx}
          >
            {!tx.isConfirmed && (
              <div className={s.historyLoading}>
                <img src={LoadingIcon} alt="LoadingIcon" />
              </div>
            )}

            {tx.transfers.map((transfer) => (
              <HistoryItem transfer={transfer} fee={tx.fee} isInitiator={tx.isInitiator} />
            ))}
            <span className={s.historyAddress}>{tx.txHash}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default History;
