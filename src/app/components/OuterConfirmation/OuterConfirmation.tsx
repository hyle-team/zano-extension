import React from "react";
import Button, { ButtonThemes } from "../UI/Button/Button";
import styles from "./OuterConfirmation.module.scss";
import { useState, useEffect } from "react";
import { fetchBackground } from "../../utils/utils";
import customTokenIcon from "../../assets/tokens-svg/custom-token.svg";
import banditIcon from "../../assets/tokens-svg/bandit-icon.svg";
import zanoIcon from "../../assets/tokens-svg/zano.svg";
import bitcoinIcon from "../../assets/tokens-svg/bitcoin.svg";
import ethIcon from "../../assets/tokens-svg/eth.svg";
import InfoTooltip from "../UI/InfoTooltip";
import { getCurrent, goBack } from "react-chrome-extension-router";

interface ParamsType {
	key: number;
	value: string;
}

const OuterConfirmation = () => {
	const { props } = getCurrent();
	const { reqs } = props;

	const [reqIndex, setReqIndex] = useState(0);
	const [accepting, setAccepting] = useState(false);
	const [denying, setDenying] = useState(false);
	const [showFullComment, setShowFullComment] = useState(false);

	const req = reqs[reqIndex];
	const { id, name, params, method } = req;

	const transactionParams = Object.fromEntries((params as ParamsType[]).map(item => [item.key, item.value]));

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

	console.log("FINALIZA TRANSACTION", req);

	return (
		<div className={styles.confirmation}>
			<h3 className={styles.confirmation__title}>Request Confirmation</h3>
			<h5 className={styles.confirmation__subtitle}>
				{name?.toLowerCase() === "transfer" ? "Please confirm the transfer details" : name}
			</h5>

			<div className={styles.confirmation__content}>
				<div className={styles.confirmation__block}>
					<div className={styles.row}>
						<h5>From</h5>
						<p>{transactionParams.From}</p>
					</div>
					<div className={styles.row}>
						<h5>Asset</h5>
						<p>{getAssetIcon(transactionParams.Asset)} {transactionParams.Asset}</p>
					</div>
					<div className={styles.row}>
						<h5>Amount</h5>
						<p>{Number(transactionParams.Amount).toLocaleString()}</p>
					</div>
					<div className={styles.col}>
						<h5>Comment</h5>
						<p>{(transactionParams.Comment.length > 60 && !showFullComment) ?
							<>
								{transactionParams.Comment.slice(0, 60)}...
								<button className={styles.showMoreBtn} onClick={() => setShowFullComment(true)}>Show more</button>
							</>
							:
							transactionParams.Comment
						}</p>
					</div>
				</div>

				<div className={styles.confirmation__block}>
					<div className={styles.row}>
						<h5>To</h5>
						<p>{transactionParams.To}</p>
					</div>
					<div className={styles.row}>
						<h5>Amount</h5>
						<p>{Number(transactionParams.Amount).toLocaleString()}</p>
					</div>
				</div>
			</div>

			<div className={styles.confirmation__bottom}>
				<div className={styles.confirmation__bottom_fee}>
					<h5>
						Transaction fee <InfoTooltip title="information" />
					</h5>
					<p>0.01 ZANO</p>
				</div>

				<div className={styles.divider} />

				<div className={styles.confirmation__bottom_total}>
					<h5>Total</h5>
					<p>{Number(transactionParams.Amount).toLocaleString()}</p>
				</div>


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