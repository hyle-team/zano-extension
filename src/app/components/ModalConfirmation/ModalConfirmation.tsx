import React, { useCallback, useContext } from 'react';
import cls from './ModalConfirmation.module.scss';
import Modal from '../UI/Modal/Modal';
import Button, { ButtonThemes } from '../UI/Button/Button';
import { Store } from '../../store/store-reducer';

interface ModalConfirmationProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const ModalConfirmation = ({ isOpen, onClose, onConfirm }: ModalConfirmationProps) => {
	const { state } = useContext(Store);
	const { method, params } = state.confirmationModal || {};

	const closeHandler = useCallback(() => {
		onClose();
	}, [onClose]);

	const confirmHandler = useCallback(() => {
		onConfirm();
	}, [onConfirm]);

	return (
		<Modal isOpen={isOpen} onClose={closeHandler}>
			<div className={cls.ConfirmationModal}>
				<div className={cls.title}>Confirmation</div>
				<div className={cls.subTitle}>Confirm and send tx</div>
				<div className={cls.table}>
					<div className={cls.tableRow}>
						<div className={cls.label}>method:</div>
						<div className={cls.value}>{method}</div>
					</div>
					<div className={cls.tableRow}>
						<div className={cls.label}>params:</div>
						<div className={cls.value}>
							{Array.isArray(params) &&
								params.map((param: string) => <span key={param}>{param}</span>)}
						</div>
					</div>
				</div>
				<div className={cls.actions}>
					<Button onClick={closeHandler} theme={ButtonThemes.Outline}>
						Cancel
					</Button>
					<Button onClick={confirmHandler}>Sign</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ModalConfirmation;
