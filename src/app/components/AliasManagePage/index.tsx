import React, { useContext, useEffect, useMemo, useState } from 'react';
import Decimal from 'decimal.js';
import { goBack } from 'react-chrome-extension-router';
import styles from './styles.module.scss';
import MyInput, { inputDataProps } from '../UI/MyInput/MyInput';
import { useInput } from '../../hooks/useInput';
import { Store } from '../../store/store-reducer';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import Button from '../UI/Button/Button';
import { fetchBackground } from '../../utils/utils';
import InfoTooltip from '../UI/InfoTooltip';
import { AliasManagePageProps, RegisterAliasParams } from './types';
import successImg from '../../assets/images/success-round.png';
import errorImg from '../../assets/images/failed-round.png';

const AliasManagePage = ({ mode = 'create' }: AliasManagePageProps) => {
	const fee = mode === 'create' ? 0.11 : 0.01;

	const { state } = useContext(Store);
	const walletAddress = state.wallet.address;
	const walletAlias = state.wallet.alias;
	const balance = new Decimal(state.wallet?.balance || 0);
	const locked = new Decimal(state.wallet?.lockedBalance || 0);
	const feeBig = new Decimal(fee);
	const zanoBalance = balance.minus(locked);
	const [transactionSuccess, setTransactionSuccess] = useState<null | boolean>(null);
	const [loading, setLoading] = useState(false);

	const [isAliasRegistred, setAliasRegistred] = useState(false);
	const [initialComment, setInitialComment] = useState('');
	const aliasInput = useInput(
		walletAlias || '',
		{ isEmpty: true, minLength: 6, customError: isAliasRegistred },
		{
			onChangeFactory:
				({ setValue }) =>
				(e) => {
					let { value } = e.target;
					value = value.replace(/^@/, '');
					value = value.toLowerCase().replace(/[^a-z0-9]/g, '');

					setValue(value);
				},
		},
	);
	const commentInput = useInput('', { isEmpty: false, customValidation: true });
	const displayAlias = aliasInput.value ? `@${aliasInput.value}` : '';

	const isCommentChanged = commentInput.value !== initialComment;
	const notEnoughFee = useMemo(() => {
		return zanoBalance.lessThan(feeBig);
	}, [zanoBalance, feeBig]);

	const onSubmitAlias = async () => {
		setLoading(true);

		try {
			let data;

			if (mode === 'create') {
				data = await fetchBackground({
					method: 'REGISTER_ALIAS',
					address: walletAddress,
					alias: String(aliasInput.value),
					comment: commentInput.value || undefined,
				} as RegisterAliasParams);
			} else {
				data = await fetchBackground({
					method: 'UPDATE_ALIAS',
					address: walletAddress,
					alias: walletAlias,
					comment: commentInput.value,
				} as RegisterAliasParams);
			}

			if (data.result.tx_id) {
				setTransactionSuccess(true);
			} else {
				setTransactionSuccess(false);
			}
		} catch (error) {
			console.log(error);
			setTransactionSuccess(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!aliasInput.value || mode === 'edit') return;
		setLoading(true);

		const timer = setTimeout(async () => {
			try {
				const data = await fetchBackground({
					method: 'GET_ALIAS_DETAILS',
					alias: String(aliasInput.value),
				});

				if (data.address) {
					setAliasRegistred(true);
				} else {
					setAliasRegistred(false);
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [aliasInput.value]);

	useEffect(() => {
		if (mode === 'create') return;

		(async () => {
			const data = await fetchBackground({
				method: 'GET_ALIAS_DETAILS',
				alias: walletAlias,
			});

			console.log('GET_ALIAS_DETAILS', data);

			if (data) {
				const aliasComment = data?.comment || '';
				commentInput.setValue(aliasComment);
				setInitialComment(aliasComment);
			}
		})();
	}, []);

	const isDisabled = useMemo(() => {
		if (mode === 'edit') {
			return commentInput.isEmpty || notEnoughFee || loading || !isCommentChanged;
		}

		return (
			aliasInput.isEmpty ||
			aliasInput.minLengthError ||
			isAliasRegistred ||
			notEnoughFee ||
			loading
		);
	}, [
		mode,
		aliasInput,
		commentInput.isEmpty,
		isAliasRegistred,
		notEnoughFee,
		loading,
		isCommentChanged,
	]);

	if (transactionSuccess !== null) {
		return (
			<div className={styles.main}>
				<div className={styles.main__transactionInfo}>
					<img
						className={styles.main__transactionInfo_img}
						src={transactionSuccess ? successImg : errorImg}
						alt="transaction image"
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
					<p className={styles.main__address_value}>{walletAddress}</p>
				</div>

				<MyInput
					disabled={mode === 'edit'}
					noActiveBorder={mode === 'edit'}
					placeholder="Enter alias"
					label="Alias"
					stroke={
						mode === 'edit'
							? null
							: (() => {
									if (aliasInput.isEmpty) return 'This field is required';
									if (aliasInput.minLengthError)
										return 'Alias must be minimum 6 symbols';
									if (isAliasRegistred) return 'Alias name already exits';
									return null;
								})()
					}
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

					<Button disabled={isDisabled} onClick={onSubmitAlias}>
						{mode === 'create' ? 'Create' : 'Edit'} alias
					</Button>
				</div>
			</div>
		</main>
	);
};

export default AliasManagePage;
