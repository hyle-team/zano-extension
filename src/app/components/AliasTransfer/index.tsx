import React, { useContext } from 'react';
import { goBack } from 'react-chrome-extension-router';
import styles from './styles.module.scss';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import MyInput, { inputDataProps } from '../UI/MyInput/MyInput';
import Button from '../UI/Button/Button';
import InfoTooltip from '../UI/InfoTooltip';
import { Store } from '../../store/store-reducer';
import successImg from '../../assets/images/success-round.png';
import errorImg from '../../assets/images/failed-round.png';
import { useAliasTransfer } from './hook/useAliasTransfer';

const AliasTransfer = () => {
	const { state } = useContext(Store);
	const walletAlias = state.wallet?.alias;

	const {
		onTransfer,
		addressStroke,
		commentInput,
		addressInput,
		fee,
		notEnoughFee,
		errorMsg,
		transactionSuccess,
		isDisabled,
	} = useAliasTransfer({
		alias: walletAlias,
	});

	if (transactionSuccess !== null) {
		return (
			<div className={styles.main}>
				<div className={styles.main__transactionInfo}>
					<img
						className={styles.main__transactionInfo_img}
						src={transactionSuccess ? successImg : errorImg}
						alt="transaction"
					/>

					<p className={styles.main__transactionInfo_text}>
						{transactionSuccess ? `Alias transferred!` : 'Transaction failed!'}
					</p>

					{!transactionSuccess && (
						<p className={styles.main__transactionInfo_errorMsg}>{errorMsg}</p>
					)}
				</div>

				<Button className={styles.main__action} onClick={goBack}>
					OK
				</Button>
			</div>
		);
	}

	return (
		<main className={styles.main}>
			<RoutersNav title="Transfer Alias" />

			<div className={styles.main__content}>
				<MyInput
					disabled
					noActiveBorder
					placeholder="Alias"
					label="Alias"
					value={`@${state.wallet.alias}`}
				/>

				<MyInput
					stroke={addressStroke}
					placeholder="Please enter an address"
					label="Transfer to"
					inputData={addressInput as inputDataProps}
				/>

				<MyInput
					maxLength={255}
					placeholder="Enter your comment here"
					label="Comment"
					inputData={commentInput as inputDataProps}
					noActiveBorder
				/>

				<div className={styles.main__bottom}>
					<div className={styles.fee}>
						<h5 className={styles.fee__label}>
							Transfer fee <InfoTooltip title="Total network fee" />
						</h5>

						<p className={`${styles.fee__value} ${notEnoughFee ? styles.error : ''}`}>
							{fee} ZANO
						</p>
					</div>

					<Button onClick={onTransfer} disabled={isDisabled}>
						Transfer alias
					</Button>
				</div>
			</div>
		</main>
	);
};

export default AliasTransfer;
