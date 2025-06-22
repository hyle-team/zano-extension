import React from 'react';
import loader from '../../../assets/svg/loader.svg';
import cls from './Loader.module.scss';

const Loader = () => (
	<div className={cls.Loader}>
		<img src={loader} alt="loader" />
	</div>
);

export default Loader;
