var debug = require('debug')('ccr:depd_crypto');
var crypto = require('crypto');

module.exports = function(globalAseKey) {
	return {
		encrypt: function(data, userid) {
			data += ',' + Date.now();

			var aseKey = userid ? globalAseKey + ',' + userid : globalAseKey;
			var cipher = crypto.createCipher('aes-256-cbc', aseKey);
			var sid = cipher.update(data, 'utf8', 'base64');
			sid += cipher.final('base64');

			return sid;
		},
		decrypt: function(sid, userid) {
			var aseKey = userid ? globalAseKey + ',' + userid : globalAseKey;

			var decipher = crypto.createDecipher('aes-256-cbc', aseKey);
			var info = decipher.update(sid, 'base64', 'utf8');
			info += decipher.final('utf8');

			var arr = info.split(',');
			var file = arr[0].trim();
			// 如果是这个框架生成的文件，不可能有..的字符
			if (file.indexOf('..') != -1) {
				debug('file path has "..": %s', file);
				throw new Error('INVALID_FILE_SID');
			}

			return file;
		}
	};
};
