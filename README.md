# starmanproton

一个简约美观的中文博客网站

## 特点

- 🎨 简约设计风格
- 📱 响应式布局，支持移动端
- 🚀 纯前端实现，无需后端
- 💻 使用自定义轻量级模板引擎替代Vue.js
- 🌐 支持中文内容展示

## 技术栈

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (自定义模板引擎)
- Font Awesome 图标

## 功能

- ✅ 博客文章列表展示
- ✅ 文章分类和标签
- ✅ 阅读时间估算
- ✅ 响应式导航栏
- ✅ 分页导航
- ✅ 社交媒体链接

## 运行方式

直接在浏览器中打开 `index.html` 文件，或者使用本地服务器：

```bash
# 使用Python 3
python3 -m http.server 8000

# 使用Node.js
npx serve .
```

然后访问 `http://localhost:8000`

## 自定义

可以在 `index.html` 文件中的 JavaScript 部分修改：

- `siteTitle`: 网站标题
- `pageTitle`: 页面主标题  
- `pageSubtitle`: 页面副标题
- `posts`: 博客文章数据

## 问题解决

原网站存在 Vue.js CDN 资源加载问题，导致模板插值显示为字面文本（如 `{{ siteTitle }}`）。现已使用自定义轻量级模板引擎替换，完美解决了 CDN 依赖问题，确保网站正常运行。