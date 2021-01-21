'use strict';

const minimist = require('minimist');
let args = minimist(process.argv.slice(2), {
  default: {
    b: 0,
    a: 0,
    l: '',
  }
});

if (args._.length == 0) {
  console.log('使用方法：');
  console.log('\tnode index.js [-b 数字] [-a 数字] [-l 链接地址] 小说目录地址');
  console.log('可选参数：');
  console.log('\t-b\tnumber\t跳过列表前连续的几个链接。用于有些小说会提取最新的几个章节放在列表前（跟列表同一级）的情况');
  console.log('\t-a\tnumber\t跳过列表后连续的几个链接。用于有些小说会出现重复或者其它无关的章节的情况');
  console.log('\t-l\tstring\t要跳过读取的链接完整地址，多个用逗号分隔。用于一些章节发布错误或其他原因导致内容无效的情况');
  process.exit(0);
}

const XiaoShuo = require('./lib/xiaoshuo');

new XiaoShuo(args._[0], {
  skip: {
    before: parseInt(args.b || 0),
    after: parseInt(args.a || 0),
    links: args.l ? args.l.replace(/[，|、｜。|\s]/g, ',').split(',') : [],
  }
});
