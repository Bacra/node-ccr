var Promise = require('bluebird');
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
	this._dirPromise = null;
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

		var newpath = this._root() + daypath + '/' + subpath;

		return mkdirp(newpath)
			.then(function() {
				return newpath;
			});
	},

	_root: function() {
		return this.root + '/' + this.name + '/';
	},
};
