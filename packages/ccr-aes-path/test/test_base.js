const debug = require('debug')('ccr-aes-path:test');
const expect = require('expect.js');
const ccrAesPath = require('../');
const rootPath = __dirname + '/tmp/';

describe('#base', () => {

	it('#new aesid', () => {
		const aeskey = ccrAesPath(rootPath, 'aes key 123', {
			userid: true,
		});

		const file = rootPath + '/file1';
		const sid = aeskey(file, 'userid');
		const sidfile = aeskey(sid, 'userid');

		debug('file: %s sid: %s sidfile: %s', file, sid, sidfile);
		expect(file).to.be(sidfile);
	});

	it('#depd crypto', () => {
		const aeskey = ccrAesPath(rootPath, 'depd_crypto', { depdAesKey: 'test/do&j3m()==3{]ddd' });

		const sid = 'yPTj0MQ13Ogbq2-kksDsr2sH2Dmw-BRawhUa7QKByDY5c6xzuWbyBnHB2XkHKIQf';
		aeskey(sid, 'userid');
	});
});
