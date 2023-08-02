import React, { useCallback, useEffect, useState } from "react";
import cls from "./Modal.module.scss";
import { createPortal } from "react-dom";
import { classNames } from '../../../utils/classNames';

const Modal = (props) => {
  const { className, children, isOpen, onClose } = props;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  const closeHandler = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        closeHandler();
      }
    },
    [closeHandler]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onKeyDown]);

  const onContentClick = (e) => {
    e.stopPropagation();
  };

  const mods = {
    [cls.opened]: isOpen,
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className={classNames(cls.Modal, mods, [className])}>
      <div onClick={closeHandler} className={cls.wrapper}>
        <div onClick={onContentClick} className={cls.content}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
