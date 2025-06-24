import React, { useState } from 'react';
import { useInput } from '../../hooks/useInput';
import Button from '../UI/Button/Button';
import MyInput from '../UI/MyInput/MyInput';
import RoutersNav from '../UI/RoutersNav/RoutersNav';
import s from './WalletSettings.module.scss';

const WalletSettings = () => {
	const [isBtnDisabled] = useState(true);
	const localNodePort = useInput('11112', {});

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
			<Button disabled={isBtnDisabled}>Confirm</Button>
		</div>
	);
};

export default WalletSettings;
