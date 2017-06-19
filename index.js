var Promise	= require('bluebird');
var crypto	= require('crypto');
var fs		= Promise.promisifyAll(require('fs'));
var mkdirp	= Promise.promisify(require('mkdirp'));
var path	= Promise.promisifyAll(require('path'));
var debug	= require('debug')('ccr');

exports = module.exports = Cacher;
exports.root = '/tmp/node-ccr';

var pathClearReg = /[\/\\]?\.\.[\/\\]/g;


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

	this.root = exports.root;
	this.name = this.clear(name);
	this.index = 0;
	this.options = options || {};
}

Cacher.prototype =
{
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

	pathstr: function(userid)
	{
		var dir = this.root+'/'+this.name;
		var datepath = this.options.datepath;
		if (datepath !== false)
		{
			dir += '/'+(datepath || getToday());
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

