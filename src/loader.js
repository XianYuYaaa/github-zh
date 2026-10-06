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
