import Button from "../UI/Button/Button";
import s from "./ConnectPage.module.scss";
import logo from "../../assets/svg/logo.svg";
import { useContext, useState } from "react";
import MyInput from "../UI/MyInput/MyInput";
import { fetchBackground } from "../../utils/utils";
import { setConnectData } from "../../store/actions";
import { Store } from "../../store/store-reducer";
import forge from "node-forge";

export default function ConnectPage() {
    const { dispatch } = useContext(Store);

    // "start" | "code"
    const [connectState, setConnectState] = useState("start");

    const [keyValue, setKeyValue] = useState("");
    const [receivedPublicKey, setReceivedPublicKey] = useState("");

    const [keyIncorrect, setKeyIncorrect] = useState(false);

    async function connectClick() {
        const response = await fetchBackground({ method: "CREATE_CONNECT_KEY" });
        setReceivedPublicKey(response.publicKey);
        if (response.success) setConnectState("code");
    }

    async function continueClick() {
        const publicKey = forge.pki.publicKeyFromPem(receivedPublicKey);
        const encrypted = publicKey.encrypt(keyValue);
        const response = await fetchBackground({ method: "VALIDATE_CONNECT_KEY", key: encrypted });

        if (response.success) {
            setConnectData(dispatch, {
                token: keyValue,
                publicKey: receivedPublicKey
            });
        } else {
            setKeyIncorrect(true);
        }
    }

    function onKeyInput(event) {
        setKeyValue(event.currentTarget.value);
        setKeyIncorrect(false);
    }

    return (
        <div className={s.connect}>
			<img
				className={s.logoImage}
				src={logo}
				alt="Zano"
			/>
            <p>{connectState === "start" ? "Connect wallet app to continue" : "Type connect key from app"}</p>
            {
                (() => {
                    switch (connectState) {
                        case "code": {
                            return (
                                <div className={s.connectCodeContent}>
                                    <MyInput 
                                        inputData={{ value: keyValue, isDirty: keyIncorrect }} 
                                        label="Connect key"
                                        placeholder="Enter key here"
                                        onChange={onKeyInput}
                                    />
                                    <Button onClick={continueClick}>Continue</Button>
                                </div>
                                // <></>
                            )
                        }
                        default: {
                            return (
                                <>
                                    <Button onClick={connectClick}>Connect</Button>
                                </>
                            )
                        }
                    }
                })()
            }
        </div>
    )
}