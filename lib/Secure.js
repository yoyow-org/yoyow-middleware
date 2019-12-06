import utils from './utils';
import config from '../conf/config';
import CryptoJS from 'crypto-js';
import CryptoJSAesJson from './aes-json-format';

class Secure {
  constructor() {
    this.validQueue = [
      config.security_level === 'simple' ? this.validCipher : this.validCipherV2,
      this.validTime
    ];
  }

  /**
   * 验证密文
   * @private
   */
  validCipher (req, res, next) {
    let { ct, iv, s } = req.body;
    let cipher = { ct, iv, s };
    let send = CryptoJS.AES.decrypt(JSON.stringify(cipher), config.secure_key, { format: CryptoJSAesJson }).toString(CryptoJS.enc.Utf8);
    let isValid = true;
    try {
      send = JSON.parse(send);
      isValid = send != null && typeof send === 'object';
    } catch (e) {
      isValid = false;
    } finally {
      if (isValid) {
        req.decryptedData = send;
        next();
      }
      else res.json({ code: 1005, message: '无效的操作签名' });
    }
  }

  validCipherV2 (req, res, next) {
    let { ct, iv, s } = req.body;
    let key = CryptoJS.PBKDF2(config.secure_key, CryptoJS.enc.Hex.parse(s), {
      keySize: 256 / 32,
      iterations: 100
    });
    let send = CryptoJS.AES.decrypt(CryptoJS.enc.Hex.parse(ct).toString(CryptoJS.enc.Base64), key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString(CryptoJS.enc.Utf8);
    send = send.toString(CryptoJS.enc.Utf8);
    let isValid = true;
    try {
      send = JSON.parse(send);
      isValid = send != null && typeof send === 'object';
    } catch (e) {
      isValid = false;
    } finally {
      if (isValid) {
        req.decryptedData = send;
        next();
      }
      else res.json({ code: 1005, message: '无效的操作签名' });
    }
  }

  /**
   * 验证操作时间
   * @private
   */
  validTime (req, res, next) {
    let { time } = req.decryptedData;
    if (!time || typeof time !== 'number') {
      res.json({ code: 1004, message: '无效的操作时间' });
      return;
    }
    let diff = (Date.now() - time) / 1000;
    if (diff > config.secure_ageing) {
      res.json({ code: 1003, message: '请求已过期.' });
      return;
    }
    next();
  }
}

let secure = new Secure();

export default secure;
