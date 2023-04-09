import React from 'react';
import s from "./MyButton.module.scss"

const MyButton = ({variant, children, ...props}) => {
   const classes = variant === "border" ? [s.myButton, s.borderVariant].join(" ") : s.myButton;
   return (
      <button {...props} type="button" className={classes}>
         {children}
      </button>
   );
};

export default MyButton;