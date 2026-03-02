import React, { useState } from 'react';
import MyInput, { inputDataProps } from '../../../UI/MyInput/MyInput';
import s from './AdditionalDetails.module.scss';
import { classNames } from '../../../../utils/classNames';
import arrowIcon from '../../../../assets/svg/arrow-select.svg';

interface mixinType {
	isEmpty: boolean;
	minLengthError: boolean;
	amountCorrectError: boolean;
	inputValid: boolean;
	value: string | number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onInput: (newValue: string | number) => void;
	onBlur: () => void;
	isFilled: boolean;
	isDirty: boolean;
}

interface feeType {
	isEmpty: boolean;
	minLengthError: boolean;
	amountCorrectError: boolean;
	inputValid: boolean;
	value: string | number;
	onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
	onInput: (_newValue: string | number) => void;
	onBlur: () => void;
	isFilled: boolean;
	isDirty: boolean;
}

interface AdditionalDetailsProps {
	fee: string | number | feeType;
	mixin: string | number | mixinType;
}
const AdditionalDetails = ({ fee, mixin }: AdditionalDetailsProps) => {
	const [detailsVisible, setDetailsVisible] = useState(false);

	const toggleDetails = () => {
		setDetailsVisible((prevState) => !prevState);
	};

	return (
		<div className={s.detailsSelect}>
			<button
				onClick={toggleDetails}
				className={classNames(s.detailsSelectValue, {
					[s.active]: detailsVisible,
				})}
			>
				Additional details
				<img src={arrowIcon} alt="arrow" />
			</button>

			{detailsVisible && (
				<div className={s.detailsSelectContent}>
					<div className={s.detailsSelectInputs}>
						<MyInput label="Mixin:" inputData={mixin as inputDataProps} disabled />
						<MyInput label="Fee:" inputData={fee as inputDataProps} disabled />
					</div>
				</div>
			)}
		</div>
	);
};

export default AdditionalDetails;
