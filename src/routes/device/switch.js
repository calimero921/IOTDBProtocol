const Log4n = require('../../utils/log4n.js');
const configMQTT = require('../../config/mqtt.js');
const get = require('../../models/api/device/get.js');
const set = require('../../models/api/device/set.js');
const update = require('../../models/api/device/patch.js');
const errorparsing = require('../../utils/errorparsing.js');

module.exports = function (context, content) {
    const log4n = new Log4n(context, '/mqttroutes/api/device/switch');
    // log4n.object(content, 'content');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) =>{
        try{
            if (typeof content === 'undefined') {
                //aucune donnée postée
                log4n.debug('done - no data');
                reject({code: 400});
            } else {
                let query = {"device_id": content.id};
                get(query, "", "", true)
                    .then(result => {
                        // log4n.object(result, 'result');
                        if (typeof result === 'undefined') {
                            //enregistrement des données postées
                            log4n.debug('inserting device');
                            return set(content);
                        } else {
                            //enregistrement des données postées
                            log4n.debug('updating device');
                            let record = result[0];
                            content.key = record.key;
                            content.creation_date = record.creation_date;
                            return update(context, record.id, content);
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            //aucune données recue du processus d'enregistrement
                            reject(errorparsing(context, {code: 500}));
                            log4n.debug('done - no data');
                        } else {
                            //recherche d'un code erreur précédent
                            if (typeof datas.error_code === 'undefined') {
                                //device enregistrée
                                let message = {"message": "registred", "payload" : datas};
                                global.mqttConnexion.publish(configMQTT.topic_system, message);
                                resolve();
                                log4n.debug('done - ok');
                            } else {
                                //erreur dans le processus d'enregistrement de la notification
                                reject(errorparsing(context, datas));
                                log4n.debug('done - response error');
                            }
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch(error) {
            console.log(error);
            log4n.object(error, 'error');
            reject(errorparsing(context, error));
            log4n.debug('done - global catch');
        }
    });
};
