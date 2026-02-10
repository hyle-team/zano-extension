import React, { useContext } from 'react';
import Decimal from 'decimal.js';
import WhitelistIconImage from '../../UI/WhitelistIconImage/WhitelistIconImage';
import { useCensorDigits } from '../../../hooks/useCensorDigits';
import { Store } from '../../../store/store-reducer';
import s from './Assets.module.scss';
import { ZANO_ASSET_ID } from '../../../../constants';

const Assets = () => {
	const { state } = useContext(Store);
	const { censorValue } = useCensorDigits();

	return (
		<div>
			{state.wallet.assets.map((asset) => {
				const fiatBalance = (Number(asset.balance) * state.priceData.price).toFixed(2);
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
										$
										{censorValue(
											asset.assetId === ZANO_ASSET_ID ? fiatBalance : 0,
										)}
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
