/* global chrome */
import Big from 'big.js';
import Decimal from 'decimal.js';
import sha256 from 'sha256';

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

export const setPassword = (password: string): void => {
	localStorage.setItem('hash', sha256(password));
};

export const comparePasswords = (password: string): boolean => {
	const hash = localStorage.getItem('hash');
	return hash === sha256(password);
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
