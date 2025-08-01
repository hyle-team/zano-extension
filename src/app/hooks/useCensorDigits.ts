import { useContext } from 'react';
import { updateBalancesHidden } from '../store/actions';
import { Store } from '../store/store-reducer';

export function useCensorDigits() {
	const { state, dispatch } = useContext(Store);

	const changeCensor = () => {
		updateBalancesHidden(dispatch, !state.isBalancesHidden);
	};

	const censorValue = (number: number | string): string | number => {
		if (state.isBalancesHidden) {
			return number.toString().replace(/\d/g, '*');
		}
		return number;
	};

	return { changeCensor, censorValue };
}
