const mqtt = require('mqtt');
const {AsyncClient} = require("async-mqtt");

const configMQTT = require('../config/mqtt.js');
const checkJSON = require('../utils/checkJSON.js');
const mqttroute = require('./mqttroute.js');

const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

class MQTTEngine {
    constructor(context) {
        const log4n = new Log4n(context, '/routes/MQTTEngine/constructor');
        this.context = context;
        this.mqttURL = 'mqtt://' + configMQTT.server + ':' + configMQTT.port;
        log4n.debug('done - ok');
    }

    /**
     *
     */
    connect() {
        let context = getContext();
        const log4n = new Log4n(context, '/routes/MQTTEngine/unsubscribe');
        try {
            if (typeof this.clientMQTT === 'undefined') {
                this.clientMQTT = new AsyncClient(mqtt.connect(this.mqttURL));
                log4n.debug('done - ok');
            } else {
                log4n.debug('Done - Already connected');
            }
        } catch (exception) {
            log4n.error(errorparsing(context, exception.stack));
            log4n.debug('done - exception');
        }
    };

    /**
     *
     */
    end() {
        let context = getContext();
        const log4n = new Log4n(getContext(), '/routes/MQTTEngine/end');
        try {
            this.clientMQTT.end()
                .then(() => {
                    delete this.clientMQTT;
                    log4n.debug('done - ok');
                })
                .catch(error => {
                    log4n.error(errorparsing(context, error));
                    log4n.debug('done - error');
                });
        } catch (exception) {
            log4n.error(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    };

    /**
     *
     */
    start() {
        let context = getContext();
        const log4n = new Log4n(context, '/routes/MQTTEngine/start');
        this.connect();
        this.clientMQTT.on('connect', onConnect);
        this.clientMQTT.on('reconnect', onReconnect);
        this.clientMQTT.on('close', onClose);
        this.clientMQTT.on('offline', onOffline);
        this.clientMQTT.on('error', onError);
        this.clientMQTT.on('message', onMessage);
        this.clientMQTT.on('packetsend', onPacketSend);
        this.clientMQTT.on('packetreceive', onPacketReceived);
        log4n.debug('done - ok');
    };

    /**
     *
     */
    stop() {
        const log4n = new Log4n(getContext(), '/routes/MQTTEngine/stoo');
        try {
            this.end();
            log4n.debug('done - ok');
        } catch (exception) {
            log4n.error(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    };

    /**
     *
     */
    publish(topic, message) {
        let context = getContext();
        const log4n = new Log4n(context, '/routes/MQTTEngine/publish');
        try {
            log4n.object(topic, 'topic');
            log4n.object(JSON.stringify(message), 'message');

            this.clientMQTT.publish(topic, JSON.stringify(message))
                .then(() => {
                    log4n.debug('done - ok');
                })
                .catch(error => {
                    log4n.error(errorparsing(context, error));
                    log4n.debug('done - error');
                });
        } catch (exception) {
            log4n.error(errorparsing(context, exception));
            log4n.debug('done - exception');
        }
    };

    /**
     *
     */
    subscribe(topic) {
        const log4n = new Log4n(getContext(), '/routes/MQTTEngine/subscribe');
        try {
            log4n.object(topic, 'topic');

            this.clientMQTT.subscribe(topic)
                .then(subscriptionGrant => {
                    log4n.object(subscriptionGrant, 'subscriptionGrant');
                    log4n.debug('done - ok');
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    log4n.debug('done - error');
                });
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('done - exception');
        }
    };

    /**
     *
     */
    unsubscribe(topic) {
        const log4n = new Log4n(getContext(), '/routes/MQTTEngine/unsubscribe');
        try {
            log4n.object(topic, 'topic');

            this.clientMQTT.unsubscribe(topic)
                .then(unsubackPacket => {
                    log4n.object(unsubackPacket, 'unsubackPacket');
                    log4n.debug('done - ok');
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    log4n.debug('done - error');
                });
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('done - exception');
        }
    };
}

/**
 *
 */
function onConnect() {
    let context = getContext();
    const log4n = new Log4n(context, '/routes/MQTTEngine/onConnect');
    try {
        log4n.debug('MQTT client subscribing "' + configMQTT.topic_register + '" topic');
        this.subscribe(configMQTT.topic_register);
        log4n.debug('MQTT client subscribing "' + configMQTT.topic_sensor + '" topic');
        this.subscribe(configMQTT.topic_sensor);
        log4n.debug('MQTT client subscribing "' + configMQTT.topic_slave + '" topic');
        this.subscribe(configMQTT.topic_slave);
        log4n.debug('MQTT client subscribing "' + configMQTT.topic_switch + '" topic');
        this.subscribe(configMQTT.topic_switch);
        log4n.debug('done - ok');
    } catch (exception) {
        log4n.error(exception.stack);
        log4n.debug('done - exception');
    }
}

/**
 *
 */
function onReconnect() {
    const log4n = new Log4n(getContext(), '/routes/MQTTEngine/onReconnect');
    log4n.debug('done - ok');
}

/**
 *
 */
function onClose() {
    const log4n = new Log4n(getContext(), '/routes/MQTTEngine/onClose');
    log4n.debug('done - ok');
}

/**
 *
 */
function onOffline() {
    const log4n = new Log4n(getContext(), '/routes/MQTTEngine/onOffline');
    log4n.debug('done - ok');
}

/**
 *
 */
function onError(error) {
    const log4n = new Log4n(getContext(), '/routes/MQTTEngine/onError');
    console.log('error: ' + error);
    log4n.debug('done - ok');
}

/**
 *
 */
function onMessage(topic, message, packet) {
    let context = getContext();
    const log4n = new Log4n(context, '/routes/MQTTEngine/onMessage');
    try {
        // log4n.object(topic, 'topic');
        // log4n.object(message.toString(), 'message');
        // log4n.object(packet, 'packet');

        let result = checkJSON(context, message);
        // log4n.object(result, 'result');

        mqttroute(context, topic, result)
            .then(datas => {
                log4n.debug('done - ok');
            })
            .catch(error => {
                log4n.debug('done - error');
            });
    } catch (exception) {
        log4n.error(exception.stack);
        log4n.debug('done - exception');
    }
}

/**
 *
 */
function onPacketSend(packet) {
    const log4n = new Log4n(getContext(), '/routes/MQTTEngine/onPacketSend');
    // log4n.object(packet, 'packet');
    log4n.debug('done - ok');
}

/**
 *
 */
function onPacketReceived(packet) {
    const log4n = new Log4n(getContext(), '/routes/MQTTEngine/onPacketReceived');
    // log4n.object(packet, 'packet');
    log4n.debug('done - ok');
}

function getContext() {
    return {httpRequestId: Date.now().toString()};
}

module.exports = MQTTEngine;
