#!/usr/bin/env node
/**
 * Internal URL graph audit — crawls live site, checks links/locale/canonical/sitemap parity.
 * Usage: node scripts/url-audit.js [BASE_URL]
 */
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { ROUTES } = require('../server/services/seo-pages');
const { getLaunchedServiceSlugs } = require('../server/services/service-pages');
const { getLaunchedConditionSlugs } = require('../server/services/condition-pages');
const { getLaunchedKnowledgeSlugs } = require('../server/services/knowledge-pages');
const { LAUNCHED_AUTHORITY_SLUGS } = require('../server/services/local-authority-pages');
const { buildPublicContent } = require('../server/db/helpers');
const { buildSitemapEntries } = require('../server/services/sitemap');

const BASE = (process.argv[2] || 'https://healthyspinedoc.com').replace(/\/$/, '');
const LANGS = ['hy', 'ru', 'en'];
const MAX_PAGES = 220;
const LEGACY_HTML = /\.html(?:[?#]|$)/i;

const CRITICAL = [];
const HIGH = [];
const MEDIUM = [];
const LOW = [];

function add(severity, row) {
  const bucket =
    severity === 'critical' ? CRITICAL : severity === 'high' ? HIGH : severity === 'medium' ? MEDIUM : LOW;
  bucket.push(row);
}

function fetchFollow(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 10) return reject(new Error('too many redirects'));
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(
      url,
      { headers: { 'User-Agent': 'HealthySpine-URL-Audit/1.0' }, method: 'GET' },
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
            finalUrl: url,
            redirected: redirects > 0
          })
        );
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

