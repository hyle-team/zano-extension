import React, { useContext, useState } from "react";
import { Store } from "../../../store/store-reducer";
import mainStyles from "../WalletSend.module.scss";
import s from "./AssetsSelect.module.scss";

const AssetsSelect = ({ value, setValue }) => {
  const { state } = useContext(Store);
  const [isOpen, setIsOpen] = useState(false);

  function openHandler() {
    isOpen ? setIsOpen(false) : setIsOpen(true);
  }

  function setValueHandler(e) {
    setValue(e.target.value);
    setIsOpen(false);
  }

  return (
    <div>
      <div className={mainStyles.label}>Asset:</div>
      <div className={s.select}>
        <button
          onClick={openHandler}
          className={isOpen ? s.selectValue + " " + s.active : s.selectValue}
        >
          <span>{value}</span>
          <svg>вниз</svg>
        </button>
        {isOpen && (
          <div className={s.options}>
            {state.wallet.assets.map((asset) => (
              <button
                className={s.option}
                key={asset.name}
                value={asset.name + asset.balance}
                onClick={setValueHandler}
              >
                {asset.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsSelect;