var debug = require('debug');
debug.enable('ccr*');

var cache	= require('../')('test_cache');
cache.root	= __dirname+'/tmp';
var Promise	= require('bluebird');


Promise.all(
	[
		cache.write('xxxxxxx', 111),
		cache.file(222)
			.then(function(file)
			{
				var sid = cache.downloadkey(file);
				var info = cache.downloadkey(sid);

				if (file != info.file) throw new Error('file not match');
				console.log(file, sid, info);
			})
	])
	.catch(function(err)
	{
		console.error(err.stack);
		process.exit(1);
	});


