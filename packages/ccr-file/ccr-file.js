var Promise = require('bluebird');
var mkdirp = Promise.promisify(require('mkdirp'));
var debug = require('debug')('ccr');
var timekey = require('time-key');

exports = module.exports = Cacher;
exports.root = '/tmp/node-ccr';


// Main
function Cacher(name, options) {
	if (!(this instanceof Cacher)) {
		return new Cacher(name, options);
	}

	this.name = name;
	this.options = options || {};

	this._index = 0;
	this._dirPromise = null;
	this.timekey = timekey(this.options.timeformat || 'YYYY/MMDD');
	this._parentPath = this.options.root || exports.root;
}

Cacher.prototype = {
	file: function(userid) {
		var index = ++this._index;
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
		var random = '' + (Math.random() * 1000 | 0);
		// 补齐一下位数，目录创建出来整齐一些
		random = '0000'.substr(random.length) + random;
		var subpath = process.pid + '_' + random;
		debug('new subpath: %s', subpath);

		var newpath = this.root() + daypath + '/' + subpath;

		return mkdirp(newpath)
			.then(function() {
				return newpath;
			});
	},

	root: function() {
		return this._parentPath + '/' + this.name + '/';
	},
};
