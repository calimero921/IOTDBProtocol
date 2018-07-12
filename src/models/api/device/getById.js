const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
// const mongoClient = require('../../mongodbfind.js');
const apiGet = require('../../apiGet.js');
const Converter = require('./converter.js');

module.exports = function (id, overtake) {
    const log4n = new Log4n('/models/api/device/getById');
    log4n.object(id, 'id');
    log4n.object(overtake, 'overtake');
    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        // const converter = new Converter();

        try{
            apiGet('/device/' + id, '', overtake)
                .then((datas)=>{
                    log4n.object(datas, 'datas');
                    if(typeof datas === 'undefined') throw 'data not found';
                    resolve (datas);
                })
                .catch((err) => {
                    reject(errorparsing(err));
                });
        } catch(err) {
            reject(errorparsing(err));
        }
    });
};
