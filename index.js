/**
 * 博客友链格式转换器 - 主服务入口
 * 
 * 提供REST API接口，将不同格式的博客友链数据转换为统一格式
 * 
 * @author luoy-oss <2557657882@qq.com>
 * @website https://www.drluo.top
 * @github https://www.github.com/luoy-oss
 */

const express = require('express');
const bodyParser = require('body-parser');
const { convertBlogLink } = require('./utils/converter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <h1>博客友链格式转换器</h1>
    <p>当你看到这段文字时，说明服务已成功启动</p>
    <p>请使用以下方式进行友链数据转换</p>
    <p>1. 使用POST请求发送原始友链数据到 /api/convert 端口</p>
    <p>2. 使用GET请求：/api/convert?data=友链数据</p>
    <p>GitHub: <a href="https://www.github.com/luoy-oss" target="_blank">luoy-oss</a></p>
    <p>GitHub仓库: <a href="https://github.com/luoy-oss/blog-link-converter" target="_blank">blog-link-converter</a></p>
    <p>作者主页: <a href="https://www.drluo.top" target="_blank">drluo.top</a></p>
  `);
});

const convertRouter = require('./api/convert');
app.use('/api/convert', convertRouter);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;