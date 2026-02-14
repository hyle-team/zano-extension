import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import bitcoinIcon from '../../../../assets/tokens-svg/bitcoin.svg';
import customTokenIcon from '../../../../assets/tokens-svg/custom-token.svg';
import ethIcon from '../../../../assets/tokens-svg/eth.svg';
import zanoIcon from '../../../../assets/tokens-svg/zano.svg';
import arrowIcon from '../../../../assets/svg/arrow-select.svg';
import { Store } from '../../../../store/store-reducer';
import mainStyles from '../../WalletSend.module.scss';
import s from './AssetsSelect.module.scss';
import { classNames } from '../../../../utils/classNames';
import WhitelistIconImage from '../../../UI/WhitelistIconImage';

interface Asset {
	name: string;
	assetId: string;
}

interface AssetsSelectProps {
	value: Asset;
	setValue: Dispatch<SetStateAction<Asset>>;
}

const AssetsSelect = ({ value, setValue }: AssetsSelectProps) => {
	const { state } = useContext(Store);
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
	const selectRef = useRef<HTMLDivElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (focusedIndex === null || focusedIndex === state.wallet.assets.length - 1) {
				setFocusedIndex(0);
			} else {
				setFocusedIndex((prevIndex) => Number(prevIndex) + 1);
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (focusedIndex === null || focusedIndex === 0) {
				setFocusedIndex(state.wallet.assets.length - 1);
			} else {
				setFocusedIndex((prevIndex) => Number(prevIndex) - 1);
			}
		}
	};

	useEffect(() => {
		if (focusedIndex !== null && selectRef.current) {
			const { childNodes } = selectRef.current;
			if (childNodes && childNodes[focusedIndex as number]) {
				(childNodes[focusedIndex as number] as HTMLElement).focus();
			}
		}
	}, [focusedIndex]);

	function openHandler() {
		setIsOpen(!isOpen);
	}

	function setValueHandler(asset: Asset) {
		setValue(asset);
		setIsOpen(false);
	}

	return (
		<div onClick={() => setIsOpen(false)} onKeyDown={handleKeyDown}>
			<div className={mainStyles.label}>Asset:</div>
			<div onClick={(e) => e.stopPropagation()} className={s.select}>
				<button
					onClick={openHandler}
					className={isOpen ? `${s.selectValue} ${s.active}` : s.selectValue}
				>
					<span>
						<WhitelistIconImage asset={value} />
						{value.name}
					</span>
					<span className={s.valueArrow}>
						<img src={arrowIcon} alt="arrow" />
					</span>
				</button>

				<div className={classNames(s.options, { [s.active]: isOpen })} ref={selectRef}>
					{state.wallet.assets.map((asset) => (
						<button
							data-active={asset.assetId === value.assetId}
							className={s.option}
							key={asset.assetId}
							onClick={() => setValueHandler(asset)}
						>
							<WhitelistIconImage asset={asset} />
							{asset.name}
							<span className={s.selectPoint} />
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default AssetsSelect;
