import React, { useCallback, useContext } from "react";
import cls from "./ModalTransactionStatus.module.scss";
import Modal from "../../components/UI/Modal/Modal";
import { Store } from "../../store/store-reducer";
import errorImage from "../../assets/svg/plus.svg";
import { updateTransactionStatus } from "../../store/actions";
import Loader from "../UI/Loader/Loader";
import { classNames } from "../../utils/classNames";
import Button, { ButtonThemes } from "../UI/Button/Button";

const ModalTransactionStatus = () => {
  const { state, dispatch } = useContext(Store);
  const { visible, type, message } = state?.transactionStatus;

  const closeHandler = useCallback(() => {
    updateTransactionStatus(dispatch, (prevState) => ({
      ...prevState,
      isVisible: false,
    }));
  }, [dispatch]);

  const Loading = () => {
    if (type === "loading") {
      return (
        <div className={cls.loading}>
          <Loader />
          <div className={cls.title}>Sending...</div>
        </div>
      );
    }
  };

  const Error = () => {
    if (type === "error") {
      return (
        <div className={cls.error}>
          <div className={classNames(cls.icon, {}, [[cls.redColor]])}>
            <img src={errorImage} alt="error" />
          </div>

          <div className={cls.title}>Error!</div>
          <div className={cls.statusMessage}>{message && message}</div>
          <div className={cls.table}>
            <div className={cls.tableRow}>
              <div className={cls.label}>method:</div>
              <div className={cls.value}>POST</div>
            </div>
            <div className={cls.tableRow}>
              <div className={cls.label}>params:</div>
              <div className={cls.value}>
                <span>Value</span>
                <span>Value2</span>
              </div>
            </div>
          </div>
          <Button
            className={cls.button}
            theme={ButtonThemes.Outline}
            onClick={closeHandler}
          >
            Close
          </Button>
        </div>
      );
    }
  };

  return (
    <Modal
      width={296}
      isOpen={visible}
      onClose={type !== "loading" && closeHandler}
    >
      <div className={cls.ModalTransactionStatus}>
        <Loading />
        <Error />
      </div>
    </Modal>
  );
};

export default ModalTransactionStatus;
