import React, { useEffect, useRef } from 'react';

const FAVICON_TIMEOUT_MS = 15_000;

interface FaviconImgProps {
	src: string;
	alt: string;
	className?: string;
	onLoad?: () => void;
	onError?: () => void;
}

const FaviconImg = ({ src, alt, className, onLoad, onError }: FaviconImgProps) => {
	const imgRef = useRef<HTMLImageElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const img = imgRef.current;
		if (!img) return;
		timeoutRef.current = setTimeout(() => {
			img.src = '';
		}, FAVICON_TIMEOUT_MS);
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	const handleLoad = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		onLoad?.();
	};

	const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		e.currentTarget.style.display = 'none';

		onError?.();
	};

	return (
		<img
			ref={imgRef}
			className={className}
			src={src}
			alt={alt}
			referrerPolicy="no-referrer"
			crossOrigin="anonymous"
			onLoad={handleLoad}
			onError={handleError}
		/>
	);
};

export default FaviconImg;
