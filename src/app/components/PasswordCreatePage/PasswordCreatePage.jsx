import s from "./PasswordCreatePage.module.scss";
import logo from "../../assets/svg/logo.svg";
import MyInput from "../UI/MyInput/MyInput";
import Button from "../UI/Button/Button";
import { useState } from "react";

function PasswordCreatePage(props) {
	const {
		onConfirm,
		incorrectPassword,
		setIncorrectPassword
	} = props;

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

	function onButtonClick() {
		const correctPassword = (
			password === passwordRepeat && 
			password
		);

		if (!correctPassword) return setInvalidPassword(true);

		onConfirm && onConfirm(password);
	}

	return (
		<div className={s.passwordPage}>

			<img
				className={s.logoImage}
				src={logo}
				alt="Zano"
			/>
			<p>This password will unlock your Zano extension on that device.</p>
			<div className={s.inputPanel}>
				<MyInput
					type="password"
					placeholder="Password"
					inputData={{ value: password, isDirty: !!(incorrectPassword || invalidPassword) }}
					onChange={(event) => onPasswordInput(event, false)}
				/>
				<MyInput
					type="password"
					placeholder="Repeat password"
					inputData={{ value: passwordRepeat, isDirty: !!(incorrectPassword || invalidPassword) }}
					onChange={(event) => onPasswordInput(event, true)}
				/>
				<Button onClick={onButtonClick}>
					Create
				</Button>
			</div>

		</div>
	)
}

export default PasswordCreatePage;