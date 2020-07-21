'use strict';

let args = process.argv.splice(2);

if (!args[0]) {
  console.log('使用方法：node index.js 小说目录地址');
  process.exit(0);
}

const XiaoShuo = require('./lib/xiaoshuo');

new XiaoShuo(args[0]);
