import React, { useContext, useEffect, useRef, useState } from "react";
import BitcoinIcon from "../../../../assets/tokens-svg/bitcoin.svg";
import CustomTokenIcon from "../../../../assets/tokens-svg/custom-token.svg";
import EthIcon from "../../../../assets/tokens-svg/eth.svg";
import ZanoIcon from "../../../../assets/tokens-svg/zano.svg";
import ArrowIcon from "../../../../assets/svg/arrow-select.svg";
import { Store } from "../../../../store/store-reducer";
import mainStyles from "../../WalletSend.module.scss";
import s from "./AssetsSelect.module.scss";
import { classNames } from "../../../../utils/classNames";

interface Asset {
  name: string;
}

interface AssetsSelectProps {
  value: Asset;
  setValue: (asset: Asset) => void;
}

const AssetsSelect = ({ value, setValue }: AssetsSelectProps) => {
  const { state } = useContext(Store);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (
        focusedIndex === null ||
        focusedIndex === state.wallet.assets.length - 1
      ) {
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prevIndex) => Number(prevIndex) + 1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (focusedIndex === null || focusedIndex === 0) {
        setFocusedIndex(state.wallet.assets.length - 1);
      } else {
        setFocusedIndex((prevIndex) => Number(prevIndex) - 1);
      }
    }
  };

  useEffect(() => {
    if (focusedIndex !== null && selectRef.current) {
      const childNodes = selectRef.current.childNodes;
      if (childNodes && childNodes[focusedIndex as number]) {
        (childNodes[focusedIndex as number] as HTMLElement).focus();
      }
    }
  }, [focusedIndex]);

  function openHandler() {
    setIsOpen(!isOpen);
  }

  function setValueHandler(asset: Asset) {
    setValue(asset);
    setIsOpen(false);
  }

  const getAssetImage = (name: string) => {
    switch (name) {
      case "Zano":
        return <ZanoIcon />;
      case "Wrapped Bitcoin":
        return <BitcoinIcon />;
      case "Wrapped Ethereum":
        return <EthIcon />;
      default:
        return <CustomTokenIcon />;
    }
  };

  return (
    <div onClick={() => setIsOpen(false)} onKeyDown={handleKeyDown}>
      <div className={mainStyles.label}>Asset:</div>
      <div onClick={(e) => e.stopPropagation()} className={s.select}>
        <button
          onClick={openHandler}
          className={isOpen ? s.selectValue + " " + s.active : s.selectValue}
        >
          <span>
            { getAssetImage(value.name) }
            {value.name}
          </span>
          <span className={s.valueArrow}>
            <ArrowIcon />
          </span>
        </button>

        <div
          className={classNames(s.options, { [s.active]: isOpen })}
          ref={selectRef}
        >
          {state.wallet.assets.map((asset) => (
            <button
              data-active={asset.name === value.name}
              className={s.option}
              key={asset.name}
              onClick={() => setValueHandler(asset)}
            >
              { getAssetImage(value.name) }
              {asset.name}
              <span className={s.selectPoint} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetsSelect;
