import React, { useContext } from "react";
import DisplayImage from "../../assets/images/display.svg";
import Logo from "../../assets/svg/logo.svg";
import QuestionIcon from "../../assets/svg/question.svg";
import { Store } from "../../store/store-reducer";
import s from "./AppPlug.module.scss";

// Define the type for props
interface AppPlugProps {
  setConnectOpened: (isOpened: boolean) => void;
}

const AppPlug: React.FC<AppPlugProps> = (props) => {
  const { state } = useContext(Store);

  const { setConnectOpened } = props;

  // Type of btnClasses is inferred as string
  const btnClasses = state.isLoading
    ? [s.plugButton, s.hidden].join(" ")
    : s.plugButton;

  const openDocs = () => {
    window.open("https://docs.zano.org/docs/use/companion", "_blank");
  };

  return (
    <>
      {!state.isConnected && (
        <div className={s.plug}>
          <div className={`${s.plugBody} container`}>
            <div className={s.plugLogo}>
              <Logo />
            </div>

            <div className={s.plugContent}>
              <div className={s.plugImage}>
                <DisplayImage />
              </div>

              <strong>Wallet offline</strong>

              <div className={s.plugText}>
                Make sure you're running <br />a wallet with RPC enabled
              </div>

              <button
                className={btnClasses}
                onClick={() => setConnectOpened(true)}
              >
                Connection Settings
              </button>
            </div>
            <button className={btnClasses} onClick={openDocs}>
              <QuestionIcon />
              How to connect to the wallet?
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppPlug;
