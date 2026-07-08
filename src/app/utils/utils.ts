/* global chrome */
import Big from 'big.js';
import Decimal from 'decimal.js';
import * as NobleHashesScrypt from '@noble/hashes/scrypt.js';
import * as NobleUtils from '@noble/hashes/utils.js';
import CryptoJS from 'crypto-js';
import {
	PASSWORD_HASH_SALT_STORAGE_KEY,
	PASSWORD_HASH_STORAGE_KEY,
	PASSWORD_HASH_STORAGE_KEY_DEPRECATED,
} from '../../constants';

interface BackgroundResponse {
	password: string;
}

export async function fetchBackground(data: {
	method: string;
	password?: string;
	id?: number;
	success?: boolean;
	credentials?: { port: string };
	alias?: string;
	address?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
	return new Promise((resolve, reject) => {
		try {
			chrome.runtime.sendMessage(data, (response) => {
				resolve(response);
			});
		} catch (error) {
			console.error(`Error while fetching data (${data.method}):`, error);
			reject(error);
		}
	});
}

export const removeZeros = (amount: string | number, decimal_point = 12): string => {
	const multiplier = new Big(10).pow(decimal_point);
	const bigAmount = new Big(amount);
	const fixedAmount = bigAmount.div(multiplier).toString();
	return fixedAmount;
};

export const addZeros = (amount: string | number, decimal_point = 12): Big => {
	const multiplier = new Big(10).pow(decimal_point);
	const bigAmount = new Big(amount);
	const fixedAmount = bigAmount.times(multiplier);
	return fixedAmount;
};

export const scrypt = async ({
	str,
	saltBuffer,
}: {
	str: string;
	saltBuffer: Uint8Array;
}): Promise<Uint8Array> => {
	const hashBuffer = await NobleHashesScrypt.scryptAsync(str, saltBuffer, {
		N: 2 ** 14,
		r: 8,
		p: 1,
		dkLen: 32,
	});

	return hashBuffer;
};

export const clearDeprecatedPasswordStorageData = (): void => {
	localStorage.removeItem(PASSWORD_HASH_STORAGE_KEY_DEPRECATED);
};

export const setPassword = async (password: string): Promise<void> => {
	const salt = CryptoJS.lib.WordArray.random(128).toString(CryptoJS.enc.Hex);
	const saltBuffer = NobleUtils.hexToBytes(salt);

	const hashBytes = await scrypt({ str: password, saltBuffer });
	const hash = NobleUtils.bytesToHex(hashBytes);

	localStorage.setItem(PASSWORD_HASH_STORAGE_KEY, hash);
	localStorage.setItem(PASSWORD_HASH_SALT_STORAGE_KEY, salt);
};

type ComparePasswordsResult =
	| {
			success: true;
			doesPasswordMatch: boolean;
	  }
	| {
			success: false;
			error: 'NO_PASSWORD_OR_HASH';
	  };
export const comparePasswords = async (password: string): Promise<ComparePasswordsResult> => {
	const hash = localStorage.getItem(PASSWORD_HASH_STORAGE_KEY);
	const salt = localStorage.getItem(PASSWORD_HASH_SALT_STORAGE_KEY);

	if (!hash || !salt) {
		return { success: false, error: 'NO_PASSWORD_OR_HASH' };
	}

	const saltBuffer = NobleUtils.hexToBytes(salt);

	const newHashBytes = await scrypt({ str: password, saltBuffer });
	const newHash = NobleUtils.bytesToHex(newHashBytes);

	return { success: true, doesPasswordMatch: newHash === hash };
};

export const passwordExists = (): boolean =>
	!!(
		localStorage.getItem(PASSWORD_HASH_STORAGE_KEY) &&
		localStorage.getItem(PASSWORD_HASH_SALT_STORAGE_KEY)
	);

export const getSessionPassword = async (): Promise<string> => {
	const sessionPass = (await fetchBackground({ method: 'GET_PASSWORD' })) as BackgroundResponse;
	return sessionPass.password;
};

export const setSessionPassword = async (password: string): Promise<void> => {
	await fetchBackground({ method: 'SET_PASSWORD', password });
};

export const shortenAddress = (address: string | undefined, startAmount = 5, endAmount = 3) => {
	if (!address) {
		return '';
	}
	return `${address.slice(0, startAmount)}...${address.slice(-endAmount)}`;
};

export function truncateToDecimals(value: string, decimalPoints: number) {
	const decimal = new Decimal(value);

	return decimal.toDecimalPlaces(decimalPoints, Decimal.ROUND_DOWN).toFixed();
}

export function isPositiveFloatStr(
	input: string,
	{ allowCommaSeparator }: { allowCommaSeparator?: boolean } = {},
): boolean {
	const regExp = allowCommaSeparator ? /^\d+([.,]\d*)?$/ : /^\d+(\.\d*)?$/;
	return regExp.test(input);
}

export function normalizeOrigin(origin: string) {
	try {
		return new URL(origin).origin;
	} catch {
		return origin;
	}
}

// A message is from the extension's own UI only when its sender URL parses to the
// extension origin (chrome-extension://<id>). Content scripts share the extension id
// but carry the web page's origin, so substring/id checks are not a trust boundary.

const EXTENSION_ORIGIN = new URL(chrome.runtime.getURL('/')).origin;

export function isExtensionFrontend(sender: chrome.runtime.MessageSender): boolean {
	if (!sender.url || sender.id !== chrome.runtime.id) return false;
	try {
		return new URL(sender.url).origin === EXTENSION_ORIGIN;
	} catch {
		return false;
	}
}

// Only HTTPS, or HTTP on an explicit loopback host, is treated as a secure origin.
// A prefix check like startsWith('http://localhost') wrongly admits http://localhost.evil.com.
export function isSecureOrigin(origin: string): boolean {
	try {
		const { protocol, hostname } = new URL(origin);
		const isLoopback =
			hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
		return protocol === 'https:' || (protocol === 'http:' && isLoopback);
	} catch {
		return false;
	}
}
