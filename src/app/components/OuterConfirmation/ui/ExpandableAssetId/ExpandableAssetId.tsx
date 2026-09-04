import React, { memo, useEffect, useRef, useState } from 'react';
import cls from './ExpandableAssetId.module.scss';
import chevronIcon from '../../../../assets/svg/arrow-blue.svg';
import copyIcon from '../../../../assets/svg/copy.svg';
import checkIcon from '../../../../assets/svg/check-icon.svg';
import { useCopy } from '../../../../hooks/useCopy';
import WhitelistIconImage from '../../../UI/WhitelistIconImage';

const FALLBACK_PREVIEW_CHARS = 12;
const MIN_PREVIEW_CHARS = 4;
const ELLIPSIS = '...';

interface ExpandableAssetIdProps {
	label?: string;
	value: string;
	prefixLength?: number;
	suffixLength?: number;
}

export const ExpandableAssetId = memo((props: ExpandableAssetIdProps) => {
	const { label, value, prefixLength = 6, suffixLength = 6 } = props;
	const [expanded, setExpanded] = useState(false);
	const { copyToClipboard, copied } = useCopy();

	const labelless = !label;
	const truncatable = labelless || value.length > prefixLength + suffixLength + 1;

	const textRef = useRef<HTMLSpanElement>(null);
	const probeRef = useRef<HTMLSpanElement>(null);
	const [fittingChars, setFittingChars] = useState<number | null>(null);

	useEffect(() => {
		const textEl = textRef.current;
		const probeEl = probeRef.current;

		if (!labelless || !textEl || !probeEl || !value.length) {
			return undefined;
		}

		function measure() {
			const charWidth = (probeEl as HTMLSpanElement).offsetWidth / value.length;

			if (!charWidth) {
				return;
			}

			setFittingChars(Math.floor((textEl as HTMLSpanElement).clientWidth / charWidth));
		}

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(textEl);
		observer.observe(probeEl);

		return () => observer.disconnect();
	}, [labelless, value]);

	const sideLength =
		fittingChars === null
			? FALLBACK_PREVIEW_CHARS
			: Math.max(Math.floor((fittingChars - ELLIPSIS.length) / 2), MIN_PREVIEW_CHARS);

	const headLength = labelless ? sideLength : prefixLength;
	const tailLength = labelless ? sideLength : suffixLength;
	const preview =
		labelless && fittingChars !== null && value.length <= fittingChars
			? value
			: `${value.slice(0, headLength)}${ELLIPSIS}${value.slice(-tailLength)}`;

	return (
		<div className={cls.wrapper}>
			<div className={cls.row}>
				{!labelless && <h5 className={cls.label}>{label}</h5>}

				{truncatable ? (
					<button
						type="button"
						className={`${cls.chip} ${labelless ? cls.chipWide : ''}`}
						onClick={() => setExpanded((prev) => !prev)}
						aria-expanded={expanded}
					>
						<WhitelistIconImage
							width={16}
							height={16}
							className={cls.chipIcon}
							asset={{ assetId: value }}
						/>
						<span ref={textRef} className={cls.chipText}>
							{preview}
							{labelless && (
								<span ref={probeRef} className={cls.probe} aria-hidden="true">
									{value}
								</span>
							)}
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
						<WhitelistIconImage
							width={16}
							height={16}
							className={cls.chipIcon}
							asset={{ assetId: value }}
						/>
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
