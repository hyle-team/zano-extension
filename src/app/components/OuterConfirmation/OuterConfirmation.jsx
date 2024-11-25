import { getCurrent, goBack } from "react-chrome-extension-router";
import Button, { ButtonThemes } from "../UI/Button/Button";
import styles from "./OuterConfirmation.module.scss";
import { useState, useEffect } from "react";
import { fetchBackground } from "../../utils/utils";

const OuterConfirmation = () => {
	const { props } = getCurrent();
	const { reqs } = props;

	const [reqIndex, setReqIndex] = useState(0);
	const [accepting, setAccepting] = useState(false);
	const [denying, setDenying] = useState(false);

	const req = reqs[reqIndex];
	const { id, name, params, method } = req;

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

	const disabled = accepting || denying;

	return (
		<div className={styles.confirmationContainer}>
			<h3 className={styles.title}>Request Confirmation</h3>
			<h5>{name}</h5>
			<div className={styles.table}>
				{
					params.map((param) => {

						return (
							<div className={styles.row} key={param.key}>
								<p>{param.key}:</p>
								<p>{param.value}</p>
							</div>
						)
					}
					)
				}
			</div>
			<div className={styles.buttons}>
				<Button
					disabled={disabled}
					theme={ButtonThemes.Outline}
					onClick={denyClick}
				>
					Cancel
				</Button>
				<Button
					disabled={disabled}
					onClick={acceptClick}
				>
					Confirm
				</Button>
			</div>

		</div>
	);
}

export default OuterConfirmation;