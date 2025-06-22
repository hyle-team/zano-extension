import { useEffect, useState } from 'react';

type Validations = {
	minLength?: number;
	isEmpty?: boolean;
	isAmountCorrect?: boolean;
	customValidation?: boolean;
};

export const useValidation = (value: string | number, validations: Validations) => {
	const [isEmpty, setIsEmpty] = useState<boolean>(true);
	const [minLengthError, setMinLengthError] = useState<boolean>(false);
	const [amountCorrectError, setAmountCorrectError] = useState<boolean>(false);
	const [inputValid, setInputValid] = useState<boolean>(false);

	useEffect(() => {
		for (const validation in validations) {
			switch (validation) {
				case 'minLength':
					if (typeof value === 'string' && value.length < validations[validation]!) {
						setMinLengthError(true);
					} else {
						setMinLengthError(false);
					}
					break;
				case 'isEmpty':
					setIsEmpty(!value);
					break;
				case 'isAmountCorrect':
					const amountCheckResult =
						typeof value === 'number' &&
						!isNaN(value) &&
						value >= 0.000000000001 &&
						value <= 1000000000;
					setAmountCorrectError(!amountCheckResult);
					break;
				case 'customValidation':
					setInputValid(true);
					break;
				default:
					break;
			}
		}
	}, [validations, value]);

	useEffect(() => {
		if (isEmpty || minLengthError || amountCorrectError) {
			setInputValid(false);
		} else {
			setInputValid(true);
		}
	}, [isEmpty, minLengthError, amountCorrectError]);

	return {
		isEmpty,
		minLengthError,
		amountCorrectError,
		inputValid,
	};
};
