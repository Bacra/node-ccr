var expect = require('expect.js');
var ccr = require('..');
var aesid = require('aesid');

ccr.root = __dirname + '/tmp';

describe('#base', () => {
	it('#base', () => {
		var cache = ccr('test_cache');

		return cache.file()
			.then(file => {
				var sid = cache.downloadkey(file, 'userid');
				var sidfile = cache.downloadkey(sid, 'userid');

				console.log('file: %s sid: %s sidfile: %s', file, sid, sidfile);
				expect(file).to.be(sidfile);
			});
	});

	it('#downloadkey', () => {
		var sidObj = aesid('aes key 123', {
			userid: true,
		});

		var cache = ccr('test_cache', {
			aes: sidObj
		});

		return cache.file()
			.then(file => {
				var sid = cache.downloadkey(file, 'userid');
				var sidfile = cache.downloadkey(sid, 'userid');

				console.log('file: %s sid: %s sidfile: %s', file, sid, sidfile);
				expect(file).to.be(sidfile);
			});
	});

	it('#depd crypto', () => {
		var cache = ccr('depd_crypto');

		return Promise.all([
			cache.file(),
			cache.file(),
			cache.file().then(file => {
				return cache.file().then(file2 => [file, file2])
			}),
		])
			.then((files) => {
				console.log('cache check files: %o', files);

				// var sid = cache.downloadkey(file, 'userid');
				var sid = '7CsaxozvZnlMt2tUzY51JjaJxQl7pnlb7TJVszg8rTKnOTpMZ8VEyxWmzmZgdnsy';
				var sidfile = cache.downloadkey(sid, 'userid');
				console.log('sid: %s sidfile: %s', sid, sidfile);
			});
	});
});
