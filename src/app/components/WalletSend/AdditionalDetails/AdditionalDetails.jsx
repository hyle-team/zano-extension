import React, { useState } from "react";
import MyCheckbox from "../../UI/MyCheckbox/MyCheckbox";
import MyInput from "../../UI/MyInput/MyInput";
import s from "./AdditionalDetails.module.scss";

const AdditionalDetails = ({ fee, mixin, isSenderInfo, isReceiverInfo }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const toggleDetails = () => {
    if (detailsVisible) {
      setDetailsVisible(false);
    } else {
      setDetailsVisible(true);
    }
  };

  return (
    <div className={s.detailsSelect}>
      <button
        onClick={toggleDetails}
        className={
          detailsVisible
            ? [s.detailsSelectValue, s.active].join(" ")
            : s.detailsSelectValue
        }
      >
        Additional details
      </button>

      {detailsVisible && (
        <div className={s.detailsSelectContent}>
          <div className={s.detailsSelectInputs}>
            <MyInput
              label="Mixin:"
              value={10}
              readOnly
            />
            <MyInput
              label="Fee:"
              value={0.01}
              readOnly
            />
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
