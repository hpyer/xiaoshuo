'use strict';

module.exports = {
  // 编码
  charset: 'utf-8',
  // 选择器设置
  selector: {
    // 标题选择器，须定位到标题名称
    title: '.title h1',
    // 列表选择器，须定位到链接标签a
    list: '.list a',
    // 内容选择器，须定位到内容
    content: '.content',
  },
  // 是否已完结，如设置为false，则会保留本次下载章节标识，下次可继续下载
  isFinish: true,
  // 去除内容设置（正则表达式）
  trim: {
    // 去除内容前无效内容
    before: '',
    // 去除内容后无效内容
    after: '',
  },
}
