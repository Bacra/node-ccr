var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var debug = require('debug')('ccr:test');
var expect = require('expect.js');

describe('#base', () => {

	it('#base', () => {
		var cache = require('../')('test', {
			root: __dirname + '/tmp/',
			aes: 'ase key 1234'
		});

		const content = 'file content 123';
		const userid = 'userid 456';

		return cache.file()
			.then(file => {
				const sid = cache.filekey(file, userid);
				debug('sid: %s', sid);

				return fs.writeFileAsync(file, content)
					.then(() => cache.mvEncryptFile(sid, userid))
					.then(() => cache.readEncryptFile(sid, userid))
					.then(buf => expect(buf.toString()).to.be(content));
			});
	});
});
