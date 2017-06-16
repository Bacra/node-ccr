c(a)c(he)r  [![Build Status](https://travis-ci.org/Bacra/node-ccr.svg?branch=master)](https://travis-ci.org/Bacra/node-ccr)
==================

File Cache Mgr.

## Usage

```javascript
var cache = require('ccr')('user_cache');

// write file content, return promise
cache.write('file content', 'userid');

var dir = cache.pathstr('userid');
console.log(dir);
// print "/tmp/node-ccr/user_cache/20170616/md5_ea/8f538c94b6e352418254ed6474a81f"

var filename = cache.filename();
console.log(filename);
// print "13800_1497619564546_1.tmp"

cache.file('userid').then(function(file){console.log(file)})
// return promise
// print "/tmp/node-ccr/user_cache/20170616/md5_ea/8f538c94b6e352418254ed6474a81f/13800_1497619564552_3.tmp"
```
