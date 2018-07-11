const Log4n = require('../utils/log4n.js');
const server = require('../config/server.js');

const checkAuth = require('./checkAuth.js');
const registerDevice = require('./api/register.js');

module.exports = function (app) {
    const log4n = new Log4n('/routes/main');

    // Routage des pages
    app.get('/1.0.0/status', (req, res) => {res.status(200).send({'last_update':server.date})});
    app.post('/1.0.0/register', checkAuth, (req, res) => {registerDevice(req, res)});

    log4n.debug('done');
};