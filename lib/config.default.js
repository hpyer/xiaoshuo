'use strict';

module.exports = {
  // 编码
  charset: 'utf-8',
  // 选择器
  selector: {
    // 标题选择器，须定位到标题名称
    title: '.title h1',
    // 列表选择器，须定位到链接标签a
    list: '.list a',
    // 内容选择器，须定位到内容
    content: '.content',
  },
  // 添加前置基础域名
  prependBaseUrl: false,
  // 添加前置协议
  prependProtocal: false,
  // 去除内容前后无效内容
  trim: {
    // 内容前
    before: '',
    // 内容后
    after: '',
  }
}
