const Log4n = require('../utils/log4n.js');
const server = require('../config/server.js');

const checkAuth = require('./checkAuth.js');

const status = require('./status.js');
const registerDevice = require('./api/register.js');
const encodeMessage = require('./api/encodeMessage.js');
const decodeMessage = require('./api/decodeMessage.js');

let context = {httpRequestId: 'Initialize'};

module.exports = function (app) {
    const log4n = new Log4n(context, '/routes/main');
    app.use((req, res, next) => {
        log4n.debug('watermark');
        req.httpRequestId = Date.now().toString();
        next();
    });

    // Routage des pages
    app.get('/status', status);
    app.post('/1.0.0/register', checkAuth, registerDevice);
    app.post('/1.0.0/encode', checkAuth, encodeMessage);
    app.post('/1.0.0/decode', checkAuth, decodeMessage);

    log4n.debug('done');
};