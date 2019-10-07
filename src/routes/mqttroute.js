const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

const deviceRegister = require('./device/register.js');
const deviceSensor = require('./device/sensor.js');
const deviceSlave = require('./device/slave.js');
const deviceSwitch = require('./device/switch.js');

module.exports = function (context, topic, content) {
    const log4n = new Log4n(context, '/routes/mqttroute');

    return new Promise((resolve, reject) => {
        try {
            // log4n.object(topic, 'topic');
            // log4n.object(content, 'content');

            switch (topic) {
                case 'register':
                    deviceRegister(context, content)
                        .then(datas => {
                            if (typeof datas === 'undefined') {
                                resolve();
                                log4n.debug('done - register ok');
                            } else {
                                log4n.object(datas, 'error');
                                reject(datas);
                                log4n.debug('done - register error');
                            }
                        })
                        .catch(error => {
                            log4n.object(error, 'error');
                            reject(errorparsing(context, error));
                            log4n.debug('done - register catch');
                        });
                    break;
                case 'sensor':
                    deviceSensor(context, content)
                        .then(datas => {
                            if (typeof datas === 'undefined') {
                                resolve();
                                log4n.debug('done - sensor ok');
                            } else {
                                log4n.object(datas, 'error');
                                reject(datas);
                                log4n.debug('done - sensor error');
                            }
                        })
                        .catch(error => {
                            log4n.object(error, 'error');
                            reject(errorparsing(context, error));
                            log4n.debug('done - sensor catch');
                        });
                    break;
                case 'slave':
                    deviceSlave(context, content)
                        .then(datas => {
                            if (typeof datas === 'undefined') {
                                resolve();
                                log4n.debug('slave ok');
                            } else {
                                log4n.object(datas, 'error');
                                reject(datas);
                                log4n.debug('done - slave error');
                            }
                        })
                        .catch(error => {
                            log4n.object(error, 'error');
                            reject(errorparsing(context, error));
                            log4n.debug('done - slave catch');
                        });
                    break;
                case 'switch':
                    deviceSwitch(context, content)
                        .then(datas => {
                            if (typeof datas === 'undefined') {
                                resolve();
                                log4n.debug('switch ok');
                            } else {
                                log4n.object(datas, 'error');
                                reject(datas);
                                log4n.debug('done - switch error');
                            }
                        })
                        .catch(error => {
                            log4n.object(error, 'error');
                            reject(errorparsing(context, error));
                            log4n.debug('done - switch catch');
                        });
                    break;
                default:
                    log4n.debug('error unknown topic');
                    reject(errorparsing(context, {status_code: 500, status_message: 'Unknown topic'}));
                    log4n.debug('done - unknown topic');
                    break;
            }
        } catch (exception) {
            log4n.object(exception, 'exception');
            reject(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    });
};
