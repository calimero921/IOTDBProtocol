const uuid = require('uuid');
const Log4n = require('../../utils/log4n.js');

const log4n = new Log4n('/models/api/generator');

function Generator() {
}

Generator.prototype.idgen = function () {
    log4n.debug('idgen starting');
    let node = [];

    for(let i=0; i<6; i++) {
        node.push(parseInt(Math.floor(Math.random()*16)), 16);
    }
    // log4n.object(node, 'node');

    let result = uuid.v1({node: node});
    log4n.object(result, 'result');
    log4n.debug('idgen done - ok');
    return result;
};

Generator.prototype.keygen = function () {
    log4n.debug('keygen starting');
    const dictionnary = "0123456789ABCDEF";
    const keylength = 256;
    let result = "";

    for(let i=0; i < Math.floor(keylength/8); i++) {
        result = result + dictionnary.substr(Math.floor(Math.random()*dictionnary.length), 1);
    }
    log4n.object(result, 'result');
    log4n.debug('keygen done - ok');
    return result;
};

module.exports = Generator;