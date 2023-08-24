import React, { useCallback, useContext } from "react";
import cls from "./ModalTransactionStatus.module.scss";
import Modal from "../../components/UI/Modal/Modal";
import { Store } from "../../store/store-reducer";
import errorImage from "../../assets/svg/plus.svg";
import successImage from "../../assets/svg/check-icon.svg";
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

  const TableIcon = ({ error, success }) => {
    if (error) {
      return (
        <div className={cls.errorIcon}>
          <img src={errorImage} alt="error" />
        </div>
      );
    }
    if (success) {
      return (
        <div className={cls.successIcon}>
          <img src={successImage} alt="success" />
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
          <div className={cls.title}>Failure!</div>
          <div className={cls.detailsTitle} style={{textAlign: 'center'}}>{state.transactionStatus.message}</div>
          {/*<div className={cls.details}>*/}
          {/*  <div className={cls.detailsTitle}>Transaction details</div>*/}
          {/*  <div className={cls.detailsTable}>*/}
          {/*    <div className={cls.tableRow}>*/}
          {/*      Initializing...*/}
          {/*      <TableIcon success />*/}
          {/*    </div>*/}
          {/*    <div className={cls.tableRow}>*/}
          {/*      Downloading consensus...*/}
          {/*      <TableIcon success />*/}
          {/*    </div>*/}
          {/*    <div className={cls.tableRow}>*/}
          {/*      Building tunnel to A...*/}
          {/*      <TableIcon success />*/}
          {/*    </div>*/}
          {/*    <div className={cls.tableRow}>*/}
          {/*      Building tunnel to B...*/}
          {/*      <TableIcon error />*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
          <Button className={cls.button} theme={ButtonThemes.Outline} onClick={closeHandler}>
            Got it
          </Button>
        </div>
      );
    }
  };

  return (
    <Modal width={296} isOpen={visible} onClose={closeHandler}>
      <div className={cls.ModalTransactionStatus}>
        <Loading />
        <Error />
      </div>
    </Modal>
  );
};

export default ModalTransactionStatus;
