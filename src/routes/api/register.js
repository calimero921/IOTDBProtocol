const configMQTT = require('../../config/mqtt.js');

const decodePost = require('../../utils/decodePost.js');
const exists = require('../../models/api/device/exists.js');

const Log4n = require('../../utils/log4n.js');
const errorparsing = require('../../utils/errorparsing.js');
const responseError = require('../../utils/responseError.js');

module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/register');

    try {
        log4n.object(req.headers, 'headers');
        log4n.object(req.body, 'body');
        //lecture des données postées
        let topic;
        let message;
        let content;
        decodePost(context, req)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    //aucune donnée postée
                    return errorparsing(context, {status_code: 404});
                } else {
                    content = datas;
                    topic = configMQTT.topic_system + '/' + content.manufacturer + '/' + content.model + '/' + content.serial;
                    message = {
                        payload: content,
                        status_code: 0,
                        status_message: 'registration error'
                    };
                    return exists(context, datas);
                }
            })
            .then(result => {
                // log4n.object(datas, 'datas');
                if (typeof result === 'undefined') {
                    responseError(context, {status_code: 500}, res, log4n);
                    log4n.debug('done - no data');
                } else {
                    //recherche d'un code erreur précédent
                    if (typeof result.status_code === 'undefined') {
                        message.payload.device_id = result.device_id;
                        message.status_code = 200;
                        message.status_message = 'registred';
                        global.mqttConnexion.publish(topic, message);
                        //notification enregistrée
                        res.status(200).send(message.payload);
                        log4n.debug('done - ok');
                    } else {
                        //erreur dans le processus d'enregistrement de la notification
                        responseError(context, result, res, log4n);
                        log4n.debug('done - response error');
                    }
                }
            })
            .catch(error => {
                responseError(context, error, res, log4n);
                log4n.debug('done - promise catch');
            });
    } catch
        (exception) {
        log4n.error(exception.stack);
        log4n.debug('Done - Error');
        responseError({status_code: 500}, res, log4n);
    }
}
;
