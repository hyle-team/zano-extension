import React, { ChangeEvent } from "react";
import s from "./PasswordPage.module.scss";
import Logo from "../../assets/svg/logo.svg";
import MyInput from "../UI/MyInput/MyInput";
import Button from "../UI/Button/Button";
import { useState } from "react";

interface PasswordPageProps {
	onConfirm: (password: string) => void;
	incorrectPassword: boolean;
	setIncorrectPassword: (value: boolean) => void;
}

function PasswordPage(props: PasswordPageProps) {
	const {
		onConfirm,
		incorrectPassword,
		setIncorrectPassword
	} = props;

	const [password, setPassword] = useState("");

	function onInputChange(event: ChangeEvent<HTMLInputElement>) {
		setIncorrectPassword(false);
		setPassword(event.currentTarget.value);
	}

	function onButtonClick() {
		onConfirm && onConfirm(password);
	}

	return (
		<div className={s.passwordPage}>

			<Logo className={s.logoImage} />
			<p>Enter your password</p>
			<div className={s.inputPanel}>
				<MyInput
					placeholder="Password"
					type="password"
					inputData={{ value: password, isDirty: !!incorrectPassword }}
					onChange={onInputChange}
					onKeyDown={event => event.key === "Enter" ? onButtonClick() : undefined}
				/>
				<Button onClick={onButtonClick}>
					Enter
				</Button>
			</div>

		</div>
	)
}

export default PasswordPage;