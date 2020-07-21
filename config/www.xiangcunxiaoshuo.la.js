'use strict';

module.exports = {
  // 编码
  charset: 'gbk',
  // 选择器
  selector: {
    // 标题选择器，须定位到标题名称
    title: 'section.ml_title h1',
    // 列表选择器，须定位到链接标签a
    list: 'section.ml_main dl a',
    // 内容选择器，须定位到内容
    content: 'div.yd_text2',
  },
  // 添加前置基础域名
  prependBaseUrl: true,
  // 去除无效内容
  trim: {
    // 内容后
    after: '微信搜索公众号：wmdy66，你寂寞，小姐姐用电影温暖你',
  }
}
