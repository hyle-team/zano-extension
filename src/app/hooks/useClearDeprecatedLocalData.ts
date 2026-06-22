import { useEffect } from 'react';

import ConnectKeyUtils from '../utils/ConnectKeyUtils';
import { clearDeprecatedPasswordStorageData } from '../utils/utils';

export const useInitialClearDeprecatedLocalData = () => {
	useEffect(() => {
		ConnectKeyUtils.clearDeprecatedConnectKey();
		clearDeprecatedPasswordStorageData();
	}, []);
};
