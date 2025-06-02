import React from "react";
import { useContext } from "react";
import Big from "big.js";
import LoadingIcon from "../../../assets/svg/loading.svg";
import receiveIcon from "../../../assets/svg/receive-colored.svg";
import sendIcon from "../../../assets/svg/send-colored.svg";
import { Store } from "../../../store/store-reducer";
import TransactionDetails from "../../TransactionDetails/TransactionDetails";
import s from "./History.module.scss";
import NavLink from '../../UI/NavLink/NavLink';
import useGetAsset from "../../../hooks/useGetAsset";
import { ZANO_ASSET_ID } from "../../../../constants";

interface HistoryItemProps {
  transfer: {
    assetId: string;
    amount: string;
    incoming: boolean;
  };
  fee: string;
  isInitiator: boolean;
}

const HistoryItem = ({ transfer, fee, isInitiator }: HistoryItemProps) => {
  const { getAssetById } = useGetAsset();

  if (transfer.amount === fee) return null;
  const amount = new Big(transfer.amount);
  const fixedFee = new Big(fee);

  return (
    <div className={s.historyTop}>
      <div className={s.historyIcon}>
        <img src={transfer.incoming ? receiveIcon : sendIcon} alt="ArrowIcon" />
      </div>
      <p>
        <span>
          {transfer.assetId ===
            ZANO_ASSET_ID
            ? !isInitiator
              ? amount.toFixed()
              : amount.minus(fixedFee).toFixed()
            : amount.toFixed()
          }
        </span>
        {" "}
        {
          getAssetById(transfer.assetId)
            ?.ticker || '***'
        }
      </p>
    </div>
  );
};

const History = () => {
  const { state } = useContext(Store);
  if (!state.wallet) {
    return <div>No wallet connected.</div>;
  }

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

            {tx.transfers?.map((transfer) => (
              <HistoryItem transfer={transfer as any} fee={String(tx.fee)} isInitiator={Boolean(tx.isInitiator)} />
            ))}
            <span className={s.historyAddress}>{tx.txHash}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default History;