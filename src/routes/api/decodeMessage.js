const Log4n = require('../../utils/log4n.js');
const responseError = require('../../utils/responseError.js');
const errorparsing = require('../../utils/errorparsing.js');
const decodePost = require('../../utils/decodePost.js');
const getById = require('../../models/api/device/getById.js');
const Cipher = require('../../models/api/device/cipher.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/decodeMessage');

    //lecture des données postées
    let postData;
    let cipher = new Cipher;
    decodePost(req, res)
        .then(datas => {
            // log4n.object(datas, 'datas');
            if (typeof datas === 'undefined') {
                //aucune donnée postée
                return errorparsing({error_code: 400});
            } else {
                //encodage du message
                postData = datas;
                return getById(postData.id);
            }
        })
        .then(datas => {
            if (typeof datas === 'undefined') {
                //aucune donnée postée
                return errorparsing({error_code: 404});
            } else {
                if (typeof datas.error_code === 'undefined') {
                    //encodage du message
                    return cipher.decode(postData.payload, datas[0]);
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
                responseError(datas, res, log4n);
                log4n.debug('done - response error');
            }
        })
        .catch(error => {
            responseError(error, res, log4n);
            log4n.debug('done - promise catch');
        });
};
