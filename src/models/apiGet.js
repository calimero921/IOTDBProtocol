'use strict';

const https = require('https');

const api = require('../config/iotdbapi');
const DecodeResponse = require('../utils/decodeResponse.js');

const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

module.exports = function (context, apiPath, errorMessage, overtake) {
    const log4n = new Log4n(context, '/models/apiGet');

    return new Promise((resolve, reject) => {
        try {
            log4n.object(apiPath, 'apiPath');
            log4n.object(errorMessage, 'errorMessage');
            log4n.object(overtake, 'overtake');

            if (typeof apiPath === 'undefined') throw ('missing apiPath parameter');
            if (typeof errorMessage === 'undefined') throw ('missing errorMessage parameter');
            if (typeof overtake === 'undefined') overtake = false;

            let decodeResponse = new DecodeResponse(context);
            let auth = 'Bearer ' + api.accessToken;
            const options = {
                host: api.hostName,
                port: api.hostPort,
                path: api.hostPath + apiPath,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': auth
                },
                rejectUnauthorized: false
            };
            log4n.object(options, 'options');

            let callReturn = "";
            https.get(options, (response) => {
                try {
                    log4n.object(response.statusCode, 'response.statuscode');
                    log4n.object(response.headers, 'response.headers');
                    if (response.statusCode < 200 || response.statusCode > 299) {
                        throw(errorparsing(context, {status_code: response.statusCode}));
                    }

                    response.setEncoding('utf8');
                    response.on('data', (chunk) => {
                        // log4n.debug('chunk:' + chunk);
                        if (typeof chunk === 'undefined') throw('chunk empty');

                        if (typeof callReturn === 'undefined') callReturn = "";
                        callReturn = callReturn + chunk;
                    });
                    response.on('end', () => {
                        // log4n.debug('callReturn:' + callReturn);
                        let responseContent = {};
                        if (typeof callReturn === 'undefined') {
                            reject('GET:return empty');
                            log4n.debug('done - empty.');
                        } else {
                            responseContent = decodeResponse.decode(callReturn);
                            // log4n.object(responseContent, "response");
                            if (typeof responseContent.code === 'undefined') {
                                //le champ code est absent => on a des données
                                resolve(responseContent);
                                log4n.debug('done - ok');
                            } else {
                                log4n.object(responseContent.error, 'error');
                                if (typeof responseContent.error !== 'undefined') {
                                    if (responseContent.error.code === '200') {
                                        //le champ code est présent mais à 200 => réponse correcte
                                        responseContent.error = {};
                                        resolve(responseContent);
                                        log4n.debug('done - ok');
                                    } else {
                                        if (!overtake) {
                                            //le champ code est présent et affiche une erreur
                                            log4n.object(callReturn, 'reject error');
                                            reject(responseContent);
                                            log4n.debug('done - statuscode error');
                                        } else {
                                            //l'erreur est outrepassée à la demande du requeteur
                                            log4n.object(callReturn, 'resolve overtake');
                                            resolve(responseContent);
                                            log4n.debug('done - overtake');
                                        }
                                    }
                                } else {
                                    resolve(responseContent);
                                    log4n.debug('done - ok');
                                }
                            }
                        }
                    });
                } catch (exception) {
                    log4n.object(exception, 'exception');
                    reject(errorparsing(context, exception));
                    log4n.debug('done - inner exception');
                }
            }).on('error', (error) => {
                log4n.object(error, 'error');
                reject(errorparsing(context, error));
                log4n.debug('done - error');
            });
        } catch (exception) {
            log4n.object(exception, 'exception');
            reject(errorparsing(context, exception));
            log4n.debug('done - global exception');
        }
    });
};