import React from "react";
import { useContext } from "react";
import CrossIcon from "../../../assets/svg/cross.svg";
import BitcoinIcon from "../../../assets/tokens-svg/bitcoin.svg";
import CustomTokenIcon from "../../../assets/tokens-svg/custom-token.svg";
import EthIcon from "../../../assets/tokens-svg/eth.svg";
import ZanoIcon from "../../../assets/tokens-svg/zano.svg";
import { useCensorDigits } from "../../../hooks/useCensorDigits";
import { Store } from "../../../store/store-reducer";
import s from "./Assets.module.scss";
import Decimal from "decimal.js";

interface Asset {
  name: string;
  ticker: string;
  balance: number;
  lockedBalance?: number;
  value: number;
}

const getIconImage = (asset: Asset) => {
  switch (asset.name) {
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

const Assets = () => {
  const { state } = useContext(Store);
  const { censorValue } = useCensorDigits();
  //TODO: only remove non whitelisted assets
  const remove = () => console.log("remove icon click");

  return (
    <div>
      {(state.wallet.assets).map((asset) => {
        const fiatBalance = (
          Number(asset.balance) * state.priceData.price
        ).toFixed(2);
        return (
          <div className={s.asset} key={asset.name}>
            {/* <button className={s.assetRemoveBtn} onClick={remove}>
              <img src={crossIcon} alt="CrossIcon" />
            </button> */}
            <button className={s.assetBody}>
              <span className={s.assetTitle}>
                {getIconImage(asset)}
                {asset.name}
              </span>
              <span className={s.assetInfo}>
                <div>
                  <div className={s.assetInfoLabel}>Balance</div>
                  <div className={s.assetInfoValue}>
                    <span>{censorValue(new Decimal(asset.balance).toSignificantDigits(20).toString())}</span>
                    {" "}
                    {asset.ticker}
                  </div>
                </div>
                <div>
                  <div className={s.assetInfoLabel}>Value</div>
                  <div className={s.assetInfoValue}>
                    ${censorValue(asset.name === "Zano" ? fiatBalance : 0)}
                  </div>
                </div>
              </span>
            </button>
          </div>
        );
      })}
      {/* <MyButton style={{ transform: "translateY(30%)" }}>
        <img src={plusIcon} alt="PlusIcon" /> Add Custom Token
      </MyButton> */}
    </div>
  );
};

export default Assets;
