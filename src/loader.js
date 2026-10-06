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
