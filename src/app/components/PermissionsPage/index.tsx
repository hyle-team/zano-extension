import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import chevronRightIcon from '../../assets/svg/chevron-right.svg';
import historyIcon from '../../assets/svg/history.svg';
import walletIcon from '../../assets/svg/wallet.svg';
import assetIcon from '../../assets/svg/asset.svg';
import logoutIcon from '../../assets/svg/logout.svg';
import shieldOffIcon from '../../assets/svg/shield-off.svg';
import Button, { ButtonThemes } from '../UI/Button/Button';
import { PermissionsState } from './types';
import FaviconImg from '../UI/FaviconImg/FaviconImg';

const STORAGE_KEY = 'permissions';

const permissionMap: Record<string, { info: string; icon: string }> = {
	general: {
		info: 'View your address and alias',
		icon: walletIcon,
	},
	balance: {
		info: 'View your wallet balances',
		icon: assetIcon,
	},
	history: {
		info: 'View your transactions',
		icon: historyIcon,
	},
};

const PermissionsPage = () => {
	const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [confirmDisconnectAll, setConfirmDisconnectAll] = useState(false);
	const [permissions, setPermissions] = useState<PermissionsState>({});
	const [selectedSite, setSelectedSite] = useState<string | null>(null);
	const [popup, setPopup] = useState(false);

	const onHandleOpenPopup = (origin: string) => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
		}

		setSelectedSite(origin);
		setPopup(true);
	};

	const onHandleClosePopup = () => {
		setPopup(false);

		closeTimeoutRef.current = setTimeout(() => {
			setSelectedSite(null);
		}, 400);
	};

	const loadPermissions = async () => {
		const result = await chrome.storage.local.get(STORAGE_KEY);

		setPermissions(result?.[STORAGE_KEY] || {});
	};

	const savePermissions = async (data: PermissionsState) => {
		await chrome.storage.local.set({
			[STORAGE_KEY]: data,
		});

		setPermissions(data);
	};

	const disconnectAll = async () => {
		await chrome.storage.local.remove(STORAGE_KEY);
		setPermissions({});
		setConfirmDisconnectAll(false);
		setSelectedSite(null);
	};

	const disconnectSite = async (origin: string) => {
		const updated = { ...permissions };
		delete updated[origin];
		await savePermissions(updated);
		onHandleClosePopup();
	};

	useEffect(() => {
		loadPermissions();
	}, []);

	useEffect(() => {
		return () => {
			if (closeTimeoutRef.current) {
				clearTimeout(closeTimeoutRef.current);
			}
		};
	}, []);

	const parsedSites = useMemo(() => {
		return Object.entries(permissions).map(([origin, wallets]) => {
			const permissionsList = Object.values(wallets).flat();

			const uniquePermissions = [
				...new Map(permissionsList.map((p) => [p.type, p])).values(),
			];

			return {
				origin,
				hostname: new URL(origin).host,
				favicon: `${origin}/favicon.ico`,
				permissions: uniquePermissions,
			};
		});
	}, [permissions]);

	const totalPermissions = parsedSites.reduce((acc, site) => acc + site.permissions.length, 0);
	const selectedSiteData = parsedSites.find((site) => site.origin === selectedSite);

	return (
		<>
			<div className={styles.permissions}>
				<RoutersNav title="Dapp Permissions" />

				{parsedSites.length > 0 ? (
					<>
						<p className={styles.permissions__desc}>
							dApps connected to your Zano wallet will appear here. You can revoke
							access at any time.
						</p>
						<div className={styles.permissions__list}>
							{parsedSites.map((site) => (
								<div
									key={site.origin}
									onClick={() => onHandleOpenPopup(site.origin)}
									className={styles.permissions__item}
								>
									<FaviconImg
										className={styles.permissions__item_icon}
										src={site.favicon}
										alt={site.hostname}
									/>

									<div className={styles.permissions__item_info}>
										<p className={styles.permissions__item_title}>
											{site.hostname}
										</p>

										<p className={styles.permissions__item_count}>
											{site.permissions.length}{' '}
											{site.permissions.length === 1
												? 'permission'
												: 'permissions'}
										</p>
									</div>

									<img
										src={chevronRightIcon}
										alt="Chevron right"
										className={styles.permissions__item_chevron}
									/>
								</div>
							))}
						</div>
					</>
				) : (
					<div className={styles.permissions__empty}>
						<div className={styles.permissions__empty_icon}>
							<img src={shieldOffIcon} alt="Shield off" />
						</div>

						<p className={styles.permissions__empty_text}>No connected apps</p>

						<p className={styles.permissions__empty_desc}>
							dApps connected to your Zano wallet will appear here. You can revoke
							access at any time.
						</p>
					</div>
				)}

				{!!parsedSites.length && (
					<div className={styles.permissions__bottom}>
						{!confirmDisconnectAll ? (
							<Button
								onClick={() => setConfirmDisconnectAll(true)}
								theme={ButtonThemes.Danger}
							>
								<img src={logoutIcon} alt="logout" />
								Disconnect All
							</Button>
						) : (
							<>
								<p className={styles.permissions__bottom_warning}>
									Disconnect all {parsedSites.length} dApps? They'll need to
									request access again.
								</p>

								<div className={styles.permissions__bottom_actions}>
									<Button
										onClick={() => setConfirmDisconnectAll(false)}
										theme={ButtonThemes.Outline}
										className={styles.btn}
									>
										Cancel
									</Button>

									<Button
										onClick={disconnectAll}
										theme={ButtonThemes.Red}
										className={styles.btn}
									>
										Disconnect All
									</Button>
								</div>
							</>
						)}

						<p className={styles.permissions__bottom_info}>
							{parsedSites.length} connected • {totalPermissions} permissions granted
						</p>
					</div>
				)}
			</div>

			<div
				onClick={onHandleClosePopup}
				className={`${styles.popup} ${popup ? styles.visible : ''}`}
			>
				<div onClick={(e) => e.stopPropagation()} className={styles.popup__content}>
					<div onClick={onHandleClosePopup} className={styles.popup__item} />

					{selectedSiteData && (
						<>
							<p className={styles.popup__title}>{selectedSiteData.hostname}</p>

							<p className={styles.popup__desc}>
								{selectedSiteData.permissions.length}{' '}
								{selectedSiteData.permissions.length === 1
									? 'permission'
									: 'permissions'}{' '}
								granted
							</p>

							<div className={styles.popup__list}>
								{selectedSiteData.permissions.map((permission) => {
									const data = permissionMap[permission.type];

									if (!data) return null;
									return (
										<div
											key={permission.type}
											className={styles.popup__list_item}
										>
											<img
												className={styles.icon}
												src={data.icon}
												alt="Permission icon"
											/>

											<p className={styles.info}>{data.info}</p>
										</div>
									);
								})}
							</div>

							<div className={styles.popup__actions}>
								<Button
									onClick={() => disconnectSite(selectedSiteData.origin)}
									theme={ButtonThemes.Danger}
								>
									Disconnect dApp
								</Button>

								<Button onClick={onHandleClosePopup} theme={ButtonThemes.Outline}>
									Close
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default PermissionsPage;
