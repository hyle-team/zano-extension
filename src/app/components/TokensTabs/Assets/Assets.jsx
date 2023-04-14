import React from "react";
import crossIcon from "../../../assets/svg/cross.svg";
import plusIcon from "../../../assets/svg/plus.svg";
import bitcoinIcon from "../../../assets/tokens-svg/bitcoin.svg";
import customTokenIcon from "../../../assets/tokens-svg/custom-token.svg";
import ethIcon from "../../../assets/tokens-svg/eth.svg";
import zanoIcon from "../../../assets/tokens-svg/zano.svg";
import MyButton from "../../../components/UI/MyButton/MyButton";
import s from "./Assets.module.scss";

const assetsMap = [
  {
    name: "ZANO",
    icon: <img src={zanoIcon} alt="ZanoIcon" />,
    balance: 120,
    ticker: "ZANO",
    value: 128.96,
  },
  {
    name: "Wrapped Bitcoin",
    icon: <img src={bitcoinIcon} alt="bitcoin icon" />,
    balance: 0.212,
    ticker: "WBTC",
    value: 4096.96,
  },
  {
    name: "Wrapped Ethereum",
    icon: <img src={ethIcon} alt="EthIcon" />,
    balance: 2.1,
    ticker: "WETH",
    value: 3020.12,
  },
  {
    name: "Custom Asset",
    icon: <img src={customTokenIcon} alt="CustomTokenIcon" />,
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
            <img src={crossIcon} alt="CrossIcon" />
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
        <img src={plusIcon} alt="PlusIcon" /> Add Custom Token
      </MyButton>
    </div>
  );
};

export default Assets;
