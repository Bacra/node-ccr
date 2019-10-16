var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = Promise.promisify(require('mkdirp'));
var debug = require('debug')('ccr-file');
var timekey = require('time-key');

exports = module.exports = CacheFile;
exports.root = '/tmp/node-ccr';


// Main
function CacheFile(name, options) {
	if (!(this instanceof CacheFile)) {
		return new CacheFile(name, options);
	}

	if (!options) options = {};

	this.name = name;
	this._index = 0;
	this._dirPromise = null;
	this.timekey = timekey(options.timeformat || 'YYYY/MMDD');
	this._parentPath = options.root || exports.root;
}

CacheFile.prototype = {
	file: function(userid) {
		var index = this._index++;
		// linux math files is 32000
		if (index > 20000) {
			this._dirPromise = null;
			this._index = index = 0;
		}

		var filename = index;
		if (userid) filename = userid + '_' + filename;

		return this.path()
			.then(function(dir) {
				return dir + '/' + filename;
			});
	},

	path: function() {
		var self = this;
		var daypath = this.timekey.key();

		return (self._dirPromise || Promise.resolve())
			.then(function(info) {
				debug('from cache info: %o', info);

				if (info && info.daypath == daypath) return info.static;
			})
			.then(function(staticPath) {
				if (staticPath) return staticPath;

				// 创建新的目录
				var promise = self._newPath(daypath);
				self._dirPromise = promise.then(function(newpath) {
					return {
						daypath: daypath,
						static: newpath
					};
				});

				return promise;
			});
	},

	_newPath: function(daypath) {
		var self = this;
		// 补齐一下位数，目录创建出来整齐一些
		var subpath = process.pid + '-' + Date.now() + '-' + (Math.random() * 10000000000 | 0);
		debug('new subpath: %s', subpath);

		var newpath = this.root() + daypath + '/' + subpath;

		return fs.statAsync(newpath)
			.then(function() {
				return self._newPath(daypath);
			}, function(err) {
				if (err && err.code == 'ENOENT') {
					return mkdirp(newpath)
						.then(function() {
							return newpath;
						});
				} else {
					debug('stats err: %o', err);
					throw err;
				}
			});
	},

	root: function() {
		return this._parentPath + '/' + this.name + '/';
	},
};
