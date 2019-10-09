var debug = require('debug')('ccr-aes-path');
var base64url = require('base64url');
var depdCrypto = require('./depd_crypto');
var aesid = require('aesid');

module.exports = function(cache, aes, aesidOptions) {
	if (!aes) throw new Error('AES KEY MISS');

	if (!aesidOptions) aesidOptions = {};

	var aesObjDepd = depdCrypto(aesidOptions.aes_key || cache.name + '/do&j3m()==3{]ddd');
	var aesObj = aes;

	if (!aesid.is(aesObj)) aesObj = aesid(aesObj, aesidOptions);

	return function(file, userid) {
		if (!file) return;

		var dir = cache.root();

		// root+file的时候，必定有"/" 字符
		if (file.indexOf('/') != -1 || file.indexOf('\\') != -1) {
			if (file.substr(0, dir.length) == dir) {
				var data = file.substr(dir.length);
				var sid = aesObj.encrypt(data, userid);
				// var sid = (aesObjDepd || aesObj).encrypt(data, userid);

				return base64url.fromBase64(sid);
			} else {
				throw new Error('FILE_NOT_IN_ROOT_PATH');
			}
		} else {
			var sid = base64url.toBase64(file);
			var sidfile;

			try {
				sidfile = aesObj.decrypt(sid, userid);
			} catch (err) {
				if (!aesObjDepd) throw err;

				debug('use depd aes, err: %o', err);
				try {
					sidfile = aesObjDepd.decrypt(sid, userid);
				} catch (err) {
					// 兼容没有userid
					sidfile = aesObjDepd.decrypt(sid);
				}
			}

			return dir + sidfile;
		}
	};
};
