import React, { useContext } from "react";
import displayImage from "../../assets/images/display.svg";
import logo from "../../assets/svg/logo.svg";
import questionIcon from "../../assets/svg/question.svg";
import { Store } from "../../store/store-reducer";
import Loader from "../UI/Loader/Loader";
import s from "./AppPlug.module.scss";

const AppPlug = () => {
  const { state } = useContext(Store);

  const btnClasses = state.isLoading
    ? [s.plugButton, s.hidden].join(" ")
    : s.plugButton;

  return (
    <div className={s.plug}>
      <div className={`${s.plugBody} container`}>
        <div className={s.plugLogo}>
          <img src={logo} alt="zano logo" />
        </div>

        <div className={s.plugContent}>
          {state.isLoading ? (
            <Loader />
          ) : (
            <>
              <div className={s.plugImage}>
                <img src={displayImage} alt="display image" />
              </div>

              <strong>Wallet offline</strong>

              <div className={s.plugText}>
                Make sure you're running <br />a wallet with RPC enabled
              </div>
            </>
          )}
        </div>

        <button className={btnClasses}>
          <img src={questionIcon} alt="question icon" />
          How to create wallet?
        </button>
      </div>
    </div>
  );
};

export default AppPlug;