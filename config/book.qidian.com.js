'use strict';

module.exports = {
  // 选择器
  selector: {
    // 标题选择器，须定位到标题名称
    title: 'div.book-info em',
    // 列表选择器，须定位到链接标签a
    list: 'div.volume ul.cf a',
    // 内容选择器，须定位到内容
    content: 'div.read-content',
  },
}
