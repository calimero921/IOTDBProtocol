const moment = require('moment');
const Log4n = require('./log4n.js');
const errorparsing = require('./errorparsing');
const getUsersBySession = require('../models/api/account/getBySession');

module.exports = function (req, res, admin) {
    const log4n = new Log4n('/utils/getconfig');

    return new Promise((resolve, reject) => {
        if(typeof admin === 'undefined') admin = false;
        let session_id = req.sessionID;
        let config = {};
        if (typeof session_id === 'undefined') {
            reject(errorparsing({error_code: 401, error_message: 'Unauthorized'}));
            log4n.debug("done - no session available");
        } else {
            log4n.debug("Session:" + session_id);
            getUsersBySession(session_id, true)
                .then(result => {
                    // log4n.object(result, 'result');
                    if (result.length > 0) {
                        config.user = result[0];
                        if((admin === true) && (result[0].admin === false)) {
                            log4n.debug("User haven't sufficient right to access this page");
                            reject(errorparsing({error_code: 403, error_message: 'Forbidden'}));
                        } else {
                            let last = new moment(config.user.last_connexion_date);
                            config.user.last_connexion_date = last.format('DD/MMM/YYYY HH:mm:SS');
                            resolve(config);
                        }
                    } else {
                        // reject(errorparsing({error_code: 401, error_message: 'Unauthorized'}));
                        resolve(config);
                        log4n.debug("done - no user found for this session");
                    }
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    reject(errorparsing(error));
                    log4n.debug('done - catch promise')
                });
        }
    });
};