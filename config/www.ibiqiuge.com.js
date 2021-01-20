'use strict';

module.exports = {
  // 编码
  charset: 'gbk',
  // 选择器
  selector: {
    // 标题选择器，须定位到标题名称
    title: 'div#info h1',
    // 列表选择器，须定位到链接标签a
    list: 'div#list a',
    // 内容选择器，须定位到内容
    content: 'div#content',
  },
  // 跳过设置
  skip: {
    // 跳过列表前连续的几个链接。因为有些网站会将最新的几个章节放在列表前（跟列表同一级）
    before: 9,
    // 跳过列表后连续的几个链接。因为有些网站会有一些重复章节出现
    after: 967,
  },
}
