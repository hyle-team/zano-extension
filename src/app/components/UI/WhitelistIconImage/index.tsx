import DOMPurify from 'dompurify';
import React, { useEffect, useMemo, useState } from 'react';
import { BANDIT_ASSET_ID, ZANO_ASSET_ID } from '../../../../constants';
import customTokenIcon from '../../../assets/tokens-svg/custom-token.svg';
import zanoIcon from '../../../assets/tokens-svg/zano.svg';
import banditIcon from '../../../assets/tokens-svg/bandit-icon.svg';
import { WhitelistIconImageProps } from './types';

function WhitelistIconImage({ asset, width, height, className }: WhitelistIconImageProps) {
	const [whitelistData, setWhitelistData] = useState<{
		assets: { asset_id: string; logo: string }[];
	} | null>(null);

	useEffect(() => {
		fetch('https://api.zano.org/assets_whitelist.json')
			.then((response) => response.json())
			.then(setWhitelistData)
			.catch((error) => console.error('Error fetching asset whitelist:', error));
	}, []);

	const matchedAsset = useMemo(() => {
		return whitelistData?.assets.find((item) => item.asset_id === asset.assetId);
	}, [whitelistData, asset.assetId]);

	const style: React.CSSProperties | undefined =
		width || height
			? {
					width,
					height,
					display: 'inline-block',
				}
			: undefined;

	if (matchedAsset?.logo) {
		const cleanSVG = DOMPurify.sanitize(matchedAsset.logo, {
			USE_PROFILES: { svg: true },
		});

		return (
			<span
				className={className}
				style={style}
				dangerouslySetInnerHTML={{ __html: cleanSVG }}
			/>
		);
	}

	if (ZANO_ASSET_ID === asset.assetId) {
		return <img src={zanoIcon} alt="ZanoIcon" className={className} style={style} />;
	}

	if (BANDIT_ASSET_ID === asset.assetId) {
		return <img src={banditIcon} alt="BanditIcon" className={className} style={style} />;
	}

	return <img src={customTokenIcon} alt="CustomTokenIcon" className={className} style={style} />;
}

export default WhitelistIconImage;
