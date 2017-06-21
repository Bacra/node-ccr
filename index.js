var Promise	= require('bluebird');
var crypto	= require('crypto');
var fs		= Promise.promisifyAll(require('fs'));
var mkdirp	= Promise.promisify(require('mkdirp'));
var path	= Promise.promisifyAll(require('path'));
var debug	= require('debug')('ccr');

exports = module.exports = Cacher;
exports.root = '/tmp/node-ccr';

var pathClearReg = /[\/\\]?\.\.[\/\\]/g;
var safeBase64Reg1 = /\-/g;
var safeBase64Reg11 = /\+/g;
var safeBase64Reg2 = /_/g;
var safeBase64Reg21 = /\//g;
var safeBase64Reg3 = /=+$/g;


var today, nextUpdate;
function getToday()
{
	var now = new Date;
	if (!today || nextUpdate < now)
	{
		var arr =
			[
				now.getFullYear(),
				zero(now.getMonth()+1),
				zero(now.getDate())
			];
		today = arr.join('');
		nextUpdate = new Date(arr.join('/')+' 0:0:0');
		nextUpdate.setDate(nextUpdate.getDate()+1);
		nextUpdate = +nextUpdate;
	}

	return today;
}

function zero(num)
{
	return num > 9 ? num : '0'+num;
}



// Main
function Cacher(name, options)
{
	if (!(this instanceof Cacher))
	{
		return new Cacher(name, options);
	}

	this.name = this.clear(name);
	this.index = 0;
	this.options = options || {};
	this.root = this.options.root || exports.root;
}

Cacher.prototype =
{
	downloadkey: function(file)
	{
		if (!file) return;

		var aes_key = this.options.aes_key || this.name+'/do&j3m()==3{]ddd';
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
				.replace(safeBase64Reg2, '\/');

			var decipher = crypto.createDecipher('aes-256-cbc', aes_key);
			var info = decipher.update(file, 'base64', 'utf8');
			info += decipher.final('utf8');

			var arr = info.split(',');
			var ttl = +arr.pop();

			if (ttl)
			{
				return {
					file: dir + arr.join(','),
					ttl: +ttl
				};
			}
			else
			{
				throw new Error('INVALID_FILE_SID');
			}
		}
	},



	write: function(content, userid)
	{
		var self = this;

		return self.file(userid)
			.then(function(file)
			{
				var tmpfile = file+'.ccr~';

				return fs.writeFileAsync(tmpfile, content)
					.then(function()
					{
						return fs.renameAsync(tmpfile, file);
					});
			});
	},

	file: function(userid)
	{
		var self = this;

		return this.path(userid)
			.then(function(dir)
			{
				return dir+'/'+self.filename();
			});
	},

	filename: function()
	{
		if (++this.index > 999) this.index = 0;
		return [process.pid, Date.now(), this.index].join('_')+'.tmp';
	},

	path: function(userid)
	{
		var dir = this.pathstr(userid);

		return fs.statAsync(dir)
			.catch(function(err)
			{
				if (err)
				{
					debug('path maybe not exists: %s err:%o', dir, err);
					return mkdirp(dir);
				}
			})
			.then(function()
			{
				return dir;
			});
	},
	_root: function()
	{
		return this.root+'/'+this.name+'/';
	},

	pathstr: function(userid)
	{
		var dir = this._root();
		var datepath = this.options.datepath;
		if (datepath !== false)
		{
			dir += datepath || getToday();
		}

		var subdir = this.options.subdir !== false && (this.options.subdir || 'md5');

		// 增加一个二级目录
		if (userid && (subdir == 'md5' || subdir == 'userid'))
		{
			if (subdir == 'userid')
			{
				userid = this.clear(userid);
				dir += '/id_'+(''+userid).slice(-3);
				var dir2 = (''+userid).slice(-6, -3);
				if (dir2) dir += '/b'+dir2;
				dir += '/'+userid;
			}
			else
			{
				var md5 = crypto.createHash('md5')
					.update(''+userid, 'binary')
					.digest('hex');

				dir += '/md5_'+md5.slice(0, 2)+'/'+md5.slice(2);
			}
		}
		else if (this.options.subdir !== false)
		{
			// random 类似于
			if (++this.index > 999) this.index = 0;
			dir += '/rd_'+this.index;
		}

		debug('path string: %s', dir);

		return dir;
	},

	clear: function(dir)
	{
		return (''+dir).replace(pathClearReg, './');
	}
};

