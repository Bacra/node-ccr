var expect = require('expect.js');
var cache = require('..')('test_cache');
cache.root = __dirname+'/tmp';

describe('#base', () => {
	it('#base', () => {
		return cache.file()
			.then(function(file)
			{
				var sid = cache.downloadkey(file, 'userid');
				var info = cache.downloadkey(sid, 'userid');

				expect(file).to.be(info.file);
				console.log(file, sid, info);
			});
	});
});
