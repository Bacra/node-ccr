var debug = require('debug')('ccr:crypto');
var crypto = require('crypto');

module.exports = function(globalAseKey) {
	return {
		encrypt: function(data, userid) {
			var AES_KEY = userid
				? crypto.createHmac('sha256', globalAseKey).update(userid).digest()
				: globalAseKey;
			var IV = crypto.randomBytes(16);
			var output = [IV];

			var cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, IV);
			output.push(cipher.update(data, 'utf8'), cipher.final());

			return Buffer.concat(output).toString('base64');
		},
		decrypt: function(sid, userid) {
			var AES_KEY = userid
				? crypto.createHmac('sha256', globalAseKey).update(userid).digest()
				: globalAseKey;

			var buf = Buffer.from(sid, 'base64');
			var IV = buf.slice(0, 16);

			var decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);

			debug('encrypt aeskey: %s, iv: %s', AES_KEY, IV);

			return decipher.update(buf.slice(16), 'utf8')
				+ decipher.final('utf8');
		}
	};
};
