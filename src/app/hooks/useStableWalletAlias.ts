import { useContext, useEffect, useRef } from 'react';
import { Store } from '../store/store-reducer';

// The wallet's alias for pages that act on it (edit, transfer). While the alias lookup is
// failing (aliasUnknown), keep the alias this page last saw for the same address, so an open
// form is not reset or submitted with an empty alias. The wallet still checks ownership on
// submit, and a wallet switch or a confirmed change is followed as usual.
export const useStableWalletAlias = (): string => {
	const { state } = useContext(Store);
	const { address, alias, aliasUnknown } = state.wallet;
	const lastKnown = useRef({ address, alias });

	useEffect(() => {
		if (!aliasUnknown) {
			lastKnown.current = { address, alias };
		}
	}, [address, alias, aliasUnknown]);

	if (aliasUnknown && lastKnown.current.address === address) {
		return lastKnown.current.alias;
	}

	return alias;
};
