/* global chrome */
import Big from 'big.js';
import Decimal from 'decimal.js';
import sha256 from 'sha256';

interface BackgroundResponse {
	password: string;
}

interface ValidationResult {
	valid: boolean;
	error?: string;
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

export function validateTokensInput(
	input: string | number,
	decimal_point: number,
): ValidationResult {
	if (typeof input === 'number') {
		input = input.toString();
	}

	if (input === '') {
		return {
			valid: false,
			error: 'Invalid input',
		};
	}

	input = input.replace(/[^0-9.,]/g, '');

	const MAX_NUMBER = new Decimal(2).pow(64).minus(1);

	if (decimal_point < 0 || decimal_point > 18) {
		return {
			valid: false,
			error: 'Invalid decimal point',
		};
	}

	const dotInput = input.replace(/,/g, '');

	const decimalDevider = new Decimal(10).pow(decimal_point);

	const maxAllowedNumber = MAX_NUMBER.div(decimalDevider);

	const minAllowedNumber = new Decimal(1).div(decimalDevider);

	const rounded = (() => {
		if (dotInput.replace('.', '').length > 20) {
			const decimalParts = dotInput.split('.');

			if (decimalParts.length === 2 && decimalParts[1].length > 1) {
				const roundedInput = new Decimal(dotInput).toFixed(1);

				if (roundedInput.replace(/./g, '').length <= 20) {
					return roundedInput;
				}
			}

			return false;
		}
		return dotInput;
	})();

	if (rounded === false) {
		return {
			valid: false,
			error: 'Invalid amount - number is too big or has too many decimal points',
		};
	}

	const dotInputDecimal = new Decimal(rounded);

	if (dotInputDecimal.gt(maxAllowedNumber)) {
		return {
			valid: false,
			error: 'Invalid amount - number is too big',
		};
	}

	if (dotInputDecimal.lt(minAllowedNumber)) {
		return {
			valid: false,
			error: 'Invalid amount - number is too small',
		};
	}

	return {
		valid: true,
	};
}

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
