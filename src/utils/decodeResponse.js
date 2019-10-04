'use strict';

const Log4n = require('./log4n');
const checkJSON = require('./checkJSON');

class DecodeResponse {
    constructor(context) {
        const log4n = new Log4n(context, '/router/util/DecodeResponse/constructor');
        this.context = context;
        log4n.debug('done - Ok');
    }

    decode(response) {
        const log4n = new Log4n(this.context, '/router/util/DecodeResponse/decode');

        //décodage en JSON
        if (isJSON(this.context, response)) {
            log4n.debug('Done - JSON');
            return parseJSON(this.context, response);
        }

        //décodage en HTML
        if (isHTML(this.context, response)) {
            log4n.debug('Done - HTML');
            return parseHTML(this.context, response, log4n);
        }

        //décodage en XML
        if (isXML(this.context, response)) {
            log4n.debug('Done - XML');
            return response;
        }

        log4n.debug('Done - Raw');
        return response;
    };
}

function isJSON(context, response) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/isJSON');
    log4n.debug('Done - Ok');
    return response.startsWith("[") || response.startsWith("{");
}

function isXML(context, response) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/isXML');
    log4n.debug('Done - Ok');
    return response.startsWith("<?xml");
}

function isHTML(context, response) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/isHTML');
    log4n.debug('Done - Ok');
    return response.startsWith("<!DOCTYPE html>");
}

function parseJSON(context, content) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/parseJSON');

    const result = JSON.parse(content);
    let error;

    if (typeof result.code !== 'undefined') {
        if (typeof error === 'undefined') error = {};
        error.code = result.code;
        result.code = {};
    }
    if (typeof result.type !== 'undefined') {
        if (typeof error === 'undefined') error = {};
        error.type = result.type;
        result.type = {};
    }
    if (typeof result.message !== 'undefined') {
        if (typeof error === 'undefined') error = {};
        error.message = result.message;
        result.message = {};
    }

    if (typeof error !== 'undefined') result.error = error;

    log4n.object(result, "result");
    log4n.debug('Done - Ok');
    return result;
}

function parseHTML(context, content) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/parseHTML');

    let result;
    let error;

    let body = getSection(context, content, "body");
//	log4n.debug("body:" + body);

    const h1 = getSection(context, body, "h1");
//	log4n.debug("h1:" + h1);
    if (h1.length > 0) {
        body = removeSection(context, body, "h1");
//		log4n.debug("body:" + body);
        if (h1.startsWith("HTTP Status")) {
            error.code = h1.substr(12, 3);
            let p = getSection(context, body, "p");
//			log4n.debug("p:" + p);
            while (p.length > 0) {
                body = removeSection(context, body, "p");
//				log4n.debug("body:" + body);

                const b = getSection(context, p, "b");
//				log4n.debug("b:" + b);

                if (b.length > 0) {
                    switch (b) {
                        case "type":
                            error.type = removeSection(context, p, "b").trim();
                            break;
                        case "message":
                            error.message = getSection(context, p, "u").trim();
                            break;
                        case "description":
                            error.description = getSection(context, p, "u").trim();
                            break;
                        default:
                            break;
                    }
                }
                p = getSection(body, "p");
//				log4n.debug("p:" + p);
            }
        }
    }

    if (typeof result === 'undefined') {
        error.code = "500";
        error.message = "Internal hostName error";
    }

    if (typeof error !== 'undefined') result.error = error;

    log4n.object(result, "result");
    log4n.debug('Done - Ok');
    return result;
}

function getSection(context, content, section) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/getSection');

    let start = content.indexOf("<" + section + ">");
    if (start > -1) {
        start = start + section.length + 2;
        const stop = content.indexOf("</" + section + ">");
        if (stop > -1) return content.substring(start, stop);
    }

    log4n.debug('Done - Ok');
    return "";
}

function removeSection(context, content, section) {
    const log4n = new Log4n(context, '/router/util/DecodeResponse/removeSection');
    let result = "";
    let start = content.indexOf("<" + section + ">");
    if (start > -1) {
        result = content.substring(0, start);
        start = start + section.length + 2;
        const stop = content.indexOf("</" + section + ">");
        if (stop > -1) return result + content.substring(stop + section.length + 3);
    }
    log4n.object(result, "result");
    log4n.debug('Done - Ok');
    return result;
}

module.exports = DecodeResponse;