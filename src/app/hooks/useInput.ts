import { useState } from 'react';
import { useValidation } from './useValidation';

type Validations = {
	minLength?: number;
	isEmpty?: boolean;
	isAmountCorrect?: boolean;
	customValidation?: boolean;
};

export const useInput = (initialState: string | number, validations: Validations) => {
	const [value, setValue] = useState<string | number>(initialState);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const valid = useValidation(value, validations);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const onInput = (newValue: string | number) => {
		setValue(newValue);
	};

	const onBlur = () => {
		setIsDirty(true);
	};

	const isFilled = typeof value === 'string' && value.length > 0;

	return {
		value,
		onChange,
		onInput,
		onBlur,
		isFilled,
		isDirty,
		...valid,
	};
};
