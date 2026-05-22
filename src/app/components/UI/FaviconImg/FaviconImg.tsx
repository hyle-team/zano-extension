import React, { useEffect, useRef } from 'react';

const FAVICON_TIMEOUT_MS = 15_000;

interface FaviconImgProps {
	src: string;
	alt: string;
	className?: string;
}

const FaviconImg = ({ src, alt, className }: FaviconImgProps) => {
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
			onError={(e) => {
				e.currentTarget.style.display = 'none';
			}}
		/>
	);
};

export default FaviconImg;
