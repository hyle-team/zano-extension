import { ReactComponent as BurgerIcon } from "assets/svg/burger.svg";
import { ReactComponent as CrossIcon } from "assets/svg/cross.svg";
import { ReactComponent as GearIcon } from "assets/svg/gear.svg";
import { ReactComponent as InfoIcon } from "assets/svg/info.svg";
import { ReactComponent as LockIcon } from "assets/svg/lock.svg";
import { ReactComponent as Logo } from "assets/svg/logo.svg";
import { ReactComponent as PlusIcon } from "assets/svg/plus.svg";
import { ReactComponent as UsersIcon } from "assets/svg/users.svg";
import MyButton from "components/.UI/MyButton/MyButton";
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
            <BurgerIcon/>
         </button>

         <BurgerMenu
            menuVisible={menuVisible}
            toggleBurgerMenu={toggleBurgerMenu}
         />

         <div className={s.headerSelect}>Wallet Name 1</div>

         <button className={`${s.headerInfo}`}>
            <InfoIcon/>
         </button>
      </header>
   );
};

export default Header;

// Components
const BurgerMenu = ({menuVisible, toggleBurgerMenu}) => {
   return (
      <>
         {menuVisible && (
            <div className={s.menu} onClick={toggleBurgerMenu}>
               <div className={s.menuBody} onClick={(e) => e.stopPropagation()}>
                  <div className={s.menuHeader}>
                     <Logo/>
                     <button className="round-button" onClick={toggleBurgerMenu}>
                        <CrossIcon/>
                     </button>
                  </div>
                  <div className={s.menuLinks}>
                     <a href="" className={s.menuLink}>
                        <PlusIcon/> Add Wallet
                     </a>
                     <a href="" className={s.menuLink}>
                        <UsersIcon/> Contacts
                     </a>
                     <a href="" className={s.menuLink}>
                        <GearIcon/> Settings
                     </a>
                  </div>
                  <MyButton>
                     <LockIcon/> Lock Zano
                  </MyButton>
               </div>
            </div>
         )}
      </>
   );
};
