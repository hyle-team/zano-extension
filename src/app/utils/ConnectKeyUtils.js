import CryptoJS from "crypto-js";

export default class ConnectKeyUtils {
    static setConnectKey(key, extPass) {
        localStorage.setItem("connectKey", CryptoJS.AES.encrypt(key, extPass).toString());
    }

    static getConnectKeyEncrypted() {
        return localStorage.getItem("connectKey");
    }
}