// ==UserScript==
// @name         GitHub 中文化
// @name:zh-CN   GitHub 中文化
// @namespace    https://github.com/XianYuYaaa/github-zh
// @version      1.1.0
// @description  汉化 GitHub 界面固定文本。词典从仓库拉取，改翻译无需重装。
// @description:zh-CN  Translate GitHub's fixed UI text into Simplified Chinese. Dictionary is fetched from the repo, so updating translations needs no reinstall.
// @author       XianYuYaaa
// @license      MIT
// @match        *://github.com/*
// @icon         https://github.githubassets.com/favicons/favicon.svg
// @run-at       document-start
// @grant        GM_xmlhttpRequest
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

var __GHZ_DICT_URL__ = "https://raw.githubusercontent.com/XianYuYaaa/github-zh/main/i18n/zh-CN.json";

// ==================== core.js ====================
// 汉化引擎：装载词典 -> 编译 -> 遍历 DOM 替换。
// 匹配策略刻意保守，宁可漏翻也不误翻用户自己写的内容。
(function (scope) {
  'use strict';

  var CONFIG = {
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
    // 需要翻译的属性
    attrs: ['title', 'aria-label', 'placeholder', 'alt']
  };

  var ATTRS = CONFIG.attrs;
  var SKIP_SEL = CONFIG.skip.join(',');
  // 热点路径：先按 classList 快速判掉常见容器，省掉每次 matches() 的开销
  var FAST_SKIP = {
    'markdown-body': 1,
    'comment-body': 1,
    'react-directory-commit-message': 1,
    'react-directory-filename-cell': 1,
    'topic-tag': 1
  };

  var WORD = /[A-Za-z0-9_]/;
  var memo = new Map();

  // ------------------------------------------------------------------ 词典
  var pairs = [];
  var exactMap = new Map();
  var phrases = [];

  function compile(data) {
    pairs = [];
    exactMap = new Map();
    phrases = (data && data.phrases) || [];

    var terms = (data && data.terms) || {};
    var keys = Object.keys(terms).filter(function (k) {
      return k && typeof terms[k] === 'string' && terms[k] && terms[k] !== k;
    });
    // 按长度降序，保证 "Open in codespace" 先于 "Open"
    keys.sort(function (a, b) {
      if (b.length !== a.length) return b.length - a.length;
      return a < b ? -1 : a > b ? 1 : 0;
    });
    for (var i = 0; i < keys.length; i++) {
      pairs.push([keys[i], terms[keys[i]]]);
      if (!exactMap.has(keys[i])) exactMap.set(keys[i], terms[keys[i]]);
    }
    memo.clear();
  }

  // ------------------------------------------------------------------ 匹配
  function matchCase(source, translated) {
    if (source.length > 1 && source === source.toUpperCase()) return translated.toUpperCase();
    var c = source.charAt(0);
    if (c >= 'A' && c <= 'Z') return translated.charAt(0).toUpperCase() + translated.slice(1);
    return translated;
  }

  // 只在完整单词边界处替换：前后都不能紧邻字母/数字/下划线。
  // 这样 "is" 不会命中 "This"，"or" 不会命中 "refactor"。
  function replaceBounded(hay, needle, rep) {
    var out = '';
    var i = 0;
    while (i < hay.length) {
      var idx = hay.indexOf(needle, i);
      if (idx === -1) break;
      var before = idx > 0 ? hay.charAt(idx - 1) : ' ';
      var at = idx + needle.length;
      var after = at < hay.length ? hay.charAt(at) : ' ';
      out += hay.slice(i, idx);
      out += !WORD.test(before) && !WORD.test(after) ? matchCase(needle, rep) : needle;
      i = at;
    }
    return out + hay.slice(i);
  }

  function translateString(str) {
    if (!str || !/[A-Za-z]/.test(str)) return str;

    var hit = memo.get(str);
    if (hit !== undefined) return hit;

    var out = str;

    // 1) 短语规则先行，处理 "12.7M results" 这类数字拼接的动态句式。
    //    规则带 g 标志，直接 replace，不要先 test()，否则 lastIndex 会残留。
    for (var r = 0; r < phrases.length; r++) {
      var re = phrases[r].re;
      re.lastIndex = 0;
      var replaced = out.replace(re, phrases[r].rep);
      if (replaced !== out) out = replaced;
    }

    // 2) 整串精确命中：界面标签绝大多数属于这种情况，O(1)
    if (exactMap.has(out)) {
      out = exactMap.get(out);
    } else {
      // 3) 词边界替换兜底
      for (var i = 0; i < pairs.length; i++) {
        var key = pairs[i][0];
        if (key.length > out.length) continue;
        if (out.indexOf(key) !== -1) out = replaceBounded(out, key, pairs[i][1]);
      }
    }

    if (memo.size > 20000) memo.clear();
    memo.set(str, out);
    return out;
  }

  // ------------------------------------------------------------------ 归一化
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

  // ------------------------------------------------------------------ 应用
  function isSkipped(el) {
    var node = el;
    while (node && node.nodeType === 1) {
      if (node.classList) {
        var cl = node.classList;
        for (var i = 0; i < cl.length; i++) {
          if (FAST_SKIP[cl[i]]) return true;
        }
      }
      try {
        if (node.matches(SKIP_SEL)) return true;
      } catch (e) { /* 选择器异常则忽略 */ }
      node = node.parentElement;
    }
    return false;
  }

  function translateAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var name = ATTRS[i];
      var val = el.getAttribute(name);
      if (!val || !/[A-Za-z]/.test(val)) continue;
      var t = translateString(normalize(val));
      if (t !== val) {
        try {
          el.setAttribute(name, t);
        } catch (e) { /* 只读属性 */ }
      }
    }
  }

  function translateTextNode(node) {
    var text = node.nodeValue;
    if (!text || !text.trim()) return;
    var src = normalize(text);
    var t = translateString(src);
    if (t !== text) node.nodeValue = t;
  }

  function walk(root) {
    if (!root) return;
    var type = root.nodeType;

    if (type === 3) {
      if (root.parentElement && !isSkipped(root.parentElement)) translateTextNode(root);
      return;
    }
    if (type !== 1 && type !== 9 && type !== 11) return;

    if (type === 1) {
      if (isSkipped(root)) return;
      translateAttrs(root);
      var kids = root.childNodes;
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].nodeType === 3) translateTextNode(kids[i]);
      }
    }

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
  var observer = null;

  function observe() {
    if (observer) return;
    var pending = false;
    observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      // 合并同一帧内的多次变更，避免重复全量遍历
      requestAnimationFrame(function () {
        pending = false;
        walk(document.body);
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  scope.GHZ = {
    config: CONFIG,
    // 装载词典并开始翻译
    load: function (data) {
      compile(data);
      var terms = (data && data.terms) || {};
      if (!Object.keys(terms).length) return false;

      document.documentElement.setAttribute('lang', 'zh-CN');
      walk(document.body || document.documentElement);
      observe();
      return true;
    },
    translateString: translateString,
    // GitHub 内部软导航后重跑
    rewalk: function () {
      memo.clear();
      walk(document.body);
    },
  };

  // GitHub 内部软导航
  scope.addEventListener('pjax:end', function () { if (exactMap.size) walk(document.body); });
  scope.addEventListener('turbo:load', function () { if (exactMap.size) walk(document.body); });
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

// ==================== loader.js ====================
// 词典加载：脚本本身不含任何词条，全部从仓库拉 i18n/zh-CN.json。
// 维护时只改 i18n/zh-CN.json 一处，不用同步脚本。
(function (scope) {
  'use strict';

  var DICT_URL = __GHZ_DICT_URL__;

  var CACHE_KEY = 'ghz:dict';
  var CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时
  var RETRY = [0, 2000, 5000, 12000]; // 失败后的重试间隔（毫秒）

  function log() {
    if (scope.console && console.log) console.log.apply(console, ['[github-zh]'].concat([].slice.call(arguments)));
  }
  function warn() {
    if (scope.console && console.warn) console.warn.apply(console, ['[github-zh]'].concat([].slice.call(arguments)));
  }

  // ---------------------------------------------------------------- 传输
  // 优先 GM_xmlhttpRequest：不受页面 CSP 和混合内容限制
  function get(url) {
    return new Promise(function (resolve, reject) {
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
          onerror: function () { reject(new Error('network error')); },
          ontimeout: function () { reject(new Error('timeout')); },
        });
        return;
      }
      // 兜底：原生 fetch（Violentmonkey 等未实现 GM_xmlhttpRequest 时）
      fetch(url, { credentials: 'omit' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(resolve, reject);
    });
  }

  // ---------------------------------------------------------------- 校验
  function parse(text) {
    var data = JSON.parse(text);
    if (!data || typeof data.terms !== 'object' || !data.terms) throw new Error('词典格式错误：缺少 terms');

    // 编译短语规则，非法正则直接丢弃，避免整份词典失效
    var phrases = [];
    if (Array.isArray(data.phrases)) {
      for (var i = 0; i < data.phrases.length; i++) {
        var p = data.phrases[i];
        if (!p || typeof p.pattern !== 'string' || typeof p.replacement !== 'string') continue;
        try {
          phrases.push({ re: new RegExp(p.pattern, (p.flags || '').replace(/[gy]/g, '') + 'g'), rep: p.replacement });
        } catch (e) { /* 跳过坏规则 */ }
      }
    }

    var terms = {};
    for (var k in data.terms) {
      if (Object.prototype.hasOwnProperty.call(data.terms, k)) terms[k] = data.terms[k];
    }
    return { version: data.version || 0, terms: terms, phrases: phrases };
  }

  // ---------------------------------------------------------------- 缓存
  function readCache() {
    try {
      var box = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!box || !box.at || Date.now() - box.at > CACHE_TTL) return null;
      return parse(JSON.stringify(box.data));
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      // 缓存只存原始数据，编译后的正则重新生成
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: { version: data.version, terms: data.terms, phrases: [] } }));
    } catch (e) { /* 配额不足就算了 */ }
  }

  // ---------------------------------------------------------------- 启动
  function boot() {
    var cached = readCache();
    if (cached && scope.GHZ.load(cached)) {
      log('已用缓存词典', Object.keys(cached.terms).length, '条');
      refresh(true); // 后台静默更新
      return;
    }
    refresh(false);
  }

  function refresh(silent) {
    var attempt = 0;

    function attemptOnce() {
      get(DICT_URL)
        .then(function (text) {
          var data = parse(text);
          writeCache(data);
          scope.GHZ.load(data);
          log('词典已加载', Object.keys(data.terms).length, '条');
        })
        .catch(function (err) {
          attempt++;
          if (attempt < RETRY.length) {
            setTimeout(attemptOnce, RETRY[attempt]);
          } else {
            warn('词典拉取失败，页面保持原样。', err.message);
            if (!silent) {
              log('请检查网络，或稍后刷新重试。词典地址：', DICT_URL);
            }
          }
        });
    }

    attemptOnce();
  }

  // ---------------------------------------------------------------- 菜单
  function registerMenu() {
    if (typeof GM_registerMenuCommand !== 'function') return;

    GM_registerMenuCommand('重新加载汉化词典', function () {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) { /* 忽略 */ }
      window.location.reload();
    });

    GM_registerMenuCommand('复制词典地址', function () {
      var copy = function () {
        if (navigator.clipboard) navigator.clipboard.writeText(DICT_URL);
        log('词典地址已复制：', DICT_URL);
      };
      if (navigator.clipboard) copy();
      else window.prompt('词典地址：', DICT_URL);
    });
  }

  function ready() {
    boot();
    registerMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
