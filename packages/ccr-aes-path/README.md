# CCR-AES-PATH

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![NPM License][license-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]

## Install

```shell
npm install ccr-aes-path --save
```

## Usage

```javascript
var cache = require('ccr')('test_cache');
// aes: aes key or aesid obj
var aeskey = require('ccr-ase-path')(cache, aes, aesidOptions);

cache.file('userid').then(function(file) {
    // mkdirp paths auto
    console.log(file);
    // print /tmp/node-ccr/test_cache/2018/0523/15929_0148/1

    var sid = aeskey(file, 'userid');
    // print S1Agc3os25Nynh4uI2tl5ZNOlBN7yUU1PvF1RTUJ5WsGHzDoPE9RdgAZbKvvr7EP
    console.log(aeskey(sid, 'userid'));
    // print { file: '/tmp/node-ccr/test_cache/2018/0523/15929_0148/1', ttl: 1527075918176 }
});
```

[npm-image]: https://img.shields.io/npm/v/ccr-aes-path.svg
[downloads-image]: https://img.shields.io/npm/dm/ccr-aes-path.svg
[npm-url]: https://www.npmjs.org/package/ccr-aes-path
[license-image]: https://img.shields.io/npm/l/ccr-aes-path.svg
[install-size-url]: https://packagephobia.now.sh/result?p=ccr-aes-path
[install-size-image]: https://packagephobia.now.sh/badge?p=ccr-aes-path
