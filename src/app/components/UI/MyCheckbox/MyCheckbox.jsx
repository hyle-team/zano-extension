import React from "react";
import nextId from "react-id-generator";
import s from "./MyCheckbox.module.scss";

const MyCheckbox = ({ label, ...props }) => {
  const id = nextId();

  return (
    <div className={s.myCheckbox}>
      <input className={s.myCheckboxInput} id={id} {...props} type="checkbox" />
      <label className={s.myCheckboxLabel} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default MyCheckbox;
