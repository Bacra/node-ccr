# CCR-FILE

File Cache Mgr.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![NPM License][license-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]

## Install

```shell
npm install ccr-file --save
```

## Usage

```javascript
var cache = require('ccr-file')('test_cache', { root: __dirname });

cache.file('userid').then(function(file) {
    // mkdirp paths auto
    console.log(file);
    // print /tmp/node-ccr/test_cache/2018/0523/15929_0148/userid_1
});
```

[npm-image]: https://img.shields.io/npm/v/ccr-file.svg
[downloads-image]: https://img.shields.io/npm/dm/ccr-file.svg
[npm-url]: https://www.npmjs.org/package/ccr-file
[license-image]: https://img.shields.io/npm/l/ccr-file.svg
[install-size-url]: https://packagephobia.now.sh/result?p=ccr-file
[install-size-image]: https://packagephobia.now.sh/badge?p=ccr-file
