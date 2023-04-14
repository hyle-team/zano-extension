import React from 'react';
import logo from "../../assets/svg/logo.svg"
import s from "./AppPlug.module.scss"

const AppPlug = () => {
  return (
    <div className="container">
      <div className={s.plugLogo}>
        <img src={logo} alt="zano logo"/>
      </div>
    </div>
  );
};

export default AppPlug;