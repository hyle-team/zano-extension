import { useContext } from "react";
import { Store } from "../store/store-reducer";


export default function useGetAsset() {
    const {state} = useContext(Store);

    function getAssetById(id) {
        return state.wallet.assets.find(asset => asset.assetId === id);
    }

    return { getAssetById };
}