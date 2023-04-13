import BurgerIcon from "../../assets/svg/burger.svg";
import CrossIcon from "../../assets/svg/cross.svg";
import GearIcon from "../../assets/svg/gear.svg";
import InfoIcon from "../../assets/svg/info.svg";
import LockIcon from "../../assets/svg/lock.svg";
import Logo from "../../assets/svg/logo.svg";
import PlusIcon from "../../assets/svg/plus.svg";
import UsersIcon from "../../assets/svg/users.svg";
import MyButton from "../../components/UI/MyButton/MyButton";
import React, { useState } from "react";
import s from "./Header.module.scss";

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleBurgerMenu = () => {
    if (menuVisible) {
      setMenuVisible(false);
    } else {
      setMenuVisible(true);
    }
  };

  return (
    <header className={s.header}>
      <button onClick={toggleBurgerMenu} className={`${s.burger}`}>
        <img src={BurgerIcon} alt="Burger" />
      </button>

      <BurgerMenu
        menuVisible={menuVisible}
        toggleBurgerMenu={toggleBurgerMenu}
      />

      <div className={s.headerSelect}>Wallet Name 1</div>

      <button className={`${s.headerInfo}`}>
        <img src={InfoIcon} alt="InfoIcon" />
      </button>
    </header>
  );
};

export default Header;

// Components
const BurgerMenu = ({ menuVisible, toggleBurgerMenu }) => {
  return (
    <>
      {menuVisible && (
        <div className={s.menu} onClick={toggleBurgerMenu}>
          <div className={s.menuBody} onClick={(e) => e.stopPropagation()}>
            <div className={s.menuHeader}>
              <img src={Logo} alt="Logo" />
              <button className="round-button" onClick={toggleBurgerMenu}>
                <img src={CrossIcon} alt="CrossIcon" />
              </button>
            </div>
            <div className={s.menuLinks}>
              <a href="" className={s.menuLink}>
                <img src={PlusIcon} alt="PlusIcon" /> Add Wallet
              </a>
              <a href="" className={s.menuLink}>
                <img src={UsersIcon} alt="UsersIcon" /> Contacts
              </a>
              <a href="" className={s.menuLink}>
                <img src={GearIcon} alt="GearIcon" /> Settings
              </a>
            </div>
            <MyButton>
              <img src={LockIcon} alt="LockIcon" /> Lock Zano
            </MyButton>
          </div>
        </div>
      )}
    </>
  );
};
