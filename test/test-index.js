var debug = require('debug');
debug.enable('ccr*');

var cache	= require('../')('test');
cache.root	= __dirname+'/tmp';

cache.write('xxxxxxx', 111)
	.catch(function(err)
	{
		console.error(err.stack);
		process.exit(1);
	});
