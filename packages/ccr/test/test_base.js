var expect = require('expect.js');
var ccr = require('../');
var path = require('path');

ccr.root = __dirname + '/tmp';

describe('#base', () => {
	it('#base', () => {
		var cache = ccr('base');
		expect(cache.root()).to.contain(ccr.root);

		return cache.file()
			.then(file => {
				expect(file).to.contain(cache.root());
			});
	});

	it('#path cache', function() {
		var cache = ccr('test_cache');

		return Promise.all([
				cache.file(),
				cache.file(),
				cache.file().then(file => {
					return cache.file().then(file2 => [file, file2])
				}),
			])
			.then((files) => {
				expect(path.dirname(files[0])).not.to.be(path.dirname(files[1]));
				expect(path.dirname(files[2][0])).to.be(path.dirname(files[2][1]));
			});
	});
});
