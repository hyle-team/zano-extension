import React from "react";
import s from "./MyInput.module.scss";

const MyInput = ({ label, ...props }) => {
  const id = Date.now();

  return (
    <div className={s.myInput}>
      {label && <label htmlFor={id}>{label}</label>}
      <div>
        <input id={id} {...props} />
      </div>
    </div>
  );
};

export default MyInput;