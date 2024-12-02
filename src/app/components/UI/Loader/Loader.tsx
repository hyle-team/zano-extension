import React from "react";
import LoaderIcon from "../../../assets/svg/loader.svg";
import cls from "./Loader.module.scss";

const Loader = () => {
  return (
    <div className={cls.Loader}>
      <LoaderIcon />
    </div>
  );
};

export default Loader;