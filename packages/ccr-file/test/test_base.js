const expect = require('expect.js');
const ccr = require('../');
const path = require('path');

ccr.root = __dirname + '/tmp';
ccr.maxfile = 20;

describe('#base', () => {
	it('#base', () => {
		const cache = ccr('base');
		expect(cache.root()).to.contain(ccr.root);

		return cache.file()
			.then(file => {
				expect(file).to.contain(cache.root());
			});
	});

	it('#path cache', () => {
		const cache = ccr('path_cache');

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

	it('#new obj in same name', () => {
		const cache1 = ccr('same_name');
		const cache2 = ccr('same_name');

		return cache1.file()
			.then(file1 => Promise.all([file1, cache2.file()]))
			.then(files => {
				const file1 = files[0];
				const file2 = files[1];
				expect(path.dirname(file1)).not.to.be(path.dirname(file2));
				expect(path.basename(file1)).to.be(path.basename(file2));
			});
	});

	it('#update path by index', () => {
		const cache = ccr('updat_by_index');

		return cache.file()
			.then(file1 => {
				const arr = [];
				for(let i = ccr.maxfile; i--;) {
					arr.push(cache.file());
				}

				return Promise.all(arr)
					.then(() => Promise.all([file1, cache.file()]));
			})
			.then(files => {
				const file1 = files[0];
				const file2 = files[1];
				expect(path.dirname(file1)).not.to.be(path.dirname(file2));
			});
	});
});
