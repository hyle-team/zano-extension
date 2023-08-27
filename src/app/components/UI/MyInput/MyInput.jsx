import React, { memo } from "react";
import nextId from "react-id-generator";
import cls from "./MyInput.module.scss";
import { classNames } from "../../../utils/classNames";

const MyInput = memo((props) => {
  const id = nextId();
  const { label, inputData, isValid, noActiveBorder, type, ...otherProps } = props;
  const { value, onChange, onInput, inputValid, onBlur, isDirty, isFilled } =
    inputData;

  const onInputHandler = (e) => {
    if (type === "number") {
      const newValue = e.target.value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1")
        .replace(/^0[^.]/, "0");
      onInput(newValue);
    } else {
      onChange(e);
    }
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
          onChange={(e) => onInputHandler(e)}
          type="text"
          id={id}
          value={value}
          className={classNames("", {
            [cls.filled]: isFilled && !noActiveBorder,
            [cls.error]: isDirty && !inputValid,
            [cls.customError]: isDirty && isValid === false && inputValid
          })}
          {...otherProps}
        />
      </div>
    </div>
  );
});

export default MyInput;
