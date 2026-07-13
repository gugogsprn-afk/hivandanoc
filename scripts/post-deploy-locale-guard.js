#!/usr/bin/env node
/**
 * Lightweight post-deploy locale smoke test (no Playwright).
 * Usage: node scripts/post-deploy-locale-guard.js [BASE_URL]
 */
const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE = (process.argv[2] || 'https://healthyspinedoc.com').replace(/\/$/, '');
const LANGS = ['hy', 'ru', 'en'];
const ROUTES = [
  '/',
  '/services',
  '/conditions',
  '/knowledge',
  '/find-a-doctor',
  '/locations',
  '/about',
  '/appointment',
  '/reviews',
  '/move-better',
  '/submit-story',
  '/privacy-policy',
  '/terms',
  '/cookies-policy',
  '/patient-information',
  '/patient-story',
  '/doctors/doc-1'
];

const ARMENIAN_RE = /[\u0531-\u0587]{2,}/g;
const ALLOWLIST = ['HY', 'RU', 'EN', 'Առողջ ողնաշար'];

function fetchFollow(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) return reject(new Error('too many redirects'));
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      { headers: { 'User-Agent': 'HealthySpine-PostDeploy-Locale-Guard/1.0' } },
      (res) => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return resolve(fetchFollow(next, redirects + 1));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status,
            html: Buffer.concat(chunks).toString('utf8'),
            finalUrl: url
          })
        );
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

function routeUrl(route, lang) {
  if (lang === 'hy') return `${BASE}${route}`;
  const sep = route.includes('?') ? '&' : '?';
  return `${BASE}${route}${sep}lang=${lang}`;
}

function htmlLang(html) {
  const m = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function extractCrawlText(html) {
  const crawl = html.match(/<(?:section|article)[^>]*id="seo-crawl-content"[^>]*>([\s\S]*?)<\/(?:section|article)>/i);
  if (crawl) return stripTags(crawl[1]);
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return stripTags(main[1]);
  return stripTags(html);
}

function stripTags(fragment) {
  return String(fragment || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function armenianLeaks(text) {
  const hits = [];
  for (const m of text.match(ARMENIAN_RE) || []) {
    if (ALLOWLIST.some((frag) => m.includes(frag) || frag.includes(m))) continue;
    if (/^(HY|RU|EN)$/.test(m)) continue;
    hits.push(m.slice(0, 80));
  }
  return [...new Set(hits)];
}

async function checkRoute(route, lang) {
  const url = routeUrl(route, lang);
  try {
    const { status, html } = await fetchFollow(url);
    if (status !== 200) {
      return { ok: false, detail: `HTTP ${status}` };
    }
    const langAttr = htmlLang(html);
    if (langAttr !== lang) {
      return { ok: false, detail: `html lang="${langAttr || 'missing'}" expected "${lang}"` };
    }
    if (lang === 'ru' || lang === 'en') {
      const leaks = armenianLeaks(extractCrawlText(html));
      if (leaks.length) {
        return { ok: false, detail: `Armenian leak: ${leaks.slice(0, 2).join(', ')}` };
      }
    }
    return { ok: true, detail: 'OK' };
  } catch (err) {
    return { ok: false, detail: err.message || String(err) };
  }
}

async function checkDuplicateLang() {
  const url = `${BASE}/?lang=ru&lang=ru`;
  try {
    const { status, html, finalUrl } = await fetchFollow(url);
    if (status !== 200) {
      return { ok: false, detail: `HTTP ${status}` };
    }
    const parsed = new URL(finalUrl);
    const langs = parsed.searchParams.getAll('lang').map((v) => v.trim().toLowerCase());
    if (langs.length !== 1 || langs[0] !== 'ru') {
      return { ok: false, detail: `lang params: [${langs.join(', ')}]` };
    }
    const langAttr = htmlLang(html);
    if (langAttr !== 'ru') {
      return { ok: false, detail: `html lang="${langAttr || 'missing'}" expected "ru"` };
    }
    const leaks = armenianLeaks(extractCrawlText(html));
    if (leaks.length) {
      return { ok: false, detail: `Armenian leak: ${leaks.slice(0, 2).join(', ')}` };
    }
    return { ok: true, detail: 'OK' };
  } catch (err) {
    return { ok: false, detail: err.message || String(err) };
  }
}

function pad(str, len) {
  const s = String(str);
  return s.length >= len ? s.slice(0, len - 1) + '…' : s + ' '.repeat(len - s.length);
}

async function main() {
  const rows = [];
  let failures = 0;

  for (const route of ROUTES) {
    for (const lang of LANGS) {
      const result = await checkRoute(route, lang);
      rows.push({ route, lang, ...result });
      if (!result.ok) failures += 1;
    }
  }

  const dup = await checkDuplicateLang();
  rows.push({ route: '/?lang=ru&lang=ru', lang: 'ru', ...dup });
  if (!dup.ok) failures += 1;

  console.log(`Post-deploy locale guard — ${BASE}\n`);
  console.log(`${pad('Route', 28)} ${pad('Lang', 6)} ${pad('Status', 6)} Detail`);
  console.log('-'.repeat(72));
  for (const row of rows) {
    const status = row.ok ? 'PASS' : 'FAIL';
    console.log(`${pad(row.route, 28)} ${pad(row.lang, 6)} ${pad(status, 6)} ${row.detail}`);
  }
  console.log('-'.repeat(72));
  console.log(failures ? `FAILED (${failures} check(s))` : 'ALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
