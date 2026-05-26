import React, { memo, useState } from 'react';
import cls from './ExpandableAddress.module.scss';

interface ExpandableAddressProps {
	value: string;
	prefixLength?: number;
	suffixLength?: number;
	className?: string;
}

export const ExpandableAddress = memo((props: ExpandableAddressProps) => {
	const { value, prefixLength = 12, suffixLength = 12, className } = props;
	const [expanded, setExpanded] = useState(false);

	const needsTruncation = value.length > prefixLength + suffixLength + 3;

	const containerClass = [cls.container, className].filter(Boolean).join(' ');

	if (!needsTruncation) {
		return (
			<div className={containerClass}>
				<span className={cls.value}>{value}</span>
			</div>
		);
	}

	const displayed = expanded
		? value
		: `${value.slice(0, prefixLength)}...${value.slice(-suffixLength)}`;

	return (
		<div className={containerClass}>
			<span className={`${cls.value} ${expanded ? cls.full : ''}`}>{displayed}</span>
			<button
				type="button"
				className={`${cls.toggle} ${expanded ? cls.toggleBlock : ''}`}
				onClick={() => setExpanded((prev) => !prev)}
			>
				{expanded ? 'Minimize' : 'Expand'}
			</button>
		</div>
	);
});

export default ExpandableAddress;
