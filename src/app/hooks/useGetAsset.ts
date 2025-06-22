import { useContext } from 'react';
import { Store } from '../store/store-reducer';

interface Asset {
	assetId: string;
}

export default function useGetAsset() {
	const { state } = useContext(Store);

	function getAssetById(id: string) {
		return state.wallet.assets.find((asset: Asset | any) => asset.assetId === id);
	}

	return { getAssetById };
}
