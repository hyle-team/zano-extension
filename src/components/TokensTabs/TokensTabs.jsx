import { ReactComponent as BitcoinIcon } from "assets/tokens-svg/bitcoin.svg";
import { ReactComponent as CustomTokenIcon } from "assets/tokens-svg/custom-token.svg";
import { ReactComponent as EthIcon } from "assets/tokens-svg/eth.svg";
import { ReactComponent as ZanoIcon } from "assets/tokens-svg/zano.svg";
import Assets from "components/TokensTabs/Assets/Assets";
import History from "components/TokensTabs/History/History";
import s from "components/TokensTabs/TokensTabs.module.scss";
import React, { useState } from "react";

const assetsMap = [
   {
      name: "ZANO",
      icon: <ZanoIcon/>,
      balance: 120,
      ticker: "ZANO",
      value: 128.96,
   },
   {
      name: "Wrapped Bitcoin",
      icon: <BitcoinIcon/>,
      balance: 0.212,
      ticker: "WBTC",
      value: 4096.96,
   },
   {
      name: "Wrapped Ethereum",
      icon: <EthIcon/>,
      balance: 2.1,
      ticker: "WETH",
      value: 3020.12,
   },
   {
      name: "Custom Asset",
      icon: <CustomTokenIcon/>,
      balance: 15.52,
      ticker: "TSDS",
      value: 3020.12,
   },
];

const historyMap = [
   {
      value: 112412,
      type: "send", // or "receive"
      ticker: "ZANO",
      address: "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7oT6KQaR7gbog7",
      inProcess: false,
   },
   {
      value: 10,
      type: "receive", // or "send"
      ticker: "ZANO",
      address: "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7gbog7oT6KQaR7gbog7",
      inProcess: true,
   }
];

const TokensTabs = () => {
   const [activeTab, setActiveTab] = useState(1);

   const tabs = [
      {label: "assets", content: <Assets assetsMap={assetsMap}/>},
      {label: "history", content: <History historyMap={historyMap}/>},
   ];

   const toggleTabs = (e) => {
      if (activeTab !== e.target.value) {
         setActiveTab(Number(e.target.value));
      }
   };

   return (
      <div className={s.tabs}>
         <div className={s.tabsNav}>
            {tabs.map((tab, index) => (
               <button
                  key={tab.label}
                  onClick={(e) => toggleTabs(e)}
                  value={index}
                  disabled={activeTab === index}
                  className={s.tabsNavBtn}
               >
                  {tab.label}
               </button>
            ))}
         </div>

         {tabs[activeTab].content}
      </div>
   );
};

export default TokensTabs;