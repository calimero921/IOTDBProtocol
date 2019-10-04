'use strict';

const https = require('https');
const Log4n = require('../utils/log4n.js');
const api = require('../config/iotdbapi');
const DecodeResponse = require('../utils/decodeResponse.js');
const errorparsing = require('../utils/errorparsing.js');

module.exports = function (context, apiPath, errorMessage, overtake) {
    const log4n = new Log4n(context, '/models/apiGet');
    log4n.object(apiPath, 'apiPath');
    log4n.object(errorMessage, 'errorMessage');
    log4n.object(overtake, 'overtake');

    return new Promise((resolve, reject) => {
        let decodeResponse = new DecodeResponse(context);
        try {
            if (typeof apiPath === 'undefined') throw ('missing apiPath parameter');
            if (typeof errorMessage === 'undefined') throw ('missing errorMessage parameter');
            if (typeof overtake === 'undefined') overtake = false;
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
                    if (response.statusCode < 200 || response.statusCode > 299)
                        throw('Get failed:' + response.statusCode);

                    response.setEncoding('utf8');
                    response.on('end', () => {
                        log4n.debug('callReturn:' + callReturn);
                        let responseContent = {};
                        if (typeof callReturn === 'undefined') {
                            log4n.debug('reject:return empty.');
                            reject('GET:return empty');
                        } else {
                            responseContent = decodeResponse.decode(callReturn);
                            // log4n.object(responseContent, "response");
                            //le champ code est absent => on a des données
                            if (typeof responseContent.code === 'undefined') {
                                log4n.debug('resolve implicit ok');
                                resolve(responseContent);
                            } else {
                                log4n.object(responseContent.error, 'error');
                                if (typeof responseContent.error !== 'undefined') {
                                    if (responseContent.error.code === '200') {
                                        //le champ code est présent mais à 200 => réponse correcte
                                        responseContent.error = {};
                                        // log4n.debug('resolve explicit ok');
                                        resolve(responseContent);
                                    } else {
                                        if (!overtake) {
                                            //le champ code est présent et affiche une erreur
                                            log4n.debug('reject error:' + callReturn);
                                            reject(responseContent);
                                        } else {
                                            //l'erreur est outrepassée à la demande du requeteur
                                            log4n.debug('resolve overtake:' + callReturn);
                                            resolve(responseContent);
                                        }
                                    }
                                } else {
                                    log4n.debug('resolve real data ok');
                                    resolve(responseContent);
                                }
                            }
                        }
                    });

                    response.on('data', (chunk) => {
                        log4n.debug('chunk:' + chunk);
                        if (typeof chunk === 'undefined') throw('chunk empty');

                        if (typeof callReturn === 'undefined') callReturn = "";
                        callReturn = callReturn + chunk;
                    });
                } catch (exception) {
                    reject(errorparsing(context, exception));
                }
            }).on('error', (error) => {
                reject(errorparsing(context, error));
            });
        } catch (exception) {
            reject(errorparsing(context, exception));
        }
    });
};