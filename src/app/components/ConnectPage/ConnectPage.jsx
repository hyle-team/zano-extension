import Button from "../UI/Button/Button";
import s from "./ConnectPage.module.scss";
import logo from "../../assets/svg/logo.svg";
import { useContext, useState } from "react";
import MyInput from "../UI/MyInput/MyInput";
import { fetchBackground } from "../../utils/utils";
import { setConnectKey } from "../../store/actions";
import { Store } from "../../store/store-reducer";

export default function ConnectPage() {
    const { dispatch } = useContext(Store);

    // "start" | "code"
    const [connectState, setConnectState] = useState("start");

    const [keyValue, setKeyValue] = useState("");

    async function connectClick() {
        const response = await fetchBackground({ method: "CREATE_CONNECT_KEY" });
        if (response.success) setConnectState("code");
    }

    async function continueClick() {
        const response = await fetchBackground({ method: "VALIDATE_CONNECT_KEY" });
        if (response.success) setConnectKey(dispatch, keyValue);
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
                                        inputData={{ value: keyValue }} 
                                        label="Connect key"
                                        onChange={event => setKeyValue(event.currentTarget.value)}
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