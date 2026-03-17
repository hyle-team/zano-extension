import { Dispatch, SetStateAction, useState } from 'react';
import { useValidation } from './useValidation';
import { ValidationsType } from '../../types';

export const useInput = (
	initialState: string | number,
	validations: ValidationsType,
	{
		onChangeFactory,
	}: {
		onChangeFactory?: ({
			setValue,
		}: {
			setValue: Dispatch<SetStateAction<string | number>>;
		}) => (event: React.ChangeEvent<HTMLInputElement>) => void;
	} = {},
) => {
	const [value, setValue] = useState<string | number>(initialState);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const valid = useValidation(value, validations);

	const onChange = onChangeFactory
		? onChangeFactory({ setValue })
		: (e: React.ChangeEvent<HTMLInputElement>) => {
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
		setValue,
		onChange,
		onInput,
		onBlur,
		isFilled,
		isDirty,
		...valid,
	};
};
