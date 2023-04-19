import { useEffect, useState } from "react";
import Assets from "./Assets/Assets";
import History from "./History/History";
import s from "./TokensTabs.module.scss";

const TokensTabs = () => {
  const [activeTab, setActiveTab] = useState(
    Number(localStorage.getItem("activeTab")) || 0
  );

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

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
