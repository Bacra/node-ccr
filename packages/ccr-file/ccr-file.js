const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = Promise.promisify(require('mkdirp'));
const debug = require('debug')('ccr-file');
const timekey = require('time-key');

exports = module.exports = CacheFile;
exports.root = '/tmp/node-ccr';
// 单个目录最多文件数据
// linux max files is 32000
exports.maxfile = 20000;


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
		let index = this._index++;

		if (index > exports.maxfile) {
			// 强制更新目录
			this._dirPromise = null;
			this._index = index = 0;
		}

		let filename = index;
		if (userid) filename = userid + '_' + filename;

		return this.path()
			.then(function(dir) {
				return dir + '/' + filename;
			});
	},

	path: function() {
		const self = this;
		const daypath = this.timekey.key();

		return (self._dirPromise || Promise.resolve())
			.then(function(info) {
				debug('from cache info: %o', info);

				if (info && info.daypath == daypath) return info.static;
			})
			.then(function(staticPath) {
				if (staticPath) return staticPath;

				// 创建新的目录
				const promise = self._newPath(daypath);
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
		const self = this;
		// 补齐一下位数，目录创建出来整齐一些
		const subpath = process.pid + '-' + Date.now() + '-' + (Math.random() * 10000000000 | 0);
		debug('new subpath: %s', subpath);

		const newpath = this.root() + daypath + '/' + subpath;

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
