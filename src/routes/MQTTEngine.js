const configMQTT = require('../config/mqtt.js');
const Log4n = require('../utils/log4n.js');
const mqtt = require('mqtt');
const {AsyncClient} = require("async-mqtt");

const checkJSON = require('../utils/checkJSON.js');
const mqttroute = require('./mqttroute.js');

let globalContext = {};

class MQTTEngine {
    constructor(context) {
        this.context = context;
        globalContext = context;
        this.mqttURL = 'mqtt://' + configMQTT.server + ':' + configMQTT.port;
    }

    /**
     *
     */
    connect() {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/unsubscribe');
        try {
            if (typeof this.clientMQTT === 'undefined') {
                this.clientMQTT = new AsyncClient(mqtt.connect(this.mqttURL));
                log4n.debug('Done - Ok');
            } else {
                log4n.debug('Done - Already connected');
            }
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('Done - Exception');
        }
    };

    /**
     *
     */
    end() {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/unsubscribe');
        try {
            this.clientMQTT.end()
                .then(() => {
                    delete this.clientMQTT;
                    log4n.debug('Done - Ok');
                })
                .catch(error => {
                    log4n.object(error, 'publish error');
                    log4n.debug('Done - Error');
                });
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('Done - Exception');
        }
    };

    /**
     *
     */
    start() {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/start');
        this.connect();
        this.clientMQTT.on('connect', onConnect);
        this.clientMQTT.on('reconnect', onReconnect);
        this.clientMQTT.on('close', onClose);
        this.clientMQTT.on('offline', onOffline);
        this.clientMQTT.on('error', onError);
        this.clientMQTT.on('message', onMessage);
        this.clientMQTT.on('packetsend', onPacketSend);
        this.clientMQTT.on('packetreceive', onPacketReceived);
        log4n.debug('Done - Ok');
    };

    /**
     *
     */
    stop() {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/stoo');
        this.end();
        log4n.debug('Done - Ok');
    };

    /**
     *
     */
    publish(topic, message) {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/publish');
        try {
            log4n.object(topic, 'topic');
            log4n.object(JSON.stringify(message), 'message');

            this.clientMQTT.publish(topic, JSON.stringify(message))
                .then(() => {
                    log4n.debug('Done - Ok');
                })
                .catch(error => {
                    log4n.object(error, 'publish error');
                    log4n.debug('Done - Error');
                });
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('Done - Exception');
        }
    };

    /**
     *
     */
    subscribe(topic) {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/subscribe');
        try {
            log4n.object(topic, 'topic');

            this.clientMQTT.subscribe(topic)
                .then(subscriptionGrant => {
                    log4n.object(subscriptionGrant, 'subscriptionGrant');
                    log4n.debug('Done - Ok');
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    log4n.debug('Done - Error');
                });
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('Done - Exception');
        }
    };

    /**
     *
     */
    unsubscribe(topic) {
        const log4n = new Log4n(this.context, '/routes/MQTTEngine/unsubscribe');
        try {
            log4n.object(topic, 'topic');

            this.clientMQTT.unsubscribe(topic)
                .then(unsubackPacket => {
                    log4n.object(unsubackPacket, 'unsubackPacket');
                    log4n.debug('Done - Ok');
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    log4n.debug('Done - Error');
                });
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('Done - Exception');
        }
    };
}

/**
 *
 */
function onConnect() {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onConnect');
    log4n.debug('MQTT client subscribing "' + configMQTT.topic_register + '" topic');
    this.subscribe(configMQTT.topic_register);
    log4n.debug('MQTT client subscribing "' + configMQTT.topic_sensor + '" topic');
    this.subscribe(configMQTT.topic_sensor);
    log4n.debug('MQTT client subscribing "' + configMQTT.topic_slave + '" topic');
    this.subscribe(configMQTT.topic_slave);
    log4n.debug('MQTT client subscribing "' + configMQTT.topic_switch + '" topic');
    this.subscribe(configMQTT.topic_switch);
    log4n.debug('Done - Ok');
}

/**
 *
 */
function onReconnect() {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onReconnect');
    log4n.debug('Done - Ok');
}

/**
 *
 */
function onClose() {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onClose');
    log4n.debug('Done - Ok');
}

/**
 *
 */
function onOffline() {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onOffline');
    log4n.debug('Done - Ok');
}

/**
 *
 */
function onError(error) {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onError');
    log4n.debug('MQTT client error');
    console.log('error: ' + error);
    log4n.debug('Done - Ok');
}

/**
 *
 */
function onMessage(topic, message, packet) {
    globalContext.httpRequestId = Date.now().toString();
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onMessage');
    // log4n.object(topic, 'topic');
    // log4n.object(message.toString(), 'message');
    // log4n.object(packet, 'packet');

    let result = checkJSON(globalContext, message);
    // log4n.object(result, 'result');

    mqttroute(globalContext, topic, result)
        .then(datas => {
            log4n.debug('Done - Ok');
        })
        .catch(error => {
            log4n.debug('Done - Error');
        });
}

/**
 *
 */
function onPacketSend(packet) {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onPacketSend');
    // log4n.debug('MQTT client sending packet');
    // log4n.object(packet, 'packet');
    log4n.debug('Done - Ok');
}

/**
 *
 */
function onPacketReceived(packet) {
    const log4n = new Log4n(globalContext, '/routes/MQTTEngine/onPacketReceived');
    // log4n.debug('MQTT client receiving packet');
    // log4n.object(packet, 'packet');
    log4n.debug('Done - Ok');
}

module.exports = MQTTEngine;
