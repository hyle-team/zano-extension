import CryptoJS from "crypto-js";

export default class ConnectKeyUtils {
    static setConnectData(key, publicKey, walletPort, extPass) {
        const data = JSON.stringify({ token: key, publicKey: publicKey, port: walletPort });
        localStorage.setItem("connectKey", CryptoJS.AES.encrypt(data, extPass).toString());
    }

    static getConnectKeyEncrypted() {
        return localStorage.getItem("connectKey");
    }
    
    static getConnectData(password) {
        const encrypted = localStorage.getItem("connectKey");
        const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
        const data = JSON.parse(decrypted);
        return data;
    }
}