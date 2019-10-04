const Log4n = require('../../../utils/log4n.js');
const apiGet = require('../../apiGet.js');
const Converter = require('./converter.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, query) {
    const log4n = new Log4n(context, '/models/api/device/get');
    log4n.object(query.manufacturer, 'manufacturer');
    log4n.object(query.model, 'model');
    log4n.object(query.serial, 'serial');
    log4n.object(query.secret, 'secret');

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        // const converter = new Converter();

        try{
            apiGet(context, '/device/exists/' + query.manufacturer + '/' + query.model + '/' + query.serial + '/' + query.secret , 'error getting device information', true)
                .then((data)=>{
                    log4n.object(data, "data");
                    if(typeof data === 'undefined') throw 'data not found';
                    resolve (data);
                })
                .catch((err) => {
                    reject(errorparsing(context, err));
                });
        } catch(err) {
            reject(errorparsing(context, err));
        }
    });
};
