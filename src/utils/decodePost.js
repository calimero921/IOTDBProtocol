const checkJSON = require('./checkJSON.js');

const Log4n = require('./log4n.js');

module.exports = function (context, req) {
	const log4n = new Log4n(context, '/utils/decodePost');

	return new Promise((resolve, reject) => {
		try {
			log4n.object(req.headers, 'headers');
			log4n.object(req.body, 'body');

			let fullBody = '';
			req.on('data', chunk => {
				// log4n.object(chunk, 'chunk');
				fullBody += chunk.toString();
				log4n.object(fullBody, 'fullBody');
			});
			req.on('end', () => {
				const decodedBody = checkJSON(context, fullBody);
				log4n.object(decodedBody, 'decodedBody');
				resolve(decodedBody);
				log4n.debug('Done - Ok');
			});
			req.on('error', (error) => {
				log4n.error(error);
				reject('no data in post');
				log4n.debug('Done - Error');
			});
		} catch(exception) {
			log4n.error(exception);
			reject(exception);
			log4n.debug('Done - Exception');
		}
	});
};