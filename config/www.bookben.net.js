'use strict';

module.exports = {
  // 选择器
  selector: {
    // 标题选择器，须定位到标题名称
    title: 'dl.yxjj h2 a',
    // 列表选择器，须定位到链接标签a
    list: 'div.info_views a',
    // 内容选择器，须定位到内容
    content: 'div#content',
  },
  // 跳过设置
  skip: {
    // 跳过列表后连续的几个链接。因为有些网站会有一些重复章节出现
    after: 967,
  },
}
