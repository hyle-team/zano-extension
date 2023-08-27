import React from "react";
import { Link } from "react-chrome-extension-router";
import { classNames } from "../../../utils/classNames";

const NavLink = ({ component, children, className, ...props }) => {
  const scrollHandler = () => {
    document.body.scrollTop = 0;
  };

  return (
    <Link
      onClick={scrollHandler}
      component={component}
      className={classNames("", {}, [className])}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink;
