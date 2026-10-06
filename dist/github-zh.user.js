// ==UserScript==
// @name         GitHub 中文化
// @name:zh-CN   GitHub 中文化
// @namespace    https://github.com/XianYuYaaa/github-zh
// @version      1.0.0
// @description  汉化 GitHub 界面固定文本，词典来自远程仓库，可随时更新。
// @description:zh-CN  Translate GitHub's fixed UI text into Simplified Chinese.
// @author       XianYuYaaa
// @license      MIT
// @match        *://github.com/*
// @icon         https://github.githubassets.com/favicons/favicon.svg
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      raw.github.com
// @connect      gist.githubusercontent.com
// @connect      gist.github.com
// @updateURL    https://github.com/XianYuYaaa/github-zh/raw/main/dist/github-zh.user.js
// @downloadURL  https://github.com/XianYuYaaa/github-zh/raw/main/dist/github-zh.user.js
// @homepageURL  https://github.com/XianYuYaaa/github-zh
// @supportURL   https://github.com/XianYuYaaa/github-zh/issues
// @noframes
// ==/UserScript==

var __GHZ_DEFAULTS__ = {"dictUrl":"https://raw.githubusercontent.com/XianYuYaaa/github-zh/main/i18n/zh-CN.json","version":"1.0.0"};

