import DOMPurify from 'dompurify';
import React, { ReactElement, useEffect, useState } from 'react';
import { ZANO_ASSET_ID } from '../../../../constants';
import customTokenIcon from '../../../assets/tokens-svg/custom-token.svg';
import zanoIcon from '../../../assets/tokens-svg/zano.svg';

function WhitelistIconImage({ asset }: { asset: { assetId: string } }) {
	const [whitelistData, setWhitelistData] = useState<{
		assets: { asset_id: string; logo: string }[];
	} | null>(null);
	const [assetIcon, setAssetIcon] = useState<ReactElement | null>(null);

	useEffect(() => {
		fetch('https://api.zano.org/assets_whitelist.json')
			.then((response) => response.json())
			.then((data) => {
				setWhitelistData(data);
			})
			.catch((error) => {
				console.error('Error fetching asset whitelist:', error);
			});
	}, []);

	useEffect(() => {
		const matchedAsset = whitelistData?.assets.find(
			(item: { asset_id: string }) => item.asset_id === asset.assetId,
		);

		if (!matchedAsset?.logo) {
			setAssetIcon(null);
			return;
		}

		const cleanSVG = DOMPurify.sanitize(matchedAsset.logo, {
			USE_PROFILES: { svg: true },
		});

		setAssetIcon(<span dangerouslySetInnerHTML={{ __html: cleanSVG }} />);
	}, [whitelistData, asset]);

	if (assetIcon) {
		return <>{assetIcon}</>;
	}

	if (ZANO_ASSET_ID === asset.assetId) {
		return <img src={zanoIcon} alt="ZanoIcon" />;
	}

	return <img src={customTokenIcon} alt="CustomTokenIcon" />;
}

export default WhitelistIconImage;
