const uuid = require('uuid');

const Log4n = require('../../../utils/log4n.js');

class Generator {
    constructor(context) {
        const log4n = new Log4n(this.context, '/models/api/device/generator/constructor');
        this.context = context;
        log4n.debug('Done - Ok')
    }

    idgen() {
        const log4n = new Log4n(this.context, '/models/api/device/generator/idgen');
        try {
            let node = [];

            for (let i = 0; i < 6; i++) {
                node.push(parseInt(Math.floor(Math.random() * 16)), 16);
            }
            // log4n.object(node, 'node');

            let data = uuid.v1({node: node});
            // log4n.object(data, 'data');
            log4n.debug('done - ok');
            return data;
        } catch (exception) {
            log4n.object(exception, 'exception');
            log4n.debug('done - exception');
            return errorparsing(this.context, exception);
        }
    };

    keygen() {
        const log4n = new Log4n(this.context, '/models/api/device/generator/keygen');
        try {
            const dictionnary = "0123456789ABCDEF";
            const keylength = 256;
            let result = "";

            for (let i = 0; i < Math.floor(keylength / 8); i++) {
                result = result + dictionnary.substr(Math.floor(Math.random() * dictionnary.length), 1);
            }
            log4n.object(result, 'result');
            log4n.debug('done - ok');
            return result;
        } catch (exception) {
            log4n.object(exception, 'exception');
            log4n.debug('done - exception');
            return errorparsing(this.context, exception);
        }
    };
}

module.exports = Generator;