// ==================== fallback.js ====================
// 内置精简词典：保证脚本离线/词典拉取失败时首屏也有基本汉化。
// 由 tools/make-fallback.js 从 i18n/zh-CN.json 生成，请勿手工编辑。
(function (scope) {
  'use strict';
  scope.__GHZ_FALLBACK__ = {
  "version": 0,
  "terms": {
    "Skip to content": "跳到主要内容",
    "Skip to main content": "跳到主要内容",
    "Open menu": "打开菜单",
    "Homepage": "首页",
    "Dashboard": "仪表盘",
    "Home": "首页",
    "Feed": "动态",
    "Preview": "预览",
    "Loading": "加载中",
    "Loading...": "加载中...",
    "Loading…": "加载中…",
    "Search": "搜索",
    "Search this repository": "搜索此仓库",
    "Search issues": "搜索议题",
    "Search pull requests": "搜索合并请求",
    "Search notifications": "搜索通知",
    "Type": "输入",
    "to search": "搜索",
    "Open quick search dialog, type / to search": "打开快捷搜索框，输入 / 进行搜索",
    "Chat with Copilot": "与 Copilot 对话",
    "Create new...": "新建...",
    "All issues": "所有议题",
    "All pull requests": "所有合并请求",
    "All repositories": "所有仓库",
    "Notifications": "通知",
    "Settings": "设置",
    "Appearance": "外观",
    "Accessibility": "无障碍",
    "Menu": "菜单",
    "Cancel": "取消",
    "Close": "关闭",
    "Save": "保存",
    "Saved": "已保存",
    "Done": "完成",
    "Delete": "删除",
    "Remove": "移除",
    "Edit": "编辑",
    "Add": "添加",
    "Update": "更新",
    "Create": "创建",
    "Submit": "提交",
    "Confirm": "确认",
    "Continue": "继续",
    "Previous": "上一页",
    "Next": "下一页",
    "More": "更多",
    "Learn more": "了解更多",
    "Dismiss": "忽略",
    "Clear": "清除",
    "Clear filter": "清除筛选",
    "Filter": "筛选",
    "Sort by:": "排序方式：",
    "Newest": "最新",
    "Oldest": "最旧",
    "Open": "打开",
    "Closed": "已关闭",
    "Date": "日期",
    "Repository": "仓库",
    "Language": "语言",
    "Today": "今天",
    "This week": "本周",
    "This month": "本月",
    "Code": "代码",
    "Issues": "议题",
    "Pull requests": "合并请求",
    "Pull request": "合并请求",
    "Discussions": "讨论",
    "Actions": "操作",
    "Projects": "项目",
    "Wiki": "Wiki",
    "Security": "安全",
    "Insights": "洞察",
    "Watch": "关注",
    "Star": "收藏",
    "Unstar": "取消收藏",
    "Starred": "已收藏",
    "Fork": "Fork",
    "Sponsor": "赞助",
    "About": "关于",
    "Releases": "发行版",
    "Packages": "软件包",
    "Contributors": "贡献者",
    "Latest commit": "最新提交",
    "Branches": "分支",
    "Tags": "标签",
    "Go to file": "跳转到文件",
    "Add file": "添加文件",
    "History": "历史",
    "Name": "名称",
    "Activity": "活动",
    "Owner": "所有者",
    "Author": "作者",
    "Assignees": "负责人",
    "Labels": "标签",
    "Milestones": "里程碑",
    "New issue": "新建议题",
    "New pull request": "新建合并请求",
    "Terms": "条款",
    "Privacy": "隐私",
    "Status": "状态",
    "Community": "社区",
    "Docs": "文档",
    "Contact": "联系我们",
    "Manage cookies": "管理 Cookie",
    "Switch repository": "切换仓库",
    "Open in github.dev": "在 github.dev 中打开",
    "Open in codespace": "在 Codespace 中打开",
    "See your forks of this repository": "查看你 Fork 的此仓库副本",
    "View all files": "查看全部文件",
    "Assigned to me": "分配给我的",
    "Created by me": "我创建的",
    "Mentioned": "提到我的",
    "Views": "浏览量",
    "Reviews": "评审",
    "Review required": "需要评审",
    "Approved": "已批准",
    "Comment": "评论",
    "Reply": "回复",
    "Watchers": "关注者",
    "Contributing": "贡献指南",
    "Code of conduct": "行为准则",
    "Security policy": "安全策略",
    "License": "许可证",
    "Topics": "主题",
    "New repository": "新建仓库",
    "Create a new repository": "创建新仓库",
    "Create repository": "创建仓库",
    "Repository name": "仓库名称",
    "Description": "描述",
    "Configuration": "配置",
    "Public": "公开",
    "Private": "私有",
    "Advanced": "高级",
    "Advanced search": "高级搜索",
    "Sign in": "登录",
    "Sign out": "退出登录",
    "Sign up": "注册",
    "Overview": "概览",
    "Profile": "个人资料",
    "Account": "账号",
    "Inbox": "收件箱",
    "Mark all read notifications as done": "将所有已读通知标记为完成",
    "Collapse sidebar": "收起侧边栏",
    "Add new filter": "添加新的筛选器",
    "Newest to oldest": "从新到旧",
    "Oldest to newest": "从旧到新",
    "Notifications by date": "按日期显示的通知",
    "Clear out the clutter.": "清理杂物。",
    "Resources": "资源",
    "Readme": "说明文档",
    "Deployments": "部署",
    "Stargazers": "收藏者",
    "Report repository": "举报仓库",
    "Latest": "最新",
    "Commit changes": "提交更改",
    "You have no unread notifications": "你没有未读通知",
    "Open user navigation menu": "打开用户导航菜单",
    "Dismiss alert": "关闭提示",
    "No results found": "没有找到结果",
    "Retry": "重试",
    "Copy": "复制",
    "Copied": "已复制",
    "Unsubscribe": "取消订阅",
    "Subscribe": "订阅",
    "Mark as read": "标记为已读",
    "Followers": "关注者",
    "Contributing guidelines": "贡献指南",
    "Good first issues": "适合新贡献者的议题"
  },
  "phrases": [
    {
      "pattern": "^([\\d,.kKmM]+)\\s+Commits$",
      "flags": "",
      "replacement": "$1 次提交"
    },
    {
      "pattern": "^([\\d,.kKmM]+)\\s+commits?$",
      "flags": "i",
      "replacement": "$1 次提交"
    },
    {
      "pattern": "^([\\d,.kKmM]+)\\s+reactions$",
      "flags": "",
      "replacement": "$1 个回应"
    },
    {
      "pattern": "^([\\d,.kKmM]+)\\s+people reacted$",
      "flags": "",
      "replacement": "$1 人回应"
    },
    {
      "pattern": "^([\\d,.kKmM]+)\\s+stars today$",
      "flags": "",
      "replacement": "今日新增 $1 收藏"
    },
    {
      "pattern": "^([\\d,.kKmM+]+)\\s+results?$",
      "flags": "",
      "replacement": "$1 个结果"
    },
    {
      "pattern": "results?\\s*$",
      "flags": "",
      "replacement": "个结果"
    },
    {
      "pattern": "Updated\\s+(.+)$",
      "flags": "",
      "replacement": "更新于 $1"
    },
    {
      "pattern": "^0\\s+results$",
      "flags": "",
      "replacement": "0 个结果"
    }
  ]
};
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

// ==================== core.js ====================
// 引擎：词典 -> 编译 -> 应用。匹配规则刻意保守，宁可漏翻也不误翻用户内容。
(function (scope) {
  'use strict';

  var CONFIG = {
    enabled: true,
    translateAttributes: true,
    observeMutations: true,
    // 匹配策略：'word' 只替换完整单词/整段短语；'substring' 会误伤 refactor 这类词，默认关闭
    matchMode: 'word',
    // 用户自己写的内容、以及会与词典冲突的标识符，一律不动
    skip: [
      // --- 代码 ---
      'pre', 'code', 'kbd', 'samp', 'textarea', 'script', 'style',
      '.highlight', '.blob-code', '.react-code-text', '.js-file-line',
      // --- 用户撰写的正文 ---
      '.markdown-body', '.comment-body', '.js-comment-body',
      '.gist-content', '[data-testid="markdown-body"]', '.directory-richtext',
      '.edit-comment-hide', '.js-blob-form',
      // --- 用户撰写的短文本（仓库简介、提交信息、文件名、分支名、议题标题等）---
      '.react-directory-commit-message',
      '.react-directory-filename-cell',
      '.react-directory-commit-author',
      '[data-testid="repo-name-link"]',
      '[data-testid="mobile-description"]',
      '[data-testid="desktop-description"]',
      '[itemprop="about"]', '[itemprop="description"]',
      '.topic-tag', '.topic-tag-link',
      '[data-testid="anchor-button"]', '.ref-selector', '.branch-name', '.commit-ref',
      '.gh-header-title', '.js-issue-title', '.issue-title-link',
      'a[data-hovercard-type="user"]', 'a[data-hovercard-type="organization"]',
      '.author', '.vcard-username', '.p-nickname', '.p-name', '.avatar',
      // 语言名（Inno Setup、Objective-C++ 等是专有名词，翻译反而看不懂）
      '[class*="languageName"]', '[class*="languageList"]'
    ],
    // 属性
    attrs: ['title', 'aria-label', 'placeholder', 'alt']
  };

  // ------------------------------------------------------------------ 匹配
  var WORD = /[A-Za-z0-9_]/;
  var memo = new Map();

  // ------------------------------------------------------------------ 词典
  var pairs = [];
  var exactMap = new Map();
  var phrases = [];

  function compile(data) {
    // 换词典之前先还原上一轮的改动
    revertAll();
    pairs = [];
    exactMap = new Map();
    phrases = (data && data.phrases) || [];

    var terms = (data && data.terms) || {};
    var keys = Object.keys(terms).filter(function (k) {
      return k && typeof terms[k] === 'string' && terms[k] && terms[k] !== k;
    });
    keys.sort(function (a, b) {
      if (b.length !== a.length) return b.length - a.length;
      return a < b ? -1 : a > b ? 1 : 0;
    });
    for (var i = 0; i < keys.length; i++) {
      pairs.push([keys[i], terms[keys[i]]]);
      if (!exactMap.has(keys[i])) exactMap.set(keys[i], terms[keys[i]]);
    }
  }

  // ------------------------------------------------------------------ 匹配
  function matchCase(source, translated) {
    if (source.length > 1 && source === source.toUpperCase()) return translated.toUpperCase();
    var c = source.charAt(0);
    if (c >= 'A' && c <= 'Z') return translated.charAt(0).toUpperCase() + translated.slice(1);
    return translated;
  }

  // 只在完整单词边界处替换：前后都不能紧邻字母/数字/下划线
  function replaceBounded(hay, needle, rep) {
    var out = '';
    var i = 0;
    var guard = 0;
    while (guard++ < 10000) {
      var idx = hay.indexOf(needle, i);
      if (idx === -1) break;
      var before = idx > 0 ? hay.charAt(idx - 1) : ' ';
      var at = idx + needle.length;
      var after = at < hay.length ? hay.charAt(at) : ' ';
      var ok = !WORD.test(before) && !WORD.test(after);
      out += hay.slice(i, idx);
      out += ok ? matchCase(needle, rep) : needle;
      i = at;
    }
    return out + hay.slice(i);
  }

  function replaceAny(hay, needle, rep) {
    return hay.split(needle).join(rep);
  }

  function translateString(str) {
    if (!str || !/[A-Za-z]/.test(str)) return str;

    var hit = memo.get(str);
    if (hit !== undefined) return hit;

    var out = str;

    // 1) 短语规则先行（处理数字拼接等动态句式）
    //    规则带 g 标志，直接 replace 即可，不要先 test()，否则 lastIndex 会残留
    for (var r = 0; r < phrases.length; r++) {
      var re = phrases[r].re;
      re.lastIndex = 0;
      var replaced = out.replace(re, phrases[r].rep);
      if (replaced !== out) out = replaced;
    }

    // 2) 整串精确命中：UI 标签绝大多数属于这种情况，O(1)
    if (exactMap.has(out)) out = exactMap.get(out);
    else {
      // 3) 词内替换兜底
      var fn = CONFIG.matchMode === 'word' ? replaceBounded : replaceAny;
      for (var i = 0; i < pairs.length; i++) {
        var key = pairs[i][0];
        if (key.length > out.length) continue;
        if (out.indexOf(key) !== -1) out = fn(out, key, pairs[i][1]);
      }
    }

    if (memo.size > 20000) memo.clear();
    memo.set(str, out);
    return out;
  }

  // ------------------------------------------------------------------ 应用
  var skipSel = CONFIG.skip.join(',');

  function isSkipped(el) {
    var node = el;
    while (node && node.nodeType === 1) {
      if (node.classList) {
        // 热点路径：先用 classList 判掉常见容器，避免每次都走 matches()
        var cl = node.classList;
        for (var i = 0; i < cl.length; i++) {
          var c = cl[i];
          if (c === 'markdown-body' || c === 'comment-body' || c === 'react-directory-commit-message' ||
              c === 'react-directory-filename-cell' || c === 'topic-tag') return true;
        }
      }
      try {
        if (node.matches(skipSel)) return true;
      } catch (e) { /* 选择器异常则忽略 */ }
      node = node.parentElement;
    }
    return false;
  }

  function translateAttrs(el) {
    if (!CONFIG.translateAttributes) return false;
    var changed = false;
    for (var i = 0; i < CONFIG.attrs.length; i++) {
      var name = CONFIG.attrs[i];
      var val = el.getAttribute(name);
      if (!val || !/[A-Za-z]/.test(val)) continue;
      var src = normalize(val);
      var t = translateString(src);
      if (t !== val) {
        try {
          rememberAttr(el, name, val);
          el.setAttribute(name, t);
          changed = true;
        } catch (e) { /* 只读属性 */ }
      }
    }
    return changed;
  }

  // GitHub 常把一个标签写成带换行/缩进的文本节点（"\n    Add new filter\n  "），
  // 浏览器渲染本来就会折叠空白，所以匹配前先归一化成单空格。
  // 首尾各保留一个空格，避免把相邻 span 的文字粘在一起。
  var WS_ALL = /[\s\u00a0]+/g;
  var WS_LEAD = /^[\s\u00a0]+/;
  var WS_TRAIL = /[\s\u00a0]+$/;

  function normalize(str) {
    var lead = WS_LEAD.test(str) ? ' ' : '';
    var trail = WS_TRAIL.test(str) ? ' ' : '';
    return lead + str.replace(WS_ALL, ' ').trim() + trail;
  }

  // 词典升级时要把之前改过的文本还原，否则"内置词典先翻一遍、完整词典后到"
  // 会留下翻了一半的句子。
  var touched = [];

  function rememberText(node, original) {
    if (node.__ghzOrig === undefined) {
      node.__ghzOrig = original;
      touched.push(node);
    }
  }

  function rememberAttr(el, name, original) {
    if (!el.__ghzOrigAttr) el.__ghzOrigAttr = {};
    if (el.__ghzOrigAttr[name] === undefined) el.__ghzOrigAttr[name] = original;
    if (!el.__ghzAttrSeen) {
      el.__ghzAttrSeen = 1;
      touched.push(el);
    }
  }

  function revertAll() {
    for (var i = touched.length - 1; i >= 0; i--) {
      var n = touched[i];
      if (!n.isConnected) continue; // 已从文档移除的节点不用还原
      if (typeof n.__ghzOrig === 'string') n.nodeValue = n.__ghzOrig;
      if (n.__ghzOrigAttr) {
        for (var k in n.__ghzOrigAttr) {
          try {
            n.setAttribute(k, n.__ghzOrigAttr[k]);
          } catch (e) { /* 只读属性 */ }
        }
      }
    }
    touched.length = 0;
    memo.clear();
  }

  function translateTextNode(node) {
    var text = node.nodeValue;
    if (!text || !text.trim()) return false;
    var src = normalize(text);
    var t = translateString(src);
    if (t !== text) {
      rememberText(node, text);
      node.nodeValue = t;
      return true;
    }
    return false;
  }

  function walk(root) {
    if (!root) return;
    var type = root.nodeType;
    if (type === 3) {
      if (root.parentElement && !isSkipped(root.parentElement)) translateTextNode(root);
      return;
    }
    if (type === 1) {
      if (isSkipped(root)) return;
      translateAttrs(root);
      var kids = root.childNodes;
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].nodeType === 3) translateTextNode(kids[i]);
      }
    }
    if (type !== 1 && type !== 9 && type !== 11) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (node.nodeType === 1) return isSkipped(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        var p = node.parentElement;
        if (p && isSkipped(p)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var batch = [];
    var n;
    while ((n = walker.nextNode())) batch.push(n);
    for (var j = 0; j < batch.length; j++) {
      var el = batch[j];
      if (el.nodeType === 3) translateTextNode(el);
      else translateAttrs(el);
    }
  }

  // ------------------------------------------------------------------ 启动
  function start() {
    if (!CONFIG.enabled) return;
    if (!/(^|\.)github\.com$/.test(location.hostname)) return;

    document.documentElement.setAttribute('lang', 'zh-CN');
    walk(document.body || document.documentElement);

    if (CONFIG.observeMutations) {
      var pending = false;
      var flush = function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          walk(document.body);
        });
      };
      observer = new MutationObserver(flush);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: CONFIG.attrs
      });
    }
  }

  // GitHub 内部软导航后重跑一次
  scope.addEventListener('pjax:end', function () { memo.clear(); walk(document.body); });
  scope.addEventListener('turbo:load', function () { memo.clear(); walk(document.body); });

  var observer = null;

  scope.GHZ = {
    config: CONFIG,
    // 装载词典：先套用内置精简词典，随后由 loader 换成完整/远程词典
    setData: function (data) {
      compile(data);
      if (!data || !Object.keys(data.terms || {}).length) return false;
      document.documentElement.setAttribute('lang', 'zh-CN');
      start();
      return true;
    },
    // 词典升上去时：还原 -> 换词典 -> 重新全量翻译
    upgrade: function (data) {
      if (!data) return false;
      compile(data);
      document.documentElement.setAttribute('lang', 'zh-CN');
      walk(document.body || document.documentElement);
      return true;
    },
    start: start,
    walk: function () {
      walk(document.body || document.documentElement);
    },
    translateString: translateString,
    reset: function () {
      memo.clear();
    },
    disconnect: function () {
      if (observer) observer.disconnect();
    },
  };
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

