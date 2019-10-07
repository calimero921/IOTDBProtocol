const Log4n = require('../../utils/log4n.js');
const configMQTT = require('../../config/mqtt.js');
const get = require('../../models/api/device/get.js');
const update = require('../../models/api/device/patch.js');
const errorparsing = require('../../utils/errorparsing.js');

module.exports = function (context, content) {
    const log4n = new Log4n(context, '/mqttroutes/device/sensor');
    log4n.object(content, 'content');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            if (typeof content === 'undefined') {
                //aucune donnée postée
                log4n.debug('done - no data');
                reject(errorparsing(context, {status_code: 400}));
            } else {
                let query = {"device_id": content.id};
                get(context, query, "", "", true)
                    .then(result => {
                        // log4n.object(result, 'result');
                        if (typeof result === 'undefined') {
                            //enregistrement absent
                            log4n.debug('unknown device');
                            return errorparsing(context, {status_code: 404});
                        } else {
                            //enregistrement des données postées
                            log4n.debug('updating data');
                            let record = result[0];
                            // log4n.object(record, 'record');
                            for (let i = 0; i < content.capabilities.length; i++) {
                                for (let j = 0; j < record.capabilities.length; j++) {
                                    if (content.capabilities[i].name === record.capabilities[j].name) {
                                        record.capabilities[j].last_value = content.capabilities[i].value;
                                    }
                                }
                            }
                            return update(context, result[0].id, record);
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            //aucune données recue du processus d'enregistrement
                            reject(errorparsing(context, {status_code: 500}));
                            log4n.debug('done - no data');
                        } else {
                            //recherche d'un code erreur précédent
                            if (typeof datas.status_code === 'undefined') {
                                //data enregistrées
                                log4n.debug('data updated');
                                let message = {"message": "ok"};
                                global.mqttConnexion.publish(configMQTT.topic_system, message);
                                resolve();
                                log4n.debug('done - ok');
                            } else {
                                //erreur dans le processus d'enregistrement de la notification
                                reject(errorparsing(context, datas));
                                log4n.debug('done - response error');
                            }
                        }
                        resolve();
                    })
                    .catch(error => {
                        console.log(error);
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch
            (error) {
            console.log(error);
            log4n.object(error, 'error');
            reject(errorparsing(context, error));
            log4n.debug('done - global catch');
        }
    })
        ;
}
;
