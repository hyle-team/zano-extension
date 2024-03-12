import Button from "../UI/Button/Button";
import s from "./ConnectPage.module.scss";
import logo from "../../assets/svg/logo.svg";
import { useContext, useEffect, useState } from "react";
import MyInput from "../UI/MyInput/MyInput";
import { fetchBackground } from "../../utils/utils";
import { setConnectData } from "../../store/actions";
import { Store } from "../../store/store-reducer";
import forge from "node-forge";

export default function ConnectPage({
    incorrectPassword,
    setIncorrectPassword,
    onConfirm,
}) {
    const { dispatch } = useContext(Store);


    const [keyValue, setKeyValue] = useState("");
    const [receivedPublicKey, setReceivedPublicKey] = useState("");

    const [keyIncorrect, setKeyIncorrect] = useState(false);

    const [password, setPassword] = useState("");
	const [passwordRepeat, setPasswordRepeat] = useState("");

	const [invalidPassword, setInvalidPassword] = useState(false);

	function onPasswordInput(event, repeat) {
		const { value } = event.currentTarget;
		setIncorrectPassword(false);
		setInvalidPassword(false);
		if (repeat) {
			setPasswordRepeat(value);
		} else {
			setPassword(value);
		}
	}

    async function connectClick() {
        const response = await fetchBackground({ method: "CREATE_CONNECT_KEY" });
        setReceivedPublicKey(response.publicKey);
    }


    useEffect(() => {
        connectClick();
    }, []);

    async function continueClick() {

        
        const correctPassword = (
            password === passwordRepeat && 
            password
        );

        if (!correctPassword) return setInvalidPassword(true);


        const publicKey = forge.pki.publicKeyFromPem(receivedPublicKey);
        const encrypted = publicKey.encrypt(keyValue);
        const response = await fetchBackground({ method: "VALIDATE_CONNECT_KEY", key: encrypted });

        if (response.success) {
            setConnectData(dispatch, {
                token: keyValue,
                publicKey: receivedPublicKey
            });
    
            onConfirm && onConfirm(password, keyValue, receivedPublicKey);
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
            <div className={s.connectCodeContent}>
                <div className={s.input}>
                    <MyInput 
                        type="number"
                        label="Wallet port"
                        placeholder="Enter port here"
                        inputData={{ value: "" }} 
                    />
                    {false && <p>Wallet is not responding</p>}
                </div>

                <MyInput 
                    label="Wallet secret"
                    placeholder="Enter secret here"
                    inputData={{ value: keyValue, isDirty: keyIncorrect }}
                    onChange={onKeyInput}
                />
                <MyInput 
					type="password"
                    label="Password"
                    placeholder="Password"
                    inputData={{ value: password, isDirty: !!(incorrectPassword || invalidPassword) }}
					onChange={event => onPasswordInput(event, false)}
                />
                <MyInput 
					type="password"
                    placeholder="Repeat password"
                    inputData={{ value: passwordRepeat, isDirty: !!(incorrectPassword || invalidPassword) }}
					onChange={event => onPasswordInput(event, true)}
                />
                <Button onClick={continueClick}>Continue</Button>
            </div>
        </div>
    )
}