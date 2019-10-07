const apiGet = require('../../apiGet.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, id, overtake) {
    const log4n = new Log4n(context, '/models/api/device/getById');

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.object(id, 'id');
            log4n.object(overtake, 'overtake');
            if (typeof overtake === 'undefined') overtake = false;

            apiGet(context, '/device/' + id, '', overtake)
                .then(datas => {
                    log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') throw 'data not found';
                    resolve(datas);
                    log4n.debug('done - ok');
                })
                .catch((error) => {
                    log4n.object(error, 'error');
                    reject(errorparsing(context, error));
                    log4n.debug('done - error');
                });
        } catch (exception) {
            log4n.object(exception, 'exception');
            reject(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    });
};
