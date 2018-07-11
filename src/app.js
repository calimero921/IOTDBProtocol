/**
 * Module dependencies.
 */
const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MongoDBStore = require('connect-mongodb-session')(session);
const logger = require('morgan');

const config = require('./config/server.js');
const mongodbconf = require('./config/mongodb.js');
const Log4n = require('./utils/log4n.js');
const MQTTEngine = require('./routes/MQTTEngine.js');

const log4n = new Log4n('/app.js');

log4n.debug("Database connexion setup");
global.mongodbConnexion = null;

log4n.debug("MQTT client setup");
global.mqttConnexion = new MQTTEngine();
global.mqttConnexion.start();

log4n.debug('Create server');
let app = express();

log4n.debug('Session store setup');
let store = new MongoDBStore(
    {
        uri: mongodbconf.url,
        databaseName: mongodbconf.dbName,
        collection: 'session'
    });
// Catch errors
store.on('error', function (error) {
    assert.ifError(error);
    assert.ok(false);
});

log4n.debug('Session manager setup');
app.use(require('express-session')({
    secret: 'IOTDBsecrettoprotectsessiondata',
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: true
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
}));

log4n.debug("Express server setup");
app.set('trust proxy', 1);
require('./routes/main')(app);

// uncomment after placing your favicon in /public
log4n.debug("View engine setup");
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

log4n.debug("Parser setup");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());

/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || config.port);
app.set('port', port);

/**
 * Create HTTPs server.
 */
log4n.debug("HTTPS server setup");
let options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
let server = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */
log4n.debug("HTTPS server starting");
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
server.on('stop', onStop);

module.exports = app;
log4n.debug('HTTPS server started');

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
    res.status(err.status || 500);
    res.render('error');
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP server "error" event.
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
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    log4n.debug('Listening on ' + bind);
}

/**
 * Event listener for HTTPS server "stop" event.
 */
function onStop() {
}

/**
 * Event listener for HTTP server "stop" event.
 */
process.on( 'SIGINT', function() {
    log4n.debug("MQTT client stop");
    global.mqttConnexion.stop();
    process.exit( )
});
