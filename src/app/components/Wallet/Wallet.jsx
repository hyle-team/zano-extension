import { useContext, useRef, useState } from "react";
import { Link } from "react-chrome-extension-router";
import copyIcon from "../../assets/svg/copy.svg";
import dotsIcon from "../../assets/svg/dots.svg";
import sendIcon from "../../assets/svg/send.svg";
import useAwayClick from "../../hooks/useAwayClick";
import { useCensorDigits } from "../../hooks/useCensorDigits";
import { useCopy } from "../../hooks/useCopy";
import { Store } from "../../store/store-reducer";
import { updateBalancesHidden, updateDisplay } from "../../store/actions";
import WalletSend from "../WalletSend/WalletSend";
import s from "./Wallet.module.scss";

const Wallet = () => {
  const { state, dispatch } = useContext(Store);
  const { SuccessCopyModal, copyToClipboard } = useCopy();
  const { censorValue } = useCensorDigits();
  const [menuVisible, setMenuVisible] = useState(false);

  const aliasClasses = state.wallet.alias
    ? [s.aliasContent, s.active].join(" ")
    : s.aliasContent;

  const renderBalance = () => {
    const fiatBalance = (state.wallet.balance * state.priceData.price).toFixed(
      2
    );

    if (state.displayUsd) {
      return (
        <>
          <span>${censorValue(fiatBalance)}</span>
          <span
            style={{
              color: state.priceData.change > 0 ? "#16D1D6" : "#FFCBCB",
            }}
            className={s.percentСhange}
          >
            {state.priceData.change}%
          </span>
        </>
      );
    } else {
      return <span>{censorValue(state.wallet.balance)} ZANO</span>;
    }
  };

  const flipDisplay = () => {
    updateDisplay(dispatch, !state.displayUsd);
  };

  const flipMenu = () => {
    setMenuVisible((prevState) => !prevState);
  };

  const createAliasHandler = () => {
    // eslint-disable-next-line no-undef
    chrome.tabs.create({
      url: "https://docs.zano.org/docs/aliases",
    });
  };

  const flipBalancesVisibility = () => {
    if (state.isBalancesHidden) {
      updateBalancesHidden(dispatch, false);
    } else {
      updateBalancesHidden(dispatch, true);
    }
    flipMenu();
  };

  // Function and hook to close menu if click away
  const menuRef = useRef(null);
  const handleAwayClick = () => {
    setMenuVisible(false);
  };
  useAwayClick(menuRef, handleAwayClick);

  return (
    <div className={s.wallet}>
      {SuccessCopyModal}

      <div className={s.infoWallet}>
        <div>
          <div className={aliasClasses}>
            {state.wallet.alias ? (
              `@${state.wallet.alias}`
            ) : (
              <button className={s.aliasCreateBtn} onClick={createAliasHandler}>
                Create alias
              </button>
            )}
          </div>
        </div>

        <div>
          <button
            onClick={flipDisplay}
            title="Change currency"
            className={s.balance}
          >
            {renderBalance()}
          </button>
        </div>

        <div className={s.infoAddress}>
          <span>{state.wallet.address}</span>
        </div>
      </div>

      <div className={s.actionsWallet}>
        <div ref={menuRef} className={s.actionsSettings}>
          <button onClick={flipMenu} className="round-button">
            <img src={dotsIcon} alt="dots icon" />
          </button>

          {menuVisible && (
            <div className={s.settings}>
              <button disabled className={s.settingsBtn}>
                Settings
              </button>
              <button
                onClick={flipBalancesVisibility}
                className={s.settingsBtn}
              >
                {state.isBalancesHidden ? "Show values" : "Hide values"}
              </button>
            </div>
          )}
        </div>

        <Link component={WalletSend} className="round-button">
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
