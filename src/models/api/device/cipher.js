const crypto = require('crypto');
const Log4n = require('../../../utils/log4n.js');

const log4n = new Log4n('/models/api/cipher');
const algorithm = 'aes256';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';

function Cipher() {
}

Cipher.prototype.encode = function (inputDatas, device) {
    log4n.debug('encode starting');
    log4n.object(inputDatas, 'inpurDatas');
    log4n.object(device, 'device');

    if (typeof device !== 'undefined') {
        if (typeof device.key !== 'undefined') {
            log4n.object(device.key, 'key');
            let cipher = crypto.createCipher(algorithm, device.key);
            let ciphered = cipher.update(JSON.stringify(inputDatas), inputEncoding, outputEncoding);
            ciphered += cipher.final(outputEncoding);
            return ciphered;
        }
    }
};

Cipher.prototype.decode = function (inputDatas, device) {
    log4n.debug('decode starting');
    log4n.object(inputDatas, 'inpurDatas');
    log4n.object(device, 'device');

    if (typeof device !== 'undefined') {
        if (typeof device.key !== 'undefined') {
            log4n.object(device.key, 'key');
            let decipher = crypto.createDecipher(algorithm, device.key);
            let deciphered = decipher.update(inputDatas, outputEncoding, inputEncoding);
            deciphered += decipher.final(inputEncoding);
            return JSON.parse(deciphered);
        }
    }
};

module.exports = Cipher;