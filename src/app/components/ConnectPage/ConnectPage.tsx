import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import Button from '../UI/Button/Button';
import s from './ConnectPage.module.scss';
import logo from '../../assets/svg/logo.svg';
import MyInput from '../UI/MyInput/MyInput';
import { fetchBackground, getSessionPassword } from '../../utils/utils';
import { setConnectData } from '../../store/actions';
import { Store } from '../../store/store-reducer';
import ConnectKeyUtils from '../../utils/ConnectKeyUtils';
import { defaultPort } from '../../config/config';
import { getFirstFailedPasswordRule } from './helpers/passwordValidation';

interface ConnectPageProps {
	onConfirm?: (password?: string, keyValue?: string, walletPort?: string) => void;
	passwordExists: boolean;
	setConnectOpened: Dispatch<SetStateAction<boolean>>;
}

const PASSWORDS_DO_NOT_MATCH_MESSAGE = 'Passwords do not match';

export default function ConnectPage({
	onConfirm,
	passwordExists,
	setConnectOpened,
}: ConnectPageProps) {
	const updateSettings = !!passwordExists;

	const { dispatch } = useContext(Store);

	const [keyValue, setKeyValue] = useState('');

	const [keyIncorrect, setKeyIncorrect] = useState(false);
	const [portIncorrect, setPortIncorrect] = useState(false);

	const [password, setPassword] = useState('');
	const [passwordRepeat, setPasswordRepeat] = useState('');
	const [walletPort, setWalletPort] = useState(`${defaultPort}`);

	const [passwordValidationErrorMessage, setPasswordValidationErrorMessage] = useState<
		string | null
	>(null);
	const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);

	useEffect(() => {
		async function getExistingPort() {
			if (!passwordExists) return;
			const password = await getSessionPassword();
			if (!password) return;
			const getConnectDataResult = await ConnectKeyUtils.getConnectData(password);

			if (!getConnectDataResult.success) {
				console.error(
					'Failed to get connect data. Error code:',
					getConnectDataResult.error,
				);

				return;
			}

			const { connectData } = getConnectDataResult;

			setWalletPort(connectData.port);
		}
		getExistingPort();
	}, [passwordExists]);

	function onPasswordInput(event: React.ChangeEvent<HTMLInputElement>, isRepeatField: boolean) {
		const { value } = event.currentTarget;
		setPasswordValidationErrorMessage(null);
		setPasswordsDoNotMatch(false);
		if (isRepeatField) {
			setPasswordRepeat(value);
		} else {
			setPassword(value);
		}
	}

	async function continueClick() {
		if (!updateSettings) {
			const failedValidationRule = getFirstFailedPasswordRule(password);
			if (failedValidationRule) {
				setPasswordValidationErrorMessage(failedValidationRule.message);
				return;
			}

			if (password !== passwordRepeat) {
				setPasswordsDoNotMatch(true);
				return;
			}
		}

		if (!parseInt(walletPort, 10)) {
			console.log('PORT IS NOT A NUMBER');
			return setPortIncorrect(true);
		}

		await fetchBackground({
			method: 'SET_API_CREDENTIALS',
			credentials: { port: walletPort },
		});

		setConnectData(dispatch as () => void, {
			token: keyValue,
			port: walletPort,
		});

		if (onConfirm) {
			await onConfirm(!updateSettings ? password : undefined, keyValue, walletPort);
			if (updateSettings) {
				setConnectOpened(false);
			}
		} else {
			throw new Error('No onConfirm function provided');
		}
	}

	function onKeyInput(event: React.ChangeEvent<HTMLInputElement>) {
		setKeyValue(event.currentTarget.value);
		setKeyIncorrect(false);
	}

	const passwordMatchingErrorMessage = passwordsDoNotMatch
		? PASSWORDS_DO_NOT_MATCH_MESSAGE
		: null;

	const passwordFieldErrorMessage =
		passwordValidationErrorMessage ?? passwordMatchingErrorMessage;

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
						type={'number'}
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
					<div className={s.passwords}>
						<MyInput
							type="password"
							label="Password"
							placeholder="Password"
							inputData={{
								value: password,
								isDirty: !!passwordFieldErrorMessage,
							}}
							onChange={(event) => onPasswordInput(event, false)}
						/>
						<MyInput
							type="password"
							placeholder="Repeat password"
							inputData={{
								value: passwordRepeat,
								isDirty: !!passwordFieldErrorMessage,
							}}
							stroke={passwordFieldErrorMessage}
							onChange={(event) => onPasswordInput(event, true)}
							preserveStrokeLabelSpace
						/>
					</div>
				)}
				<div className={`${s.buttons} ${updateSettings ? s.buttonsWithMargin : ''}`}>
					<Button onClick={continueClick}>{updateSettings ? 'Save' : 'Continue'}</Button>
					{updateSettings && (
						<Button theme="outline" onClick={() => setConnectOpened(false)}>
							Back
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
