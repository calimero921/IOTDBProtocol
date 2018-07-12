const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
// const mongoClient = require('../../mongodbfind.js');
const apiGet = require('../../apiGet.js');
const Converter = require('./converter.js');

module.exports = function (manufacturer, serialnumber, secret) {
    const log4n = new Log4n('/models/api/device/get');
    log4n.object(manufacturer, 'manufacturer');
    log4n.object(serialnumber, 'serialnumber');
    log4n.object(secret, 'secret');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        // const converter = new Converter();

        try{
            apiGet('/device/exists/' + manufacturer + '/' + serialnumber + '/' + secret , 'error getting device information', true)
                .then((data)=>{
                    log4n.object(data, "data");
                    if(typeof data === 'undefined') throw 'data not found';
                    resolve (data);
                })
                .catch((err) => {
                    reject(errorparsing(err));
                });
        } catch(err) {
            reject(errorparsing(err));
        }
    });
};
