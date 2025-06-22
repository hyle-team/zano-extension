import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './app/store/store-reducer';
import App from './app/App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<StoreProvider>
			<App />
		</StoreProvider>
	</React.StrictMode>,
);
