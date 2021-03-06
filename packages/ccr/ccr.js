const Promise = require('bluebird');
const stream = require('stream');
const pipeline = Promise.promisify(stream.pipeline);
const finished = Promise.promisify(stream.finished);
const fs = Promise.promisifyAll(require('fs'));
const debug = require('debug')('ccr');
const aesid = require('aesid');
const ccrFile = require('ccr-file');
const ccrAesPath = require('ccr-aes-path');

exports = module.exports = CCR;
exports.ccrFile = ccrFile;
exports.root = '/tmp/node-ccr';

function CCR(name, options) {
	if (!(this instanceof CCR)) {
		return new CCR(name, options);
	}
	if (!options) options = {};

	const ccrFileOptions = Object.assign({
		root: exports.root
	}, options);

	this.cache = ccrFile(name, ccrFileOptions);
	this.aes = aesid.is(options.aes)
		? options.aes
		: aesid(options.aes || this.cache.name + '/ddx^d88=++4@rf.co', options);

	this.aeskey = ccrAesPath(this.cache.root(), this.aes, options);
}

CCR.prototype = {
	file: function() {
		return this.cache.file.apply(this.cache, arguments);
	},
	path: function() {
		return this.cache.path.apply(this.cache, arguments);
	},
	filekey: function() {
		return this.aeskey.apply(null, arguments);
	},

	// 对文件内容进行加解密
	mvEncryptFile: function(sid, userid, keepOldFile) {
		const file = this.filekey(sid);
		const encryptFile = file + '.encrypt~';
		debug('encryptFile: %s', encryptFile);

		return pipeline(
				fs.createReadStream(file),
				this.aes.createCipherFromSid(sid, userid),
				fs.createWriteStream(encryptFile)
			)
			.then(function() {
				if (keepOldFile) return;
				return fs.unlinkAsync(file);
			});
	},
	createReadEncryptFileStream: function(sid, userid) {
		const file = this.filekey(sid, userid);
		const encryptFile = file + '.encrypt~';
		debug('encryptFile: %s', encryptFile);

		return fs.createReadStream(encryptFile)
			.pipe(this.aes.createDecipherFromSid(sid, userid));
	},
	readEncryptFile: function() {
		const rs = this.createReadEncryptFileStream.apply(this, arguments);
		const promise = finished(rs);
		const outputs = [];

		rs.on('data', function(buf) {
			outputs.push(buf);
		});

		rs.resume();

		return promise.then(function() {
			return Buffer.concat(outputs);
		});
	},
};
