var debug = require('debug')('ccr-aes-path:test');
var expect = require('expect.js');
var ccrAesPath = require('../');
var rootPath = __dirname + '/tmp/';

describe('#base', () => {

	it('#new aesid', () => {
		var aeskey = ccrAesPath(rootPath, 'aes key 123', {
			userid: true,
		});

		const file = rootPath + '/file1';
		var sid = aeskey(file, 'userid');
		var sidfile = aeskey(sid, 'userid');

		debug('file: %s sid: %s sidfile: %s', file, sid, sidfile);
		expect(file).to.be(sidfile);
	});

	it('#depd crypto', () => {
		var aeskey = ccrAesPath(rootPath, 'depd_crypto', { depdAesKey: 'test/do&j3m()==3{]ddd' });

		var sid = 'yPTj0MQ13Ogbq2-kksDsr2sH2Dmw-BRawhUa7QKByDY5c6xzuWbyBnHB2XkHKIQf';
		aeskey(sid, 'userid');
	});
});
