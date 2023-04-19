import React from "react";
import s from "./CopyModal.module.scss";

const CopyModal = ({ isVisible }) => {
  return (
    isVisible && (
      <div className={s.clipboardModal}>
        <span>Copied to clipboard!</span>
      </div>
    )
  );
};

export default CopyModal;
