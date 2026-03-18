import { useContext, useMemo } from 'react';
import Decimal from 'decimal.js';
import { Store } from '../store/store-reducer';

export const useFeeCheck = (fee: number) => {
	const { state } = useContext(Store);

	const notEnoughFee = useMemo(() => {
		const balance = Number(state.wallet.balance ?? 0);
		const locked = Number(state.wallet.lockedBalance ?? 0);

		const available = new Decimal(balance).minus(locked);
		const feeBig = new Decimal(fee);

		return available.lessThan(feeBig);
	}, [state.wallet.balance, state.wallet.lockedBalance, fee]);

	return { notEnoughFee };
};
