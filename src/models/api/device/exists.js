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

        // let parameter = {};
        // if (typeof limit !== 'undefined') parameter.limit = limit;
        // if (typeof skip !== 'undefined') parameter.offset = skip;
        // mongoClient('device', query, parameter, overtake)
        //     .then(datas => {
        //         // log4n.object(datas, 'datas');
        //         if (datas.length > 0) {
        //             let promises = [];
        //             for (let i = 0; i < datas.length; i++) {
        //                 promises.push(converter.db2json(datas[i]));
        //             }
        //             Promise.all(promises)
        //                 .then(result => {
        //                     // log4n.object(result, 'result');
        //                     if (result.length > 0) {
        //                         log4n.debug('done - ok');
        //                         resolve(result);
        //                     } else {
        //                         log4n.debug('done - not correct record found');
        //                         reject(errorparsing({error_code: 404}));
        //                     }
        //                 })
        //                 .catch(error => {
        //                     log4n.object(error, 'error reading data');
        //                     reject(errorparsing(error));
        //                 });
        //         } else {
        //             if (overtake) {
        //                 log4n.debug('done - no result but ok');
        //                 resolve();
        //             } else {
        //                 log4n.debug('done - not found');
        //                 reject(errorparsing({error_code: 404}));
        //             }
        //         }
        //     })
        //     .catch(error => {
        //         log4n.debug('done - global catch');
        //         log4n.object(error, 'error');
        //         reject(errorparsing(error));
        //     });
    });
};
