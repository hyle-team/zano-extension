import { useEffect } from 'react';

import ConnectKeyUtils from '../utils/ConnectKeyUtils';

export const useInitialClearDeprecatedLocalData = () => {
	useEffect(() => {
		ConnectKeyUtils.clearDeprecatedConnectKey();
	}, []);
};
