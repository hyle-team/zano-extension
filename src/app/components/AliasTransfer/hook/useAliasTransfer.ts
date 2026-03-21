import { useEffect, useState } from 'react';
import { useFeeCheck } from '../../../hooks/useFeeCheck';
import { useInput } from '../../../hooks/useInput';
import { fetchBackground } from '../../../utils/utils';
import { GetAliasByAdderssParams, TransferAliasParams } from '../types';

const fee = 0.01;

export const useAliasTransfer = ({ alias }: { alias: string }) => {
	const { notEnoughFee } = useFeeCheck(fee);
	const [addressStroke, setAddressStroke] = useState<null | string>(null);
	const commentInput = useInput('', { isEmpty: false, customValidation: true });
	const addressInput = useInput('', { isEmpty: false, customError: !!addressStroke });
	const [isChecking, setIsChecking] = useState(false);
	const [isSubmitting, setSubmitting] = useState(false);
	const [isValidAddress, setValidAddress] = useState(false);

	const [debouncedAddress, setDebouncedAddress] = useState(addressInput.value);
	const [transactionSuccess, setTransactionSuccess] = useState<null | boolean>(null);
	const [errorMsg, setErrorMsg] = useState('');

	useEffect(() => {
		setValidAddress(false);

		const timer = setTimeout(() => {
			setDebouncedAddress(addressInput.value);
		}, 500);

		return () => clearTimeout(timer);
	}, [addressInput.value]);

	useEffect(() => {
		if (!debouncedAddress) return;

		const checkAddress = async () => {
			setIsChecking(true);

			try {
				const data = await fetchBackground({
					method: 'GET_ALIAS_BY_ADDRESS',
					address: debouncedAddress,
				} as GetAliasByAdderssParams);

				if (data.status === 'NOT_FOUND') {
					setValidAddress(true);
					setAddressStroke(null);
				} else if (data.status === 'OK') {
					setValidAddress(false);
					setAddressStroke('This wallet already has an alias');
				} else {
					setValidAddress(false);
					setAddressStroke('No wallet exists for the provided address');
				}
			} catch (err) {
				console.log(err);
			} finally {
				setIsChecking(false);
			}
		};

		checkAddress();
	}, [debouncedAddress]);

	const onTransfer = async () => {
		setSubmitting(true);

		try {
			const data = await fetchBackground({
				method: 'UPDATE_ALIAS',
				address: addressInput.value,
				alias,
				comment: commentInput.value,
			} as TransferAliasParams);

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
		} catch (err) {
			console.log(err);
		} finally {
			setSubmitting(false);
		}
	};

	const isDisabled =
		!isValidAddress ||
		addressInput.isEmpty ||
		!addressInput.inputValid ||
		isChecking ||
		isSubmitting ||
		!addressInput.value ||
		notEnoughFee ||
		Boolean(addressStroke);

	return {
		onTransfer,
		transactionSuccess,
		errorMsg,
		isDisabled,
		addressStroke,
		commentInput,
		addressInput,
		notEnoughFee,
		fee,
	};
};
