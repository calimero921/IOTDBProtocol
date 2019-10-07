const apiGet = require('../../apiGet.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, query) {
    const log4n = new Log4n(context, '/models/api/device/get');

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try{
            log4n.object(query.manufacturer, 'manufacturer');
            log4n.object(query.model, 'model');
            log4n.object(query.serial, 'serial');
            log4n.object(query.secret, 'secret');

            apiGet(context, '/device/exists/' + query.manufacturer + '/' + query.model + '/' + query.serial + '/' + query.secret , 'error getting device information', true)
                .then((data)=>{
                    log4n.object(data, "data");
                    if(typeof data === 'undefined') throw 'data not found';
                    resolve (data);
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
