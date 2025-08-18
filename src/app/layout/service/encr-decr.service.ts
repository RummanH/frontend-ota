import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class EncrDecrService {
    constructor() {}

    // The set method is use for encrypt the value.
    setString(keys: any, value: any) {
        const key = CryptoJS.enc.Utf8.parse(keys);
        const iv = CryptoJS.enc.Utf8.parse(keys);
        const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    // The get method is use for decrypt the value.
    getString(keys: any, value: any) {
        const key = CryptoJS.enc.Utf8.parse(keys);
        const iv = CryptoJS.enc.Utf8.parse(keys);
        const decrypted = CryptoJS.AES.decrypt(value, key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    setObject(data: any) {
        const ciphertext: any = CryptoJS.AES.encrypt(JSON.stringify(data), environment.encryptionKey);
        return ciphertext;
    }

    getObject(data: any) {
        if (data != null) {
            const bytes = CryptoJS.AES.decrypt(data.toString(), environment.encryptionKey);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData;
        }
    }

}
