import React, { useState } from 'react';
import { getCurrent, goBack } from 'react-chrome-extension-router';
import styles from './styles.module.scss';
import Button, { ButtonThemes } from '../UI/Button/Button';
import infoIcon from '../../assets/svg/info-blue.svg';
import walletIcon from '../../assets/svg/wallet.svg';
import assetIcon from '../../assets/svg/asset.svg';
import historyIcon from '../../assets/svg/history.svg';
import { fetchBackground } from '../../utils/utils';
import { PermissionType } from '../../../types';

const permissionMap = {
	general: {
		title: 'Wallet address',
		desc: 'View your address and alias',
		icon: walletIcon,
	},
	balance: {
		title: 'Balance',
		desc: 'View your wallet balances',
		icon: assetIcon,
	},
	history: {
		title: 'Transaction history',
		desc: 'View your transactions',
		icon: historyIcon,
	},
};

const RequestAccessPage = () => {
	const { props } = getCurrent();
	const { accessRequests } = props;
	const [reqIndex, setReqIndex] = useState(0);
	const [accepting, setAccepting] = useState(false);
	const [denying, setDenying] = useState(false);

	if (!accessRequests?.length) return null;

	const req = accessRequests[reqIndex];

	if (!req) return null;

	async function nextRequest() {
		if (reqIndex < accessRequests.length - 1) {
			setReqIndex(reqIndex + 1);
		} else {
			goBack();
		}
	}

	async function acceptClick() {
		setAccepting(true);

		await fetchBackground({
			method: 'FINALIZE_REQUEST_ACCESS',
			id: req.id,
			success: true,
		});

		setAccepting(false);
		await nextRequest();
	}

	async function denyClick() {
		if (denying) return;

		setDenying(true);

		await fetchBackground({
			method: 'FINALIZE_REQUEST_ACCESS',
			id: req.id,
			success: false,
		});

		setDenying(false);
		await nextRequest();
	}

	return (
		<main className={styles.main}>
			<h3 className={styles.main__title}>Access Request</h3>
			<p className={styles.main__subtitle}>Review access before continuing</p>

			<div className={styles.main__content}>
				<div className={styles.main__siteInfo}>
					<img
						className={styles.main__siteInfo_icon}
						src={req.favicon}
						alt="site favicon"
					/>
					<h3 className={styles.main__siteInfo_origin}>{req.hostname}</h3>
				</div>

				<div className={styles.main__permissions}>
					<h5 className={styles.main__permissions_title}>Permissions requested:</h5>

					<div className={styles.main__permissions_list}>
						{req?.permissions?.map((p: { type: PermissionType }) => {
							const item = permissionMap[p.type];

							if (!item) return null;

							return (
								<div key={p.type} className={styles.item}>
									<img
										className={styles.item__icon}
										width={24}
										height={24}
										src={item.icon}
										alt="icon"
									/>

									<div className={styles.item__text}>
										<p className={styles.item__title}>{item.title}</p>
										<p className={styles.item__desc}>{item.desc}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<div className={styles.main__bottom}>
				<p className={styles.main__bottom_info}>
					<img src={infoIcon} width={16} alt="info" />
					This site cannot move funds without your approval
				</p>

				<div className={styles.main__bottom_actions}>
					<Button disabled={denying} onClick={denyClick} theme={ButtonThemes.Outline}>
						Deny
					</Button>
					<Button disabled={accepting} onClick={acceptClick}>
						Allow
					</Button>
				</div>
			</div>
		</main>
	);
};

export default RequestAccessPage;
