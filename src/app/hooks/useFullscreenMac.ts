import { useEffect } from 'react';

export function useFullscreenMac(className = 'app-fullscreen') {
	const isMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);

	if (!isMacOS) return;

	useEffect(() => {
		const checkFullscreen = () => {
			const fullscreenElement =
				document.fullscreenElement ||
				(document as unknown as { webkitFullscreenElement: boolean })
					.webkitFullscreenElement ||
				(document as unknown as { mozFullScreenElement: boolean }).mozFullScreenElement;

			const displayModeFullscreen =
				window.matchMedia?.('(display-mode: fullscreen)').matches ?? false;

			const outerFullscreen =
				Math.abs(window.outerHeight - window.screen.height) < 2 &&
				Math.abs(window.outerWidth - window.screen.width) < 2;

			const visualFullscreen =
				window.visualViewport &&
				Math.abs(window.visualViewport.height - window.screen.height) < 2;

			const isFullscreen = Boolean(
				fullscreenElement || displayModeFullscreen || outerFullscreen || visualFullscreen,
			);

			document.body.classList.toggle(className, isFullscreen);
			document.documentElement.classList.toggle(className, isFullscreen);
		};

		checkFullscreen();

		window.addEventListener('resize', checkFullscreen);
		document.addEventListener('fullscreenchange', checkFullscreen);

		const interval = setInterval(checkFullscreen, 500);

		return () => {
			window.removeEventListener('resize', checkFullscreen);
			document.removeEventListener('fullscreenchange', checkFullscreen);
			clearInterval(interval);
		};
	}, [className]);
}
