import React, { useState } from "react";
import MyCheckbox from "../../../UI/MyCheckbox/MyCheckbox";
import MyInput from "../../../UI/MyInput/MyInput";
import s from "./AdditionalDetails.module.scss";
import { classNames } from "../../../../utils/classNames";
import arrowIcon from "../../../../assets/svg/arrow-select.svg";

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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput: (newValue: string | number) => void;
  onBlur: () => void;
  isFilled: boolean;
  isDirty: boolean;
}

interface AdditionalDetailsProps {
  fee: string | number | feeType;
  mixin: string | number | mixinType;
  isSenderInfo: { isChecked: boolean; onChange: () => void };
  isReceiverInfo: { isChecked: boolean; onChange: () => void };
}
const AdditionalDetails = ({ fee, mixin, isSenderInfo, isReceiverInfo }: AdditionalDetailsProps) => {
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
            <MyInput label="Mixin:" inputData={mixin as any} disabled />
            <MyInput label="Fee:" inputData={fee as any} disabled />
          </div>
          <div className={s.detailsSelectCheckboxes}>
            <MyCheckbox
              label="Include sender info"
              checked={isSenderInfo.isChecked}
              onChange={isSenderInfo.onChange}
            />
            <MyCheckbox
              label="Include receiver info"
              checked={isReceiverInfo.isChecked}
              onChange={isReceiverInfo.onChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalDetails;
