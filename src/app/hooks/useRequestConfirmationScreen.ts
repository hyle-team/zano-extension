import { useContext, useEffect } from 'react';
import { Store } from '../store/store-reducer';

// A dapp request is bound to the wallet that was active when it was made, so wallet
// switching stays locked while a confirmation screen is mounted, no matter which
// window the screen was opened in.
export const useRequestConfirmationScreen = (): void => {
	const { dispatch } = useContext(Store);

	useEffect(() => {
		dispatch({ type: 'REQUEST_CONFIRMATION_OPENED' });

		return () => dispatch({ type: 'REQUEST_CONFIRMATION_CLOSED' });
	}, [dispatch]);
};
