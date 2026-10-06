// 构建：合并 src/ 下的模块成单个油猴脚本，并校验 i18n/zh-CN.json
const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcDir = path.join(root, 'src');
const outDir = path.join(root, 'dist');
const dictFile = path.join(root, 'i18n', 'zh-CN.json');

const pkg = {
  version: '1.0.1',
  author: 'XianYuYaaa',
  repo: 'https://github.com/XianYuYaaa/github-zh',
  // 装好脚本后也能在 Tampermonkey 菜单里改这个地址，不需要重装
  dictUrl: 'https://raw.githubusercontent.com/XianYuYaaa/github-zh/main/i18n/zh-CN.json',
};

const header = `// ==UserScript==
// @name         GitHub 中文化
// @name:zh-CN   GitHub 中文化
// @namespace    ${pkg.repo}
// @version      ${pkg.version}
// @description  汉化 GitHub 界面固定文本，词典来自远程仓库，可随时更新。
// @description:zh-CN  Translate GitHub's fixed UI text into Simplified Chinese.
// @author       ${pkg.author}
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
// @updateURL    ${pkg.repo}/raw/main/dist/github-zh.user.js
// @downloadURL  ${pkg.repo}/raw/main/dist/github-zh.user.js
// @homepageURL  ${pkg.repo}
// @supportURL   ${pkg.repo}/issues
// @noframes
// ==/UserScript==
`;

const defaults = `var __GHZ_DEFAULTS__ = ${JSON.stringify({ dictUrl: pkg.dictUrl, version: pkg.version })};`;

// 保留英文的词：官方术语或音译更自然，硬译反而看不懂
const KEEP_ENGLISH = new Set(['Fork', 'Wiki', 'Copilot', 'Gist', 'Markdown', 'Blame']);

// 短词白名单。匹配用词边界（前后不能紧邻字母数字），
// 所以 "is" 不会命中 "This"、"no" 不会命中 "Note"，短词是安全的。
const SHORT_KEYS_OK = new Set(['is', 'no', 'On', 'on', 'pr', 'in', 'of', 'to', 'by', 'or', 'at', 'it']);

function validateDict(dict) {
  const problems = [];
  if (!dict || typeof dict !== 'object') return ['词典不是合法对象'];
  if (!dict.terms || typeof dict.terms !== 'object') return ['缺少 terms 字段'];

  for (const [k, v] of Object.entries(dict.terms)) {
    if (typeof v !== 'string') problems.push(`译文不是字符串: ${k}`);
    else if (!v.trim()) problems.push(`译文为空: ${k}`);
    else if (v === k && !KEEP_ENGLISH.has(k)) problems.push(`译文等于原文（等于没翻）: ${k}`);
    else if (k.length <= 2 && !SHORT_KEYS_OK.has(k)) problems.push(`短词不在白名单，误伤风险高: ${k}`);
    else if (/\s+$/.test(k) || /^\s/.test(k)) problems.push(`key 首尾有多余空白: "${k}"`);
  }

  if (Array.isArray(dict.phrases)) {
    const seen = new Set();
    dict.phrases.forEach((p, i) => {
      if (!p || typeof p.pattern !== 'string' || typeof p.replacement !== 'string') {
        problems.push(`第 ${i + 1} 条短语规则格式错误`);
        return;
      }
      if (seen.has(p.pattern)) problems.push(`短语规则重复（只会用第一条）: ${p.pattern}`);
      seen.add(p.pattern);
      try {
        new RegExp(p.pattern, (p.flags || '').replace(/[gy]/g, ''));
      } catch (e) {
        problems.push(`第 ${i + 1} 条短语规则正则非法: ${p.pattern} (${e.message})`);
      }
    });
  }
  return problems;
}

const dict = JSON.parse(fs.readFileSync(dictFile, 'utf8'));
const problems = validateDict(dict);

const modules = ['fallback.js', 'core.js', 'loader.js'];
let out = header + '\n' + defaults + '\n';
for (const m of modules) {
  const p = path.join(srcDir, m);
  if (!fs.existsSync(p)) throw new Error('缺少源文件: ' + p);
  out += `\n// ==================== ${m} ====================\n`;
  out += fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
}

fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'github-zh.user.js');
fs.writeFileSync(outFile, out, 'utf8');

// 装不上的脚本等于没构建
try {
  new Function(out);
} catch (e) {
  console.error('语法错误，产物无效：', e.message);
  process.exit(1);
}

const size = Buffer.byteLength(out, 'utf8');
console.log('输出   :', outFile);
console.log('大小   :', size, 'bytes (' + (size / 1024).toFixed(1) + ' KB)');
console.log('词条   :', Object.keys(dict.terms).length);
console.log('短语   :', dict.phrases.length);
console.log('词典   :', (fs.statSync(dictFile).size / 1024).toFixed(1), 'KB');

if (problems.length) {
  console.log('\n词典告警 ' + problems.length + ' 条:');
  problems.slice(0, 40).forEach((p) => console.log('  - ' + p));
  if (problems.length > 40) console.log('  ... 还有 ' + (problems.length - 40) + ' 条');
  process.exitCode = 1;
}
