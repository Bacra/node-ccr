var debug = require('debug')('ccr-aes-path:test');
var expect = require('expect.js');
var cache = require('ccr-file')('test', {
	root: __dirname + '/tmp/',
});

var ccrAesPath = require('../');

describe('#base', () => {

	it('#new aesid', () => {
		var aeskey = ccrAesPath(cache, 'aes key 123', {
			userid: true,
		});

		return cache.file()
			.then(file => {
				var sid = aeskey(file, 'userid');
				var sidfile = aeskey(sid, 'userid');

				debug('file: %s sid: %s sidfile: %s', file, sid, sidfile);
				expect(file).to.be(sidfile);
			});
	});

	it('#depd crypto', () => {
		var aeskey = ccrAesPath(cache, 'depd_crypto');

		var sid = 'yPTj0MQ13Ogbq2-kksDsr2sH2Dmw-BRawhUa7QKByDY5c6xzuWbyBnHB2XkHKIQf';
		aeskey(sid, 'userid');

		// return cache.file()
		// 	.then(file => {
		// 		var sid = aeskey(file, 'userid');
		// 		console.log('new sid: ', sid);
		// 		aeskey(sid, 'userid');
		// 	});
	});
});
