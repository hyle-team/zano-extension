import React, { memo, useState } from 'react';
import cls from './ExpandableAssetId.module.scss';
import chevronIcon from '../../../../assets/svg/arrow-blue.svg';
import copyIcon from '../../../../assets/svg/copy.svg';
import checkIcon from '../../../../assets/svg/check-icon.svg';
import { useCopy } from '../../../../hooks/useCopy';
import WhitelistIconImage from '../../../UI/WhitelistIconImage';

interface ExpandableAssetIdProps {
	label: string;
	value: string;
	prefixLength?: number;
	suffixLength?: number;
}

export const ExpandableAssetId = memo((props: ExpandableAssetIdProps) => {
	const { label, value, prefixLength = 6, suffixLength = 6 } = props;
	const [expanded, setExpanded] = useState(false);
	const { copyToClipboard, copied } = useCopy();

	const truncatable = value.length > prefixLength + suffixLength + 1;

	return (
		<div className={cls.wrapper}>
			<div className={cls.row}>
				<h5 className={cls.label}>{label}</h5>

				{truncatable ? (
					<button
						type="button"
						className={cls.chip}
						onClick={() => setExpanded((prev) => !prev)}
						aria-expanded={expanded}
					>
						<WhitelistIconImage width={16} height={16} asset={{ assetId: value }} />
						<span className={cls.chipText}>
							{value.slice(0, prefixLength)}…{value.slice(-suffixLength)}
						</span>
						<img
							className={cls.chevron}
							style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
							src={chevronIcon}
							alt=""
							width={12}
							height={12}
						/>
					</button>
				) : (
					<span className={cls.shortValue}>
						<WhitelistIconImage width={16} height={16} asset={{ assetId: value }} />
						<span>{value}</span>
					</span>
				)}
			</div>

			{truncatable && expanded && (
				<div className={cls.fullBox}>
					<span className={cls.fullText}>{value}</span>
					<button
						type="button"
						className={cls.copyBtn}
						onClick={() => copyToClipboard(value)}
						aria-label={copied ? 'copied' : 'copy'}
					>
						<img src={copied ? checkIcon : copyIcon} alt="" width={18} height={18} />
						<span className={cls.tooltip}>{copied ? 'copied!' : 'copy'}</span>
					</button>
				</div>
			)}
		</div>
	);
});

export default ExpandableAssetId;
