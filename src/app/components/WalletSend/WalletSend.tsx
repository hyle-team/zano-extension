import React, { useContext, useEffect, useState } from 'react';
import { popToTop } from 'react-chrome-extension-router';
import failedImage from '../../assets/images/failed-round.png';
import successImage from '../../assets/images/success-round.png';
import { useCheckbox } from '../../hooks/useCheckbox';
import { useInput } from '../../hooks/useInput';
import { Store } from '../../store/store-reducer';
import Button from '../UI/Button/Button';
import MyInput, { inputDataProps } from '../UI/MyInput/MyInput';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import s from './WalletSend.module.scss';
import { fetchBackground, validateTokensInput } from '../../utils/utils';
import AssetsSelect from './ui/AssetsSelect/AssetsSelect';
import AdditionalDetails from './ui/AdditionalDetails/AdditionalDetails';

interface FetchBackgroundParams {
	method: string;
	assetId: string;
	destination: string;
	amount: string | number;
	comment: string;
	decimalPoint: number;
	password?: string;
	id?: number;
	success?: boolean;
	credentials?: {
		port: string;
	};
}

interface AssetProps {
	unlockedBalance: number;
	balance: number;
}

const WalletSend = () => {
	const { state } = useContext(Store);
	const [activeStep, setActiveStep] = useState(0);
	const [transactionSuccess, setTransactionSuccess] = useState(false);
	const [txId, setTxId] = useState('');

	// Form data
	const [asset, setAsset] = useState(state.wallet.assets[0]);
	const [submitAddress, setSubmitAddress] = useState('');
	const [amountValid, setAmountValid] = useState(false);

	const address = useInput('', { customValidation: true });
	const amount = useInput('', {
		isEmpty: true,
		isAmountCorrect: true,
	});
	const comment = useInput('', { isEmpty: true });
	const mixin = useInput(10, { isEmpty: true });
	const fee = useInput(0.01, { isEmpty: true });
	const isSenderInfo = useCheckbox(false);
	const isReceiverInfo = useCheckbox(false);

	const sendTransfer = (
		destination: string,
		amount: string | number,
		comment: string,
		assetId: string,
		decimalPoint: number,
	) =>
		new Promise(async (resolve, reject) => {
			if (chrome.runtime.sendMessage as any) {
				const response = await fetchBackground({
					method: 'SEND_TRANSFER',
					assetId,
					destination,
					amount,
					comment,
					decimalPoint,
				} as FetchBackgroundParams);

				if (response.data) {
					resolve(response.data);
				} else if (response.error) {
					reject(response.error);
				} else {
					reject(new Error('No data or error received in response.'));
				}
			} else {
				reject(new Error('chrome.runtime.sendMessage is not available.'));
			}
		});

	const openExplorer = (txId: string) => {
		// eslint-disable-next-line no-undef
		chrome.tabs.create({
			url: `https://testnet-explorer.zano.org/block/${txId}`,
		});
	};

	const fetchAddress = async (alias: string) =>
		fetchBackground({ method: 'GET_ALIAS_DETAILS', alias });

	useEffect(() => {
		(async () => {
			if (String(address.value).startsWith('@')) {
				const alias = String(address.value).slice(1);
				const resolvedAddress = await fetchAddress(alias);
				if (resolvedAddress) {
					setSubmitAddress(resolvedAddress);
				} else {
					setSubmitAddress('');
				}
			} else if (String(address.value).length === 97) {
				setSubmitAddress(String(address.value));
			} else {
				setSubmitAddress('');
			}
		})();
	}, [address.value]);

	useEffect(() => {
		const isValid = !!validateTokensInput(amount.value, Number(asset.decimalPoint));
		setAmountValid(isValid);
	}, [amount.value, asset]);

	const checkAvailableBalance = (amount: string | number, asset: AssetProps) =>
		asset.unlockedBalance !== asset.balance
			? +amount <= asset.unlockedBalance - Number(fee.value)
			: true;

	//-------------------------------------------------------------------------------------------------------------------
	// Subcomponents
	const TableRow = ({ label, value }: { label: string; value: string }) => (
		<div className="table__row">
			<div className="table__label">{label}:</div>
			<div className="table__value">{value}</div>
		</div>
	);

	return (
		<>
			{(() => {
				console.log('activeStep', activeStep);
				console.log('address', address);

				switch (activeStep) {
					// Send form
					case 0:
						return (
							<div>
								<RoutersNav title="Send" />
								<div className={s.sendForm}>
									<MyInput
										placeholder="Address or alias"
										label="Address"
										inputData={address as inputDataProps}
										isValid={!!submitAddress}
									/>
									<AssetsSelect value={asset} setValue={setAsset} />
									<MyInput
										type="number"
										placeholder="Amount to transfer"
										label="Amount:"
										inputData={amount as inputDataProps}
										isError={amount.value ? !amountValid : false}
									/>
									<MyInput
										placeholder="Enter the comment"
										label="Comment:"
										inputData={comment as inputDataProps}
									/>
									<AdditionalDetails
										mixin={mixin}
										fee={fee}
										isSenderInfo={isSenderInfo}
										isReceiverInfo={isReceiverInfo}
									/>
									<Button
										onClick={() => setActiveStep(1)}
										disabled={
											!submitAddress ||
											!amount.value ||
											!amountValid ||
											!checkAvailableBalance(amount.value, asset)
										}
									>
										Send
									</Button>
								</div>
							</div>
						);
					// Confirm
					case 1:
						return (
							<div>
								<RoutersNav onClick={() => setActiveStep(0)} title="Confirm" />

								<div style={{ minHeight: '410px' }} className="table">
									<TableRow
										label="Amount"
										value={`${amount?.value} ${asset?.ticker}`}
									/>
									<TableRow label="From" value={state?.wallet?.address} />
									<TableRow label="To" value={String(address.value)} />
									<TableRow label="Comment" value={String(comment?.value)} />
									<TableRow label="Fee" value={String(fee?.value)} />
								</div>

								<Button
									onClick={async () => {
										const transferStatus = await sendTransfer(
											submitAddress,
											amount.value,
											String(comment.value),
											String(asset.assetId),
											Number(asset.decimalPoint),
										);
										console.log('transfer status', transferStatus);
										if (transferStatus.result) {
											setTxId(transferStatus.result.tx_hash);
											setTransactionSuccess(true);
										}
										setActiveStep(2);
									}}
								>
									Confirm
								</Button>
							</div>
						);
					// Transaction status
					case 2:
						return (
							<div>
								<RoutersNav
									onClick={transactionSuccess ? 'none' : () => setActiveStep(1)}
									title="Transaction"
								/>

								<div className={s.transactionContent}>
									<div className={s.transactionIcon}>
										<img
											src={transactionSuccess ? successImage : failedImage}
											alt="transaction status icon"
										/>
									</div>
									<div className={s.transactionText}>
										{transactionSuccess ? (
											<div>
												Sent in <span>{txId}</span>
											</div>
										) : (
											'Sending failed'
										)}
									</div>
									{transactionSuccess && (
										<button
											className={s.link}
											onClick={() => openExplorer(txId)}
										>
											See details
										</button>
									)}
								</div>

								<Button onClick={() => popToTop()}>Close</Button>
							</div>
						);
					default:
						return <></>;
				}
			})()}
		</>
	);
};

export default WalletSend;
