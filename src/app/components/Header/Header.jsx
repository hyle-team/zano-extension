import React, { useState } from "react";
import Formatters from "../../../utils/formatters";
import arrowIcon from "../../assets/svg/arrow-shevron.svg";
import s from "./Header.module.scss";

const wallet = {
  address: "ZxDCjt6KQaR7DCjt6KQaR7DCjt6KQaR7",
  label: "@alias",
};

const walletsMap = [
  {
    address: "ZxDCjt6KQaR7DCjt6KQaR7DCjt6KQaR7",
    label: null,
    balance: 120,
  },
  {
    address: "ZxDCjt6KQaR213DCjt6KQaR7DCjt6KQaR7",
    label: "@alias",
    balance: 2415,
  },
  {
    address: "ZxDCjt623R7DCjt6KQaR7DCjt6KQaR7",
    label: null,
    balance: 52.23,
  },
];

const isConnected = true;

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
      document.querySelector(".App").style.overflow = "auto";
    } else {
      setDropdownOpen(true);
      document.querySelector(".App").style.overflow = "hidden";
    }
  };

  return (
    <header className={s.header}>
      <button onClick={toggleDropdown} className={s.dropdownButton}>
        <span>
          {wallet.label
            ? wallet.label
            : Formatters.walletAddress(wallet.address)}
        </span>
        <img src={arrowIcon} alt="arrow icon" />
      </button>

      <div className={s.headerStatus}>
        {isConnected ? "online" : "offline"}
        <span
          style={{ backgroundColor: isConnected ? "#16D1D6" : "#FF6767" }}
        ></span>
      </div>

      {dropdownOpen && (
        <div onClick={toggleDropdown} className={s.dropdown}>
          <div onClick={(e) => e.stopPropagation()} className={s.dropdownList}>
            {walletsMap.map((wallet) => (
              <button key={wallet.address} className={s.dropdownTitle}>
                <div>
                  {wallet.label
                    ? wallet.label
                    : Formatters.walletAddress(wallet.address)}
                  {wallet.label && (
                    <span>{Formatters.walletAddress(wallet.address)}</span>
                  )}
                </div>
                <div className={s.dropdownBalance}>{wallet.balance} ZANO</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
