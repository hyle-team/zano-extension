import copy from 'copy-to-clipboard';
import { useState } from 'react';

export const useCopy = () => {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = (text: string) => {
		copy(text);
		if (!copied) {
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		}
	};

	return {
		copyToClipboard,
		copied,
	};
};
