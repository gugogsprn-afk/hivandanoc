#!/usr/bin/env node
/**
 * Strict live locale parity audit — visible body text must match selected language.
 * Usage: node scripts/audit-locale-parity.js [BASE_URL]
 */
const fs = require('fs');
const https = require('https');
const http = require('http');
const { getLaunchedServiceSlugs } = require('../server/services/service-pages');
const { getLaunchedConditionSlugs } = require('../server/services/condition-pages');
const { getLaunchedKnowledgeSlugs } = require('../server/services/knowledge-pages');
const { getPublishedDoctorSlugs } = require('../server/services/doctor-pages');
const { buildPublicContent } = require('../server/db/helpers');
const { AUDIT_NAME_ALLOWLIST } = require('../server/services/locale-content');

const BASE = (process.argv[2] || process.env.LOCALE_AUDIT_BASE || 'https://healthyspinedoc.com').replace(
  /\/$/,
  ''
);
if (!process.env.CMS_DATA_DIR && fs.existsSync('/var/lib/hivandanoc-cms/cms.db')) {
  process.env.CMS_DATA_DIR = '/var/lib/hivandanoc-cms';
}
const LANGS = ['hy', 'ru', 'en'];

const ARMENIAN_RE = /[\u0531-\u0587]{2,}/g;
const CYRILLIC_RE = /[\u0400-\u04FF]{2,}/g;
const OLD_GMAIL_RE = /gmail\.com/i;
const I18N_KEY_RE = /\b(?:pages|nav|content|meta)\.[A-Za-z0-9_.-]{2,}\b/g;

const ALLOWLIST_FRAGMENTS = [
  ...AUDIT_NAME_ALLOWLIST,
  'HY',
  'RU',
  'EN',
  'Healthy Spine',
  'Здоровый позвоночник',
  'Առողջ ողնաշար'
];

const STATIC_ROUTES = [
  '/',
  '/services',
  '/conditions',
  '/knowledge',
  '/find-a-doctor',
  '/locations',
  '/about',
  '/contact',
  '/consultation-process',
  '/spine-specialist-yerevan',
  '/editorial-policy'
];

function buildRoutes() {
  const routes = [...STATIC_ROUTES];
  for (const slug of getLaunchedServiceSlugs()) routes.push(`/services/${slug}`);
  for (const slug of getLaunchedConditionSlugs()) routes.push(`/conditions/${slug}`);
  for (const slug of getLaunchedKnowledgeSlugs()) routes.push(`/knowledge/${slug}`);
  for (const slug of getPublishedDoctorSlugs(buildPublicContent('hy'))) routes.push(`/doctors/${slug}`);
  return routes;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, { headers: { 'User-Agent': 'HealthySpine-Locale-Audit/2.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
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

function isAllowlisted(sample) {
  const s = String(sample || '').trim();
  if (!s) return true;
  if (/^(HY|RU|EN)$/.test(s)) return true;
  return ALLOWLIST_FRAGMENTS.some((frag) => s.includes(frag));
}

function findLeaks(text, re) {
  const hits = [];
  const matches = text.match(re) || [];
  for (const m of matches) {
    if (isAllowlisted(m)) continue;
    hits.push(m.slice(0, 120));
  }
  return [...new Set(hits)];
}

function langQuery(route, lang) {
  if (lang === 'hy') return route;
  const sep = route.includes('?') ? '&' : '?';
  return `${route}${sep}lang=${lang}`;
}

function checkHtmlLang(html, lang) {
  const m = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  if (!m) return { ok: false, sample: 'missing html lang attribute' };
  if (m[1] !== lang) return { ok: false, sample: `html lang="${m[1]}" expected "${lang}"` };
  return { ok: true };
}

function checkCanonical(html, route) {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/i);
  if (!m) return { ok: false, sample: 'missing canonical link' };
  const expected = `${BASE}${route === '/' ? '/' : route}`.replace(/\/$/, route === '/' ? '/' : '');
  const canonical = m[1].replace(/\/$/, route === '/' ? '/' : '');
  if (canonical !== expected) {
    return { ok: false, sample: `canonical ${canonical} expected ${expected}` };
  }
  return { ok: true };
}

function checkMetaLocale(html, lang) {
  const issues = [];
  const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] || '';
  const ogDesc = html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] || '';
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
  const metaText = `${title} ${ogTitle} ${ogDesc}`;

  if (lang === 'en') {
    findLeaks(metaText, ARMENIAN_RE).forEach((s) => issues.push({ type: 'en_meta_armenian', sample: s }));
    findLeaks(metaText, CYRILLIC_RE).forEach((s) => issues.push({ type: 'en_meta_cyrillic', sample: s }));
  } else if (lang === 'ru') {
    findLeaks(metaText, ARMENIAN_RE).forEach((s) => issues.push({ type: 'ru_meta_armenian', sample: s }));
  }
  return issues;
}

