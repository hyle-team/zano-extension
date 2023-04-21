import React, { useContext } from "react";
import loader from "../../../assets/svg/loader.svg";
import logo from "../../../assets/svg/logo.svg";

import { Store } from "../../../store/store-reducer";
import s from "./Loader.module.scss";

const Loader = ({ isSmall }) => {
  const { state } = useContext(Store);
  const loaderClasses = isSmall ? [s.loader, s.small].join(" ") : s.loader;

  return (
    <>
      {state.isLoading && (
        <div className={s.loaderWrapper}>
          <div className={s.loaderContent}>
            <div className={s.logo}>
              <img src={logo} alt="logo image" />
            </div>
            <div className={loaderClasses}>
              <img src={loader} alt="loader icon" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;