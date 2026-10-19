#!/usr/bin/env node
// Writes the Italian pages in it/ from the English ones, using the translations in assets/i18n.js.
//
// Search engines only see the text that is in the HTML, so translating in the browser is not
// enough for them: each page also needs a real Italian copy at its own address (it/mods.html...).
// This script makes those copies the same way i18n.js translates in the browser: every text node,
// and every alt, aria-label, title and placeholder, whose English text is a key in the list.
//
// Runs in GitHub Actions (.github/workflows/build-it.yml) on every push that touches a page or
// the translations. To run it by hand:
//
//   node tools/build-it.mjs
//
// With --missing it also lists the texts that have no translation (names like "Fabric" or
// "GitHub" are expected there); to translate one, add it to assets/i18n.js.

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SITE = 'https://studio-deriva.github.io/';
const PAGES = ['index.html', 'mods.html', 'staff.html', 'carves-and-crafts.html'];
const root = new URL('../', import.meta.url);

// ---- the translations, read straight from i18n.js
const i18n = await readFile(new URL('assets/i18n.js', root), 'utf8');
const block = i18n.match(/var IT = (\{[\s\S]*?\n  \});/);
if (!block) fail('could not find "var IT = {...};" in assets/i18n.js');
const IT = new Function('return ' + block[1])();
const has = (k) => Object.prototype.hasOwnProperty.call(IT, k);

// ---- entities, enough for hand-written pages
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', eacute: 'é', egrave: 'è', agrave: 'à', ograve: 'ò', ugrave: 'ù', igrave: 'ì', rsaquo: '›', lsaquo: '‹', middot: '·', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1));
    return NAMED[e] ?? m;
  });
}
const encText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
const encAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// ---- translate one page
const SKIP_TAGS = new Set(['script', 'style', 'pre', 'code', 'svg', 'textarea']);
const ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];
const missing = new Set();

function translateText(raw) {
  const key = decode(raw).replace(/\s+/g, ' ').trim();
  if (!key) return raw;
  if (!has(key)) {
    if (/[a-z]{2}/i.test(key)) missing.add(key);
    return raw;
  }
  const lead = /^[.,;:]/.test(IT[key]) ? '' : raw.match(/^\s*/)[0];
  return lead + encText(IT[key]) + raw.match(/\s*$/)[0];
}

function translateTag(tag) {
  return tag.replace(/(\s)([\w:-]+)="([^"]*)"/g, (m, sp, name, value) => {
    const v = decode(value);
    return ATTRS.includes(name) && has(v) ? `${sp}${name}="${encAttr(IT[v])}"` : m;
  });
}

function translate(html) {
  let out = '', i = 0, skip = null, depth = 0;
  const re = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = html.slice(i, m.index);
    out += skip ? text : translateText(text);
    i = re.lastIndex;
    const [tag, close, rawName, rest] = m;
    if (!rawName) { out += tag; continue; } // comment or doctype
    const name = rawName.toLowerCase();
    if (skip) {
      if (name === skip) depth += close ? -1 : (/\/\s*$/.test(rest) ? 0 : 1);
      if (depth === 0) skip = null;
      out += tag;
      continue;
    }
    if (!close && (SKIP_TAGS.has(name) || /\sdata-no-i18n[\s=>]/.test(rest + '>'))) { skip = name; depth = 1; }
    out += close ? tag : translateTag(tag);
  }
  return out + (skip ? html.slice(i) : translateText(html.slice(i)));
}

// ---- head: language, addresses, and the meta texts
function head(html, page) {
  const en = SITE + (page === 'index.html' ? '' : page);
  const it = SITE + 'it/' + (page === 'index.html' ? '' : page);
  const meta = (s) => s.replace(/(<meta (?:name="description"|property="og:(?:title|description)") content=")([^"]*)(")/g,
    (m, a, v, b) => (has(decode(v)) ? a + encAttr(IT[decode(v)]) + b : (missing.add(decode(v)), m)));
  const swap = (s, from, to) => { if (!s.includes(from)) fail(`${page}: "${from}" not found`); return s.split(from).join(to); };
  html = swap(html, '<html lang="en">', '<html lang="it">');
  html = swap(html, `<link rel="canonical" href="${en}">`, `<link rel="canonical" href="${it}">`);
  html = swap(html, `<meta property="og:url" content="${en}">`, `<meta property="og:url" content="${it}">`);
  html = swap(html, '<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="it_IT">',
    '<meta property="og:locale" content="it_IT">\n<meta property="og:locale:alternate" content="en_US">');
  return meta(html);
}

// ---- it/ is one folder down: shared files are one level up
const up = (html) => html.replace(/(["'(])((?:assets|data)\/)/g, '$1../$2');

await mkdir(new URL('it/', root), { recursive: true });
for (const page of PAGES) {
  const src = await readFile(new URL(page, root), 'utf8');
  let html = up(translate(head(src, page)));
  html = html.replace(/^<!doctype html>\n/i, (d) => `${d}<!-- Generated by tools/build-it.mjs from ${page} and assets/i18n.js. Edit those, not this file. -->\n`);
  await writeFile(new URL('it/' + page, root), html);
}

console.log(`build-it: wrote ${PAGES.length} pages in it/`);
if (missing.size && process.argv.includes('--missing')) {
  console.log(`build-it: ${missing.size} texts have no Italian translation yet and stay in English:`);
  for (const k of missing) console.log('  ' + JSON.stringify(k));
}

function fail(msg) { console.error('build-it: ' + msg); process.exit(1); }
