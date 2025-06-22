import { useState } from 'react';

export const useCheckbox = (initialState: boolean) => {
	const [isChecked, setIsChecked] = useState(initialState);

	const onChange = () => {
		setIsChecked(!isChecked);
	};

	return { isChecked, onChange };
};
