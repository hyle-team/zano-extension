import React, { useContext } from 'react';
import Decimal from 'decimal.js';
import bitcoinIcon from '../../../assets/tokens-svg/bitcoin.svg';
import banditIcon from '../../../assets/tokens-svg/bandit-icon.svg';
import customTokenIcon from '../../../assets/tokens-svg/custom-token.svg';
import ethIcon from '../../../assets/tokens-svg/eth.svg';
import zanoIcon from '../../../assets/tokens-svg/zano.svg';
import { useCensorDigits } from '../../../hooks/useCensorDigits';
import { Store } from '../../../store/store-reducer';
import s from './Assets.module.scss';

interface Asset {
	name: string;
	ticker: string;
	balance: number;
	lockedBalance?: number;
	value: number;
}

const getIconImage = (asset: Asset) => {
	switch (asset.name) {
		case 'Zano':
			return <img src={zanoIcon} alt="ZanoIcon" />;
		case 'Wrapped Bitcoin':
			return <img src={bitcoinIcon} alt="bitcoin icon" />;
		case 'Wrapped Ethereum':
			return <img src={ethIcon} alt="EthIcon" />;
		case 'BANDIT':
			return <img src={banditIcon} alt="bandit icon" />;
		default:
			return <img src={customTokenIcon} alt="CustomTokenIcon" />;
	}
};

const Assets = () => {
	const { state } = useContext(Store);
	const { censorValue } = useCensorDigits();

	return (
		<div>
			{state.wallet.assets.map((asset) => {
				const fiatBalance = (Number(asset.balance) * state.priceData.price).toFixed(2);
				return (
					<div className={s.asset} key={asset.name}>
						{/* <button className={s.assetRemoveBtn} onClick={remove}>
              <img src={crossIcon} alt="CrossIcon" />
            </button> */}
						<button className={s.assetBody}>
							<span className={s.assetTitle}>
								{getIconImage(asset)}
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
										${censorValue(asset.name === 'Zano' ? fiatBalance : 0)}
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
