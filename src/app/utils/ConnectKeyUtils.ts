import CryptoJS from 'crypto-js';
import * as NobleHashesScrypt from '@noble/hashes/scrypt.js';
import * as NobleUtils from '@noble/hashes/utils.js';

interface ConnectData {
	token: string;
	port: string;
}

interface StoredBlob {
	/** Version of the stored blob format */
	v: 1;
	salt: string;
	/** Initialization vector for AES encryption (hex encoded) */
	iv: string;
	/** Cipher text for AES encryption (hex encoded) */
	ct: string;
}

type GetConnectDataResult =
	| {
			success: true;
			connectData: ConnectData;
	  }
	| {
			success: false;
			error: 'CONNECT_DATA_NOT_SET' | 'CONNECT_DATA_CORRUPTED' | 'WRONG_DECRYPTION_RESULT';
	  };

export default class ConnectKeyUtils {
	private static readonly DEFAULT_KDF_PARAMS = { N: 2 ** 16, r: 8, p: 1, dkLen: 32 } as const;
	private static readonly CONNECT_KEY_STORAGE_KEY_DEPRECATED = 'connectKey';
	private static readonly CONNECT_KEY_STORAGE_KEY = 'connectKey2';

	private static async deriveKey(password: string, saltBuffer: Uint8Array): Promise<Uint8Array> {
		return NobleHashesScrypt.scryptAsync(
			password,
			saltBuffer,
			ConnectKeyUtils.DEFAULT_KDF_PARAMS,
		);
	}

	static async setConnectData(
		connectKey: string,
		walletPort: string,
		extensionPassword: string,
	): Promise<void> {
		localStorage.removeItem(ConnectKeyUtils.CONNECT_KEY_STORAGE_KEY_DEPRECATED);

		const connectData: ConnectData = { token: connectKey, port: walletPort };
		const connectDataJson = JSON.stringify(connectData);

		const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
		const keyBuffer = await ConnectKeyUtils.deriveKey(extensionPassword, saltBuffer);
		const keyWordArrayBuffer = CryptoJS.lib.WordArray.create(keyBuffer);

		const ivBuffer = CryptoJS.lib.WordArray.random(16);

		const { ciphertext: connectDataEncrypted } = CryptoJS.AES.encrypt(
			connectDataJson,
			keyWordArrayBuffer,
			{
				iv: ivBuffer,
			},
		);

		const storedBlob: StoredBlob = {
			v: 1,
			salt: NobleUtils.bytesToHex(saltBuffer),
			iv: ivBuffer.toString(CryptoJS.enc.Hex),
			ct: connectDataEncrypted.toString(CryptoJS.enc.Hex),
		};
		localStorage.setItem(ConnectKeyUtils.CONNECT_KEY_STORAGE_KEY, JSON.stringify(storedBlob));
	}

	static getConnectKeyEncrypted(): string | null {
		return localStorage.getItem(ConnectKeyUtils.CONNECT_KEY_STORAGE_KEY);
	}

	static async getConnectData(password: string): Promise<GetConnectDataResult> {
		const storedBlobJson = localStorage.getItem(ConnectKeyUtils.CONNECT_KEY_STORAGE_KEY);
		if (!storedBlobJson) {
			return { success: false, error: 'CONNECT_DATA_NOT_SET' };
		}

		let storedBlob: StoredBlob;

		try {
			storedBlob = JSON.parse(storedBlobJson);
		} catch {
			return { success: false, error: 'CONNECT_DATA_CORRUPTED' };
		}
		if (storedBlob.v !== 1) {
			return { success: false, error: 'CONNECT_DATA_CORRUPTED' };
		}

		const saltBuffer = NobleUtils.hexToBytes(storedBlob.salt);
		const keyBuffer = await ConnectKeyUtils.deriveKey(password, saltBuffer);
		const keyWordArrayBuffer = CryptoJS.lib.WordArray.create(keyBuffer);

		const ivBuffer = CryptoJS.enc.Hex.parse(storedBlob.iv);
		const cipherTextBuffer = CryptoJS.enc.Hex.parse(storedBlob.ct);

		const cipherParams = CryptoJS.lib.CipherParams.create({
			ciphertext: cipherTextBuffer,
		});
		const connectDataBuffer = CryptoJS.AES.decrypt(cipherParams, keyWordArrayBuffer, {
			iv: ivBuffer,
		});

		let connectData: ConnectData;

		try {
			const connectDataJson = connectDataBuffer.toString(CryptoJS.enc.Utf8);
			connectData = JSON.parse(connectDataJson) as ConnectData;
		} catch {
			return { success: false, error: 'WRONG_DECRYPTION_RESULT' };
		}

		return { success: true, connectData };
	}

	static clearDeprecatedConnectKey() {
		localStorage.removeItem(ConnectKeyUtils.CONNECT_KEY_STORAGE_KEY_DEPRECATED);
	}
}
