import Assets from "components/TokensTabs/Assets/Assets";
import History from "components/TokensTabs/History/History";
import s from "components/TokensTabs/TokensTabs.module.scss";
import React, { useState } from "react";

const TokensTabs = () => {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { label: "assets", content: <Assets /> },
    { label: "history", content: <History /> },
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