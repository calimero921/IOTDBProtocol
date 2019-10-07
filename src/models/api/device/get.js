const apiGet = require('../../apiGet.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, overtake) {
    const log4n = new Log4n(context, '/models/api/device/get');

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.object(id, 'id');
            log4n.object(overtake, 'overtake');
            if (typeof overtake === 'undefined') overtake = false;

            apiGet(context, '/device', '', overtake)
                .then((data) => {
                    if (typeof data === 'undefined') throw 'data not found';
                    resolve(data);
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
