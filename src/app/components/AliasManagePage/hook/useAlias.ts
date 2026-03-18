import { useEffect, useMemo, useState } from 'react';
import { fetchBackground } from '../../../utils/utils';
import { RegisterAliasParams } from '../types';
import { useInput } from '../../../hooks/useInput';
import { useFeeCheck } from '../../../hooks/useFeeCheck';

enum AliasMethods {
	REGISTER = 'REGISTER_ALIAS',
	UPDATE = 'UPDATE_ALIAS',
	DETAILS = 'GET_ALIAS_DETAILS',
}

export const useAlias = ({
	mode,
	walletAddress,
	walletAlias,
}: {
	mode: string;
	walletAddress: string;
	walletAlias: string;
}) => {
	const fee = mode === 'create' ? 0.11 : 0.01;
	const { notEnoughFee } = useFeeCheck(fee);

	const [transactionSuccess, setTransactionSuccess] = useState<null | boolean>(null);
	const [errorMsg, setErrorMsg] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isChecking, setIsChecking] = useState(false);

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

	const isCommentChanged = commentInput.value !== initialComment;

	const [debouncedAlias, setDebouncedAlias] = useState(aliasInput.value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedAlias(aliasInput.value);
		}, 500);

		return () => clearTimeout(timer);
	}, [aliasInput.value]);

	useEffect(() => {
		if (!debouncedAlias || mode === 'edit') return;

		const checkAlias = async () => {
			setIsChecking(true);
			try {
				const data = await fetchBackground({
					method: AliasMethods.DETAILS,
					alias: String(debouncedAlias),
				});

				setAliasRegistred(Boolean(data?.address));
			} catch (e) {
				console.log(e);
			} finally {
				setIsChecking(false);
			}
		};

		checkAlias();
	}, [debouncedAlias, mode]);

	useEffect(() => {
		if (mode !== 'edit') return;

		(async () => {
			const data = await fetchBackground({
				method: AliasMethods.DETAILS,
				alias: walletAlias,
			});

			const aliasComment = data?.comment || '';
			commentInput.setValue(aliasComment);
			setInitialComment(aliasComment);
		})();
	}, [mode, walletAlias]);

	const submit = async () => {
		setIsSubmitting(true);

		try {
			let data;

			if (mode === 'create') {
				data = await fetchBackground({
					method: AliasMethods.REGISTER,
					address: walletAddress,
					alias: String(aliasInput.value),
					comment: commentInput.value || undefined,
				} as RegisterAliasParams);
			} else {
				data = await fetchBackground({
					method: AliasMethods.UPDATE,
					address: walletAddress,
					alias: walletAlias,
					comment: commentInput.value,
				} as RegisterAliasParams);
			}

			if (data?.result?.tx_id) {
				setTransactionSuccess(true);
			} else {
				setTransactionSuccess(false);

				if (data?.error?.code === -7) {
					setErrorMsg('Not enough balance');
				} else {
					const deamonMsg = data?.error?.message;

					setErrorMsg(deamonMsg || 'Unknown error');
				}
			}

			console.log(mode, data);
		} catch (e) {
			console.log(e);
			setTransactionSuccess(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const aliasError = useMemo(() => {
		if (mode === 'edit') return null;
		if (aliasInput.isEmpty) return 'This field is required';
		if (aliasInput.minLengthError) return 'Alias must be minimum 6 symbols';
		if (isAliasRegistred) return 'Alias name already exits';
		return null;
	}, [aliasInput, isAliasRegistred, mode]);

	const isDisabled = useMemo(() => {
		if (mode === 'edit') {
			return commentInput.isEmpty || notEnoughFee || isSubmitting || !isCommentChanged;
		}

		return (
			aliasInput.isEmpty ||
			aliasInput.minLengthError ||
			isAliasRegistred ||
			notEnoughFee ||
			isSubmitting ||
			isChecking
		);
	}, [
		mode,
		aliasInput,
		commentInput.isEmpty,
		isAliasRegistred,
		notEnoughFee,
		isSubmitting,
		isChecking,
		isCommentChanged,
	]);

	return {
		fee,
		aliasInput,
		commentInput,
		aliasError,
		isDisabled,
		submit,
		transactionSuccess,
		isSubmitting,
		isChecking,
		notEnoughFee,
		errorMsg,
	};
};
