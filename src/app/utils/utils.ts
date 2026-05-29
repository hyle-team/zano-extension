/* global chrome */
import Big from 'big.js';
import Decimal from 'decimal.js';
import * as NobleHashesScrypt from '@noble/hashes/scrypt.js';
import * as NobleUtils from '@noble/hashes/utils.js';
import CryptoJS from 'crypto-js';

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

export const SET_PASSWORD_FAILED_TO_GENERATE_SALT_ERR = 'SET_PASSWORD_FAILED_TO_GENERATE_SALT_ERR';
export const setPassword = async (password: string): Promise<void> => {
	const salt = CryptoJS.lib.WordArray.random(128).toString(CryptoJS.enc.Hex);
	const saltBytes = NobleUtils.hexToBytes(salt);

	if (!salt) {
		throw new Error(SET_PASSWORD_FAILED_TO_GENERATE_SALT_ERR);
	}

	const hashBytes = await NobleHashesScrypt.scryptAsync(password, saltBytes, {
		N: 2 ** 16,
		r: 8,
		p: 1,
		dkLen: 32,
	});
	const hash = NobleUtils.bytesToHex(hashBytes);

	localStorage.setItem('hash', hash);
	localStorage.setItem('salt', salt);
};

export const COMPARE_PASSWORD_NO_PASSWORD_OR_HASH_ERR = 'COMPARE_PASSWORD_NO_PASSWORD_OR_HASH_ERR';
export const comparePasswords = async (password: string): Promise<boolean> => {
	const hash = localStorage.getItem('hash');
	const salt = localStorage.getItem('salt');

	if (!hash || !salt) {
		throw new Error(COMPARE_PASSWORD_NO_PASSWORD_OR_HASH_ERR);
	}

	const saltBytes = NobleUtils.hexToBytes(salt);

	const newHashBytes = await NobleHashesScrypt.scryptAsync(password, saltBytes, {
		N: 2 ** 16,
		r: 8,
		p: 1,
		dkLen: 32,
	});
	const newHash = NobleUtils.bytesToHex(newHashBytes);

	return newHash === hash;
};

export const passwordExists = (): boolean => !!localStorage.getItem('hash');

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
