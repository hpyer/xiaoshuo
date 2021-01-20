'use strict';

const Url = require("url");
const Request = require('request');
const CheerIO = require('cheerio');
const Iconv = require('iconv-lite');
const Merge = require('merge');
const Fs = require('fs');
const Path = require('path');
const DefaultConfig = require('./config.default');

module.exports = class XiaoShuo {
  constructor(url) {
    let info = Url.parse(url);

    this.protocal = info.protocol;
    this.baseUrl = Url.format({
      protocol: info.protocol,
      host: info.host,
      port: info.port,
    });

    try {
      let config = require(Path.resolve(__dirname + `/../config/${info.hostname}`));
      this.config = Merge({}, DefaultConfig, config);

      this.config.charset = (this.config.charset + '').toLowerCase();
      if (this.config.charset == 'utf8') {
        this.config.charset = 'utf-8';
      }

      this.run(url);
    }
    catch (e) {
      console.error(`未配置${info.hostname}`);
    }
  }

  async run(url) {
    let title, chapters;
    try {
      let res = await this.getChapters(url);
      title = res.title;
      chapters = res.chapters;
    }
    catch (e) {
      console.error(e.message);
      return;
    }

    let file = Path.resolve(__dirname + `/../files/${title}.txt`);
    let tmp_file = Path.resolve(__dirname + `/../files/${title}.tmp`);

    // 写入标题
    this.writeFile(file, `《${title}》\n\n`, 'w');

    this.output(`《${title}》开始下载...\n`);

    let i = 0;
    try {
      i = parseInt(this.readFile(tmp_file) || 0);
    }
    catch (e) {}
    let content = '';
    for (; i < chapters.length; i++) {
      this.writeFile(tmp_file, i, 'w');
      try {
        content = await this.getChapterContent(chapters[i].link);
      }
      catch (e) {
        console.error(e.message);
        return;
      }

      content = chapters[i].text + '\n\n' + content + '\n\n';

      this.writeFile(file, content);

      this.flush();
      this.output(`第${(i + 1)}章已下载，进度：${((i + 1) / chapters.length * 100).toFixed(2)}%`);
    }

    if (this.config.isFinish) {
      this.deleteFile(tmp_file);
    }
    else {
      this.writeFile(tmp_file, i, 'w');
    }

    this.flush();
    this.output('下载完成\n');
  }

  iconv(content) {
    if (this.config.charset != 'utf-8') {
      content = Iconv.decode(Buffer.from(content, 'binary'), this.config.charset);
    }
    else {
      content = Buffer.from(content, 'binary');
    }

    return content.toString();
  }

  async getChapters(url) {
    let content = await this.doRequest({
      url,
      encoding: 'binary'
    });
    content = this.iconv(content);
    if (!content) {
      throw new Error('无法获取目录页');
    }

    let $ = CheerIO.load(content);
    let title = $(this.config.selector.title).eq(0).text().trim();
    if (!title) {
      console.info('DEBUG:', content);
      throw new Error('无法获取书名');
    }
    let list = $(this.config.selector.list);
    if (!title) {
      console.info('DEBUG:', content);
      throw new Error('无法获取章节列表');
    }

    let chapters = [];
    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let item = list.eq(i);
        if (!item) continue;
        let link = item.attr('href');
        if (this.config.prependBaseUrl) {
          link = this.baseUrl + link;
        }
        else if (this.config.prependProtocal) {
          link = this.protocal + link;
        }
        chapters.push({
          text: item.text().trim(),
          link: link,
        });
      }
    }

    // console.log(list);
    return { title, chapters };
  }

  async getChapterContent(url) {
    let html = '';
    let i = 0;
    for (; i < 3; i++) {
      try {
        html = await this.doRequest({
          url,
          encoding: 'binary'
        });
        html = this.iconv(html);
        if (html) break;
        break;
      }
      catch (e) { }
    }
    if (i == 3) {
      throw new Error('无法获取章节内容');
    }

    let $ = CheerIO.load(html, {
      decodeEntities: false,
    });
    let chapter = $(this.config.selector.content);

    let content = (chapter.eq(0).html() + '').trim();
    content = content.replace(new RegExp('<br>', 'ig'), '\n');
    content = content.replace(new RegExp('<p>', 'ig'), '');
    content = content.replace(new RegExp('</p>', 'ig'), '\n');
    if (this.config.trim.before) {
      content = content.replace(new RegExp(`^${this.config.trim.before}`, 'ig'), '');
    }
    if (this.config.trim.after) {
      content = content.replace(new RegExp(`${this.config.trim.after}$`, 'ig'), '');
    }

    if (!content || content == 'null') {
      console.info('DEBUG::', content);
      throw new Error('章节内容为空');
    }

    return content;
  }

  doRequest(payload) {
    payload.timeout = payload.timeout || 10000;
    payload.headers = payload.header || {};
    payload.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
    payload.headers['Accept-Encoding'] = 'compress';
    payload.headers['Accept-Language'] = 'zh-CN,zh;q=0.9';
    payload.headers['Cache-Control'] = 'no-cache';
    payload.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36';

    return new Promise((resolve, reject) => {
      Request(payload, (error, response, body) => {
        if (error) {
          reject(error)
        }
        else {
          resolve(body);
        }
      });
    });
  }

  writeFile(file, content, flag = 'a') {
    Fs.writeFileSync(file, content, {
      flag
    });
  }

  readFile(file, flag = 'r') {
    return Fs.readFileSync(file, {
      flag
    });
  }

  deleteFile(file) {
    Fs.unlinkSync(file);
  }

  flush() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }

  output(msg) {
    process.stdout.write(msg);
  }

}