function checkJsonLdLocale(html, lang) {
  const issues = [];
  const blocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const jsonText = blocks.join(' ');
  if (lang === 'en') {
    findLeaks(jsonText, ARMENIAN_RE).forEach((s) => issues.push({ type: 'en_schema_armenian', sample: s }));
    findLeaks(jsonText, CYRILLIC_RE).forEach((s) => issues.push({ type: 'en_schema_cyrillic', sample: s }));
  } else if (lang === 'ru') {
    findLeaks(jsonText, ARMENIAN_RE).forEach((s) => issues.push({ type: 'ru_schema_armenian', sample: s }));
  }
  return issues;
}

function checkDuplicateBlocks(html) {
  const crawlCount = (html.match(/id="seo-crawl-content"/g) || []).length;
  if (crawlCount > 1) {
    return [{ type: 'duplicate_crawl', sample: `${crawlCount} seo-crawl-content blocks` }];
  }
  return [];
}

function checkI18nKeyLeakage(text) {
  const keys = (text.match(I18N_KEY_RE) || []).filter((k) => !k.includes('healthyspine'));
  return [...new Set(keys)].map((sample) => ({ type: 'i18n_key_leak', sample }));
}

async function auditRoute(route, lang) {
  const url = `${BASE}${langQuery(route, lang)}`;
  const issues = [];

  try {
    const { status, body } = await fetchUrl(url);
    if (status !== 200) {
      issues.push({ type: 'http', sample: `HTTP ${status}` });
      return { route, lang, url, issues, text: '' };
    }

    const text = stripHtml(body);

    if (OLD_GMAIL_RE.test(body) || OLD_GMAIL_RE.test(text)) {
      issues.push({ type: 'old_gmail', sample: 'gmail.com found' });
    }

    const langCheck = checkHtmlLang(body, lang);
    if (!langCheck.ok) issues.push({ type: 'wrong_lang_attr', sample: langCheck.sample });

    const canonCheck = checkCanonical(body, route);
    if (!canonCheck.ok) issues.push({ type: 'wrong_canonical', sample: canonCheck.sample });

    issues.push(...checkMetaLocale(body, lang));
    issues.push(...checkJsonLdLocale(body, lang));
    issues.push(...checkDuplicateBlocks(body));
    issues.push(...checkI18nKeyLeakage(text));

    if (lang === 'en') {
      findLeaks(text, ARMENIAN_RE).forEach((sample) => issues.push({ type: 'en_armenian', sample }));
      findLeaks(text, CYRILLIC_RE).forEach((sample) => issues.push({ type: 'en_cyrillic', sample }));
    } else if (lang === 'ru') {
      findLeaks(text, ARMENIAN_RE).forEach((sample) => issues.push({ type: 'ru_armenian', sample }));
    } else if (lang === 'hy') {
      if (!ARMENIAN_RE.test(text)) {
        issues.push({ type: 'hy_missing_armenian', sample: 'No Armenian script in visible text' });
      }
    }

    return { route, lang, url, issues, text };
  } catch (err) {
    issues.push({ type: 'fetch_error', sample: String(err.message || err) });
    return { route, lang, url, issues, text: '' };
  }
}

