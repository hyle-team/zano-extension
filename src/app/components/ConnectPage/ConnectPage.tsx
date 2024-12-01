import React from "react";
import Button from "../UI/Button/Button";
import s from "./ConnectPage.module.scss";
import logo from "../../assets/svg/logo.svg";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import MyInput from "../UI/MyInput/MyInput";
import { fetchBackground, getSessionPassword } from "../../utils/utils";
import { setConnectData } from "../../store/actions";
import { Store } from "../../store/store-reducer";
import ConnectKeyUtils from "../../utils/ConnectKeyUtils";
import { defaultPort } from "../../config/config";

interface ConnectPageProps {
  incorrectPassword: boolean;
  setIncorrectPassword: Dispatch<SetStateAction<boolean>>;
  onConfirm?: (password?: string, keyValue?: string, walletPort?: string) => void;
  passwordExists: boolean;
  setConnectOpened: Dispatch<SetStateAction<boolean>>;

}

export default function ConnectPage({
  incorrectPassword,
  setIncorrectPassword,
  onConfirm,
  passwordExists,
  setConnectOpened,
}: ConnectPageProps) {
  const updateSettings = !!passwordExists;

  const { dispatch } = useContext(Store);

  const [keyValue, setKeyValue] = useState("");

  const [keyIncorrect, setKeyIncorrect] = useState(false);
  const [portIncorrect, setPortIncorrect] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [walletPort, setWalletPort] = useState(`${defaultPort}`);

  const [invalidPassword, setInvalidPassword] = useState(false);

  useEffect(() => {
    async function getExistingPort() {
      if (!passwordExists) return;
      const password = await getSessionPassword();
      if (!password) return;
      const connectData = ConnectKeyUtils.getConnectData(password);
      if (connectData?.port) setWalletPort(connectData.port);
    }
    getExistingPort();
  }, [passwordExists]);

  function onPasswordInput(event: React.ChangeEvent<HTMLInputElement>, repeat: boolean) {
    const { value } = event.currentTarget;
    setIncorrectPassword(false);
    setInvalidPassword(false);
    if (repeat) {
      setPasswordRepeat(value);
    } else {
      setPassword(value);
    }
  }

  async function continueClick() {
    if (!updateSettings) {
      const correctPassword = password === passwordRepeat && password;

      if (!correctPassword) return setInvalidPassword(true);
    }

    if (!parseInt(walletPort, 10)) {
      console.log("PORT IS NOT A NUMBER");
      return setPortIncorrect(true);
    }

    await fetchBackground({
      method: "SET_API_CREDENTIALS",
      credentials: { port: walletPort },
    });

    setConnectData(dispatch as () => void, {
      token: keyValue,
      port: walletPort,
    });

    if (onConfirm) {
      await onConfirm(
        !updateSettings ? password : undefined,
        keyValue,
        walletPort
      );
      if (updateSettings) {
        setConnectOpened(false);
      }
    } else {
      throw new Error("No onConfirm function provided");
    }
  }

  function onKeyInput(event: React.ChangeEvent<HTMLInputElement>) {
    setKeyValue(event.currentTarget.value);
    setKeyIncorrect(false);
  }

  return (
    <div className={s.connect}>
      <img className={s.logoImage} src={logo} alt="Zano" />
      <div className={s.connectCodeContent}>
        <div className={s.input}>
          <MyInput
            label="Wallet port"
            placeholder="Enter port here"
            inputData={{ value: walletPort }}
            noValidation={true}
            type={"number"}
            onChange={(event) => {
              setWalletPort(event.currentTarget.value);
              setPortIncorrect(false);
            }}
          />
          {portIncorrect && <p>Wallet is not responding</p>}
        </div>

        <MyInput
          label="Wallet secret"
          placeholder="Enter secret here"
          inputData={{ value: keyValue, isDirty: keyIncorrect }}
          onChange={onKeyInput}
        />
        {!updateSettings && (
          <>
            <MyInput
              type="password"
              label="Password"
              placeholder="Password"
              inputData={{
                value: password,
                isDirty: !!(incorrectPassword || invalidPassword),
              }}
              onChange={(event) => onPasswordInput(event, false)}
            />
            <MyInput
              type="password"
              placeholder="Repeat password"
              inputData={{
                value: passwordRepeat,
                isDirty: !!(incorrectPassword || invalidPassword),
              }}
              onChange={(event) => onPasswordInput(event, true)}
            />
          </>
        )}
        <Button onClick={continueClick}>
          {updateSettings ? "Save" : "Continue"}
        </Button>
        {updateSettings && (
          <Button theme="outline" onClick={() => setConnectOpened(false)}>
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
