import { useContext } from "react";
import { Link } from "react-chrome-extension-router";
import copyIcon from "../../assets/svg/copy.svg";
import dotsIcon from "../../assets/svg/dots.svg";
import sendIcon from "../../assets/svg/send.svg";
import { useCopy } from "../../hooks/useCopy";
import { Store } from "../../store/store-reducer";
import WalletSend from "../WalletSend/WalletSend";
import s from "./Wallet.module.scss";

const Wallet = () => {
  const { state, dispatch } = useContext(Store);
  const { SuccessCopyModal, copyToClipboard } = useCopy();

  const renderBalance = () => {
    if (state.displayUsd) {
      return (
        <div className={s.infoBalance}>
          <span>
            ${(state.wallet.balance * state.priceData.price).toFixed(2)}
          </span>
          <span
            style={{
              color: state.priceData.change > 0 ? "#16D1D6" : "#FFCBCB",
            }}
            className={s.percentСhange}
          >
            {state.priceData.change}%
          </span>
        </div>
      );
    } else {
      return (
        <div className={s.infoBalance}>
          <span>{state.wallet.balance} ZANO</span>
        </div>
      );
    }
  };

  const flipDisplay = () => {};

  return (
    <div className={s.wallet}>
      {SuccessCopyModal}

      <div className={s.infoWallet}>
        <div className={s.alias}>
          {state.wallet.alias ? (
            `@${state.wallet.alias}`
          ) : (
            <button className={s.aliasCreateBtn}>Create alias</button>
          )}
        </div>

        {renderBalance()}

        <div className={s.infoAddress}>
          <span>{state.wallet.address}</span>
        </div>
      </div>

      <div className={s.actionsWallet}>
        <button className={`${s.dotsButton} round-button`}>
          <img src={dotsIcon} alt="dots icon" />
        </button>

        <Link
          component={WalletSend}
          props={{ message: "I came from Wallet component" }}
          className="round-button"
        >
          <img src={sendIcon} alt="send icon" />
        </Link>

        <button
          onClick={() => copyToClipboard(state.wallet.address)}
          className="round-button"
        >
          <img src={copyIcon} alt="copy icon" />
        </button>
      </div>
    </div>
  );
};

export default Wallet;
