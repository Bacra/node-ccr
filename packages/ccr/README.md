# CCR

File Cache Mgr.

## Install

```shell
npm install ccr --save
```

## Usage

```javascript
var cache = require('ccr')('test_cache');

cache.file('userid').then(function(file) {
    // mkdirp paths auto
    console.log(file);
    // print /tmp/node-ccr/test_cache/2018/0523/15929_0148/1

    var sid = cache.downloadkey(file, 'userid');
    // print S1Agc3os25Nynh4uI2tl5ZNOlBN7yUU1PvF1RTUJ5WsGHzDoPE9RdgAZbKvvr7EP
    console.log(cache.downloadkey(sid, 'userid'));
    // print { file: '/tmp/node-ccr/test_cache/2018/0523/15929_0148/1', ttl: 1527075918176 }
});
```
