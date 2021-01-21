## xiaoshuo

Node.js写的小说爬虫

#### 使用方法

```bash
# 常规用法
# 参数在小说目录地址前后均可
node index.js [-b 数字] [-a 数字] [-l 链接地址] 小说目录地址

# 跳过列表前连续的几个链接。用于有些小说会提取最新的几个章节放在列表前（跟列表同一级）的情况
node index.js -b 9 小说目录地址

# 跳过列表后连续的几个链接。用于有些小说会出现重复或者其它无关的章节的情况
node index.js -a 9 小说目录地址

# 要跳过读取的链接完整地址，多个用逗号分隔。用于一些章节发布错误或其他原因导致内容无效的情况
node index.js -l https://www.example.com/book/read/1.html,https://www.example.com/book/read/2.html 小说目录地址
```