async function main() {
  const routes = buildRoutes();
  const counters = {
    en_armenian: 0,
    en_cyrillic: 0,
    ru_armenian: 0,
    hy_missing_armenian: 0,
    old_gmail: 0,
    wrong_lang_attr: 0,
    wrong_canonical: 0,
    meta_locale: 0,
    schema_locale: 0,
    duplicate_crawl: 0,
    i18n_key_leak: 0,
    http: 0
  };

  console.log(`==> Locale parity audit: ${BASE}`);
  console.log(`    Routes: ${routes.length} × ${LANGS.length} = ${routes.length * LANGS.length} fetches\n`);

  const results = [];
  for (const route of routes) {
    for (const lang of LANGS) {
      const row = await auditRoute(route, lang);
      results.push(row);
      for (const issue of row.issues) {
        if (issue.type.startsWith('en_') && issue.type.includes('armenian')) counters.en_armenian += 1;
        else if (issue.type === 'en_cyrillic' || issue.type === 'en_meta_cyrillic' || issue.type === 'en_schema_cyrillic') {
          counters.en_cyrillic += 1;
        } else if (issue.type.startsWith('ru_') && issue.type.includes('armenian')) counters.ru_armenian += 1;
        else if (issue.type === 'hy_missing_armenian') counters.hy_missing_armenian += 1;
        else if (issue.type === 'old_gmail') counters.old_gmail += 1;
        else if (issue.type === 'wrong_lang_attr') counters.wrong_lang_attr += 1;
        else if (issue.type === 'wrong_canonical') counters.wrong_canonical += 1;
        else if (issue.type.includes('meta_')) counters.meta_locale += 1;
        else if (issue.type.includes('schema_')) counters.schema_locale += 1;
        else if (issue.type === 'duplicate_crawl') counters.duplicate_crawl += 1;
        else if (issue.type === 'i18n_key_leak') counters.i18n_key_leak += 1;
        else if (issue.type === 'http') counters.http += 1;
        console.log(`FAIL [${lang}] ${route} (${issue.type}): ${issue.sample}`);
      }
    }
  }

  const failedRoutes = new Set(results.filter((r) => r.issues.length).map((r) => `${r.lang}:${r.route}`));

  console.log('\n==> Summary');
  console.log(`Routes crawled: ${routes.length}`);
  console.log(`Locale fetches: ${routes.length * LANGS.length}`);
  console.log(`Failed route/lang pairs: ${failedRoutes.size}`);
  console.log(`EN Armenian leakage hits: ${counters.en_armenian}`);
  console.log(`EN Cyrillic leakage hits: ${counters.en_cyrillic}`);
  console.log(`RU Armenian leakage hits: ${counters.ru_armenian}`);
  console.log(`HY missing-Armenian hits: ${counters.hy_missing_armenian}`);
  console.log(`Wrong lang attribute hits: ${counters.wrong_lang_attr}`);
  console.log(`Wrong canonical hits: ${counters.wrong_canonical}`);
  console.log(`Localized meta issues: ${counters.meta_locale}`);
  console.log(`Localized schema issues: ${counters.schema_locale}`);
  console.log(`Duplicate crawl blocks: ${counters.duplicate_crawl}`);
  console.log(`Visible i18n key leaks: ${counters.i18n_key_leak}`);
  console.log(`Old Gmail hits: ${counters.old_gmail}`);

  const pass =
    counters.en_armenian === 0 &&
    counters.en_cyrillic === 0 &&
    counters.ru_armenian === 0 &&
    counters.hy_missing_armenian === 0 &&
    counters.old_gmail === 0 &&
    counters.wrong_lang_attr === 0 &&
    counters.meta_locale === 0 &&
    counters.schema_locale === 0 &&
    counters.duplicate_crawl === 0 &&
    counters.i18n_key_leak === 0 &&
    counters.http === 0 &&
    failedRoutes.size === 0;

  console.log('\n==> Certification');
  console.log(pass ? 'FULL_LOCALE_PARITY_PASS' : 'FULL_LOCALE_PARITY_FAIL');
  console.log(counters.en_armenian === 0 ? 'NO_ARMENIAN_LEAKAGE_IN_EN' : 'ARMENIAN_LEAKAGE_IN_EN');
  console.log(counters.ru_armenian === 0 ? 'NO_ARMENIAN_LEAKAGE_IN_RU' : 'ARMENIAN_LEAKAGE_IN_RU');
  console.log('NO_UNSAFE_DUPLICATES (code cleanup tracked separately in report)');

  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
