import React, { useEffect, useContext } from 'react';
import Big from 'big.js';
import copyIcon from '../../assets/svg/copy-blue.svg';
import checkIcon from '../../assets/svg/check-icon-blue.svg';
import incomingIcon from '../../assets/svg/incoming_ico.svg';
import outgoingIcon from '../../assets/svg/outgoing_ico.svg';
import { useCopy } from '../../hooks/useCopy';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import { Store } from '../../store/store-reducer';
import styles from './TransactionDetails.module.scss';
import { ZANO_ASSET_ID } from '../../../constants';

interface TransactionSubtransfersGroup {
	paymentId: string;
	subtransfers: {
		amount: string;
		assetId: string;
		incoming: boolean;
	}[];
}

type TransactionDetailsProps = {
	subtransfersByPid: TransactionSubtransfersGroup[];
	fee: string;
	addresses?: string[];
	txHash: string;
	blobSize: number;
	timestamp: string;
	height: number;
	comment: string;
	isInitiator: boolean;
};

type TableRowProps = {
	label: string;
	value?: string | number;
	copyButton?: boolean;
	children?: React.ReactNode;
};

type WhitelistedAssetType = {
	asset_id: string;
	ticker: string;
};

const PaymentCard: React.FC<{
	group: TransactionSubtransfersGroup;
	fee: string;
	isInitiator: boolean;
	getTicker: (assetId: string) => string;
}> = ({ group, getTicker, fee, isInitiator }) => {
	const { copied, copyToClipboard } = useCopy();

	return (
		<div className={styles.payment}>
			{group.paymentId !== '' && (
				<div className={styles.payment__header}>
					<div className={styles.payment__id}>
						<span className={styles.payment__label}>Payment ID</span>
						<span className={styles.payment__value}>
							{group.paymentId !== '' ? group.paymentId : 'None'}
						</span>
					</div>

					<button
						className="round-button"
						onClick={() => copyToClipboard(group.paymentId)}
					>
						<img src={copied ? checkIcon : copyIcon} alt="copy icon" />
						<span>{copied ? 'copied!' : 'copy payment ID'}</span>
					</button>
				</div>
			)}
			<div className={styles.payment__transfers}>
				{group.subtransfers.map((transfer, index) => {
					const amount = new Big(transfer.amount);
					const fixedFee = new Big(fee);

					const isZano = transfer.assetId === ZANO_ASSET_ID;

					let amountText: string;

					if (isZano) {
						if (!isInitiator || transfer.incoming) {
							amountText = amount.toFixed();
						} else {
							const resultAmount = amount.minus(fixedFee);

							amountText = resultAmount.lte(0) ? '0' : resultAmount.toFixed();
						}
					} else {
						amountText = amount.toFixed();
					}

					return (
						<div key={index} className={styles.payment__transfer}>
							<p className="table__value">
								{amountText} {getTicker(transfer.assetId)}
							</p>
							<div className="table__icon">
								<img
									src={transfer.incoming ? incomingIcon : outgoingIcon}
									alt="transfer icon"
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const TableRow: React.FC<TableRowProps> = ({ label, value, copyButton, children }) => {
	const { copied, copyToClipboard } = useCopy();

	return (
		<div className={`${copyButton && 'table__row_button'} table__row`}>
			<div className="table__label">
				{label}:
				{copyButton && value && (
					<button
						className="round-button"
						onClick={() => copyToClipboard(value.toString())}
					>
						<img src={copied ? checkIcon : copyIcon} alt="copy icon" />
						<span>{copied ? 'copied!' : 'copy'}</span>
					</button>
				)}
			</div>
			<div className="table__value">{value}</div>
			{children}
		</div>
	);
};

const TransactionDetails: React.FC<TransactionDetailsProps> = (props) => {
	const { state } = useContext(Store);

	useEffect(() => {
		document.body.scrollTo(0, 0);
	}, []);

	const getTicker = (assetId: string) =>
		(state.whitelistedAssets as unknown as WhitelistedAssetType[]).find(
			(asset: WhitelistedAssetType) => asset.asset_id === assetId,
		)?.ticker ?? '***';

	return (
		<div>
			<RoutersNav title="Transaction details" />

			<div className="table">
				<div className={styles.payments}>
					<div className="table__label">Payments:</div>
					{props.subtransfersByPid.map((group, index) => (
						<PaymentCard
							key={index}
							group={group}
							getTicker={getTicker}
							fee={props.fee}
							isInitiator={props.isInitiator}
						/>
					))}
				</div>
				<TableRow label="Fee" value={`${props.fee} ZANO`} />
				{props.addresses && (
					<TableRow label="Remote address" value={props.addresses[0]} copyButton />
				)}
				<TableRow label="Transaction hash" value={props.txHash} copyButton />
				<TableRow label="Blob size" value={`${props.blobSize} bytes`} />
				<TableRow label="Timestamp" value={props.timestamp} />
				<TableRow label="Height" value={props.height} />
				<TableRow label="Comment" value={props.comment} />
			</div>
		</div>
	);
};

export default TransactionDetails;
