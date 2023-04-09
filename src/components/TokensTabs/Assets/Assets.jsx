import { ReactComponent as CrossIcon } from "assets/svg/cross.svg";
import { ReactComponent as PlusIcon } from "assets/svg/plus.svg";
import MyButton from "components/.UI/MyButton/MyButton";
import React from 'react';
import s from "./Assets.module.scss"

const Assets = ({assetsMap}) => {
   const remove = () => {
      alert("remove")
   }

   return (
      <div>
         {assetsMap.map(asset =>
            <div className={s.asset}>
               <button className={s.assetRemoveBtn} onClick={remove}>
                  <CrossIcon/>
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
         )}
         <MyButton style={{transform: "translateY(30%)"}}>
            <PlusIcon/> Add Custom Token
         </MyButton>
      </div>
   )
};

export default Assets;