import React, { useEffect, useContext } from 'react';
import Big from 'big.js';
import copyIcon from '../../assets/svg/copy-blue.svg';
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
		isIncome: boolean;
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
	isInitiator?: boolean;
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

const TableRow: React.FC<TableRowProps> = ({ label, value, copyButton, children }) => {
	const { copyToClipboard } = useCopy();

	return (
		<div className={`${copyButton && 'table__row_button'} table__row`}>
			<div className="table__label">
				{label}:
				{copyButton && value && (
					<button
						className="round-button"
						onClick={() => copyToClipboard(value.toString())}
					>
						<img src={copyIcon} alt="copy icon" />
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

	return (
		<div>
			{/* {SuccessCopyModal} */}

			<RoutersNav title="Transaction details" />

			<div className="table">
				<TableRow label="Transfers">
					<div className={styles.transaction__transfers}>
						{props.subtransfersByPid
							.flatMap((group) => group.subtransfers)
							.map((transfer, index) => {
								const amount = new Big(transfer.amount);
								const fixedFee = new Big(props.fee);

								const isZano = transfer.assetId === ZANO_ASSET_ID;

								let amountText: string;

								if (isZano) {
									if (!props.isInitiator || transfer.isIncome) {
										amountText = amount.toFixed();
									} else {
										const resultAmount = amount.minus(fixedFee);

										if (resultAmount.lte(0)) {
											return;
										}

										amountText = resultAmount.toFixed();
									}
								} else {
									amountText = amount.toFixed();
								}

								const ticker =
									(
										state.whitelistedAssets as unknown as WhitelistedAssetType[]
									).find(
										(asset: WhitelistedAssetType) =>
											asset.asset_id === transfer.assetId,
									)?.ticker ?? '***';

								return (
									<div key={index} className={styles.transaction__transfer}>
										<p className="table__value">
											<p className="table__value">
												{amountText} {ticker}
											</p>
										</p>
										<div className="table__icon">
											<img
												src={
													transfer.isIncome ? incomingIcon : outgoingIcon
												}
												alt="transfer icon"
											/>
										</div>
									</div>
								);
							})}
					</div>
				</TableRow>
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
