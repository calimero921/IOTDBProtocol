const Log4n = require('../../utils/log4n.js');
const responseError = require('../../utils/responseError.js');
const errorparsing = require('../../utils/errorparsing.js');
const decodePost = require('../../utils/decodePost.js');
const getById = require('../../models/api/device/getById.js');
const Cipher = require('../../models/api/device/cipher.js');

module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/encodeMessage');

    //lecture des données postées
    let postData;
    let cipher = new Ciphe(context);
    decodePost(context, req, res)
        .then(datas => {
            log4n.object(datas, 'datas');
            if (typeof datas === 'undefined') {
                //aucune donnée postée
                return errorparsing(context, {error_code: 400});
            } else {
                //encodage du message
                postData = datas;
                return getById(context, postData.id);
            }
        })
        .then(datas => {
            log4n.object(datas, 'device');
            if (typeof datas === 'undefined') {
                //aucune donnée postée
                return errorparsing(context, {error_code: 404});
            } else {
                if (typeof datas.error_code === 'undefined') {
                    //encodage du message
                    return cipher.encode(postData.payload, datas[0]);
                } else {
                    return datas;
                }
            }
        })
        .then(datas => {
            //recherche d'un code erreur précédent
            if (typeof datas.error_code === 'undefined') {
                //notification enregistrée
                res.status(200).send(datas);
                log4n.debug('done - ok');
            } else {
                //erreur dans le processus d'enregistrement de la notification
                responseError(context, datas, res, log4n);
                log4n.debug('done - response error');
            }
        })
        .catch(error => {
            responseError(context, error, res, log4n);
            log4n.debug('done - promise catch');
        });
};
