'use strict';

const https = require('https');
const Log4n = require('../utils/log4n.js');
const api = require('../config/iotdbapi');
const decodeResponse = require('../utils/decodeResponse.js');
const errorparsing = require('../utils/errorparsing.js');

module.exports = function (apiPath, data, errorMessage) {
    const log4n = new Log4n('/models/apiPost');
    log4n.debug('apiPath:' + apiPath);
    log4n.debug('data: ' + data);
    log4n.debug('errorMessage: ' + errorMessage);

    return new Promise((resolve, reject) => {
        let callReturn;
        try {
            if(typeof apiPath === 'undefined') throw('missing apiPath parameter');
            if(typeof data === 'undefined') throw('missing data parameter');
            if(typeof errorMessage === 'undefined') throw('missing errorMessage parameter');
            let auth = 'Basic ' + Buffer.from(api.login + ':' + api.password).toString('base64');

            const jsonObject = JSON.stringify(data);
//			log4n.debug('jsonObject: ' + jsonObject);

            const options = {
                host: api.hostName,
                port: api.hostPort,
                path: api.hostPath + apiPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(jsonObject),
                    'Accept': 'application/json',
                    'Authorization': auth
                },
                rejectUnauthorized: false
            };

            const request = https.request(options, (response) => {
                if (response.statuscode < 200 || response.code > 299)
                    throw('Post failed:' + response.statuscode);

                response.setEncoding('utf8');
                response.on('end', () => {
                    log4n.debug('response:' + callReturn);
                    let responseContent = {};
                    if(typeof callReturn === 'undefined') {
                        log4n.debug('reject return empty.');
                        reject('POST:return empty');
                    } else {
                        responseContent = decodeResponse(callReturn);
                        // log4n.object(responseContent, "response");

                        if(typeof responseContent.code === 'undefined') {
                            //le champ code est absent => on a des données
                            log4n.debug('resolve implicit ok');
                            resolve(responseContent);
                        } else {
                            //le champ code est présent mais à 200 => réponse correcte
                            if(responseContent.code === '200') {
                                // log4n.debug('resolve explicit ok');
                                resolve(responseContent);
                            } else {
                                //le champ code est présent et affiche une erreur
                                log4n.debug('reject error:' + responseContent.code);
                                reject(responseContent);
                            }
                        }
                    }
                });
                response.on('data', (chunk) => {
                    log4n.debug('chunk:' + chunk);
                    if(typeof chunk === 'undefined') throw('chunk empty');

                    if(typeof callReturn === 'undefined') callReturn = "";
                    callReturn = callReturn + chunk;
                });
            });
            request.on('error', (err) => {
                reject(errorparsing(err));
;
            });
            request.write(jsonObject);
            request.end();
        } catch(err) {
            reject(errorparsing(err));
        }
    });
};