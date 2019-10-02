var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = Promise.promisify(require('mkdirp'));
var debug = require('debug')('ccr');
var timekey = require('time-key');
var base64url = require('base64url');
var depdCrypto = require('./depd_crypto');
var crypto = require('./crypto');

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
	this._dir = null;
	this.timekey = timekey(this.options.timeformat || 'YYYY/MMDD');
	this.root = this.options.root || exports.root;
}

Cacher.prototype = {
	downloadkey: function(file, userid) {
		if (!file) return;

		var dir = this._root();
		var aesObj = this.options.aes || this.name + '/do&j3m()==3{]ddd';
		var aesObjDepd;

		if (typeof aesObj == 'string') {
			aesObjDepd = depdCrypto(aesObj);
			aesObj = crypto(aesObj);
		}

		// root+file的时候，必定有"/" 字符
		if (file.indexOf('/') != -1) {
			if (file.substr(0, dir.length) == dir) {
				var data = file.substr(dir.length);
				var sid = aesObj.encrypt(data, userid);
				// var sid = (aesObjDepd || aesObj).encrypt(data, userid);

				return base64url.fromBase64(sid);
			} else {
				throw new Error('FILE_NOT_IN_ROOT_PATH');
			}
		} else {
			var sid = base64url.toBase64(file);
			var sidfile;

			try {
				sidfile = aesObj.decrypt(sid, userid);
			} catch (err) {
				if (!aesObjDepd) throw err;

				debug('use depd aes, err: %o', err);
				try {
					sidfile = aesObjDepd.decrypt(sid, userid);
				} catch (err) {
					// 兼容没有userid
					sidfile = aesObjDepd.decrypt(sid);
				}
			}

			return dir + sidfile;
		}
	},

	file: function() {
		var index = ++this._index;
		// linux math files is 32000
		if (index > 20000) {
			this._dir = null;
			this._index = index = 0;
		}

		return this.path()
			.then(function(dir) {
				return dir + '/' + index;
			});
	},

	path: function() {
		var self = this;
		var daypath = this.timekey.key();

		if (self._dir) {
			return self._dir.then(function(oldInfo) {
				if (oldInfo && oldInfo.daypath == daypath) return oldInfo.static;

				debug('new path, name:%s oldInfo:%o new daypath:%s', self.name, oldInfo, daypath);
				return self._setSelfDir(daypath);
			});
		} else {
			return self._setSelfDir(daypath);
		}
	},
	_setSelfDir: function(daypath) {
		var promise = this._newPath(daypath);
		this._dir = promise.then(function(newpath) {
			return {
				daypath: daypath,
				static: newpath
			};
		});

		return promise;
	},
	_newPath: function(daypath) {
		var self = this;
		var random = '' + (Math.random() * 1000 | 0);
		// 补齐一下位数，目录创建出来整齐一些
		random = '0000'.substr(random.length) + random;

		var subpath = process.pid + '_' + random;
		var newpath = this._root() + daypath + '/' + subpath;

		return fs.statAsync(newpath)
			.then(function() {
				return self._newPath(daypath);
			},
			function() {
				return mkdirp(newpath)
					.then(function() {
						return newpath;
					});
			});
	},

	_root: function() {
		return this.root + '/' + this.name + '/';
	},
};
