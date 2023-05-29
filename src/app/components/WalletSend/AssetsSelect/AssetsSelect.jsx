import React, { useContext, useState } from "react";
import bitcoinIcon from "../../../assets/tokens-svg/bitcoin.svg";
import customTokenIcon from "../../../assets/tokens-svg/custom-token.svg";
import ethIcon from "../../../assets/tokens-svg/eth.svg";
import zanoIcon from "../../../assets/tokens-svg/zano.svg";
import { Store } from "../../../store/store-reducer";
import mainStyles from "../WalletSend.module.scss";
import s from "./AssetsSelect.module.scss";

const AssetsSelect = ({ value, setValue }) => {
  const { state } = useContext(Store);
  const [isOpen, setIsOpen] = useState(false);

  function openHandler() {
    isOpen ? setIsOpen(false) : setIsOpen(true);
  }

  function setValueHandler(asset) {
    setValue(asset);
    setIsOpen(false);
  }

  const getAssetImage = (name) => {
    switch (name) {
      case "Zano":
        return zanoIcon;
      case "Wrapped Bitcoin":
        return bitcoinIcon;
      case "Wrapped Ethereum":
        return ethIcon;
      case "Confidential Token":
        return customTokenIcon;
      default:
        return;
    }
  };

  return (
    <div onClick={() => setIsOpen(false)}>
      <div className={mainStyles.label}>Asset:</div>
      <div onClick={(e) => e.stopPropagation()} className={s.select}>
        <button
          onClick={openHandler}
          className={isOpen ? s.selectValue + " " + s.active : s.selectValue}
        >
          <span>
            <img src={getAssetImage(value.name)} alt={value.name + " icon"} />
            {value.name}
          </span>
        </button>

        {isOpen && (
          <div className={s.options}>
            {state.wallet.assets.map((asset) => (
              <button
                data-active={asset.name === value.name}
                className={s.option}
                key={asset.name}
                onClick={() => setValueHandler(asset)}
              >
                <img
                  src={getAssetImage(asset.name)}
                  alt={value.name + " icon"}
                />
                {asset.name}
                <span className={s.selectPoint} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsSelect;
