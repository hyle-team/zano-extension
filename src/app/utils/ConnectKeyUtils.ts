import CryptoJS from "crypto-js";

interface ConnectData {
  token: string;
  port: string;
}

export default class ConnectKeyUtils {
  static setConnectData(key: string, walletPort: string, extPass: string): void {
    const data: ConnectData = { token: key, port: walletPort };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), extPass).toString();
    localStorage.setItem("connectKey", encrypted);
  }

  static getConnectKeyEncrypted(): string | null {
    return localStorage.getItem("connectKey");
  }

  static getConnectData(password: string): ConnectData | null {
    const encrypted = localStorage.getItem("connectKey");
    if (!encrypted) return null;
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) return null;
    
    try {
      const data: ConnectData = JSON.parse(decrypted);
      return data;
    } catch (error) {
      return null;
    }
  }
}
