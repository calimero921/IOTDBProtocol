const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
// const mongoClient = require('../../mongodbfind.js');
const apiGet = require('../../apiGet.js');
const Converter = require('./converter.js');

module.exports = function (query, skip, limit, overtake) {
    const log4n = new Log4n('/models/api/device/get');
    log4n.object(query, 'query');
    log4n.object(skip, 'skip');
    if (typeof skip === 'undefined') skip = 0;
    log4n.object(limit, 'limit');
    if (typeof limit === 'undefined') limit = 0;
    log4n.object(overtake, 'overtake');
    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        // const converter = new Converter();

        try{
            apiGet('/device/2bb5e6b0-1321-11e8-8d3c-0c1006100110', 'error getting device information', false)
                .then((data)=>{
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
