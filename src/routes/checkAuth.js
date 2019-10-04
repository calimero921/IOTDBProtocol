const auth = require('basic-auth');
const Log4n = require('../utils/log4n.js');
const responseError = require('../utils/responseError.js');
const errorParsing = require('../utils/errorparsing.js');
const accountCheck = require('../models/api/account/check.js');

module.exports = function (req, res, next) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/checkAuth');
    // let credentials = auth(req);
    // log4n.object(credentials, 'credentials');
    //
    // if (typeof credentials === 'undefined') {
    //     log4n.info('error no credentials found');
    //     responseError(errorParsing(context,{error_code: 401}), res, log4n);
    // } else {
    //     accountCheck(context, credentials.name, credentials.pass, 0, 0)
    //         .then(result => {
    //             log4n.object(result, 'result');
    //             if (typeof result !== 'undefined') {
    //                 log4n.debug('check Ok');
    //                 next();
    //             } else {
    //                 responseError(errorParsing(context, {error_code: 403}), res, log4n);
    //             }
    //         })
    //         .catch(err => {
    //             responseError(errorParsing(context, {error_code: 403}), res, log4n);
    //         });
    // }
    log4n.debug('Done - Ok');
    next();
};