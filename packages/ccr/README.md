# CCR

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
const cache = require('ccr')('test_cache');
// aes: aes key or aesid obj

cache.file('userid').then(file => {
    // mkdirp paths auto
    console.log(file);
    // print /tmp/node-ccr/test_cache/2018/0523/15929_0148/userid_1

    const sid = cache.filekey(file, 'userid');
    // print S1Agc3os25Nynh4uI2tl5ZNOlBN7yUU1PvF1RTUJ5WsGHzDoPE9RdgAZbKvvr7EP
    console.log(cache.filekey(sid, 'userid'));
    // print /tmp/node-ccr/test_cache/2018/0523/15929_0148/userid_1

    // .... write content into file ....

    // encrypt file
    return cache.mvEncryptFile(sid, 'userid')
        // read encrypt file
        .then(() => cache.readEncryptFile(sid, 'userid'))
        // or use read stream
        .then(() => cache.createReadEncryptFileStream(sid, 'userid'));
});
```

[npm-image]: https://img.shields.io/npm/v/ccr.svg
[downloads-image]: https://img.shields.io/npm/dm/ccr.svg
[npm-url]: https://www.npmjs.org/package/ccr
[license-image]: https://img.shields.io/npm/l/ccr.svg
[install-size-url]: https://packagephobia.now.sh/result?p=ccr
[install-size-image]: https://packagephobia.now.sh/badge?p=ccr
