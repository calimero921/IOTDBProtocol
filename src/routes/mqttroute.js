const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

const deviceRegister = require('./device/register.js');
const deviceSensor = require('./device/sensor.js');
const deviceSlave = require('./device/slave.js');
const deviceSwitch = require('./device/switch.js');

module.exports = function (context, topic, content) {
    const log4n = new Log4n(context, '/routes/mqttroute');
    // log4n.object(topic, 'topic');
    // log4n.object(content, 'content');

    return new Promise((resolve, reject) => {
        switch (topic) {
            case 'register':
                deviceRegister(context, content)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            log4n.debug('insertion ok');
                            resolve();
                        } else {
                            log4n.object(datas, 'error');
                            reject(datas);
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                    });
                break;
            case 'sensor':
                deviceSensor(context, content)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            log4n.debug('sensor ok');
                            resolve();
                        } else {
                            log4n.object(datas, 'error');
                            reject(datas);
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                    });
                break;
            case 'slave':
                deviceSlave(context, content)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            log4n.debug('slave ok');
                            resolve();
                        } else {
                            log4n.object(datas, 'error');
                            reject(datas);
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                    });
                break;
            case 'switch':
                deviceSwitch(context, content)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            log4n.debug('switch ok');
                            resolve();
                        } else {
                            log4n.object(datas, 'error');
                            reject(datas);
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                    });
                break;
            default:
                log4n.debug('error unknown topic');
                reject(errorparsing(context, {error_code: 500, error_message: 'Unknown topic'}));
                break;
        }
    });
};
