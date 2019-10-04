const Log4n = require('../../../utils/log4n.js');
const apiGet = require('../../apiGet.js');

module.exports = function (context, login, password) {
    const log4n = new Log4n(context, '/models/api/account/check');
    log4n.object(login, 'login');
    log4n.object(password, 'password');

    return new Promise((resolve, reject) => {
        apiGet(context,"/account/check/" + login + "/" + password, "", true)
            .then(result => {
                log4n.object(result, 'result');
                resolve(true);
            })
            .catch(error => {
                log4n.error(error);
                reject(error);
            });
    });
};
