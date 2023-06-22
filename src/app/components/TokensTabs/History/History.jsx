import { useContext } from "react";
import { Link } from "react-chrome-extension-router";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
import { Store } from "../../../store/store-reducer";
import TransactionDetails from "../../TransactionDetails/TransactionDetails";
import s from "./History.module.scss";
import { whitelistedAssets } from "../../../config/config";

const History = () => {
  const { state } = useContext(Store);

  return (
    <div>
      {state.wallet.transactions.map((tx) => {
        return (
          <Link
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

            {tx.transfers.map((transfer) => {
              return (
                <div className={s.historyTop}>
                  <div className={s.historyIcon}>
                    <img
                      src={transfer.incoming ? receiveIcon : sendIcon}
                      alt="ArrowIcon"
                    />
                  </div>
                  <span>
                    {transfer.amount}{" "}
                    {
                      whitelistedAssets.find(
                        (asset) => asset.asset_id === transfer.assetId
                      ).ticker
                    }
                  </span>
                </div>
              );
            })}
            <span className={s.historyAddress}>{tx.txHash}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default History;
