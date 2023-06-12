import { useContext, useState } from "react";
import arrowIcon from "../../assets/svg/arrow-shevron.svg";
import { useCensorDigits } from "../../hooks/useCensorDigits";
import { Store } from "../../store/store-reducer";
import { updateActiveWalletId } from "../../store/actions";
import Formatters from "../../utils/formatters";
import s from "./Header.module.scss";

const Header = () => {
  const { dispatch, state } = useContext(Store);
  const { censorValue } = useCensorDigits();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
      document.body.style.overflow = "auto";
    } else {
      setDropdownOpen(true);
      document.body.style.overflow = "hidden";
    }
  };

  const switchWallet = (id) => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ key: id }, function () {
      updateActiveWalletId(dispatch, id);
      console.log("Active wallet set to", id);
    });

    toggleDropdown();
  };

  return (
    <header className={s.header}>
      <button onClick={toggleDropdown} className={s.dropdownButton}>
        <span>
          {state.wallet.alias
            ? state.wallet.alias
            : Formatters.walletAddress(state.wallet.address)}
        </span>
        <img src={arrowIcon} alt="arrow icon" />
      </button>

      <div className={s.headerStatus}>
        {state.isConnected ? "online" : "offline"}
        <span
          style={{ backgroundColor: state.isConnected ? "#16D1D6" : "#FF6767" }}
        ></span>
      </div>

      {dropdownOpen && (
        <div onClick={toggleDropdown} className={s.dropdown}>
          <div onClick={(e) => e.stopPropagation()} className={s.dropdownList}>
            {state.walletsList.map((wallet, i) => (
              <button
                key={wallet.address}
                className={s.dropdownTitle}
                onClick={() => switchWallet(i)}
              >
                <div>
                  {wallet.alias
                    ? wallet.alias
                    : Formatters.walletAddress(wallet.address)}
                  {wallet.alias && (
                    <span>{Formatters.walletAddress(wallet.address)}</span>
                  )}
                </div>
                <div className={s.dropdownBalance}>
                  {censorValue(wallet.balance)} ZANO
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