// ==================== loader.js ====================
// 词典加载器：优先用远程 i18n/zh-CN.json，失败时退回脚本内置的精简词典。
// 这样改词典只需要更新仓库文件，不需要重装脚本。
(function (scope) {
  'use strict';

  var DEF = scope.__GHZ_DEFAULTS__ || {};

  var STORE_KEY = 'ghz:dict-url';
  var CACHE_KEY = 'ghz:dict-cache';
  var CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时

  function gmGet(k, d) {
    try {
      return GM_getValue(k, d);
    } catch (e) {
      return d;
    }
  }
  function gmSet(k, v) {
    try {
      GM_setValue(k, v);
    } catch (e) {
      /* 忽略 */
    }
  }

  function getUrl() {
    return gmGet(STORE_KEY, DEF.dictUrl || '');
  }

  // ---------------------------------------------------------------- 远程请求
  function request(url) {
    return new Promise(function (resolve, reject) {
      // 优先 GM_xmlhttpRequest：不受页面 CSP / 混合内容限制
      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          timeout: 15000,
          headers: { Accept: 'application/json' },
          onload: function (res) {
            if (res.status >= 200 && res.status < 300) resolve(res.responseText);
            else reject(new Error('HTTP ' + res.status));
          },
          onerror: function () {
            reject(new Error('network error'));
          },
          ontimeout: function () {
            reject(new Error('timeout'));
          },
        });
        return;
      }
      // 兜底：原生 fetch
      if (typeof fetch === 'function') {
        fetch(url, { credentials: 'omit' })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
          })
          .then(resolve, reject);
        return;
      }
      reject(new Error('no transport available'));
    });
  }

  function validate(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (!obj.terms || typeof obj.terms !== 'object') return null;
    // 编译短语规则；非法正则直接丢弃，避免整份词典失效
    var phrases = [];
    if (Array.isArray(obj.phrases)) {
      for (var i = 0; i < obj.phrases.length; i++) {
        var p = obj.phrases[i];
        if (!p || typeof p.pattern !== 'string') continue;
        try {
          var re = new RegExp(p.pattern, (p.flags || '').replace(/[gy]/g, '') + 'g');
          phrases.push({ re: re, rep: p.replacement });
        } catch (e) {
          /* 跳过坏规则 */
        }
      }
    }
    return { version: obj.version || 0, terms: obj.terms, phrases: phrases };
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var box = JSON.parse(raw);
      if (!box || !box.at || Date.now() - box.at > CACHE_TTL) return null;
      return validate(box.data);
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: { version: data.version, terms: data.terms, phrases: [] } }));
    } catch (e) {
      /* 配额不足就算了 */
    }
  }

  // ---------------------------------------------------------------- 启动
  function boot() {
    var api = scope.GHZ;
    if (!api) return;

    var url = getUrl();

    function apply(data, tag) {
      if (!data) return;
      // upgrade 会先还原上一轮改动再整体重译，避免留下半句没翻的文本
      api.upgrade(data);
      if (scope.console && console.debug) {
        console.debug('[github-zh] ' + tag + ': ' + Object.keys(data.terms).length + ' terms');
      }
    }

    // 1) 先用内置精简词典，保证首屏就能翻
    apply(validate(scope.__GHZ_FALLBACK__), '内置词典');

    if (!url) {
      if (scope.console && console.info) {
        console.info('[github-zh] 未配置词典地址，仅使用内置词典');
      }
      return;
    }

    // 2) 有新鲜缓存就直接用
    var cached = readCache();
    if (cached) {
      apply(cached, '缓存');
      // 后台静默刷新一次
      refresh();
      return;
    }

    refresh();

    function refresh() {
      request(url)
        .then(function (text) {
          var data = validate(JSON.parse(text));
          if (!data) throw new Error('bad payload');
          writeCache(data);
          apply(data, '远程');
        })
        .catch(function (err) {
          if (scope.console && console.warn) {
            console.warn('[github-zh] 词典拉取失败，已使用内置词典：', err.message);
          }
        });
    }
  }

  // ---------------------------------------------------------------- 菜单
  function registerMenu() {
    if (typeof GM_registerMenuCommand !== 'function') return;
    GM_registerMenuCommand('设置汉化词典地址', function () {
      var cur = getUrl();
      var next = window.prompt(
        '汉化词典（zh-CN.json）的地址。\n留空则只使用脚本内置词典。\n\n当前：\n' + (cur || '（未设置）'),
        cur
      );
      if (next === null) return;
      next = (next || '').trim();
      gmSet(STORE_KEY, next);
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) {
        /* 忽略 */
      }
      window.location.reload();
    });
    GM_registerMenuCommand('清空词典缓存', function () {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) {
        /* 忽略 */
      }
      window.location.reload();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot();
      registerMenu();
    });
  } else {
    boot();
    registerMenu();
  }
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
