import React, { useEffect, useState } from 'react';
import { getCurrent, goBack } from 'react-chrome-extension-router';
import Button, { ButtonThemes } from '../UI/Button/Button';
import styles from './AliasCreatePage.module.scss';
import { fetchBackground } from '../../utils/utils';
import InfoTooltip from '../UI/InfoTooltip';
import { useFeeCheck } from '../../hooks/useFeeCheck';

const fee = 0.11;

export default function AliasCreatePage() {
	const { props } = getCurrent();
	const { notEnoughFee } = useFeeCheck(fee);

	const { createRequests } = props;

	const [reqIndex, setReqIndex] = useState(0);
	const [accepting, setAccepting] = useState(false);
	const [denying, setDenying] = useState(false);

	const signRequest = createRequests[reqIndex];

	useEffect(() => {
		setReqIndex(0);
	}, [createRequests]);

	function nextRequest() {
		if (reqIndex < createRequests.length - 1) {
			setReqIndex(reqIndex + 1);
		} else {
			goBack();
		}
	}

	async function acceptClick() {
		setAccepting(true);
		await fetchBackground({
			method: 'FINALIZE_ALIAS_CREATE',
			id: signRequest.id,
			success: true,
		});
		setAccepting(false);
		nextRequest();
	}

	async function denyClick() {
		setDenying(true);
		await fetchBackground({
			method: 'FINALIZE_ALIAS_CREATE',
			id: signRequest.id,
			success: false,
		});
		setDenying(false);
		nextRequest();
	}

	return (
		<div className={styles.signContainer}>
			<h3 className={styles.title}>Create alias request</h3>
			<p className={styles.text}>New alias will be created for your wallet</p>

			<div className={styles.messageBlock}>
				<p className={styles.messageTitle}>New alias:</p>
				<p>@{signRequest.alias}</p>
			</div>

			<div className={styles.buttonsContainer}>
				<div className={styles.fee}>
					<h5 className={styles.fee__label}>
						Alias fee <InfoTooltip title="Total network fee" />
					</h5>

					<p className={`${styles.fee__value} ${notEnoughFee ? styles.error : ''}`}>
						{fee} ZANO
					</p>
				</div>

				<div className={styles.actions}>
					<Button disabled={denying} theme={ButtonThemes.Outline} onClick={denyClick}>
						Deny
					</Button>
					<Button disabled={accepting || notEnoughFee} onClick={acceptClick}>
						Accept
					</Button>
				</div>
			</div>
		</div>
	);
}
