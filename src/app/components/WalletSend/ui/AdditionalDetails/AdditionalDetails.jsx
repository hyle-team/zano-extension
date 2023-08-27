import React, { useState } from "react";
import MyCheckbox from "../../../UI/MyCheckbox/MyCheckbox";
import MyInput from "../../../UI/MyInput/MyInput";
import s from "./AdditionalDetails.module.scss";
import { classNames } from "../../../../utils/classNames";
import arrowIcon from "../../../../assets/svg/arrow-select.svg";

const AdditionalDetails = ({ fee, mixin, isSenderInfo, isReceiverInfo }) => {
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
            <MyInput label="Mixin:" inputData={mixin} disabled />
            <MyInput label="Fee:" inputData={fee} disabled />
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
