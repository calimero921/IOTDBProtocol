const crypto = require('crypto');
const Log4n = require('../../../utils/log4n.js');

const algorithm = 'aes256';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';

class Cipher{
    constructor(context) {
        const log4n = new Log4n(this.context,'/models/api/device/cipher/constructor');
        this.context = context;
        log4n.debug('Done - Ok')
    }

    encode(inputDatas, device) {
        const log4n = new Log4n(this.context,'/models/api/device/cipher/encode');
        log4n.object(inputDatas, 'inpurDatas');
        log4n.object(device, 'device');

        if (typeof device !== 'undefined') {
            if (typeof device.key !== 'undefined') {
                log4n.object(device.key, 'key');
                let cipher = crypto.createCipher(algorithm, device.key);
                let ciphered = cipher.update(JSON.stringify(inputDatas), inputEncoding, outputEncoding);
                ciphered += cipher.final(outputEncoding);
                log4n.debug('Done - ok');
                return ciphered;
            } else {
                log4n.debug('Done - No device key');
            }
        } else {
            log4n.debug('Done - No device');
        }
    }

    decode(inputDatas, device) {
        const log4n = new Log4n(this.context,'/models/api/device/cipher/decode');
        log4n.object(inputDatas, 'inpurDatas');
        log4n.object(device, 'device');

        if (typeof device !== 'undefined') {
            if (typeof device.key !== 'undefined') {
                log4n.object(device.key, 'key');
                let decipher = crypto.createDecipher(algorithm, device.key);
                let deciphered = decipher.update(inputDatas, outputEncoding, inputEncoding);
                deciphered += decipher.final(inputEncoding);
                log4n.debug('Done - ok');
                return JSON.parse(deciphered);
            } else {
                log4n.debug('Done - No device key');
            }
        } else {
            log4n.debug('Done - No device');
        }
    }
}

module.exports = Cipher;