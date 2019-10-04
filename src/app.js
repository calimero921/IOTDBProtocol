/**
 * Module dependencies.
 */
const fs = require('fs');
const https = require('https');
const path = require('path');

const createError = require('http-errors');
const express = require('express');
let app = express();

// const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');

const config = require('./config/server.js');
const MQTTEngine = require('./routes/MQTTEngine.js');

const Log4n = require('./utils/log4n.js');
let context = {httpRequestId: 'Initialize'};
const log4n = new Log4n(context,'/app.js');

log4n.debug("MQTT client setup");
global.mqttConnexion = new MQTTEngine(context);
global.mqttConnexion.start();

log4n.debug("Express server setup");
app.set('trust proxy', 1);
require('./routes/main.js')(app);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// uncomment after placing your favicon in /public
log4n.debug('Engine setup');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(express.static(path.join(__dirname, 'public')));

log4n.debug("Parser setup");
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/**
 * Get hostPort from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || config.hostPort);
app.set('port', port);

/**
 * Create HTTPs hostName.
 */
log4n.debug("HTTPS Server setup");
let options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
let server = https.createServer(options, app);

/**
 * Listen on provided hostPort, on all network interfaces.
 */
log4n.debug("HTTPS hostName starting");
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
server.on('stop', onStop);

module.exports = app;
log4n.debug('HTTPS hostName started');

/**
 * catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500).send();
});

/**
 * Normalize a hostPort into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // hostPort number
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP hostName "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP hostName "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'hostPort ' + addr.port;
    log4n.debug('Listening on ' + bind);
}

/**
 * Event listener for HTTPS hostName "stop" event.
 */
function onStop() {
}

/**
 * Event listener for HTTP hostName "stop" event.
 */
process.on( 'SIGINT', function() {
    log4n.debug("MQTT client stop");
    global.mqttConnexion.stop();
    process.exit( )
});
