import React from "react";
import { goBack } from "react-chrome-extension-router";
import backIcon from "../../../assets/svg/arrow-back.svg";
import s from "./RoutersNav.module.scss";

const RoutersNav = ({ title, onClick }) => {
  const clickHandler = () => {
    onClick ? onClick() : goBack();
  };

  return (
    <div className={s.navHeader}>
      {onClick !== "none" && (
        <button onClick={clickHandler} className={s.backBtn}>
          <img src={backIcon} alt="back button icon" />
        </button>
      )}
      <div className={s.title}>{title}</div>
    </div>
  );
};

export default RoutersNav;
