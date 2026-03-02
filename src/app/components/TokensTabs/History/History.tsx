import React, { useContext } from 'react';
import Big from 'big.js';
import LoadingIcon from '../../../assets/svg/loading.svg';
import receiveIcon from '../../../assets/svg/receive-colored.svg';
import sendIcon from '../../../assets/svg/send-colored.svg';
import { Store } from '../../../store/store-reducer';
import TransactionDetails from '../../TransactionDetails/TransactionDetails';
import s from './History.module.scss';
import NavLink from '../../UI/NavLink/NavLink';
import useGetAsset from '../../../hooks/useGetAsset';
import { ZANO_ASSET_ID } from '../../../../constants';

interface HistoryItemProps {
	transfer: {
		assetId?: string;
		amount?: string;
		incoming?: boolean;
	};
	fee: string;
	isInitiator: boolean;
}

const HistoryItem = ({ transfer, fee, isInitiator }: HistoryItemProps) => {
	const { getAssetById } = useGetAsset();

	const amount = (() => {
		try {
			return transfer.amount !== undefined ? new Big(transfer.amount) : undefined;
		} catch {
			return undefined;
		}
	})();
	const fixedFee = new Big(fee);

	let displayAmount: string;
	let isFeeOnlyTransfer = false;

	if (amount === undefined) {
		displayAmount = 'N/A';
	} else if (transfer.assetId === ZANO_ASSET_ID) {
		if (!isInitiator || transfer.incoming) {
			displayAmount = amount.toFixed();
		} else {
			const resultAmount = amount.minus(fixedFee);

			if (resultAmount.lte(0)) {
				isFeeOnlyTransfer = true;
			}

			displayAmount = resultAmount.toFixed();
		}
	} else {
		displayAmount = amount.toFixed();
	}

	if (isFeeOnlyTransfer) {
		return null;
	}

	return (
		<div className={s.historyTop}>
			<div className={s.historyIcon}>
				<img src={transfer.incoming ? receiveIcon : sendIcon} alt="ArrowIcon" />
			</div>
			<p>
				<span>{displayAmount}</span>{' '}
				{getAssetById(String(transfer.assetId))?.ticker || '***'}
			</p>
		</div>
	);
};

const History = () => {
	const { state } = useContext(Store);

	return (
		<div>
			{state.wallet.transactions.map((tx) => (
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
						<HistoryItem
							transfer={transfer}
							fee={String(tx.fee)}
							isInitiator={Boolean(tx.isInitiator)}
						/>
					))}
					<span className={s.historyAddress}>{tx.txHash}</span>
				</NavLink>
			))}
		</div>
	);
};

export default History;
