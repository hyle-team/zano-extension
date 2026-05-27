import React, { memo } from 'react';
import cls from './CopyableParam.module.scss';
import copyIcon from '../../../../assets/svg/copy.svg';
import checkIcon from '../../../../assets/svg/check-icon.svg';
import { useCopy } from '../../../../hooks/useCopy';

interface CopyableParamProps {
	label: string;
	value: string;
	prefixLength?: number;
	suffixLength?: number;
}

export const CopyableParam = memo((props: CopyableParamProps) => {
	const { label, value, prefixLength = 10, suffixLength = 10 } = props;
	const { copyToClipboard, copied } = useCopy();

	const truncatable = value.length > prefixLength + suffixLength + 1;
	const display = truncatable
		? `${value.slice(0, prefixLength)}…${value.slice(-suffixLength)}`
		: value;

	return (
		<div className={cls.wrapper}>
			<div className={cls.row}>
				<h5 className={cls.label}>{label}</h5>

				<button
					type="button"
					className={cls.chip}
					onClick={() => copyToClipboard(value)}
					aria-label={copied ? 'copied' : 'copy'}
				>
					<span className={cls.chipText}>{display}</span>
					<img
						className={cls.copyIcon}
						src={copied ? checkIcon : copyIcon}
						alt=""
						width={14}
						height={14}
					/>
				</button>
			</div>
		</div>
	);
});

export default CopyableParam;
