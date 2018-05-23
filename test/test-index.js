var debug = require('debug');
debug.enable('ccr*');

var cache	= require('../')('test_cache');
cache.root	= __dirname+'/tmp';
var Promise	= require('bluebird');


Promise.all(
	[
		cache.file()
			.then(function(file)
			{
				var sid = cache.downloadkey(file, 'userid');
				var info = cache.downloadkey(sid, 'userid');

				if (file != info.file) throw new Error('file not match');
				console.log(file, sid, info);
			})
	])
	.catch(function(err)
	{
		console.error(err.stack);
		process.exit(1);
	});
