const Moment = require('moment');

const apiPost = require('../../apiPost.js');
const apiGet = require('../../apiGet.js');
const Converter = require('./converter.js');
const Generator = require('../generator.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, device) {
    const log4n = new Log4n(context, '/models/api/device/register');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.object(device, 'device');
            log4n.debug('storing device');
            const generator = new Generator(context);
            const converter = new Converter(context);
            if (typeof device === 'undefined') {
                reject(errorparsing(context, {status_code: '400'}));
                log4n.log('done - missing parameter');
            } else {
                log4n.debug('preparing datas');
                converter.json2db(device)
                    .then(datas => {
                        log4n.object(datas, 'datas search');
                        return apiGet(context, "/device/exists/" + device.manufacturer + "/" + device.serial_number + "/" + device.secret, "", true);
                    })
                    .then(datas => {
                        log4n.object(datas, 'datas found');
                        if (datas.length === 0) {
                            //ajout des informations générées par le serveur
                            let query = {
                                "manufacturer": device.manufacturer,
                                "serial_number": device.serial_number,
                                "secret": device.secret,
                                "id": generator.idgen(),
                                "key": generator.keygen(),
                                "creation_date": parseInt(Moment().format('x')),
                                "last_connexion_date": parseInt(Moment().format('x'))
                            };
                            log4n.object(query, 'query');
                            return apiPost(context, '/device', query, 'error posting device data');
                        } else {
                            return (errorparsing(context, {status_code: '409'}));
                        }
                    })
                    .then(datas => {
                        log4n.object(datas, 'datas post');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            return (errorparsing(context, {status_code: '500'}));
                        } else {
                            if (typeof datas.status_code === "undefined") {
                                return converter.db2json(datas);
                            } else {
                                return datas;
                            }
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            reject(errorparsing(context, {status_code: '500'}));
                        } else {
                            if (typeof datas.status_code === "undefined") {
                                resolve(datas);
                                log4n.debug('done - ok');
                            } else {
                                reject(datas);
                                log4n.debug('done - wrong data');
                            }
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorparsing(context, error));
            log4n.debug('done - global catch');
        }
    });
};