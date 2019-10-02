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
		var sidObj = aesid({
			userid: true,
			business: {
				test: {
					1: 'aes key 123'
				}
			}
		})
		.business('test');

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

		return cache.file()
			.then(file => {
				// var sid = cache.downloadkey(file, 'userid');
				var sid = '7CsaxozvZnlMt2tUzY51JjaJxQl7pnlb7TJVszg8rTKnOTpMZ8VEyxWmzmZgdnsy';
				var sidfile = cache.downloadkey(sid, 'userid');
				console.log('sid: %s sidfile: %s', sid, sidfile);
			});
	});
});
