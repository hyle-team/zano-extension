import React from "react";
import Button, { ButtonThemes } from "../UI/Button/Button";
import styles from "./OuterConfirmation.module.scss";
import { useState, useEffect } from "react";
import { fetchBackground, shortenAddress } from "../../utils/utils";
import customTokenIcon from "../../assets/tokens-svg/custom-token.svg";
import banditIcon from "../../assets/tokens-svg/bandit-icon.svg";
import zanoIcon from "../../assets/tokens-svg/zano.svg";
import bitcoinIcon from "../../assets/tokens-svg/bitcoin.svg";
import ethIcon from "../../assets/tokens-svg/eth.svg";
import arrowIcon from "../../assets/svg/arrow-blue.svg";
import InfoTooltip from "../UI/InfoTooltip";
import { getCurrent, goBack } from "react-chrome-extension-router";
import { BurnAssetDataType } from "../../../types";
import { BANDIT_ASSET_ID, ZANO_ASSET_ID } from "../../../constants";

interface ParamsType {
	key: number;
	value: string;
}

interface DestionationType {
	address: string
	amount: string
}

const OuterConfirmation = () => {
	const { props } = getCurrent();
	const { reqs } = props;

	const [reqIndex, setReqIndex] = useState(0);
	const [accepting, setAccepting] = useState(false);
	const [denying, setDenying] = useState(false);
	const [showFullItems, setShowFullItems] = useState(false);
	const [showFullComment, setShowFullComment] = useState(false);

	const req = reqs[reqIndex] || {};
	const { id, name, params, method, destinations } = req;

	const isTransferMethod = name?.toLowerCase() === "transfer";
	const isBurnMethod = name?.toLowerCase() === "burn_asset";

	const isMultipleDestinations = destinations && destinations.length > 0;

	const transactionParams = params
		? Object.fromEntries((params as ParamsType[]).map(item => [item.key, item.value]))
		: {};
	const totalAmount = Number(isMultipleDestinations ? destinations.reduce((sum: number, dest: { amount: number }) => sum + Number(dest.amount), 0) : transactionParams.Amount).toLocaleString();

	useEffect(() => {
		setReqIndex(0);
	}, [reqs]);

	function nextRequest() {
		if (reqIndex < reqs.length - 1) {
			setReqIndex(reqIndex + 1);
		} else {
			goBack();
		}
	}

	async function acceptClick() {
		setAccepting(true);
		await fetchBackground({ method, id, success: true });
		setAccepting(false);
		nextRequest();
	}

	async function denyClick() {
		setDenying(true);
		await fetchBackground({ method, id, success: false });
		setDenying(false);
		nextRequest();
	}

	const getAssetIcon = (assetId: string) => {
		switch (assetId) {
			case "ZANO":
				return <img width={16} src={zanoIcon} alt="ZANO asset" />;
			case "BANDIT":
				return <img width={16} src={banditIcon} alt="ZANO asset" />;
			case "Wrapped Bitcoin":
				return <img width={16} src={bitcoinIcon} alt="bitcoin icon" />;
			case "Wrapped Ethereum":
				return <img width={16} src={ethIcon} alt="EthIcon" />;
			default:
				return <img width={16} src={customTokenIcon} alt="CustomTokenIcon" />;;
		}
	}

	const disabled = accepting || denying;

	const getConfirmationName = () => {
		if (isTransferMethod) {
			return "Please confirm the transfer details";
		} else if (isBurnMethod) {
			return "BURN ASSET"
		} else {
			return name
		}
	}

	const getConfirmationContent = () => {
		if (isTransferMethod) {
			return (
				<>
					<div className={styles.confirmation__block}>
						<div className={styles.row}>
							<h5>From</h5>
							<p>{transactionParams?.F}</p>
						</div>
						<div className={styles.row}>
							<h5>Asset</h5>
							<p>{getAssetIcon(transactionParams?.Asset)} {transactionParams?.Asset}</p>
						</div>
						<div className={styles.row}>
							<h5>Amount</h5>
							<p>{totalAmount}</p>
						</div>

						<div className={styles.col}>
							<h5>Comment</h5>
							<p>{(transactionParams?.Comment?.length > 60 && !showFullComment) ?
								<>
									{transactionParams?.Comment?.slice(0, 60)}...
									<button className={styles.commentBtn} onClick={() => setShowFullComment(true)}>Show more</button>
								</>
								:
								<>
									{transactionParams?.Comment}
									{showFullComment && <button className={`${styles.commentBtn} ${styles.less}`} onClick={() => setShowFullComment(false)}>Show less</button>}
								</>
							}</p>
						</div>
					</div>

					<div className={styles.confirmation__block}>
						<div className={styles.row}>
							<h5>To</h5>
							<p>{isMultipleDestinations ? <>{destinations?.length} addresses</> : transactionParams?.To}</p>
						</div>

						{!isMultipleDestinations && <div className={styles.row}>
							<h5>Amount</h5>
							<p>{totalAmount}</p>
						</div>}
					</div>

					{isMultipleDestinations && (
						<>
							<button
								onClick={() => setShowFullItems(prev => !prev)}
								className={styles.confirmation__showAddressesBtn}
							>
								Show addresses <img style={{ transform: `rotate(${showFullItems ? '180deg' : 0})` }} width={18} src={arrowIcon} alt="arrow" />
							</button>

							{showFullItems && destinations?.map((item: DestionationType, idx: number) => (
								<div className={styles.confirmation__destinationWrapper} key={idx}>
									<p className={styles.title}>RECIPIENT {idx + 1}</p>

									<div className={styles.confirmation__block}>
										<div className={styles.row}>
											<h5>To</h5>
											<p>{item.address}</p>
										</div>

										<div className={styles.row}>
											<h5>Amount</h5>
											<p>{item.amount}</p>
										</div>
									</div>
								</div>
							))}
						</>
					)}
				</>
			)
		} else if (isBurnMethod) {
			const {
				assetId,
				burnAmount,
				nativeAmount,
				pointTxToAddress,
				serviceEntries
			}: BurnAssetDataType = params[0];
			const getIconByAsseetId = () => {
				if (assetId === ZANO_ASSET_ID) {
					return "ZANO"
				} else if (assetId === BANDIT_ASSET_ID) {
					return "BANDIT"
				} else {
					return assetId
				}
			}

			return (
				<>
					<div className={styles.confirmation__block}>
						<div className={styles.row}>
							<h5>Asset</h5>
							<p>{getAssetIcon(getIconByAsseetId())} {shortenAddress(assetId, 6, 6)}</p>
						</div>
						<div className={styles.row}>
							<h5>Burn Amount</h5>
							<p>{burnAmount}</p>
						</div>
						{nativeAmount ?? (
							<div className={styles.row}>
								<h5>Native Amount</h5>
								<p>{nativeAmount}</p>
							</div>
						)}
						{pointTxToAddress && <div className={styles.row}>
							<h5>Send Tx To</h5>
							<p>{shortenAddress(pointTxToAddress, 6, 6)}</p>
						</div>}
					</div>

					{serviceEntries && <button
						onClick={() => setShowFullItems(prev => !prev)}
						className={styles.confirmation__showAddressesBtn}
					>
						Show service entries <img style={{ transform: `rotate(${showFullItems ? '180deg' : 0})` }} width={18} src={arrowIcon} alt="arrow" />
					</button>}

					{showFullItems && serviceEntries?.map((item, idx) => {
						const dataLength = serviceEntries?.length || 1;

						return <div className={styles.confirmation__destinationWrapper} key={idx}>
							{dataLength > 1 && <p className={styles.title}>
								Service Entries {idx + 1}
							</p>}

							<div className={styles.confirmation__block}>
								<div className={styles.row}>
									<h5>Body</h5>
									<p>{shortenAddress(item.body, 6, 6)}</p>
								</div>
								<div className={styles.row}>
									<h5>Flags</h5>
									<p>{item.flags}</p>
								</div>
								<div className={styles.row}>
									<h5>Instruction</h5>
									<p>{item.instruction}</p>
								</div>
								{item.security && <div className={styles.row}>
									<h5>Security</h5>
									<p>{shortenAddress(item.security, 6, 6)}</p>
								</div>}
								<div className={styles.row}>
									<h5>Service Id</h5>
									<p>{item.service_id}</p>
								</div>
							</div>
						</div>
					})}
				</>
			);
		} else {
			return (
				<div>
					<div className={styles.confirmation__block}>
						{Array.isArray(params) && params?.map((item: ParamsType, idx: number) => (
							<div key={idx} className={styles.row}>
								<h5>{item.key}</h5>
								<p>{item.value}</p>
							</div>
						))}
					</div>
				</div>
			)
		}
	}


	if (!req) {
		return <div>No request found.</div>;
	}

	return (
		<div className={styles.confirmation}>
			<h3 className={styles.confirmation__title}>Request Confirmation</h3>
			<h5 className={styles.confirmation__subtitle}>
				{getConfirmationName()}
			</h5>

			<div className={styles.confirmation__content}>
				{getConfirmationContent()}
			</div>

			<div className={styles.confirmation__bottom}>
				{isTransferMethod || isBurnMethod && <>
					<div className={styles.confirmation__bottom_fee}>
						<h5>
							Transaction fee <InfoTooltip title="Total network fee" />
						</h5>
						<p>0.01 ZANO</p>
					</div>

					{isTransferMethod && <>
						<div className={styles.divider} />

						<div className={styles.confirmation__bottom_total}>
							<h5>Total</h5>
							<p>{totalAmount}</p>
						</div>
					</>}
				</>}

				<div className={styles.confirmation__bottom_buttons}>
					<Button
						className={styles.btn}
						disabled={disabled}
						theme={ButtonThemes.Outline}
						onClick={denyClick}
					>
						Cancel
					</Button>

					<Button
						className={styles.btn}
						disabled={disabled}
						onClick={acceptClick}
					>
						Confirm
					</Button>
				</div>
			</div>
		</div>
	);
}

export default OuterConfirmation;