import React, { useContext, useEffect, useRef, useState } from 'react';
import arrowIcon from '../../assets/svg/arrow-shevron.svg';
import checkIcon from '../../assets/svg/check-icon-blue.svg';
import copyBlueIcon from '../../assets/svg/copy-blue.svg';
import { useCopy } from '../../hooks/useCopy';
import { Store } from '../../store/store-reducer';
import { updateActiveWalletId, updateLoading } from '../../store/actions';
import s from './Header.module.scss';
import { fetchBackground, shortenAddress } from '../../utils/utils';

const Header = () => {
	const { dispatch, state } = useContext(Store);
	const { copyToClipboard } = useCopy();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [copiedWalletAddress, setCopiedWalletAddress] = useState<string | null>(null);
	const copyFeedbackTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		document.body.style.overflow = dropdownOpen ? 'hidden' : '';

		return () => {
			document.body.style.overflow = '';
		};
	}, [dropdownOpen]);

	useEffect(
		() => () => {
			if (copyFeedbackTimeoutRef.current !== null) {
				window.clearTimeout(copyFeedbackTimeoutRef.current);
			}
		},
		[],
	);

	const toggleDropdown = () => setDropdownOpen((currentState) => !currentState);

	const formatWalletAddress = (address: string) =>
		address.length > 14 ? shortenAddress(address, 6, 6) : address;

	const switchWallet = (id: number | undefined) => {
		// eslint-disable-next-line no-undef
		chrome.storage.local.set({ key: id }, () => {
			updateLoading(dispatch as () => void, true);
			updateActiveWalletId(dispatch as () => void, String(id));

			fetchBackground({
				method: 'SET_ACTIVE_WALLET',
				id,
			});

			console.log('Active wallet set to', id);
			setTimeout(() => updateLoading(dispatch as () => void, false), 1000);
		});

		setDropdownOpen(false);
	};

	const handleWalletKeyDown = (
		event: React.KeyboardEvent<HTMLDivElement>,
		id: number | undefined,
	) => {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		switchWallet(id);
	};

	const copyAlias = (alias: string, walletAddress: string) => {
		copyToClipboard(`@${alias}`);
		setCopiedWalletAddress(walletAddress);

		if (copyFeedbackTimeoutRef.current !== null) {
			window.clearTimeout(copyFeedbackTimeoutRef.current);
		}

		copyFeedbackTimeoutRef.current = window.setTimeout(() => {
			setCopiedWalletAddress(null);
			copyFeedbackTimeoutRef.current = null;
		}, 3000);
	};

	const handleAliasCopy = (
		event: React.MouseEvent<HTMLButtonElement>,
		alias: string,
		walletAddress: string,
	) => {
		event.stopPropagation();
		copyAlias(alias, walletAddress);
	};

	const handleAliasCopyKeyDown = (
		event: React.KeyboardEvent<HTMLButtonElement>,
		alias: string,
		walletAddress: string,
	) => {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		copyAlias(alias, walletAddress);
	};

	return (
		<header className={s.header}>
			<button
				type="button"
				onClick={toggleDropdown}
				className={s.dropdownButton}
				aria-expanded={dropdownOpen}
				aria-label="Toggle wallets list"
			>
				<span className={s.dropdownButtonLabel} title={state.wallet.address}>
					{formatWalletAddress(state.wallet.address)}
				</span>
				<img
					src={arrowIcon}
					alt=""
					aria-hidden="true"
					className={`${s.dropdownButtonIcon} ${dropdownOpen ? s.dropdownButtonIconOpen : ''}`}
				/>
			</button>

			<div className={s.headerStatus}>
				{state.isConnected ? 'online' : 'offline'}
				<span style={{ backgroundColor: state.isConnected ? '#16D1D6' : '#FF6767' }}></span>
			</div>

			{dropdownOpen && (
				<div onClick={toggleDropdown} className={s.dropdown}>
					<div onClick={(event) => event.stopPropagation()} className={s.dropdownList}>
						{state.walletsList.map((wallet) => {
							const isActiveWallet = wallet.address === state.wallet.address;
							const aliasLabel = wallet.alias ? `@${wallet.alias}` : '';
							const isCopySuccessful = copiedWalletAddress === wallet.address;

							return (
								<div
									key={wallet.address}
									className={`${s.dropdownItem} ${isActiveWallet ? s.dropdownItemActive : ''}`}
									onClick={() => switchWallet(wallet.wallet_id)}
									onKeyDown={(event) =>
										handleWalletKeyDown(event, wallet.wallet_id)
									}
									role="button"
									tabIndex={0}
								>
									<span className={s.dropdownAddress} title={wallet.address}>
										{formatWalletAddress(wallet.address)}
									</span>
									{wallet.alias && (
										<div className={s.dropdownMeta}>
											<button
												type="button"
												className={s.dropdownCopyButton}
												onClick={(event) =>
													handleAliasCopy(
														event,
														wallet.alias,
														wallet.address,
													)
												}
												onKeyDown={(event) =>
													handleAliasCopyKeyDown(
														event,
														wallet.alias,
														wallet.address,
													)
												}
												aria-label={
													isCopySuccessful
														? `${aliasLabel} copied successfully`
														: `Copy ${aliasLabel}`
												}
											>
												{isCopySuccessful ? (
													<img
														src={checkIcon}
														alt=""
														aria-hidden="true"
													/>
												) : (
													<img
														src={copyBlueIcon}
														alt=""
														aria-hidden="true"
													/>
												)}
											</button>
											<span className={s.dropdownAlias} title={aliasLabel}>
												{aliasLabel}
											</span>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
