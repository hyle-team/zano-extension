import React, { useContext } from 'react';
import { goBack } from 'react-chrome-extension-router';
import styles from './styles.module.scss';
import MyInput, { inputDataProps } from '../UI/MyInput/MyInput';
import { Store } from '../../store/store-reducer';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import Button from '../UI/Button/Button';
import InfoTooltip from '../UI/InfoTooltip';
import successImg from '../../assets/images/success-round.png';
import errorImg from '../../assets/images/failed-round.png';
import { useAlias } from './hook/useAlias';

const AliasManagePage = ({ mode = 'create' }) => {
	const { state } = useContext(Store);

	const {
		fee,
		aliasInput,
		commentInput,
		aliasError,
		isDisabled,
		submit,
		transactionSuccess,
		notEnoughFee,
	} = useAlias({
		mode,
		walletAddress: state.wallet.address,
		walletAlias: state.wallet.alias,
		balance: state.wallet.balance,
		lockedBalance: Number(state.wallet.lockedBalance),
	});

	const displayAlias = aliasInput.value ? `@${aliasInput.value}` : '';

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
						{transactionSuccess ? 'Success!' : 'Transaction failed!'}
					</p>
				</div>

				<Button className={styles.main__action} onClick={goBack}>
					OK
				</Button>
			</div>
		);
	}

	return (
		<main className={styles.main}>
			<RoutersNav title={`${mode === 'create' ? 'Create' : 'Edit'} Alias`} />

			<div className={styles.main__content}>
				<div className={styles.main__address}>
					<p className={styles.main__address_title}>Address</p>
					<p className={styles.main__address_value}>{state.wallet.address}</p>
				</div>

				<MyInput
					disabled={mode === 'edit'}
					noActiveBorder={mode === 'edit'}
					placeholder="Enter alias"
					label="Alias"
					stroke={aliasError}
					inputData={{
						...aliasInput,
						value: displayAlias,
					}}
				/>

				<MyInput
					maxLength={255}
					placeholder="Enter the comment"
					label="Comment"
					inputData={commentInput as inputDataProps}
					noActiveBorder
				/>

				<div className={styles.main__bottom}>
					<div className={styles.fee}>
						<h5 className={styles.fee__label}>
							Alias fee <InfoTooltip title="Total network fee" />
						</h5>

						<p className={`${styles.fee__value} ${notEnoughFee ? styles.error : ''}`}>
							{fee} ZANO
						</p>
					</div>

					<Button disabled={isDisabled} onClick={submit}>
						{mode === 'create' ? 'Create' : 'Edit'} alias
					</Button>
				</div>
			</div>
		</main>
	);
};

export default AliasManagePage;
