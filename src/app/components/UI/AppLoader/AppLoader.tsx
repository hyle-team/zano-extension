import React, { useContext } from 'react';
import loader from '../../../assets/svg/loader.svg';
import logo from '../../../assets/svg/logo.svg';
import { Store } from '../../../store/store-reducer';
import s from './AppLoader.module.scss';

interface AppLoaderProps {
	isSmall?: boolean;
	firstWalletLoaded: boolean;
	loggedIn: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({ isSmall, firstWalletLoaded, loggedIn }) => {
	const { state } = useContext(Store);

	const loaderClasses = isSmall ? [s.loader, s.small].join(' ') : s.loader;

	return (
		<>
			{(state.isLoading ||
				(state.isConnected !== false && loggedIn && !firstWalletLoaded)) && (
				<div className={s.loaderWrapper}>
					<div className={s.loaderContent}>
						<div className={s.logo}>
							<img src={logo} alt="logo" />
						</div>
						<div className={loaderClasses}>
							<img src={loader} alt="loader" />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AppLoader;
