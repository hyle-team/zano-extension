import React, { useState } from "react";
import { useInput } from "../../hooks/useInput";
import MyButton from "../UI/MyButton/MyButton";
import MyInput from "../UI/MyInput/MyInput";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import s from "./WalletSettings.module.scss";

const WalletSettings = () => {
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const localNodePort = useInput("11112");

  return (
    <div>
      <RoutersNav title="Settings" />
      <div className={s.settingsForm}>
        <MyInput
          label="Local node port:"
          type="number"
          noActiveBorder
          value={localNodePort.value}
          onChange={localNodePort.onChange}
        />
      </div>
      <MyButton disabled={isBtnDisabled}>Confirm</MyButton>
    </div>
  );
};

export default WalletSettings;
