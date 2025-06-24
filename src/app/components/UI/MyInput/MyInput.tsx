import React, { memo, ChangeEvent, InputHTMLAttributes } from 'react';
import nextId from 'react-id-generator';
import cls from './MyInput.module.scss';
import { classNames } from '../../../utils/classNames';

export interface inputDataProps {
	value?: string;
	onChange?: (_e: ChangeEvent<HTMLInputElement>) => void;
	onInput?: (_value: string) => void;
	inputValid?: boolean;
	onBlur?: () => void;
	isDirty?: boolean;
	isFilled?: boolean;
}
interface MyInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	inputData?: inputDataProps;
	isValid?: boolean;
	noActiveBorder?: boolean;
	isError?: boolean;
	noValidation?: boolean;
	type?: string;
}

const MyInput: React.FC<MyInputProps> = memo((props) => {
	const id = nextId();
	const {
		label,
		inputData,
		isValid,
		noActiveBorder,
		type,
		isError,
		noValidation,
		...otherProps
	} = props;

	const { value, onChange, onInput, inputValid, onBlur, isDirty, isFilled } = inputData || {};

	const onInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
		if (type === 'number' && !noValidation) {
			const newValue = e.target.value
				.replace(/[^0-9.]/g, '')
				.replace(/(\..*?)\..*/g, '$1')
				.replace(/^0[^.]/, '0');
			if (onInput) onInput(newValue);
		} else if (onChange) onChange(e);
	};

	return (
		<div className={classNames(cls.myInput, {})}>
			{label && (
				<label className={cls.label} htmlFor={id}>
					{label}
				</label>
			)}
			<div className={cls.myInput}>
				<input
					onBlur={onBlur}
					onChange={onInputHandler}
					type={type}
					id={id}
					value={value}
					className={classNames('', {
						[cls.filled]: isFilled && !noActiveBorder,
						[cls.error]: (isDirty && !inputValid) || isError,
						[cls.customError]: isDirty && isValid === false && inputValid,
					})}
					{...otherProps}
				/>
			</div>
		</div>
	);
});

export default MyInput;
