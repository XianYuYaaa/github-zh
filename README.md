# GitHub 中文化（油猴脚本）

把 GitHub 界面里的固定英文文本翻成简体中文。**不碰用户自己写的内容**——README、提交信息、文件名、议题标题、评论一律原样保留。

## 安装

**点击安装**（在新标签页打开，Tampermonkey 会自动弹出安装页面）：

[点击安装 GitHub 中文化脚本](https://raw.githubusercontent.com/XianYuYaaa/github-zh/main/dist/github-zh.user.js)

需要浏览器已安装 [Tampermonkey](https://www.tampermonkey.net/)。

手动安装：Tampermonkey → 新建脚本 → 粘贴 `dist/github-zh.user.js` 全部内容 → 保存 → 刷新 GitHub。

升级：Tampermonkey 会通过脚本里的 `@updateURL` 自动检查更新；改翻译则完全不需要重装（见下）。

## 词典怎么工作

**脚本本身不含任何词条**（只有 16 KB 的引擎），词典全部从仓库的 `i18n/zh-CN.json` 拉取。

```
i18n/zh-CN.json          ← 唯一需要维护的地方（1255 词条 + 108 短语规则）
        ↓ 启动时拉取，缓存 6 小时
dist/github-zh.user.js   ← 只负责匹配和替换
```

所以**改翻译不用重装脚本**——改完 `zh-CN.json` 推上去，刷新页面就生效。维护时只有一处需要同步，不会出现脚本和词典打架。

拉取失败（断网、CDN 抖动）时自动重试 4 次（0 / 2s / 5s / 12s），都失败则保持页面原样，不会给你一个半吊子翻译的页面。

菜单里有两个命令：**重新加载汉化词典**（清缓存并刷新）、**复制词典地址**。

## 翻译策略

宁可漏翻也不误翻，所以：

- **只替换完整单词**：词边界校验，`is` 不会命中 `This`，`or` 不会命中 `refactor`
- **长句优先**：`Open in codespace` 不会被拆成 `Open` + 剩余
- **跳过用户内容**：README、评论、提交信息、文件名、分支名、语言名（`Inno Setup`、`Objective-C++`）
- **日期和数字自动转**：`Sep 3, 2026` → `2026年9月3日`，`Sep 3` → `9月3日`，`12.7M results` → `12.7M 个结果`

术语口径对齐 GitHub 官方中文文档：拉取请求（Pull request）、星标（Star）、议题（Issue）。

保留英文的词：`Fork`、`Wiki`、`Copilot`、`Markdown`、`Blame`、`Actions` —— 这些硬译反而看不懂。

## 已覆盖的页面

首页仪表盘、仓库页、议题 / 拉取请求列表与筛选栏、代码与提交历史、Compare、Actions、Releases、Security、Insights、Wiki、搜索、通知、个人资料与设置、新建仓库、Explore、Trending、登录 / 定价 / Copilot。

## 维护

```bash
node build.js
```

合并 `src/core.js` + `src/loader.js` 成 `dist/github-zh.user.js`，并校验词典（空译文、译文等于原文、短词误伤风险、重复或非法正则都会报警告）。

改词典地址或仓库地址：编辑 `build.js` 里的 `pkg` 对象。

## 说明

GitHub 本身没有官方简体中文界面，页面文本由前端 JS 动态渲染，所以只能用脚本替换文本节点。

MIT License
