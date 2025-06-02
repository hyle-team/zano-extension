import React, { Dispatch, SetStateAction } from "react";
import { useContext, useRef, useState } from "react";
import copyIcon from "../../assets/svg/copy.svg";
import dotsIcon from "../../assets/svg/dots.svg";
import sendIcon from "../../assets/svg/send.svg";
import settingsIcon from "../../assets/svg/settings.svg";
import showIcon from "../../assets/svg/show.svg";
import hideIcon from "../../assets/svg/hide.svg";
import lockedIcon from "../../assets/svg/lockedIcon.svg";
import checkIcon from "../../assets/svg/check-icon.svg";
import useAwayClick from "../../hooks/useAwayClick";
import { useCensorDigits } from "../../hooks/useCensorDigits";
import { useCopy } from "../../hooks/useCopy";
import { Store } from "../../store/store-reducer";
import { updateBalancesHidden, updateDisplay } from "../../store/actions";
import ModalTransactionStatus from "../ModalTransactionStatus/ModalTransactionStatus";
import WalletSend from "../WalletSend/WalletSend";
import WalletSettings from "../WalletSettings/WalletSettings";
import s from "./Wallet.module.scss";
import NavLink from "../UI/NavLink/NavLink";
import { classNames } from "../../utils/classNames";
import { ZANO_ASSET_ID } from "../../../constants";
import browser from "../../utils/browserApi";

const Wallet = ({ setConnectOpened }: { setConnectOpened: Dispatch<SetStateAction<boolean>> }) => {
  const { state, dispatch } = useContext(Store);
  const { copied, copyToClipboard } = useCopy();
  const { censorValue } = useCensorDigits();
  const [menuVisible, setMenuVisible] = useState(false);

  const renderBalance = () => {
    const fiatBalance = (
      Number(state.wallet.balance) * state.priceData.price
    ).toFixed(2);

    if (state.displayUsd) {
      return (
        <>
          <span>${censorValue(fiatBalance)}</span>
          <span
            style={{
              color: state.priceData.change > 0 ? "#16D1D6" : "#FFCBCB",
            }}
            className={s.percentChange}
          >
            {state.priceData.change}%
          </span>
        </>
      );
    } else {
      return (
        <span>{censorValue(Number(state.wallet.balance).toFixed(2))} ZANO</span>
      );
    }
  };

  const getUnlockedBalance = () =>
    state.wallet.assets.find(
      (asset) =>
        asset.assetId ===
        ZANO_ASSET_ID
    )?.unlockedBalance;

  const flipDisplay = () => {
    updateDisplay(dispatch as any, !state.displayUsd as any);
  };

  const flipMenu = () => {
    setMenuVisible((prevState) => !prevState);
  };

  const createAliasHandler = () => {
    browser.tabs.create({
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
      <ModalTransactionStatus />
      <div className={s.infoWallet}>
        <div>
          <div
            className={classNames(s.aliasContent, {
              [s.active]: state.wallet.alias,
            })}
          >
            {state.wallet.alias ? (
              `@${state.wallet.alias}`
            ) : (
              <button className={s.aliasCreateBtn} onClick={createAliasHandler}>
                Create alias
              </button>
            )}
          </div>
        </div>
        <div className={s.balanceWrapper}>
          <button onClick={flipDisplay} className={s.balance}>
            {state.displayUsd ||
              getUnlockedBalance() === state.wallet.balance || (
                <>
                  <img src={lockedIcon} alt="locked icon" />
                </>
              )}
            {renderBalance()}
          </button>
          {getUnlockedBalance() !== state.wallet.balance && (
            <span className={s.tooltipText}>
              Locked balance:{" "}
              {(Number(state.wallet.balance) - Number(getUnlockedBalance())).toFixed(2)}{" "}
              ZANO
            </span>
          )}
        </div>

        <div className={s.infoAddress}>
          <span>{state.wallet.address}</span>
        </div>
      </div>

      <div className={s.actionsWallet}>
        <div ref={menuRef} className={s.actionsSettings}>
          <button onClick={flipMenu} className="round-button">
            <img src={dotsIcon} alt="dots icon" />
            {/* Tooltip */}
            <span>options</span>
          </button>

          {menuVisible && (
            <div className={s.settings}>
              <div className={s.settingsBtn} onClick={() => setConnectOpened(true)}>
                <img src={settingsIcon} alt="settings icon" />
                Settings
              </div>
              <button
                onClick={flipBalancesVisibility}
                className={s.settingsBtn}
              >
                <img
                  src={state.isBalancesHidden ? showIcon : hideIcon}
                  alt="show or hide icon"
                />
                {state.isBalancesHidden ? "Show values" : "Hide values"}
              </button>
            </div>
          )}
        </div>

        <NavLink component={WalletSend} className="round-button">
          <img src={sendIcon} alt="send icon" />
          {/* Tooltip */}
          <span>send</span>
        </NavLink>

        <button
          onClick={() => copyToClipboard(state.wallet.address)}
          className="round-button"
        >
          {copied
            ? <img src={checkIcon} alt="copy icon" />
            : <img src={copyIcon} alt="copy icon" />
          }
          {/* Tooltip */}
          {copied
            ? <span>copied!</span>
            : <span>copy address</span>
          }
        </button>
      </div>
    </div>
  );
};

export default Wallet;
