import React, { Dispatch, SetStateAction, useContext, useRef, useState } from 'react';
import Decimal from 'decimal.js';
import copyIcon from '../../assets/svg/copy.svg';
import dotsIcon from '../../assets/svg/dots.svg';
import sendIcon from '../../assets/svg/send.svg';
import editIcon from '../../assets/svg/edit.svg';
import transferIcon from '../../assets/svg/transfer.svg';
import settingsIcon from '../../assets/svg/settings.svg';
import showIcon from '../../assets/svg/show.svg';
import hideIcon from '../../assets/svg/hide.svg';
import dappIcon from '../../assets/svg/dapp.svg';
import lockedIcon from '../../assets/svg/lockedIcon.svg';
import shieldOffIcon from '../../assets/svg/lockedIcon.svg';
import checkIcon from '../../assets/svg/check-icon.svg';
import useAwayClick from '../../hooks/useAwayClick';
import { useCensorDigits } from '../../hooks/useCensorDigits';
import { useCopy } from '../../hooks/useCopy';
import { Store } from '../../store/store-reducer';
import { DispatchFunction, updateBalancesHidden, updateDisplay } from '../../store/actions';
import ModalTransactionStatus from '../ModalTransactionStatus/ModalTransactionStatus';
import WalletSend from '../WalletSend/WalletSend';
import s from './Wallet.module.scss';
import NavLink from '../UI/NavLink/NavLink';
import { classNames } from '../../utils/classNames';
import { ZANO_ASSET_ID } from '../../../constants';
import AliasManagePage from '../AliasManagePage';
import AliasTransfer from '../AliasTransfer';
import PermissionsPage from '../PermissionsPage';

