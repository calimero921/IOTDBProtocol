const auth = require('basic-auth');
const Log4n = require('../utils/log4n.js');
const responseError = require('../utils/responseError.js');
const errorParsing = require('../utils/errorparsing.js');
const accountCheck = require('../models/api/account/check.js');

module.exports = function (req, res, next) {
    const log4n = new Log4n('/routes/checkAuth');
    let credentials = auth(req);
    log4n.object(credentials, 'credentials');

    if (typeof credentials === 'undefined') {
        log4n.info('error no credentials found');
        responseError(errorParsing({error_code: 401}), res, log4n);
    } else {
        accountCheck(credentials.name, credentials.pass, 0, 0)
            .then(result => {
                log4n.object(result, 'result');
                if (typeof result !== 'undefined') {
                    log4n.debug('check Ok');
                    next();
                } else {
                    responseError(errorParsing({error_code: 403}), res, log4n);
                }
            })
            .catch(err => {
                responseError(errorParsing({error_code: 403}), res, log4n);
            });
    }
};