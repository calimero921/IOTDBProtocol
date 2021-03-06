const Converter = require('./converter.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, device_id, new_device) {
    const log4n = new Log4n(context, '/models/api/device/patch');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        try {
            // log4n.object(device_id,'device_id');
            // log4n.object(new_device,'new_device');
            log4n.debug('storing device');
            let converter = new Converter(context);
            if (typeof device_id === 'undefined' || typeof new_device === 'undefined') {
                reject(errorparsing(context, {status_code: 400}));
                log4n.debug('done - missing paramater')
            } else {
                let query = {};
                log4n.debug('preparing datas');
                query.id = device_id;
                //au cas ou on usurperait le device
                converter.json2db(new_device)
                    .then(parameter => {
                        // log4n.object(parameter,'parameter');
                        return mongoClient('device', query, parameter);
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            return errorparsing(context, {status_code: 500});
                        } else {
                            if (typeof datas.status_code === 'undefined') {
                                log4n.debug('done - ok');
                                return converter.db2json(datas);
                            } else {
                                return datas;
                            }
                        }
                    })
                    .then(datas => {
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorparsing(context, datas));
                            log4n.debug('done - error')
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch')
                    });
            }
        } catch (exception) {
            log4n.object(exception, 'exception');
            reject(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    });
};
