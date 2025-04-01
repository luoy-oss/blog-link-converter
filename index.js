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
    <p>使用POST请求发送原始友链数据到 /api/convert 端点</p>
    <p>或者使用GET请求：/api/convert?data=友链数据</p>
    <p>项目作者: <a href="https://www.drluo.top" target="_blank">luoy-oss</a></p>
    <p>GitHub: <a href="https://www.github.com/luoy-oss" target="_blank">luoy-oss</a></p>
  `);
});

app.post('/api/convert', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ 
        error: true, 
        message: '请提供友链数据' 
      });
    }
    
    const convertedData = convertBlogLink(data);
    
    res.json({
      success: true,
      data: convertedData
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

app.get('/api/convert', (req, res) => {
  try {
    const { data } = req.query;
    
    if (!data) {
      return res.status(400).json({ 
        error: true, 
        message: '请提供友链数据，例如：/api/convert?data=友链数据' 
      });
    }
    
    // 对URL参数进行解码
    const decodedData = decodeURIComponent(data);
    const convertedData = convertBlogLink(decodedData);
    
    res.json({
      success: true,
      data: convertedData
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;