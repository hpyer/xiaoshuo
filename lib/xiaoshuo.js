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
    }
    catch (e) {
      throw new Error(`未配置${info.hostname}`);
    }

    this.run(url);
  }

  async run(url) {
    let { title, chapters } = await this.getChapters(url);

    let file = Path.resolve(__dirname + `/../files/${title}.txt`);

    // 写入标题
    this.writeFile(file, `《${title}》\n\n`, 'w');

    this.output(`《${title}》开始下载...\n`);

    for (let i = 0; i < chapters.length; i++) {
      let content = await this.getChapterContent(chapters[i].link);

      content = chapters[i].text + '\n\n' + content + '\n\n';

      this.writeFile(file, content);

      this.flush();
      this.output(`第${(i + 1)}章已下载，进度：${((i + 1) / chapters.length * 100).toFixed(2)}%`);
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

    return content;
  }

  async getChapters(url) {
    let content = await this.doRequest({
      url,
      encoding: 'binary'
    });
    content = this.iconv(content);

    let $ = CheerIO.load(content);
    let title = $(this.config.selector.title).eq(0).text().trim();
    let list = $(this.config.selector.list);

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
    let content = '';
    let i = 0;
    for (; i < 3; i++) {
      try {
        content = await this.doRequest({
          url,
          encoding: 'binary'
        });
        content = this.iconv(content);
        break;
      }
      catch (e) { }
    }
    if (i == 3) {
      throw new Error('无法获取章节内容');
    }

    let $ = CheerIO.load(content, {
      decodeEntities: false,
    });
    let chapter = $(this.config.selector.content);

    chapter = (chapter.eq(0).html() + '').trim();
    chapter = chapter.replace(new RegExp('<br>', 'ig'), '\n');
    chapter = chapter.replace(new RegExp('<p>', 'ig'), '');
    chapter = chapter.replace(new RegExp('</p>', 'ig'), '\n');
    if (this.config.trim.before) {
      chapter = chapter.replace(new RegExp(`^${this.config.trim.before}`, 'ig'), '');
    }
    if (this.config.trim.after) {
      chapter = chapter.replace(new RegExp(`${this.config.trim.after}$`, 'ig'), '');
    }

    // console.log(chapter);
    return chapter;
  }

  doRequest(payload) {
    payload.timeout = payload.timeout || 10000;
    payload.headers = payload.header || {};
    payload.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36';

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

  flush() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }

  output(msg) {
    process.stdout.write(msg);
  }

}
