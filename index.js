var Promise	= require('bluebird');
var crypto	= require('crypto');
var fs		= Promise.promisifyAll(require('fs'));
var mkdirp	= Promise.promisify(require('mkdirp'));
var debug	= require('debug')('ccr');
var timekey	= require('time-key');

exports = module.exports = Cacher;
exports.root = '/tmp/node-ccr';

var safeBase64Reg1 = /-/g;
var safeBase64Reg11 = /\+/g;
var safeBase64Reg2 = /_/g;
var safeBase64Reg21 = /\//g;
var safeBase64Reg3 = /=+$/g;

// Main
function Cacher(name, options)
{
	if (!(this instanceof Cacher))
	{
		return new Cacher(name, options);
	}

	this.name = name;
	this.options = options || {};

	this._index = 0;
	this._dir = null;
	this.timekey = timekey(this.options.timeformat || 'YYYY/MMDD');
	this.root = this.options.root || exports.root;
}

Cacher.prototype =
{
	downloadkey: function(file, userid)
	{
		if (!file) return;

		var aes_key = this.options.aes_key || this.name+'/do&j3m()==3{]ddd';
		if (userid) aes_key += ','+userid;
		var dir = this._root();

		// root+file的时候，必定有"/" 字符
		if (file.indexOf('/') != -1)
		{
			if (file.substr(0, dir.length) == dir)
			{
				var info = file.substr(dir.length);
				info += ','+Date.now();

				var cipher = crypto.createCipher('aes-256-cbc', aes_key);
				var sid = cipher.update(info, 'utf8', 'base64');
				sid += cipher.final('base64');

				return sid.replace(safeBase64Reg3, '')
					.replace(safeBase64Reg11, '-')
					.replace(safeBase64Reg21, '_');
			}
			else
			{
				throw new Error('FILE_NOT_IN_ROOT_PATH');
			}
		}
		else
		{
			file = file.replace(safeBase64Reg1, '+')
				.replace(safeBase64Reg2, '/');

			var decipher = crypto.createDecipher('aes-256-cbc', aes_key);
			var info = decipher.update(file, 'base64', 'utf8');
			info += decipher.final('utf8');

			var arr = info.split(',');
			var ttl = +arr.pop();
			var file = arr.join(',').trim();
			// 如果是这个框架生成的文件，不可能有..的字符
			if (file.indexOf('..') != -1)
			{
				debug('file path has "..": %s', file);
				throw new Error('INVALID_FILE_SID');
			}

			if (ttl)
			{
				return {
					file: dir + file,
					ttl: ttl
				};
			}
			else
			{
				throw new Error('INVALID_FILE_SID');
			}
		}
	},

	file: function()
	{
		var index = ++this._index;
		// linux math files is 32000
		if (index > 20000)
		{
			this._dir = null;
			this._index = index = 0;
		}

		return this.path()
			.then(function(dir)
			{
				return dir+'/'+index;
			});
	},

	path: function()
	{
		var self = this;
		var daypath = this.timekey.key();

		if (self._dir)
		{
			return self._dir.then(function(oldInfo)
			{
				if (oldInfo && oldInfo.daypath == daypath) return oldInfo.static;

				debug('new path, name:%s oldInfo:%o new daypath:%s', self.name, oldInfo, daypath);
				return self._setSelfDir(daypath);
			});
		}
		else
		{
			return self._setSelfDir(daypath);
		}
	},
	_setSelfDir: function(daypath)
	{
		var promise = this._newPath(daypath);
		this._dir = promise.then(function(newpath)
		{
			return {daypath: daypath, static: newpath};
		});

		return promise;
	},
	_newPath: function(daypath)
	{
		var self = this;
		var random = ''+(Math.random() *1000|0);
		// 补齐一下位数，目录创建出来整齐一些
		random = '0000'.substr(random.length)+random;

		var subpath = process.pid+'_'+random;
		var newpath = this._root()+daypath+'/'+subpath;

		return fs.statAsync(newpath)
			.then(function()
			{
				return self._newPath(daypath);
			},
			function()
			{
				return mkdirp(newpath)
					.then(function()
					{
						return newpath;
					});
			});
	},

	_root: function()
	{
		return this.root+'/'+this.name+'/';
	},
};