const Wallet = ({ setConnectOpened }: { setConnectOpened: Dispatch<SetStateAction<boolean>> }) => {
	const { state, dispatch } = useContext(Store);
	const { copied, copyToClipboard } = useCopy();
	const { censorValue } = useCensorDigits();
	const [menuVisible, setMenuVisible] = useState(false);

	const renderBalance = () => {
		const fiatBalance = (Number(state.wallet.balance) * state.priceData.price).toFixed(2);

		if (state.displayUsd) {
			return (
				<>
					<span>${censorValue(fiatBalance)}</span>
					<span
						style={{
							color: state.priceData.change > 0 ? '#16D1D6' : '#FFCBCB',
						}}
						className={s.percentChange}
					>
						{state.priceData.change}%
					</span>
				</>
			);
		}
		return (
			<span>
				{censorValue(
					new Decimal(state.wallet.balance)
						.toDecimalPlaces(6, Decimal.ROUND_DOWN)
						.toFixed(),
				)}{' '}
				ZANO
			</span>
		);
	};

	const getUnlockedBalance = () =>
		state.wallet.assets.find((asset) => asset.assetId === ZANO_ASSET_ID)?.unlockedBalance;

	const flipDisplay = () => {
		updateDisplay(dispatch as DispatchFunction, !state.displayUsd as never);
	};

	const flipMenu = () => {
		setMenuVisible((prevState) => !prevState);
	};

	const flipBalancesVisibility = () => {
		if (state.isBalancesHidden) {
			updateBalancesHidden(dispatch, false);
		} else {
			updateBalancesHidden(dispatch, true);
		}
		flipMenu();
	};

	// Function and hook to close menu if click away
	const menuRef = useRef(null);
	const handleAwayClick = () => {
		setMenuVisible(false);
	};
	useAwayClick(menuRef, handleAwayClick);

	const isTrackingWallet = !!state.wallet.isWatchOnly;
	const isAuditableWallet = !!state.wallet.isAuditable;

	const unlockedBalance = getUnlockedBalance();
	const lockedBalance = new Decimal(state.wallet.balance).minus(unlockedBalance ?? 0);
	const lockedBalanceDisplay = lockedBalance.gt(0)
		? lockedBalance.toDecimalPlaces(6, Decimal.ROUND_DOWN).toFixed()
		: undefined;

	const hasAlias = Boolean(state.wallet.alias);
	const canCreateAlias = !hasAlias && !isTrackingWallet;
	const showAliasBlock = hasAlias || canCreateAlias;

	return (
		<div
			className={classNames(s.wallet, {
				[s.auditable]: isAuditableWallet && !isTrackingWallet,
				[s.watchOnly]: isTrackingWallet,
			})}
		>
			<ModalTransactionStatus />
			<div className={s.infoWallet}>
				{showAliasBlock && (
					<div className={s.aliasWrapper}>
						<div
							className={classNames(s.aliasContent, {
								[s.active]: hasAlias,
							})}
						>
							{hasAlias ? (
								`@${state.wallet.alias}`
							) : (
								<NavLink component={AliasManagePage} className={s.aliasCreateBtn}>
									Create alias
								</NavLink>
							)}
						</div>

						{hasAlias && canCreateAlias && (
							<div className={s.aliasWrapper__actions}>
								<NavLink
									component={AliasManagePage}
									props={{ mode: 'edit' }}
									className="round-button"
								>
									<img width={18} height={18} src={editIcon} alt="edit icon" />
									<span>Edit alias</span>
								</NavLink>

								<NavLink component={AliasTransfer} className="round-button">
									<img
										width={18}
										height={18}
										src={transferIcon}
										alt="transfer icon"
									/>
									<span>Transfer alias</span>
								</NavLink>
							</div>
						)}
					</div>
				)}

				<div className={s.balanceWrapper}>
					<button onClick={flipDisplay} className={s.balance}>
						{renderBalance()}
					</button>
					{lockedBalanceDisplay !== undefined && (
						<div className={s.lockedBalanceWrapper}>
							<img src={lockedIcon} alt="locked icon" />
							<span className={s.lockedBalanceText}>{lockedBalanceDisplay} ZANO</span>
						</div>
					)}
				</div>

				<div className={s.infoAddress}>
					<span>{state.wallet.address}</span>
				</div>

				{isTrackingWallet && (
					<div className={s.watchOnlyBadge}>
						<img src={shieldOffIcon} alt="watch-only icon" />
						View-only wallet
					</div>
				)}
			</div>

			<div className={s.actionsWallet}>
				<div ref={menuRef} className={s.actionsSettings}>
					<button onClick={flipMenu} className="round-button">
						<img src={dotsIcon} alt="dots icon" />
						{/* Tooltip */}
						<span>options</span>
					</button>

					{menuVisible && (
						<div className={s.settings}>
							<div className={s.settingsBtn} onClick={() => setConnectOpened(true)}>
								<img src={settingsIcon} alt="settings icon" />
								Settings
							</div>
							<button onClick={flipBalancesVisibility} className={s.settingsBtn}>
								<img
									src={state.isBalancesHidden ? showIcon : hideIcon}
									alt="show or hide icon"
								/>
								{state.isBalancesHidden ? 'Show values' : 'Hide values'}
							</button>
							<NavLink component={PermissionsPage} className={s.settingsBtn}>
								<img src={dappIcon} alt="dapp icon" />
								dApps
							</NavLink>
						</div>
					)}
				</div>

				{!isTrackingWallet && (
					<NavLink component={WalletSend} className="round-button">
						<img src={sendIcon} alt="send icon" />
						{/* Tooltip */}
						<span>send</span>
					</NavLink>
				)}

				{isTrackingWallet && hasAlias && (
					<div className={s.actionPlaceholder} aria-hidden="true" />
				)}

				<button
					onClick={() => copyToClipboard(state.wallet.address)}
					className="round-button"
				>
					{copied ? (
						<img src={checkIcon} alt="copy icon" />
					) : (
						<img src={copyIcon} alt="copy icon" />
					)}
					{/* Tooltip */}
					{copied ? <span>copied!</span> : <span>copy address</span>}
				</button>
			</div>
		</div>
	);
};

export default Wallet;
