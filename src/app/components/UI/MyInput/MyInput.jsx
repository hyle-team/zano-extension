import React from "react";
import nextId from "react-id-generator";
import s from "./MyInput.module.scss";

const MyInput = ({ label, value, ...props }) => {
  const id = nextId();
  const inputClasses = value.length > 0 ? "_input-filled" : "";

  return (
    <div className={s.myInput}>
      {label && (
        <label className={s.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={s.myInput}>
        <input className={inputClasses} id={id} value={value} {...props} />
      </div>
    </div>
  );
};

export default MyInput;