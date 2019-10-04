const Log4n = require('../../utils/log4n.js');
const decodePost = require('../../utils/decodePost.js');
const setDevice = require('../../models/api/device/register.js');
const errorparsing = require('../../utils/errorparsing.js');
const responseError = require('../../utils/responseError.js');

module.exports = function (context, req, res) {
    const log4n = new Log4n(context, '/routes/api/register');

    //lecture des données postées
    decodePost(context, req, res)
        .then(datas => {
            // log4n.object(datas, 'datas');
            if (typeof datas === 'undefined') {
                //aucune donnée postée
                return errorparsing(context, {error_code: 400});
            } else {
                //creation du compte
                return setDevice(context, datas);
            }
        })
        .then(datas => {
            //recherche d'un code erreur précédent
            if (typeof datas.error_code === 'undefined') {
                //notification enregistrée
                res.status(201).send(datas);
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
