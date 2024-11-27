import React, { InputHTMLAttributes } from "react";
import nextId from "react-id-generator";
import s from "./MyCheckbox.module.scss";

interface MyCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const MyCheckbox: React.FC<MyCheckboxProps> = ({ label, ...props }) => {
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
