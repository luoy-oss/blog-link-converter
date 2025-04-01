/**
 * 博客友链格式转换器 - Serverless API
 * 
 * 为Vercel部署提供的Serverless函数
 * 
 * @author luoy-oss <2557657882@qq.com>
 * @website https://www.drluo.top
 * @github https://www.github.com/luoy-oss
 */

const { convertBlogLink } = require('../utils/converter');

module.exports = (req, res) => {
  // 设置CORS头，允许跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ 
          error: true, 
          message: '请提供友链数据' 
        });
      }
      
      const convertedData = convertBlogLink(data);
      
      return res.json({
        success: true,
        data: convertedData
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
  
  if (req.method === 'GET') {
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
      
      return res.json({
        success: true,
        data: convertedData
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }

  return res.status(200).json({
    message: '请使用GET请求(?data=友链数据)或POST请求发送友链数据',
    author: 'luoy-oss',
    website: 'https://www.drluo.top',
    github: 'https://www.github.com/luoy-oss'
  });
};