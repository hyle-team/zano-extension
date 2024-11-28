import React, { memo } from "react";
import cls from "./Button.module.scss";
import { classNames } from "../../../utils/classNames";

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  theme?: ThemeProps;
  href?: string;
  fullWidth?: boolean;
}

interface ThemeProps {
  Primary: "primary";
  Outline: "outline";
  Clear: "clear";
}

export const ButtonThemes: ThemeProps = {
  Primary: "primary",
  Outline: "outline",
  Clear: "clear",
};

export const Button = memo((props: ButtonProps) => {
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
        className={classNames(cls.Button, {}, [className, cls[theme as string]])}
        {...otherProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classNames(cls.Button, {}, [className, cls[theme as string]])}
      type="button"
      {...otherProps}
    >
      {children}
    </button>
  );
});

export default Button;