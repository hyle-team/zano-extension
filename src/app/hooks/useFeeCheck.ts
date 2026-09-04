import { useContext, useMemo } from 'react';
import Decimal from 'decimal.js';
import { Store } from '../store/store-reducer';
import { ZANO_ASSET_ID } from '../../constants';

export const useFeeCheck = (fee: number) => {
	const { state } = useContext(Store);

	const notEnoughFee = useMemo(() => {
		const zanoAsset = state.wallet.assets?.find((asset) => asset.assetId === ZANO_ASSET_ID);
		const available = new Decimal(zanoAsset?.unlockedBalance ?? state.wallet.balance ?? 0);
		const feeBig = new Decimal(fee);

		return available.lessThan(feeBig);
	}, [state.wallet.assets, state.wallet.balance, fee]);

	return { notEnoughFee };
};
