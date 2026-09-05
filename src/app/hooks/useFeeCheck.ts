import { useContext, useMemo } from 'react';
import Decimal from 'decimal.js';
import { Store } from '../store/store-reducer';
import { getAvailableZanoBalance } from '../utils/utils';

export const useFeeCheck = (fee: number) => {
	const { state } = useContext(Store);

	const notEnoughFee = useMemo(() => {
		const available = getAvailableZanoBalance(state.wallet);
		const feeBig = new Decimal(fee);

		return available.lessThan(feeBig);
	}, [state.wallet, fee]);

	return { notEnoughFee };
};