function fetchHead(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(
      url,
      { headers: { 'User-Agent': 'HealthySpine-URL-Audit/1.0' }, method: 'HEAD' },
      (res) => {
        res.resume();
        resolve({ status: res.statusCode || 0, location: res.headers.location || '' });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

function buildRouteInventory() {
  const routes = Object.keys(ROUTES).map((path) => ({
    path,
    source: 'server/services/seo-pages.js',
    type: 'SSR',
    index: path === '/patient-story' ? 'noindex-shell' : 'index'
  }));

  for (const path of ['/services', '/conditions', '/knowledge']) {
    routes.push({ path, source: 'server/routes/seo-pages.js', type: 'SSR hub', index: 'index' });
  }
  for (const slug of getLaunchedServiceSlugs()) {
    routes.push({ path: `/services/${slug}`, source: 'service-pages', type: 'SSR', index: 'index' });
  }
  for (const slug of getLaunchedConditionSlugs()) {
    routes.push({ path: `/conditions/${slug}`, source: 'condition-pages', type: 'SSR', index: 'index' });
  }
  for (const slug of getLaunchedKnowledgeSlugs()) {
    routes.push({ path: `/knowledge/${slug}`, source: 'knowledge-pages', type: 'SSR', index: 'index' });
  }
  for (const path of LAUNCHED_AUTHORITY_SLUGS) {
    routes.push({ path, source: 'local-authority-pages', type: 'SSR', index: 'index' });
  }
  try {
    for (const d of buildPublicContent('hy').doctors || []) {
      const slug = d.slug || d.id;
      if (slug) routes.push({ path: `/doctors/${slug}`, source: 'doctor-pages', type: 'SSR', index: 'index' });
    }
  } catch {
    /* cms optional */
  }
  return routes;
}

function withLang(path, lang) {
  if (lang === 'hy') return path;
  const u = new URL(path, BASE);
  u.searchParams.set('lang', lang);
  return u.pathname + u.search;
}

function extractLinks(html, pageUrl) {
  const links = [];
  const re = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    links.push({ href: m[1], pageUrl });
  }
  return links;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function htmlLang(html) {
  const m = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function classifyHref(href) {
  if (!href || href === '#') return 'empty';
  if (/^javascript:/i.test(href)) return 'javascript';
  if (/^(mailto:|tel:)/i.test(href)) return 'special';
  if (/^https?:\/\//i.test(href)) return 'external';
  return 'internal';
}

function resolveInternal(href, fromUrl) {
  try {
    const u = new URL(href, fromUrl);
    if (u.origin !== new URL(BASE).origin) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

function duplicateLangParams(search) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return params.getAll('lang').length > 1;
}

async function auditInventoryStatuses(inventory) {
  const seen = new Set();
  for (const route of inventory) {
    if (seen.has(route.path)) continue;
    seen.add(route.path);
    try {
      const res = await fetchFollow(`${BASE}${route.path}`);
      route.status = res.status;
      route.redirected = res.redirected;
    } catch (err) {
      route.status = 0;
      route.error = err.message;
      add('critical', {
        source: route.path,
        bad: route.path,
        expected: 'HTTP 200',
        severity: 'critical',
        file: route.source,
        fix: err.message
      });
    }
  }
}

async function crawlLocale(lang) {
  const queue = [`${BASE}${withLang('/', lang)}`];
  const visited = new Set();
  const pageResults = [];

  while (queue.length && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    let res;
    try {
      res = await fetchFollow(url);
    } catch (err) {
      add('critical', {
        source: url,
        bad: url,
        expected: 'fetch ok',
        severity: 'critical',
        file: 'crawl',
        fix: err.message
      });
      continue;
    }

    if (res.status >= 400) {
      add('critical', {
        source: url,
        bad: url,
        expected: 'HTTP 200/301',
        severity: 'critical',
        file: 'crawl',
        fix: `HTTP ${res.status}`
      });
      continue;
    }

    pageResults.push({ url: res.finalUrl, status: res.status, lang });

    const expectedLang = lang;
    const gotLang = htmlLang(res.html);
    if (gotLang && gotLang !== expectedLang && lang !== 'hy') {
      add('high', {
        source: res.finalUrl,
        bad: `html lang="${gotLang}"`,
        expected: `html lang="${expectedLang}"`,
        severity: 'high',
        file: 'SSR shell',
        fix: 'normalizeLang on route'
      });
    }

    const canon = extractCanonical(res.html);
    if (canon && LEGACY_HTML.test(canon)) {
      add('high', {
        source: res.finalUrl,
        bad: canon,
        expected: 'clean canonical without .html',
        severity: 'high',
        file: 'head/canonical',
        fix: 'update canonical to clean route'
      });
    }

    const parsed = new URL(res.finalUrl);
    if (duplicateLangParams(parsed.search)) {
      add('medium', {
        source: res.finalUrl,
        bad: parsed.search,
        expected: 'single lang param',
        severity: 'medium',
        file: 'locale-redirect',
        fix: 'canonicalize duplicate ?lang='
      });
    }

    for (const { href } of extractLinks(res.html, res.finalUrl)) {
      const kind = classifyHref(href);
      if (kind === 'empty' || kind === 'javascript') {
        if (href === '#') continue;
        add('medium', {
          source: res.finalUrl,
          bad: href || '(empty)',
          expected: 'real internal route',
          severity: 'medium',
          file: 'anchor',
          fix: 'wire CTA href'
        });
        continue;
      }
      if (kind !== 'internal') continue;

      const internal = resolveInternal(href, res.finalUrl);
      if (!internal) continue;

      if (LEGACY_HTML.test(internal)) {
        add('high', {
          source: res.finalUrl,
          bad: href,
          expected: internal.replace(LEGACY_HTML, (m) => m.replace('.html', '')),
          severity: 'high',
          file: 'internal link',
          fix: 'use clean route + routeHref'
        });
      }

      if ((lang === 'ru' || lang === 'en') && !internal.includes('lang=') && !internal.startsWith('#') && !internal.startsWith('tel:')) {
        const pathOnly = internal.split('#')[0].split('?')[0];
        if (pathOnly && pathOnly !== '/') {
          add('medium', {
            source: res.finalUrl,
            bad: href,
            expected: `${pathOnly}?lang=${lang}`,
            severity: 'medium',
            file: 'client SSR/nav',
            fix: 'LocalePolicy.withLang / injectLocaleIntoLinks'
          });
        }
      }

      const next = new URL(internal.split('#')[0], BASE);
      if ((lang === 'ru' || lang === 'en') && !next.searchParams.has('lang')) {
        next.searchParams.set('lang', lang);
      }
      const nextUrl = next.href;
      if (!visited.has(nextUrl) && !queue.includes(nextUrl)) queue.push(nextUrl);
    }
  }

  return { lang, pages: visited.size };
}

async function auditLegacyRedirects() {
  const legacy = [
    '/services.html',
    '/conditions.html',
    '/knowledge.html',
    '/appointment.html',
    '/reviews.html',
    '/submit-story.html',
    '/patient-story.html',
    '/privacy-policy.html'
  ];
  for (const path of legacy) {
    try {
      const head = await fetchHead(`${BASE}${path}`);
      if (head.status !== 301 && head.status !== 308) {
        add('high', {
          source: path,
          bad: `HTTP ${head.status}`,
          expected: '301 to clean URL',
          severity: 'high',
          file: 'nginx',
          fix: 'add return 301 redirect'
        });
      }
    } catch (err) {
      add('high', { source: path, bad: path, expected: '301', severity: 'high', file: 'nginx', fix: err.message });
    }
  }
}

async function auditSitemapParity(inventory) {
  let sitemapLocs = [];
  try {
    const res = await fetchFollow(`${BASE}/sitemap.xml`);
    sitemapLocs = [...res.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch (err) {
    add('critical', {
      source: '/sitemap.xml',
      bad: 'unreadable',
      expected: '200 XML',
      severity: 'critical',
      file: 'sitemap',
      fix: err.message
    });
    return;
  }

  const inventoryPaths = new Set(inventory.filter((r) => r.index === 'index').map((r) => r.path));
  const sitemapPaths = new Set(
    sitemapLocs.map((loc) => {
      try {
        const u = new URL(loc);
        return u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '') || '/';
      } catch {
        return loc;
      }
    })
  );

  for (const loc of sitemapLocs) {
    if (LEGACY_HTML.test(loc)) {
      add('high', {
        source: 'sitemap.xml',
        bad: loc,
        expected: 'clean URL',
        severity: 'high',
        file: 'sitemap.js',
        fix: 'remove .html from sitemap'
      });
    }
  }

  for (const path of inventoryPaths) {
    if (path === '/conditions' || path === '/patient-story') continue;
    if (!sitemapPaths.has(path)) {
      add('medium', {
        source: 'route inventory',
        bad: path,
        expected: 'listed in sitemap.xml',
        severity: 'medium',
        file: 'server/services/sitemap.js',
        fix: 'add CORE_ROUTES entry'
      });
    }
  }

  const expectedEntries = buildSitemapEntries().map((e) => e.loc);
  if (sitemapLocs.length !== expectedEntries.length) {
    add('medium', {
      source: 'sitemap.xml',
      bad: `${sitemapLocs.length} URLs`,
      expected: `${expectedEntries.length} URLs`,
      severity: 'medium',
      file: 'sitemap.js',
      fix: 'sync sitemap builder with live'
    });
  }
}

function printTable(title, rows) {
  console.log(`\n== ${title} (${rows.length}) ==`);
  if (!rows.length) {
    console.log('  (none)');
    return;
  }
  for (const r of rows.slice(0, 40)) {
    console.log(`  [${r.severity}] ${r.source}`);
    console.log(`    bad: ${r.bad}`);
    console.log(`    expected: ${r.expected}`);
    console.log(`    file: ${r.file} | fix: ${r.fix}`);
  }
  if (rows.length > 40) console.log(`  ... +${rows.length - 40} more`);
}

async function main() {
  if (!process.env.CMS_DATA_DIR && fs.existsSync('/var/lib/hivandanoc-cms/cms.db')) {
    process.env.CMS_DATA_DIR = '/var/lib/hivandanoc-cms';
  }

  const inventory = buildRouteInventory();
  console.log(`URL audit — ${BASE}`);
  console.log(`Route inventory: ${inventory.length} routes`);

  await auditInventoryStatuses(inventory);
  await auditLegacyRedirects();
  await auditSitemapParity(inventory);

  const crawlStats = [];
  for (const lang of LANGS) {
    crawlStats.push(await crawlLocale(lang));
  }

  console.log('\nRoute inventory sample:');
  for (const r of inventory.slice(0, 15)) {
    console.log(`  ${r.path.padEnd(28)} ${String(r.status || '?').padEnd(4)} ${r.type}`);
  }
  console.log(`  ... (${inventory.length} total)`);

  console.log('\nCrawl stats:');
  for (const s of crawlStats) console.log(`  ${s.lang}: ${s.pages} pages`);

  printTable('Critical', CRITICAL);
  printTable('High', HIGH);
  printTable('Medium', MEDIUM);
  printTable('Low', LOW);

  console.log('\nSeverity summary:');
  console.log(
    `  Critical: ${CRITICAL.length} | High: ${HIGH.length} | Medium: ${MEDIUM.length} | Low: ${LOW.length}`
  );

  const exitCode = CRITICAL.length || HIGH.length ? 1 : 0;
  console.log(exitCode ? '\nURL AUDIT FAILED' : '\nURL AUDIT PASSED');
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
