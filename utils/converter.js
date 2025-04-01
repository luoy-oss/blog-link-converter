/**
 * 博客友链格式转换工具
 * 
 * 将各种不同格式的博客友链数据转换为统一的标准格式
 * 支持JSON、YAML、Markdown等多种常见友链格式
 * 
 * @author luoy-oss <2557657882@qq.com>
 * @website https://www.drluo.top
 * @github https://www.github.com/luoy-oss
 */

/**
 * 将不同格式的博客友链数据转换为统一格式
 * @param {string} rawData - 原始友链数据
 * @returns {Object} - 转换后的标准格式
 */
function convertBlogLink(rawData) {
  // 标准化输出格式
  const standardFormat = {
    title: "",
    screenshot: "",
    url: "",
    avatar: "",
    description: "",
    keywords: ""
  };

  try {
    const result = { ...standardFormat };
    
    let processedData = rawData;
    
    processedData = processedData.replace(/#[^\n]*/g, '');
    
    // 预处理单引号问题 - 将包含撇号的单引号字符串转换为双引号字符串
    // 例如: title: 'Hello I'm xxx' -> title: "Hello I'm xxx"
    processedData = processedData.replace(/([a-zA-Z0-9_]+)\s*:\s*'([^']*?)'([,\s}])/g, function(match, key, value, ending) {
      const escapedValue = value.replace(/'/g, "\\'");
      return key + ': "' + escapedValue + '"' + ending;
    });
    
    // json
    try {
      const jsonRegex = /{[\s\S]*?}/g;
      const jsonMatches = rawData.match(jsonRegex);
      
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          let processedJson = jsonStr
            .replace(/#[^\n]*/g, '')                        // 移除注释
            .replace(/:\s*,/g, ': "",')                     // 修复空值字段
            .replace(/,\s*}/g, '}')                         // 修复末尾多余的逗号
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')   // 给没有引号的键名加上引号
            .replace(/:\s*'([^']*)'/g, ': "$1"')            // 将单引号替换为双引号
            .replace(/:\s*'([^']*)'/g, ': "$1"');           // 再次替换，处理嵌套的单引号
          
          try {
            const jsonData = JSON.parse(processedJson);
            // 关键字段检查
            if (jsonData.title || jsonData.name || jsonData.url || jsonData.link) {
              extractJsonFields(jsonData, result);
              break;
            }
          } catch (e) {
            console.log("JSON解析错误:", e.message);
          }
        }
      }
    } catch (e) {
      console.log("JSON提取错误:", e.message);
    }
    
    // yaml
    if (!result.title || !result.url) {
      const lines = rawData.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 跳过空行、注释和以破折号开头的行
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        const keyValueRegex = /^(?:-\s*)?([^:]+):\s*(.+)$/;
        const match = trimmedLine.match(keyValueRegex);
        
        if (match) {
          const key = match[1].trim().toLowerCase();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          
          if (value) {
            mapFieldToStandardFormat(key, value, result);
          }
        }
      }
    }
    
    // 中文冒号分隔的键值对（如：名称：洛屿）
    if (!result.title || !result.url) {
      const chineseColonRegex = /([^：\n]+)：\s*([^\n]+)/g;
      let match;
      
      while ((match = chineseColonRegex.exec(rawData)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        
        if (value) {
          if (key.toLowerCase().replace(/\s+/g, '').includes('头像') || 
              key.toLowerCase().replace(/\s+/g, '').includes('avatar') || 
              key.toLowerCase().replace(/\s+/g, '').includes('image')) {
            result.avatar = value;
          } else {
            mapFieldToStandardFormat(key, value, result);
          }
        }
      }
    }
    
    // 普通冒号
    if (!result.title || !result.url) {
      const colonSeparatedRegex = /([^:\n]+)[:\t]\s*([^\n]+)/g;
      let match;
      
      while ((match = colonSeparatedRegex.exec(rawData)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        
        if (value) {
          if (key.toLowerCase().replace(/\s+/g, '').includes('头像') || 
              key.toLowerCase().replace(/\s+/g, '').includes('avatar') || 
              key.toLowerCase().replace(/\s+/g, '').includes('image')) {
            result.avatar = value;
          } else {
            mapFieldToStandardFormat(key, value, result);
          }
        }
      }
    }
    
    if (!result.url) {
      const urlRegex = /https?:\/\/[^\s"']+/g;
      const urlMatches = rawData.match(urlRegex);
      
      if (urlMatches) {
        result.url = ensureHttpProtocol(urlMatches[0]);
        
        const lines = rawData.split('\n');
        for (const line of lines) {
          if (line.includes(result.url) || line.includes(result.url.replace(/^https?:\/\//, ''))) {
            const titleCandidate = line
              .replace(result.url, '')
              .replace(result.url.replace(/^https?:\/\//, ''), '')
              .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
              .trim();
            
            if (titleCandidate && !result.title) {
              result.title = titleCandidate;
            }
          }
        }
        
        for (const url of urlMatches) {
          if (/\.(jpg|jpeg|png|gif|webp|jfif)/i.test(url) && !result.avatar) {
            result.avatar = ensureHttpProtocol(url);
            break;
          }
        }
      }
    }
    
    result.url = ensureHttpProtocol(result.url);
    result.avatar = ensureHttpProtocol(result.avatar);
    result.screenshot = ensureHttpProtocol(result.screenshot);
    
    // 默认截图
    if (!result.screenshot && result.url) {
      result.screenshot = generateDefaultScreenshot(result.url);
    }
    
    // 多余字符清理
    result.title = cleanFieldValue(result.title);
    result.description = cleanFieldValue(result.description);
    result.keywords = cleanFieldValue(result.keywords);
    result.url = cleanUrl(ensureHttpProtocol(result.url));
    result.avatar = cleanUrl(ensureHttpProtocol(result.avatar));
    result.screenshot = cleanUrl(ensureHttpProtocol(result.screenshot));
    
    return result;
  } catch (error) {
    console.error("转换错误:", error);
    return {
      error: true,
      message: "无法识别的友链格式",
      original: rawData
    };
  }
}

/**
 * 从JSON对象中提取字段到标准格式
 * @param {Object} jsonData - JSON对象
 * @param {Object} result - 标准格式结果对象
 */
function extractJsonFields(jsonData, result) {
  if (jsonData.title || jsonData.name) result.title = jsonData.title || jsonData.name;
  if (jsonData.screenshot || jsonData.siteshot) result.screenshot = jsonData.screenshot || jsonData.siteshot;
  if (jsonData.url || jsonData.link) result.url = jsonData.url || jsonData.link;
  if (jsonData.avatar || jsonData.image) result.avatar = jsonData.avatar || jsonData.image;
  if (jsonData.description || jsonData.descr || jsonData.intro) {
    result.description = jsonData.description || jsonData.descr || jsonData.intro;
  }
  if (jsonData.keywords || jsonData.group) {
    const groupValue = jsonData.keywords || jsonData.group;
    result.keywords = (groupValue && typeof groupValue === 'string') ? groupValue : "";
  }
}

/**
 * 将字段名映射到标准格式
 * @param {string} key - 字段名
 * @param {string} value - 字段值
 * @param {Object} result - 标准格式结果对象
 */
function mapFieldToStandardFormat(key, value, result) {
  // 多余空格移除，转小写
  const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
  // console.log(`键名: ${normalizedKey}, 值: ${value}`);
  
  if (normalizedKey.includes('name') || normalizedKey.includes('title') || normalizedKey.includes('站点名称') || 
      normalizedKey.includes('昵称') || normalizedKey.includes('站名') || normalizedKey === '名称' || 
      normalizedKey === '站名') {
    if (!result.title) result.title = value;
  } 
  else if (normalizedKey.includes('screenshot') || normalizedKey.includes('siteshot') || 
           normalizedKey.includes('站点截图') || normalizedKey.includes('预览图')) {
    if (!result.screenshot) result.screenshot = value;
  } 
  else if (normalizedKey.includes('url') || normalizedKey.includes('link') || 
           normalizedKey.includes('站点链接') || normalizedKey.includes('博客地址') || 
           normalizedKey.includes('链接') || normalizedKey.includes('地址')) {
    if (!result.url) result.url = value;
  } 
  else if (normalizedKey.includes('avatar') || normalizedKey.includes('image') || 
           normalizedKey.includes('站长头像') || normalizedKey.includes('头像') || 
           normalizedKey.includes('图标') || normalizedKey.includes('标志')) {
    if (!result.avatar) result.avatar = value;
  } 
  else if (normalizedKey.includes('description') || normalizedKey.includes('descr') || 
           normalizedKey.includes('intro') || normalizedKey.includes('站点描述') || 
           normalizedKey.includes('简介') || normalizedKey.includes('一句话描述') || 
           normalizedKey === '描述') {
    if (!result.description) result.description = value;
  } 
  else if (normalizedKey.includes('keywords') || normalizedKey.includes('group') || 
           normalizedKey.includes('站点关键词') || normalizedKey.includes('关键词') || 
           normalizedKey.includes('博客主题')) {
    if (!result.keywords) result.keywords = value;
  }
}

/**
 * 确保URL包含协议部分
 * @param {string} url - 原始URL
 * @returns {string} - 处理后的URL
 */
function ensureHttpProtocol(url) {
  if (!url) return "";
  
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  
  if (!/^https?:\/\//i.test(url) && url.includes('.')) {
    return 'https://' + url;
  }
  
  return url;
}

/**
 * 为站点URL生成默认的截图URL
 * @param {string} url - 站点URL
 * @returns {string} - 生成的截图URL
 */
function generateDefaultScreenshot(url) {
  if (!url) return "";
  
  url = ensureHttpProtocol(url);
  
  const cleanUrl = url.replace(/\/$/, "");
  
  return `https://image.thum.io/get/width/400/crop/800/allowJPG/wait/20/noanimate/${cleanUrl}`;
}

module.exports = { convertBlogLink };

/**
 * 清理字段值中的多余字符
 * @param {string} value - 原始字段值
 * @returns {string} - 清理后的字段值
 */
function cleanFieldValue(value) {
  if (!value) return "";
  
  let cleaned = value.replace(/['"`,\\]+$/, '');
  
  cleaned = cleaned.replace(/',$/, '');
  
  return cleaned;
}

/**
 * 清理URL中的多余字符
 * @param {string} url - 原始URL
 * @returns {string} - 清理后的URL
 */
function cleanUrl(url) {
  if (!url) return "";
  
  let cleaned = url.replace(/['"`,\\]+$/, '');
  
  cleaned = cleaned.replace(/',$/, '');
  
  return cleaned;
}
