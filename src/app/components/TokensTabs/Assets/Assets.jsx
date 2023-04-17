import { useContext } from "react";
import crossIcon from "../../../assets/svg/cross.svg";
import plusIcon from "../../../assets/svg/plus.svg";
import bitcoinIcon from "../../../assets/tokens-svg/bitcoin.svg";
import customTokenIcon from "../../../assets/tokens-svg/custom-token.svg";
import ethIcon from "../../../assets/tokens-svg/eth.svg";
import zanoIcon from "../../../assets/tokens-svg/zano.svg";
import MyButton from "../../../components/UI/MyButton/MyButton";
import s from "./Assets.module.scss";
import { Store } from "../../../store/store-reducer";

const getIconImage = (asset) => {
  switch (asset.name) {
    case "ZANO":
      return <img src={zanoIcon} alt="ZanoIcon" />;
    case "Wrapped Bitcoin":
      return <img src={bitcoinIcon} alt="bitcoin icon" />;
    case "Wrapped Ethereum":
      return <img src={ethIcon} alt="EthIcon" />;
    default:
      return <img src={customTokenIcon} alt="CustomTokenIcon" />;
  }
};

const Assets = () => {
  const { state } = useContext(Store);
  const remove = () => console.log("remove icon click");

  return (
    <div>
      {state.wallet.assets.map((asset) => (
        <div className={s.asset} key={asset.name}>
          <button className={s.assetRemoveBtn} onClick={remove}>
            <img src={crossIcon} alt="CrossIcon" />
          </button>
          <button className={s.assetBody}>
            <span className={s.assetTitle}>
              {getIconImage(asset)}
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
      {/* <MyButton style={{ transform: "translateY(30%)" }}>
        <img src={plusIcon} alt="PlusIcon" /> Add Custom Token
      </MyButton> */}
    </div>
  );
};

export default Assets;
