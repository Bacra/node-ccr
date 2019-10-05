# CCR

File Cache Mgr.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![NPM License][license-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]

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

[npm-image]: https://img.shields.io/npm/v/ccr.svg
[downloads-image]: https://img.shields.io/npm/dm/ccr.svg
[npm-url]: https://www.npmjs.org/package/ccr
[license-image]: https://img.shields.io/npm/l/ccr.svg
[install-size-url]: https://packagephobia.now.sh/result?p=ccr
[install-size-image]: https://packagephobia.now.sh/badge?p=ccr
