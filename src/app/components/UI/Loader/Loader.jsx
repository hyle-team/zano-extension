import React from "react";
import loader from "../../../assets/svg/loader.svg";
import s from "./Loader.module.scss";

const Loader = ({ isSmall }) => {
  const loaderClasses = isSmall ? [s.loader, s.small].join(" ") : s.loader;

  return (
    <div className={loaderClasses}>
      <img src={loader} alt="loader icon" />
    </div>
  );
};

export default Loader;