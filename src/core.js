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
