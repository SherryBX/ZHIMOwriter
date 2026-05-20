# ZHIMOwriter (智茉公众号排版工作台)

ZHIMOwriter 是一个专为微信公众号排版场景打造的 Markdown 编辑与预览工作台，帮助创作者实现“所见即所得”的无缝排版。

![ZHIMOwriter Cover](./.github/assets/repo-cover.png?v=2)

---

## 核心特性

- **双主题切换**：内置 Classic (经典暖橙) 与 BlackRed (黑红极客) 风格公众号排版主题。
- **快捷工具栏**：左侧预设卡片一键插入（作者、主编、往期推荐等），格式低调，且支持自定义与本地持久化。
- **图片无限制**：支持 Windows 本地绝对路径及远程图床图片，点击“复制到公众号”时自动在后台将本地图片转为 Base64 内联，防止失效。
- **零闪烁高清截图**：支持 Retina 2倍清晰度“复制为图片”功能，采用离线克隆节点渲染技术，截图时完全不影响主页面滚动条。
- **排版格式还原**：自动内联符合微信公众号安全过滤规则的 CSS 样式，修复左右框线、下划线及列表丢失问题，代码块自动换行。

---

## 快速开始

```bash
# 安装依赖
npm install

# 本地启动
npm run dev

# 编译打包
npm run build
```

---

## 图片路径说明

支持在 Markdown 中直接使用以下路径格式，复制到公众号时会自动处理本地文件转码：
- Windows 本地绝对路径：`E:/图片库/配图/001.png`
- File 协议路径：`file:///E:/图片库/配图/001.png`
- 远程图片链接：`https://yourcdn.com/images/001.png`

---

## Star 趋势

[![Star History Chart](https://api.star-history.com/svg?repos=SherryBX/ZHIMOwriter&type=Date)](https://star-history.com/#SherryBX/ZHIMOwriter&Date)

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布。
