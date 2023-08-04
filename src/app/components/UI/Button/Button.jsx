import React, { memo } from "react";
import cls from "./Button.module.scss";
import { classNames } from "../../../utils/classNames";

export const ButtonThemes = {
  Primary: "primary",
  Outline: "outline",
  Clear: "clear",
};

export const Button = memo((props) => {
  const {
    className,
    children,
    theme = ButtonThemes.Primary,
    href,
    fullWidth,
    ...otherProps
  } = props;

  if (href) {
    return (
      <a
        href={href}
        className={classNames(cls.Button, {}, [className, cls[theme]])}
        {...otherProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classNames(cls.Button, {}, [className, cls[theme]])}
      type="button"
      {...otherProps}
    >
      {children}
    </button>
  );
});

export default Button;