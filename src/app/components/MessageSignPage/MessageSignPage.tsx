import React, { useEffect, useState } from 'react';
import { getCurrent, goBack } from 'react-chrome-extension-router';
import Button, { ButtonThemes } from '../UI/Button/Button';
import styles from './MessageSignPage.module.scss';
import { fetchBackground } from '../../utils/utils';

export default function MessageSignPage() {
	const { props } = getCurrent();

	const { signRequests } = props;

	const [reqIndex, setReqIndex] = useState(0);
	const [accepting, setAccepting] = useState(false);
	const [denying, setDenying] = useState(false);

	const signRequest = signRequests[reqIndex];

	useEffect(() => {
		setReqIndex(0);
	}, [signRequests]);

	async function nextRequest() {
		if (reqIndex < signRequests.length - 1) {
			setReqIndex(reqIndex + 1);
		} else {
			goBack();
		}
	}

	async function acceptClick() {
		setAccepting(true);
		await fetchBackground({
			method: 'FINALIZE_MESSAGE_SIGN',
			id: signRequest?.id,
			success: true,
		});
		setAccepting(false);
		await nextRequest();
	}

	async function denyClick() {
		setDenying(true);
		await fetchBackground({
			method: 'FINALIZE_MESSAGE_SIGN',
			id: signRequest?.id,
			success: false,
		});
		setDenying(false);
		await nextRequest();
	}
	return (
		<div className={styles.signContainer}>
			<h3 className={styles.title}>Sign Request</h3>
			<p className={styles.text}>
				<b>ATTENTION!</b>: Sign this message only if you fully understand its contents and
				trust the requesting site. Check the domain and make sure it is correct, avoid
				phishing attacks.
			</p>

			<p className={styles.subtext}>You sign:</p>
			<div className={styles.messageBlock}>
				<div className={styles.messageBlockItem}>
					<p className={styles.messageBlockTitle}>Message:</p>
					<p
						className={
							signRequest?.secure
								? styles.messageBlockTextSecure
								: styles.messageBlockText
						}
					>
						{signRequest?.message}
					</p>
				</div>
				<div className={styles.messageBlockItem}>
					<p className={styles.messageBlockTitle}>Requested by:</p>
					<p className={styles.messageBlockText}>{signRequest?.host}</p>
				</div>
			</div>
			<div className={styles.buttonsContainer}>
				<Button disabled={denying} theme={ButtonThemes.Outline} onClick={denyClick}>
					Deny
				</Button>
				<Button disabled={accepting} onClick={acceptClick}>
					Accept
				</Button>
			</div>
		</div>
	);
}
