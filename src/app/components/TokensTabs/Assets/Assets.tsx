import React, { useContext, useEffect } from 'react';
import Decimal from 'decimal.js';
import WhitelistIconImage from '../../UI/WhitelistIconImage';
import { useCensorDigits } from '../../../hooks/useCensorDigits';
import { Store } from '../../../store/store-reducer';
import s from './Assets.module.scss';
import { ZANO_ASSET_ID } from '../../../../constants';

function AssetPrice({ assetId, balance }: { assetId: string; balance: number }) {
	const { state } = useContext(Store);
	const { censorValue } = useCensorDigits();

	const [assetPrice, setAssetPrice] = React.useState<number | null>(null);

	useEffect(() => {
		if (assetId === ZANO_ASSET_ID) {
			setAssetPrice(state.priceData.change);
			return;
		}

		fetch(`https://explorer.zano.org/api/price?asset_id=${assetId}`)
			.then((response) => response.json())
			.then((response) => {
				if (response.data && response.data.usd) {
					setAssetPrice(response.data.usd);
				} else {
					setAssetPrice(0);
				}
			})
			.catch((error) => {
				console.error('Error fetching asset price:', error);
				setAssetPrice(0);
			});
	}, [assetId]);

	const fiatBalance = (Number(balance) * (assetPrice || 0)).toFixed(2);
	const price = censorValue(fiatBalance);

	if (assetPrice === null) {
		return <>...</>;
	}

	return <>${price}</>;
}

const Assets = () => {
	const { state } = useContext(Store);
	const { censorValue } = useCensorDigits();
	return (
		<div>
			{state.wallet.assets.map((asset) => {
				return (
					<div className={s.asset} key={asset.assetId}>
						{/* <button className={s.assetRemoveBtn} onClick={remove}>
              <img src={crossIcon} alt="CrossIcon" />
            </button> */}
						<button className={s.assetBody}>
							<span className={s.assetTitle}>
								{/* {getIconImage(asset)} */}
								<WhitelistIconImage asset={asset} />
								{asset.name}
							</span>
							<span className={s.assetInfo}>
								<div>
									<div className={s.assetInfoLabel}>Balance</div>
									<div className={s.assetInfoValue}>
										<span>
											{censorValue(
												new Decimal(asset.balance)
													.toSignificantDigits(20)
													.toString(),
											)}
										</span>{' '}
										{asset.ticker}
									</div>
								</div>
								<div>
									<div className={s.assetInfoLabel}>Value</div>
									<div className={s.assetInfoValue}>
										<AssetPrice
											assetId={asset.assetId}
											balance={asset.balance}
										/>
									</div>
								</div>
							</span>
						</button>
					</div>
				);
			})}
			{/* <MyButton style={{ transform: "translateY(30%)" }}>
        <img src={plusIcon} alt="PlusIcon" /> Add Custom Token
      </MyButton> */}
		</div>
	);
};

export default Assets;
