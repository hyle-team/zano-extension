import { ReactComponent as CrossIcon } from "../../../assets/svg/cross.svg";
import { ReactComponent as PlusIcon } from "../../../assets/svg/plus.svg";
import { ReactComponent as BitcoinIcon } from "../../../assets/tokens-svg/bitcoin.svg";
import { ReactComponent as CustomTokenIcon } from "../../../assets/tokens-svg/custom-token.svg";
import { ReactComponent as EthIcon } from "../../../assets/tokens-svg/eth.svg";
import { ReactComponent as ZanoIcon } from "../../../assets/tokens-svg/zano.svg";
import MyButton from "../../../components/UI/MyButton/MyButton";
import React from "react";
import s from "./Assets.module.scss";

const assetsMap = [
  {
    name: "ZANO",
    icon: <ZanoIcon />,
    balance: 120,
    ticker: "ZANO",
    value: 128.96,
  },
  {
    name: "Wrapped Bitcoin",
    icon: <BitcoinIcon />,
    balance: 0.212,
    ticker: "WBTC",
    value: 4096.96,
  },
  {
    name: "Wrapped Ethereum",
    icon: <EthIcon />,
    balance: 2.1,
    ticker: "WETH",
    value: 3020.12,
  },
  {
    name: "Custom Asset",
    icon: <CustomTokenIcon />,
    balance: 15.52,
    ticker: "TSDS",
    value: 3020.12,
  },
];

const Assets = () => {
  const remove = () => {
    alert("remove");
  };

  return (
    <div>
      {assetsMap.map((asset) => (
        <div className={s.asset}>
          <button className={s.assetRemoveBtn} onClick={remove}>
            <CrossIcon />
          </button>
          <button className={s.assetBody}>
            <span className={s.assetTitle}>
              {asset.icon}
              {asset.name}
            </span>
            <span className={s.assetInfo}>
              <div>
                <div className={s.assetInfoLabel}>Balance</div>
                <div className={s.assetInfoValue}>
                  {[asset.balance, asset.ticker].join(" ")}
                </div>
              </div>
              <div>
                <div className={s.assetInfoLabel}>Value</div>
                <div className={s.assetInfoValue}>${asset.value}</div>
              </div>
            </span>
          </button>
        </div>
      ))}
      <MyButton style={{ transform: "translateY(30%)" }}>
        <PlusIcon /> Add Custom Token
      </MyButton>
    </div>
  );
};

export default Assets;
