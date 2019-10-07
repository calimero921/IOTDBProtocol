const configMQTT = require('../../config/mqtt.js');

const exists = require('../../models/api/device/exists.js');

const Log4n = require('../../utils/log4n.js');
const errorparsing = require('../../utils/errorparsing.js');

module.exports = function (context, content) {
    const log4n = new Log4n(context, '/mqttroutes/device/register');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.object(content, 'content');
            if (typeof content === 'undefined') {
                //aucune donnée postée
                log4n.debug('done - no data');
                reject(errorparsing(context, {status_code: 400, status_message: 'Missing parameter'}));
            } else {
                let topic = configMQTT.topic_system + '/' + content.manufacturer + '/' + content.model + '/' + content.serial;
                let message = {
                    payload: content,
                    status_code: 0,
                    status_message: 'registration error'
                };
                let query = content;
                exists(context, query)
                    .then(result => {
                        log4n.object(result, 'result');
                        if (typeof result === 'undefined') {
                            //enregistrement des données postées
                            log4n.debug('inserting device');
                            return errorparsing(context, {status_code: 404});
                        } else {
                            message.payload.device_id = result.device_id;
                            return content;
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            //aucune données recue du processus d'enregistrement
                            message.status_code = 500;
                            global.mqttConnexion.publish(topic, message);
                            reject(errorparsing(context, {status_code: 500}));
                            log4n.debug('done - no data');
                        } else {
                            //recherche d'un code erreur précédent
                            if (typeof datas.status_code === 'undefined') {
                                //device enregistrée
                                log4n.debug('device stored');
                                message.status_code = 200;
                                message.status_message = 'registred';
                                global.mqttConnexion.publish(topic, message);
                                resolve();
                                log4n.debug('done - ok');
                            } else {
                                //erreur dans le processus d'enregistrement de la notification
                                message.status_code = datas.status_code;
                                global.mqttConnexion.publish(topic, message);
                                reject(errorparsing(context, datas));
                                log4n.debug('done - response error');
                            }
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        message.status_code = error.status_code;
                        global.mqttConnexion.publish(topic, message);
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch (exception) {
            log4n.object(exception, 'exception');
            reject(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    });
};
