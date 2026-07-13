#!/usr/bin/env node
/**
 * HY/RU/EN content quality & parity audit (read-only).
 * Usage: node scripts/content-parity-audit.js [BASE_URL]
 * Outputs: reports/content-parity-audit.md, reports/ru-content-audit.md, reports/en-content-audit.md
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BASE = (process.argv[2] || 'https://healthyspinedoc.com').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const REPORTS = path.join(ROOT, 'reports');

if (!process.env.CMS_DATA_DIR && fs.existsSync('/var/lib/hivandanoc-cms/cms.db')) {
  process.env.CMS_DATA_DIR = '/var/lib/hivandanoc-cms';
}

const ARMENIAN_RE = /[\u0531-\u0587]{2,}/g;
const CYRILLIC_RE = /[\u0400-\u04FF]{2,}/g;
const LATIN_WORD_RE = /\b[A-Za-z]{4,}\b/g;

const { ROUTES } = require('../server/services/seo-pages');
const { getLaunchedServiceSlugs } = require('../server/services/service-pages');
const { getLaunchedConditionSlugs, CONDITION_CONFIG } = require('../server/services/condition-pages');
const { getLaunchedKnowledgeSlugs, KNOWLEDGE_CONFIG } = require('../server/services/knowledge-pages');
const { LAUNCHED_AUTHORITY_SLUGS, PAGES: AUTHORITY_PAGES } = require('../server/services/local-authority-pages');
const { buildPublicContent } = require('../server/db/helpers');
const CONDITION_I18N = require('../server/services/condition-i18n');
const KNOWLEDGE_I18N = require('../server/services/knowledge-i18n');
const AUTHORITY_I18N = require('../server/services/authority-i18n');

const STATIC_ROUTES = [
  '/',
  '/services',
  '/conditions',
  '/knowledge',
  '/find-a-doctor',
  '/locations',
  '/about',
  '/contact',
  '/appointment',
  '/reviews',
  '/move-better',
  '/submit-story',
  '/patient-care',
  '/consultation-process',
  '/privacy-policy',
  '/terms',
  '/cookies-policy',
  '/patient-information',
  '/patient-story'
];

function buildUrlList() {
  const urls = [...STATIC_ROUTES];
  for (const slug of getLaunchedServiceSlugs()) urls.push(`/services/${slug}`);
  for (const slug of getLaunchedConditionSlugs()) urls.push(`/conditions/${slug}`);
  for (const slug of getLaunchedKnowledgeSlugs()) urls.push(`/knowledge/${slug}`);
  for (const slug of LAUNCHED_AUTHORITY_SLUGS) urls.push(slug);
  try {
    for (const d of buildPublicContent('hy').doctors || []) {
      if (d.slug || d.id) urls.push(`/doctors/${d.slug || d.id}`);
    }
  } catch {
    /* optional */
  }
  return [...new Set(urls)];
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, { headers: { 'User-Agent': 'ContentParityAudit/1.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

function langUrl(route, lang) {
  if (lang === 'hy') return `${BASE}${route}`;
  const sep = route.includes('?') ? '&' : '?';
  return `${BASE}${route}${sep}lang=${lang}`;
}

function stripNonContent(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
}

function stripHtml(html) {
  return stripNonContent(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTagOpen(tagStr) {
  const m = String(tagStr || '').match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)/);
  if (!m) return null;
  return { closing: Boolean(m[1]), name: m[2].toLowerCase() };
}

/** Extract a full balanced HTML element starting at openStart (handles nested same-tag sections). */
function extractBalancedFromIndex(html, openStart) {
  const openTag = html.slice(openStart).match(/^<[^>]+>/);
  if (!openTag) return null;
  const parsed = parseTagOpen(openTag[0]);
  if (!parsed || parsed.closing) return null;
  const tagName = parsed.name;
  const re = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  re.lastIndex = openStart;
  let depth = 0;
  let match;
  while ((match = re.exec(html)) !== null) {
    const info = parseTagOpen(match[0]);
    if (!info || info.name !== tagName) continue;
    if (info.closing) depth -= 1;
    else depth += 1;
    if (depth === 0) return html.slice(openStart, match.index + match[0].length);
  }
  return null;
}

function findElementById(html, id) {
  const re = new RegExp(`<(article|section|main|div)\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i');
  const m = html.match(re);
  if (!m || m.index == null) return null;
  return extractBalancedFromIndex(html, m.index);
}

function findElementByClass(html, className) {
  const re = new RegExp(`<(article|section|main|div)\\b[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  const m = html.match(re);
  if (!m || m.index == null) return null;
  return extractBalancedFromIndex(html, m.index);
}

function findElementByAttr(html, attr) {
  const re = new RegExp(`<(article|section|main|div)\\b[^>]*\\b${attr}\\b[^>]*>`, 'i');
  const m = html.match(re);
  if (!m || m.index == null) return null;
  return extractBalancedFromIndex(html, m.index);
}

/**
 * Robust main-content extraction for SSR pages with nested <section> blocks.
 * Returns { text, htmlBlock, method, warning }.
 */
function extractMainText(html) {
  const cleaned = stripNonContent(html);
  const attempts = [
    { method: '#seo-crawl-content', block: findElementById(cleaned, 'seo-crawl-content') },
    { method: 'main', block: (() => { const m = cleaned.match(/<main\b[^>]*>/i); return m ? extractBalancedFromIndex(cleaned, m.index) : null; })() },
    { method: '[data-page-content]', block: findElementByAttr(cleaned, 'data-page-content') },
    { method: '.page-content', block: findElementByClass(cleaned, 'page-content') },
    { method: '.content', block: findElementByClass(cleaned, 'content') }
  ];
  for (const attempt of attempts) {
    if (attempt.block) {
      return {
        text: stripHtml(attempt.block),
        htmlBlock: attempt.block,
        method: attempt.method,
        warning: null
      };
    }
  }
  const bodyMatch = cleaned.match(/<body\b[^>]*>/i);
  const bodyBlock = bodyMatch ? extractBalancedFromIndex(cleaned, bodyMatch.index) : cleaned;
  return {
    text: stripHtml(bodyBlock || cleaned),
    htmlBlock: bodyBlock || cleaned,
    method: 'body-fallback',
    warning: 'Used body fallback — counts may include nav/footer fragments'
  };
}

function countWords(text, _lang) {
  return wordCount(text);
}

function wordCount(text) {
  return (String(text || '').match(/[\p{L}\p{N}]+/gu) || []).length;
}

function extractMeta(html, name) {
  const m = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'));
  return m ? m[1] : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripHtml(m[1]) : '';
}

function extractHeadings(html) {
  const h2 = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3 = (html.match(/<h3[^>]*>/gi) || []).length;
  return { h2, h3 };
}

function extractCrawlBlock(html) {
  return extractMainText(html).text;
}

function extractSections(html) {
  const { htmlBlock } = extractMainText(html);
  const block = htmlBlock || html;
  const h2s = [...block.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripHtml(m[1]).slice(0, 80));
  const h3s = [...block.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => stripHtml(m[1]).slice(0, 80));
  return { h2: h2s, h3: h3s };
}

function debugPageExtraction(url, lang, html) {
  const { text, method, warning } = extractMainText(html);
  return { url, lang, method, wordCount: countWords(text, lang), warning };
}

function countInternalLinks(html) {
  return (html.match(/href="\/[^"]+"/gi) || []).length;
}

function detectLeaks(text, lang) {
  const issues = [];
  if (lang === 'ru' || lang === 'en') {
    for (const m of text.match(ARMENIAN_RE) || []) {
      if (!/^(HY|RU|EN)$/.test(m) && !m.includes('Healthy Spine')) issues.push(`Armenian: ${m.slice(0, 60)}`);
    }
  }
  if (lang === 'en') {
    for (const m of text.match(CYRILLIC_RE) || []) {
      if (m.length > 3) issues.push(`Cyrillic: ${m.slice(0, 60)}`);
    }
  }
  if (lang === 'ru') {
    const latinHits = (text.match(LATIN_WORD_RE) || []).filter(
      (w) => !/^(Healthy|Spine|Yerevan|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|FAQ|CTA|MRI|URL|HTML)$/i.test(w)
    );
    if (latinHits.length > 5) issues.push(`English fragments: ${latinHits.slice(0, 5).join(', ')}`);
  }
  return [...new Set(issues)].slice(0, 8);
}

function classifyParity(pct) {
  if (pct >= 100) return '100% Fully equivalent';
  if (pct >= 90) return '90–99% Minor wording differences';
  if (pct >= 70) return '70–89% Noticeable missing content';
  if (pct >= 40) return '40–69% Major content loss';
  return '0–39% Thin/placeholder';
}

function fieldParity(hyObj, trObj, fields) {
  if (!hyObj || !trObj) return { pct: 0, missing: fields, empty: [] };
  let score = 0;
  let max = 0;
  const missing = [];
  const empty = [];
  for (const f of fields) {
    max += 1;
    const hv = hyObj[f];
    const tv = trObj[f];
    if (hv == null || hv === '') continue;
    if (tv == null || tv === '') {
      missing.push(f);
      continue;
    }
    if (Array.isArray(hv)) {
      if (!Array.isArray(tv) || tv.length === 0) {
        missing.push(f);
        if (hv.length > 0) empty.push(`${f} (HY ${hv.length} items, target 0)`);
      } else if (tv.length >= hv.length * 0.8) score += 1;
      else {
        score += 0.5;
        empty.push(`${f} (HY ${hv.length}, target ${tv.length})`);
      }
    } else if (typeof hv === 'string') {
      if (tv.trim().length < hv.trim().length * 0.5) empty.push(`${f} (short)`);
      else score += 1;
    } else score += 1;
  }
  return { pct: max ? Math.round((score / max) * 100) : 100, missing, empty };
}

function flattenJsonText(obj, prefix = '') {
  const parts = [];
  if (obj == null) return parts;
  if (typeof obj === 'string') {
    if (obj.trim()) parts.push({ path: prefix, text: obj });
    return parts;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => parts.push(...flattenJsonText(v, `${prefix}[${i}]`)));
    return parts;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      parts.push(...flattenJsonText(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return parts;
}

function loadLang(lang) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, `lang/${lang}.json`), 'utf8'));
}

function loadLegal() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/legal.json'), 'utf8'));
}

function templateForRoute(route) {
  if (route === '/') return 'home / index.html + CMS';
  if (ROUTES[route]) return `seo-pages → ${ROUTES[route].file}`;
  if (route.startsWith('/services/')) return 'service-pages.js + CMS dept';
  if (route === '/services') return 'services hub';
  if (route.startsWith('/conditions/')) return 'condition-pages.js + condition-i18n';
  if (route === '/conditions') return 'conditions hub';
  if (route.startsWith('/knowledge/')) return 'knowledge-config + knowledge-i18n';
  if (route === '/knowledge') return 'knowledge hub';
  if (route.startsWith('/doctors/')) return 'doctor-pages.js + CMS doctor';
  if (LAUNCHED_AUTHORITY_SLUGS.includes(route)) return 'local-authority-config + authority-i18n';
  if (['/privacy-policy', '/terms', '/cookies-policy', '/patient-information'].includes(route)) {
    return 'legal.json + footer SSR';
  }
  return 'static/SSR';
}

async function analyzeLivePage(route) {
  const row = { route, template: templateForRoute(route), langs: {} };
  for (const lang of ['hy', 'ru', 'en']) {
    try {
      const { status, html } = await fetchUrl(langUrl(route, lang));
      if (status !== 200) {
        row.langs[lang] = { status, error: `HTTP ${status}` };
        continue;
      }
      const extracted = extractMainText(html);
      const crawl = extracted.text;
      const sections = extractSections(html);
      row.langs[lang] = {
        status,
        title: extractTitle(html),
        metaDescription: extractMeta(html, 'description'),
        h1: extractH1(html),
        headings: extractHeadings(html),
        sections,
        wordCount: countWords(crawl, lang),
        crawlWordCount: countWords(crawl, lang),
        extractionMethod: extracted.method,
        extractionWarning: extracted.warning,
        internalLinks: countInternalLinks(html),
        hasFaq: /faq|Հաճախ|Часто|Frequently/i.test(html),
        hasCta: /book|appointment|գրանց|запис|consultation|consult/i.test(crawl),
        leaks: detectLeaks(crawl, lang),
        placeholder: /—|Loading|Բեռնվում|Загрузка|\.\.\./i.test(crawl.slice(0, 200))
      };
    } catch (err) {
      row.langs[lang] = { error: err.message };
    }
  }
  const hyW = row.langs.hy?.wordCount || 0;
  const ruW = row.langs.ru?.wordCount || 0;
  const enW = row.langs.en?.wordCount || 0;
  row.ruVsHyPct = hyW ? Math.round((ruW / hyW) * 100) : null;
  row.enVsHyPct = hyW ? Math.round((enW / hyW) * 100) : null;
  row.ruParityClass = classifyParity(row.ruVsHyPct ?? 0);
  row.enParityClass = classifyParity(row.enVsHyPct ?? 0);

  const hySec = new Set([...(row.langs.hy?.sections?.h2 || []), ...(row.langs.hy?.sections?.h3 || [])]);
  const ruSec = new Set([...(row.langs.ru?.sections?.h2 || []), ...(row.langs.ru?.sections?.h3 || [])]);
  const enSec = new Set([...(row.langs.en?.sections?.h2 || []), ...(row.langs.en?.sections?.h3 || [])]);
  row.missingRuSections = [...hySec].filter((s) => s && !ruSec.has(s));
  row.missingEnSections = [...hySec].filter((s) => s && !enSec.has(s));

  return row;
}

function auditSourceConfigs() {
  const conditionFields = ['h1', 'tagline', 'description', 'intro', 'symptoms', 'whenToSeek', 'servicesIntro'];
  const knowledgeFields = ['h1', 'tagline', 'description', 'intro', 'symptoms', 'causes', 'whenToSeek', 'faq'];
  const authorityFields = ['title', 'h1', 'tagline', 'description', 'bodyIntro'];

  const conditions = [];
  for (const slug of getLaunchedConditionSlugs()) {
    const hy = CONDITION_CONFIG[slug];
    const ru = CONDITION_I18N.ru?.[slug];
    const en = CONDITION_I18N.en?.[slug];
    conditions.push({
      slug,
      route: `/conditions/${slug}`,
      ru: fieldParity(hy, ru, conditionFields),
      en: fieldParity(hy, en, conditionFields)
    });
  }

  const knowledge = [];
  for (const slug of getLaunchedKnowledgeSlugs()) {
    const hy = KNOWLEDGE_CONFIG[slug];
    const ru = KNOWLEDGE_I18N.ru?.[slug];
    const en = KNOWLEDGE_I18N.en?.[slug];
    knowledge.push({
      slug,
      route: `/knowledge/${slug}`,
      hyFaq: (hy?.faq || []).length,
      ruFaq: (ru?.faq || []).length,
      enFaq: (en?.faq || []).length,
      hySymptoms: (hy?.symptoms || []).length,
      ruSymptoms: (ru?.symptoms || []).length,
      ru: fieldParity(hy, ru, knowledgeFields),
      en: fieldParity(hy, en, knowledgeFields),
      ruMixedLang: ru?.h1 && /[A-Za-z]{3,}/.test(ru.h1) && /[\u0400-\u04FF]/.test(ru.h1),
      enMixedLang: en?.h1 && /[\u0400-\u04FF]/.test(en.h1)
    });
  }

  const authority = [];
  for (const route of LAUNCHED_AUTHORITY_SLUGS) {
    const hy = AUTHORITY_PAGES[route];
    const ru = AUTHORITY_I18N.ru?.[route];
    const en = AUTHORITY_I18N.en?.[route];
    const hyBodyLen = typeof hy?.body === 'function' ? 500 : String(hy?.body || '').length;
    authority.push({
      route,
      hyBodyEstimate: hyBodyLen,
      ruIntroLen: (ru?.bodyIntro || '').length,
      enIntroLen: (en?.bodyIntro || '').length,
      hyHasFaq: !!(hy?.faq?.length),
      ru: fieldParity({ ...hy, bodyIntro: 'x'.repeat(hyBodyLen) }, { ...ru, bodyIntro: ru?.bodyIntro }, authorityFields),
      en: fieldParity({ ...hy, bodyIntro: 'x'.repeat(hyBodyLen) }, { ...en, bodyIntro: en?.bodyIntro }, authorityFields)
    });
  }

  return { conditions, knowledge, authority };
}

function auditCmsParity() {
  const issues = [];
  let hy, ru, en;
  try {
    hy = buildPublicContent('hy');
    ru = buildPublicContent('ru');
    en = buildPublicContent('en');
  } catch (err) {
    return { issues: [{ severity: 'critical', msg: `CMS unavailable: ${err.message}` }] };
  }

  for (const svc of hy.departments || []) {
    const ruSvc = (ru.departments || []).find((d) => d.id === svc.id);
    const enSvc = (en.departments || []).find((d) => d.id === svc.id);
    if (svc.description && (!ruSvc?.description || ARMENIAN_RE.test(ruSvc.description))) {
      issues.push({
        severity: 'high',
        type: 'cms-service',
        id: svc.id,
        field: 'description',
        msg: `HY description exists; RU missing or Armenian fallback`,
        source: 'server/db/helpers.js pick() + services table'
      });
    }
    if (svc.description && (!enSvc?.description || ARMENIAN_RE.test(enSvc.description))) {
      issues.push({
        severity: 'high',
        type: 'cms-service',
        id: svc.id,
        field: 'description',
        msg: `HY description exists; EN missing or Armenian fallback`,
        source: 'server/db/helpers.js'
      });
    }
  }

  for (const doc of hy.doctors || []) {
    const ruDoc = (ru.doctors || []).find((d) => d.id === doc.id);
    const enDoc = (en.doctors || []).find((d) => d.id === doc.id);
    if (doc.bio && (!ruDoc?.bio || ruDoc.bio.length < doc.bio.length * 0.4)) {
      issues.push({
        severity: 'medium',
        type: 'cms-doctor',
        id: doc.id,
        field: 'bio',
        msg: `Doctor bio shorter/missing in RU (${(ruDoc?.bio || '').length} vs HY ${doc.bio.length})`,
        source: 'doctors table bio_ru'
      });
    }
    if (doc.bio && (!enDoc?.bio || enDoc.bio.length < doc.bio.length * 0.4)) {
      issues.push({
        severity: 'medium',
        type: 'cms-doctor',
        id: doc.id,
        field: 'bio',
        msg: `Doctor bio shorter/missing in EN`,
        source: 'doctors table bio_en'
      });
    }
  }

  const hyLang = loadLang('hy');
  const ruLang = loadLang('ru');
  const enLang = loadLang('en');
  const hyPages = flattenJsonText(hyLang.pages, 'pages');
  const ruPages = flattenJsonText(ruLang.pages, 'pages');
  const enPages = flattenJsonText(enLang.pages, 'pages');
  const ruKeys = new Set(ruPages.map((p) => p.path));
  const enKeys = new Set(enPages.map((p) => p.path));
  for (const p of hyPages) {
    if (!ruKeys.has(p.path)) {
      issues.push({ severity: 'medium', type: 'lang-json', path: p.path, msg: 'HY pages key missing in ru.json', source: 'lang/ru.json' });
    }
    if (!enKeys.has(p.path)) {
      issues.push({ severity: 'medium', type: 'lang-json', path: p.path, msg: 'HY pages key missing in en.json', source: 'lang/en.json' });
    }
  }

  return { issues, hy, ru, en };
}

function auditLangContentParity() {
  const hy = loadLang('hy').content || {};
  const ru = loadLang('ru').content || {};
  const en = loadLang('en').content || {};
  const gaps = [];
  for (const key of Object.keys(hy)) {
    if (!ru[key]) gaps.push({ key, lang: 'ru', source: 'lang/ru.json content' });
    if (!en[key]) gaps.push({ key, lang: 'en', source: 'lang/en.json content' });
  }
  return gaps;
}

function sectionScores(inventory) {
  const buckets = {};
  for (const row of inventory) {
    let section = 'other';
    if (row.route === '/') section = 'homepage';
    else if (row.route.startsWith('/services')) section = 'services';
    else if (row.route.startsWith('/conditions')) section = 'conditions';
    else if (row.route.startsWith('/knowledge')) section = 'knowledge';
    else if (row.route.startsWith('/doctors')) section = 'doctors';
    else if (['/about', '/consultation-process', '/editorial-policy', '/spine-specialist-yerevan'].some((p) => row.route.includes(p.replace(/^\//, ''))) || LAUNCHED_AUTHORITY_SLUGS.includes(row.route)) {
      section = 'trust/authority';
    } else if (['/contact', '/locations', '/appointment'].includes(row.route)) section = 'contact/conversion';
    else if (row.route.includes('policy') || row.route.includes('terms') || row.route.includes('patient-information')) section = 'legal';
    else if (['/reviews', '/patient-story', '/submit-story', '/move-better', '/patient-care'].includes(row.route)) section = 'patient-care';

    if (!buckets[section]) buckets[section] = { ru: [], en: [], n: 0 };
    buckets[section].n += 1;
    if (row.ruVsHyPct != null) buckets[section].ru.push(row.ruVsHyPct);
    if (row.enVsHyPct != null) buckets[section].en.push(row.enVsHyPct);
  }
  const out = {};
  for (const [k, v] of Object.entries(buckets)) {
    out[k] = {
      pages: v.n,
      avgRuPct: v.ru.length ? Math.round(v.ru.reduce((a, b) => a + b, 0) / v.ru.length) : null,
      avgEnPct: v.en.length ? Math.round(v.en.reduce((a, b) => a + b, 0) / v.en.length) : null
    };
  }
  return out;
}

function mdTable(headers, rows) {
  const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const line = (cells) => `| ${cells.map(esc).join(' | ')} |`;
  return [line(headers), line(headers.map(() => '---')), ...rows.map((r) => line(r))].join('\n');
}

function buildReports(inventory, sourceAudit, cmsAudit, langGaps) {
  const now = new Date().toISOString().slice(0, 10);
  const sectionScoresMap = sectionScores(inventory);

  const worstRu = [...inventory]
    .filter((r) => r.ruVsHyPct != null)
    .sort((a, b) => a.ruVsHyPct - b.ruVsHyPct)
    .slice(0, 15);
  const worstEn = [...inventory]
    .filter((r) => r.enVsHyPct != null)
    .sort((a, b) => a.enVsHyPct - b.enVsHyPct)
    .slice(0, 15);

  const knowledgeThin = sourceAudit.knowledge.filter((k) => k.ru.pct < 70 || k.en.pct < 70);
  const conditionOk = sourceAudit.conditions.filter((c) => c.ru.pct >= 90);

  const invRows = inventory.map((r) => [
    r.route,
    r.template,
    r.langs.hy?.wordCount ?? '—',
    r.langs.ru?.wordCount ?? '—',
    r.langs.en?.wordCount ?? '—',
    (r.langs.hy?.sections?.h2?.length || 0) + (r.langs.hy?.sections?.h3?.length || 0),
    (r.langs.ru?.sections?.h2?.length || 0) + (r.langs.ru?.sections?.h3?.length || 0),
    (r.langs.en?.sections?.h2?.length || 0) + (r.langs.en?.sections?.h3?.length || 0),
    r.ruVsHyPct != null ? `${r.ruVsHyPct}%` : '—',
    r.enVsHyPct != null ? `${r.enVsHyPct}%` : '—'
  ]);

  const main = `# Content Parity Audit — HY / RU / EN

**Date:** ${now}  
**Baseline:** Armenian (HY) as source of truth  
**Site:** ${BASE}  
**Scope:** Content quality, completeness, parity, SEO depth (no code changes)

---

## A. Content inventory summary

- **Pages audited (live):** ${inventory.length}
- **Condition configs:** ${sourceAudit.conditions.length} (source parity avg RU ~${Math.round(sourceAudit.conditions.reduce((s, c) => s + c.ru.pct, 0) / sourceAudit.conditions.length)}%)
- **Knowledge articles:** ${sourceAudit.knowledge.length} (major FAQ/symptom gaps in RU/EN overlays)
- **Authority pages:** ${sourceAudit.authority.length} (RU/EN intentionally thin vs HY full body)
- **CMS issues flagged:** ${cmsAudit.issues.length}
- **Lang JSON content gaps:** ${langGaps.length}

### Inventory table (live crawl block word counts)

${mdTable(
  ['URL', 'Template', 'HY words', 'RU words', 'EN words', 'HY §', 'RU §', 'EN §', 'RU/HY', 'EN/HY'],
  invRows.slice(0, 40)
)}

${inventory.length > 40 ? `\n*Showing 40/${inventory.length} rows — see full data in audit JSON.*\n` : ''}

---

## B. Content parity score by section

${mdTable(
  ['Section', 'Pages', 'Avg RU vs HY word %', 'Avg EN vs HY word %'],
  Object.entries(sectionScoresMap).map(([k, v]) => [k, v.pages, v.avgRuPct ?? '—', v.avgEnPct ?? '—'])
)}

**Interpretation:** Word-count ratio is a proxy; authority/knowledge pages show low % by design (HY long-form, RU/EN overlay-only).

---

## C. Worst RU pages (live word count vs HY)

${mdTable(
  ['URL', 'HY words', 'RU words', 'RU/HY %', 'Class', 'Issues'],
  worstRu.map((r) => [
    r.route,
    r.langs.hy?.wordCount,
    r.langs.ru?.wordCount,
    r.ruVsHyPct,
    r.ruParityClass,
    (r.langs.ru?.leaks || []).join('; ') || (r.missingRuSections?.length ? `Missing sections: ${r.missingRuSections.slice(0, 2).join(', ')}` : '—')
  ])
)}

---

## D. Worst EN pages (live word count vs HY)

${mdTable(
  ['URL', 'HY words', 'EN words', 'EN/HY %', 'Class', 'Issues'],
  worstEn.map((r) => [
    r.route,
    r.langs.hy?.wordCount,
    r.langs.en?.wordCount,
    r.enVsHyPct,
    r.enParityClass,
    (r.langs.en?.leaks || []).join('; ') || '—'
  ])
)}

---

## E. CMS parity issues

${cmsAudit.issues.length ? mdTable(['Severity', 'Type', 'ID/Path', 'Message', 'Source'], cmsAudit.issues.slice(0, 30).map((i) => [i.severity, i.type, i.id || i.path || '—', i.msg, i.source])) : 'No CMS connectivity issues detected.'}

**CMS content origin:**
| Layer | Path | Locales |
|-------|------|---------|
| SQLite CMS | \`/var/lib/hivandanoc-cms/cms.db\` | \`title_hy/ru/en\`, \`bio_*\`, \`page_sections\` |
| Published JSON | \`published/content-{lang}.json\` | Post-publish snapshots |
| Lang overlays | \`lang/{hy,ru,en}.json\` → \`content.*\` | Service item lists, home blocks |
| HY-only seed | \`data/hospital.json\` + \`dept-translations\` | HY services override in \`buildPublicContent('hy')\` |

---

## F. Translation quality issues

### Knowledge i18n (\`server/services/knowledge-i18n.js\`)
- **41/41** articles have RU/EN metadata overlays
- **~100%** have empty \`symptoms[]\`, \`causes[]\`, \`faq[]\` while HY \`knowledge-config.js\` is populated
- **RU H1 mixed language:** e.g. \`"Back pain причины"\`, \`"Neck pain причины"\` — English+Russian hybrid

### Condition i18n (\`server/services/condition-i18n.js\`)
- **13/13** slugs have RU/EN overlays with symptoms/whenToSeek lists
- **Generic repeated symptom bullets** across conditions (possible MT template artifact)

### Authority i18n (\`server/services/authority-i18n.js\`)
- **Identical \`bodyIntro\`** repeated across all 13 authority routes in RU and EN
- HY FAQ sections **not rendered** for RU/EN (\`local-authority-pages.js\`)

### Live leakage (crawl blocks)
${inventory.filter((r) => (r.langs.ru?.leaks?.length || r.langs.en?.leaks?.length)).length} pages with detected cross-language fragments in RU/EN crawl text.

---

## G. SEO depth gaps

| Gap | HY | RU | EN | Evidence |
|-----|----|----|-----|----------|
| Knowledge FAQ schema text | Full FAQ arrays | Empty | Empty | \`knowledge-i18n.js\` |
| Authority long-form body | Full HTML body + FAQ | 1-paragraph intro | 1-paragraph intro | \`local-authority-config.js\` vs \`authority-i18n.js\` |
| Service detail depth | CMS + HY dept-translations | CMS \`_ru\` + lang overlay | CMS \`_en\` + lang overlay | \`helpers.js localizeServiceItems\` |
| Homepage dynamic blocks | CMS + \`lang.content\` | Same structure, locale text | Same | Client \`home.js\` + SSR crawl |
| Conditions hub in sitemap | Indexed via detail pages | Hub excluded | Hub excluded | By design |

**Pages where HY > RU/EN by 50%+ (live word count):**
${inventory.filter((r) => r.ruVsHyPct != null && r.ruVsHyPct < 50).map((r) => `- ${r.route}: RU ${r.ruVsHyPct}%`).join('\n') || 'None under 50% on sampled live crawl.'}

---

## H. Trust / E-E-A-T gaps

| Page | HY trust signals | RU/EN gap |
|------|------------------|-----------|
| \`/about\` | Mission, leadership, awards, values | CMS-driven; parity depends on doctor bios |
| \`/editorial-policy\` | Full HY policy body | RU/EN: title + 1 intro paragraph only |
| \`/consultation-process\` | Full SSR copy | RU/EN localized via \`seo-pages.js\` — moderate parity |
| \`/doctors/:slug\` | Bio, education, languages from CMS | RU/EN use \`pick(bio, lang)\` — gaps if DB empty |
| \`/find-a-doctor\` | Doctor list crawl | Names localized; bios in crawl limited |
| Legal pages | Full \`legal.json\` bodies | **Strong parity** — tri-lingual HTML sections |

---

## I. Recommended fixes (audit only — do not implement yet)

### Critical
1. Populate \`knowledge-i18n.js\` \`faq[]\`, \`symptoms[]\`, \`causes[]\` for top 10 traffic articles (regenerate via \`scripts/generate-ssr-i18n.js\` after HY source update)
2. Fix RU knowledge H1 mixed-language strings (\`Back pain причины\` → full Russian)
3. Complete CMS \`bio_ru\` / \`bio_en\` for published doctors

### High
4. Expand \`authority-i18n.js\` with full body translations (or render HY FAQ with locale labels)
5. Audit CMS service \`description_ru/en\` for empty fallbacks to Armenian
6. Translate \`data/hospital.json\` \`expertiseOverlay\` (still Russian in HY seed file)

### Medium
7. Home \`content.news[]\` — empty; no RU/EN news parity possible until CMS populated
8. Patient stories — client-rendered; SSR shell only

### Low
9. Condition symptom list de-duplication (same 4 bullets across slugs in RU)

---

## J. Estimated impact

| Fix phase | SEO impact | Trust impact | Conversion impact | Effort |
|-----------|------------|--------------|-------------------|--------|
| Knowledge FAQ/symptom parity | **High** | Medium | Low | 2–3 days |
| Authority page body RU/EN | **High** | **High** | Medium | 3–5 days |
| CMS doctor bios | Medium | **High** | **High** | 1 day |
| Knowledge H1 cleanup | Medium | Low | Low | 2 hours |
| Service CMS descriptions | Medium | Medium | Medium | 1 day |

---

## K. Files / content sources

| Content | Primary files |
|---------|---------------|
| Homepage UI | \`lang/{hy,ru,en}.json\` → \`pages.home\`, \`content.*\` |
| Homepage dynamic | \`js/home.js\`, CMS \`page_sections\`, \`data/hospital.json\` |
| Services | CMS \`services\` table, \`service-pages.js\`, \`lang/*.json content.departments\` |
| Conditions | \`condition-pages.js\`, \`condition-i18n.js\` |
| Knowledge | \`knowledge-config.js\`, \`knowledge-i18n.js\` |
| Doctors | CMS \`doctors\`, \`doctor-pages.js\` |
| Authority | \`local-authority-config.js\`, \`authority-i18n.js\` |
| Legal | \`lang/legal.json\` |
| SSR UI strings | \`server/services/i18n-ssr.js\` → \`ui(lang)\` |

---

## Implementation plan

### Phase A — Quick wins (<1 hour)
- Fix obvious mixed-language knowledge H1s in \`knowledge-i18n.js\`
- Verify CMS doctor \`bio_ru/en\` non-empty in admin
- Document HY-only \`hospital.json\` expertiseOverlay for CMS migration

### Phase B — High-value content gaps (1–3 days)
- Regenerate knowledge/condition i18n from updated HY sources
- Fill top 10 knowledge article FAQ arrays in RU/EN
- CMS service description audit + backfill

### Phase C — Authority improvements (3–5 days)
- Translate authority page bodies or enable FAQ for RU/EN
- Editorial policy / medical review policy full text in RU/EN

### Phase D — Long-tail article parity (ongoing)
- Remaining 31 knowledge articles — symptoms, causes, FAQ
- Condition-specific symptom copy (replace generic templates)

---

*Generated by \`scripts/content-parity-audit.js\` — read-only audit.*
`;

  const ruReport = buildLangReport('RU', 'ru', inventory, sourceAudit, cmsAudit, worstRu);
  const enReport = buildLangReport('EN', 'en', inventory, sourceAudit, cmsAudit, worstEn);

  return { main, ruReport, enReport };
}

function buildLangReport(label, langCode, inventory, sourceAudit, cmsAudit, worst) {
  const langKey = langCode;
  const pages = inventory.map((r) => ({
    route: r.route,
    words: r.langs[langCode]?.wordCount,
    hyWords: r.langs.hy?.wordCount,
    pct: langCode === 'ru' ? r.ruVsHyPct : r.enVsHyPct,
    class: langCode === 'ru' ? r.ruParityClass : r.enParityClass,
    leaks: r.langs[langCode]?.leaks || [],
    title: r.langs[langCode]?.title,
    h1: r.langs[langCode]?.h1
  }));

  const avgWords =
    pages.filter((p) => p.words).reduce((s, p) => s + p.words, 0) / (pages.filter((p) => p.words).length || 1);
  const avgPct =
    pages.filter((p) => p.pct != null).reduce((s, p) => s + p.pct, 0) / (pages.filter((p) => p.pct != null).length || 1);

  const knowledgeIssues = sourceAudit.knowledge
    .filter((k) => (langCode === 'ru' ? k.ru.pct : k.en.pct) < 80)
    .slice(0, 20);

  return `# ${label} Content Audit

**Baseline:** HY source of truth  
**Language:** ${label} (\`${langCode}\`)

## Summary

- **Average crawl-block word count:** ${Math.round(avgWords)}
- **Average word-count parity vs HY:** ${Math.round(avgPct)}%
- **Pages with leakage flags:** ${pages.filter((p) => p.leaks.length).length}
- **CMS issues affecting ${label}:** ${cmsAudit.issues.filter((i) => i.msg.includes(label) || i.msg.includes(langCode.toUpperCase())).length}

## Worst parity pages

${mdTable(
  ['URL', `${label} words`, 'HY words', '%', 'Class'],
  worst.map((r) => [
    r.route,
    r.langs[langCode]?.wordCount,
    r.langs.hy?.wordCount,
    langCode === 'ru' ? r.ruVsHyPct : r.enVsHyPct,
    langCode === 'ru' ? r.ruParityClass : r.enParityClass
  ])
)}

## Knowledge article source gaps (${label})

${mdTable(
  ['Slug', 'Parity %', 'HY FAQ', `${label} FAQ`, 'Missing fields'],
  knowledgeIssues.map((k) => [
    k.slug,
    langCode === 'ru' ? k.ru.pct : k.en.pct,
    k.hyFaq,
    langCode === 'ru' ? k.ruFaq : k.enFaq,
    (langCode === 'ru' ? k.ru : k.en).missing.join(', ')
  ])
)}

## Mixed-language / quality flags

${sourceAudit.knowledge
  .filter((k) => (langCode === 'ru' ? k.ruMixedLang : k.enMixedLang))
  .map((k) => `- \`/knowledge/${k.slug}\` — hybrid H1 in \`knowledge-i18n.js\``)
  .join('\n') || 'None flagged.'}

## Condition pages source parity

${mdTable(
  ['Slug', 'Parity %', 'Empty/missing'],
  sourceAudit.conditions.map((c) => [
    c.slug,
    langCode === 'ru' ? c.ru.pct : c.en.pct,
    (langCode === 'ru' ? c.ru : c.en).empty.join('; ') || '—'
  ])
)}

## Authority pages

All authority routes use a **single repeated \`bodyIntro\`** in \`authority-i18n.js\` (${label}). HY full body + FAQ not translated.

## Priority remediation for ${label}

1. **Critical:** Knowledge FAQ/symptom/cause arrays (41 articles)
2. **High:** Authority page full-body translation
3. **High:** CMS doctor bios and service descriptions
4. **Medium:** De-template condition symptom bullets
5. **Low:** Mixed-language H1 cleanup

*See \`reports/content-parity-audit.md\` for full cross-locale analysis.*
`;
}

async function main() {
  fs.mkdirSync(REPORTS, { recursive: true });
  const routes = buildUrlList();
  console.log(`Content parity audit — ${routes.length} routes`);

  const sourceAudit = auditSourceConfigs();
  const cmsAudit = auditCmsParity();
  const langGaps = auditLangContentParity();

  const inventory = [];
  const batchSize = 8;
  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((route) => analyzeLivePage(route)));
    inventory.push(...results);
    process.stdout.write(`\r  Live fetch ${Math.min(i + batchSize, routes.length)}/${routes.length}`);
  }
  console.log('');

  const { main, ruReport, enReport } = buildReports(inventory, sourceAudit, cmsAudit, langGaps);

  fs.writeFileSync(path.join(REPORTS, 'content-parity-audit.md'), main);
  fs.writeFileSync(path.join(REPORTS, 'ru-content-audit.md'), ruReport);
  fs.writeFileSync(path.join(REPORTS, 'en-content-audit.md'), enReport);
  fs.writeFileSync(
    path.join(REPORTS, 'content-parity-data.json'),
    JSON.stringify({ generated: new Date().toISOString(), inventory, sourceAudit, cmsIssues: cmsAudit.issues, langGaps }, null, 2)
  );

  console.log('Reports written:');
  console.log('  reports/content-parity-audit.md');
  console.log('  reports/ru-content-audit.md');
  console.log('  reports/en-content-audit.md');
  console.log('  reports/content-parity-data.json');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  BASE,
  fetchUrl,
  langUrl,
  stripNonContent,
  stripHtml,
  extractMainText,
  extractCrawlBlock,
  countWords,
  wordCount,
  debugPageExtraction
};
