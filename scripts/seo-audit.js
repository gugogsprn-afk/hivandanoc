#!/usr/bin/env node
/**
 * Live SEO indexing audit for healthyspinedoc.com
 * Usage: npm run seo:audit
 */
const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE = (process.env.SEO_AUDIT_BASE || 'https://healthyspinedoc.com').replace(/\/$/, '');
const FAILURES = [];
const PASSES = [];

const CORE_URLS = [
  { path: '/', label: 'Homepage' },
  { path: '/find-a-doctor', label: 'Find a Doctor' },
  { path: '/patient-care', label: 'Patient Care' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/locations', label: 'Locations' }
];

function fetchUrl(url, { method = 'GET', follow = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(
      url,
      { method, headers: { 'User-Agent': 'HealthySpine-SEO-Audit/2.0' } },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          const location = res.headers.location;
          if ([301, 302, 307, 308].includes(res.statusCode) && location && follow > 0) {
            const next = new URL(location, url).href;
            return resolve(fetchUrl(next, { method: 'GET', follow: follow - 1 }));
          }
          resolve({ status: res.statusCode, headers: res.headers, body, url });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function fetchHead(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(
      url,
      { method: 'HEAD', headers: { 'User-Agent': 'HealthySpine-SEO-Audit/2.0' } },
      (res) => {
        const location = res.headers.location;
        if ([301, 302, 307, 308].includes(res.statusCode) && location) {
          return resolve(fetchHead(new URL(location, url).href));
        }
        resolve({ status: res.statusCode, headers: res.headers, url });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function pass(msg) {
  PASSES.push(msg);
  console.log(`✓ ${msg}`);
}

function fail(msg) {
  FAILURES.push(msg);
  console.error(`✗ ${msg}`);
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function extractTag(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function extractCanonical(html) {
  return extractTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    extractTag(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
}

function extractRobots(html) {
  return extractTag(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) ||
    extractTag(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
}

function extractTitle(html) {
  return extractTag(html, /<title>([^<]*)<\/title>/i);
}

function extractDescription(html) {
  return extractTag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    extractTag(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
}

function extractH1(html) {
  return extractTag(html, /<h1[^>]*>([^<]+)<\/h1>/i);
}

function normalizeText(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function bodyFingerprint(html) {
  return normalizeText(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')).slice(0, 500);
}

async function auditRobots() {
  const res = await fetchUrl(`${BASE}/robots.txt`);
  if (res.status !== 200) return fail(`robots.txt returned ${res.status}`);
  pass('robots.txt returns 200');
  if (!/Sitemap:\s*https:\/\/healthyspinedoc\.com\/sitemap\.xml/i.test(res.body)) {
    fail('robots.txt missing sitemap directive');
  } else {
    pass('robots.txt includes sitemap URL');
  }
  if (!/Disallow:\s*\/admin-cms\//i.test(res.body)) fail('robots.txt missing Disallow /admin-cms/');
  else pass('robots.txt blocks /admin-cms/');
  if (!/Disallow:\s*\/api\//i.test(res.body)) fail('robots.txt missing Disallow /api/');
  else pass('robots.txt blocks /api/');
}

async function auditSitemap() {
  const res = await fetchUrl(`${BASE}/sitemap.xml`);
  if (res.status !== 200) return fail(`sitemap.xml returned ${res.status}`);
  pass('sitemap.xml returns 200');
  const locs = extractLocs(res.body);
  const expected = CORE_URLS.map((u) => (u.path === '/' ? `${BASE}/` : `${BASE}${u.path}`));
  if (locs.length !== expected.length) {
    fail(`sitemap should contain exactly ${expected.length} URLs (found ${locs.length})`);
  } else {
    pass(`sitemap contains exactly ${expected.length} core URLs`);
  }
  for (const loc of expected) {
    if (!locs.includes(loc)) fail(`sitemap missing required URL: ${loc}`);
    else pass(`sitemap includes ${loc}`);
  }
  const blocked = locs.filter((u) => /\/(admin-cms|admin|api)\//i.test(u) || /\.html$/i.test(u) || /login/i.test(u));
  if (blocked.length) fail(`sitemap contains blocked URLs: ${blocked.join(', ')}`);
  else pass('sitemap excludes admin/API/login/.html URLs');
}

async function auditHomepageLinks() {
  const res = await fetchUrl(`${BASE}/`);
  const required = ['/find-a-doctor', '/patient-care', '/about', '/contact', '/locations'];
  for (const p of required) {
    const hit = res.body.includes(`href="${p}"`) || res.body.includes(`href='${p}'`);
    if (!hit) fail(`homepage missing internal link to ${p}`);
    else pass(`homepage links to ${p}`);
  }
}

async function auditPage({ path, label }, homepageSnapshot) {
  const url = path === '/' ? `${BASE}/` : `${BASE}${path}`;
  const expectedCanonical = url.replace(/\/$/, path === '/' ? '/' : '');

  console.log(`\n— ${label} (${path}) —`);

  const head = await fetchHead(url);
  if (head.status !== 200) {
    fail(`${path} HTTP status ${head.status} (expected 200)`);
    return null;
  }
  pass(`${path} returns HTTP 200`);

  if (head.headers['x-robots-tag'] && /noindex/i.test(head.headers['x-robots-tag'])) {
    fail(`${path} X-Robots-Tag contains noindex`);
  } else {
    pass(`${path} X-Robots-Tag is not noindex`);
  }

  const res = await fetchUrl(url);
  const canonical = extractCanonical(res.body);
  const robots = extractRobots(res.body);
  const title = extractTitle(res.body);
  const description = extractDescription(res.body);
  const h1 = extractH1(res.body);

  const canonExpected = path === '/' ? `${BASE}/` : `${BASE}${path}`;
  if (canonical !== canonExpected) {
    fail(`${path} canonical is "${canonical || '(missing)'}" (expected ${canonExpected})`);
  } else {
    pass(`${path} canonical self-references ${canonExpected}`);
  }

  if (/noindex/i.test(robots)) fail(`${path} meta robots contains noindex: ${robots}`);
  else if (!robots || !/index/i.test(robots)) fail(`${path} meta robots missing index: "${robots || '(missing)'}"`);
  else pass(`${path} meta robots: ${robots}`);

  if (!title || title.length < 3) fail(`${path} title empty or too short`);
  else pass(`${path} title: "${title}"`);

  if (!description || description.length < 20) fail(`${path} meta description empty or too short`);
  else pass(`${path} description present (${description.length} chars)`);

  if (!h1 || h1 === '—' || h1.length < 2) fail(`${path} H1 missing or placeholder`);
  else pass(`${path} H1: "${h1}"`);

  if (path !== '/') {
    if (normalizeText(title) === normalizeText(homepageSnapshot.title)) {
      fail(`${path} title duplicates homepage`);
    } else {
      pass(`${path} title is unique vs homepage`);
    }
    if (normalizeText(h1) === normalizeText(homepageSnapshot.h1)) {
      fail(`${path} H1 duplicates homepage`);
    } else {
      pass(`${path} H1 is unique vs homepage`);
    }
    const fp = bodyFingerprint(res.body);
    const homeFp = homepageSnapshot.fingerprint;
    if (fp === homeFp) {
      fail(`${path} body content fingerprint matches homepage (duplicate content)`);
    } else {
      pass(`${path} body content differs from homepage`);
    }
    if (path === '/contact' || path === '/locations') {
      const other = path === '/contact' ? '/locations' : '/contact';
      /* checked in pairwise pass below */
    }
  }

  if (!res.body.includes('application/ld+json')) {
    fail(`${path} missing JSON-LD`);
  } else {
    pass(`${path} includes JSON-LD`);
  }

  return { path, title, h1, canonical, robots, description, fingerprint: bodyFingerprint(res.body) };
}

async function auditContactLocationsDistinct(contactSnap, locationsSnap) {
  if (!contactSnap || !locationsSnap) return;
  if (normalizeText(contactSnap.title) === normalizeText(locationsSnap.title)) {
    fail('/contact and /locations share the same title');
  } else {
    pass('/contact and /locations have distinct titles');
  }
  if (normalizeText(contactSnap.h1) === normalizeText(locationsSnap.h1)) {
    fail('/contact and /locations share the same H1');
  } else {
    pass('/contact and /locations have distinct H1');
  }
  if (contactSnap.canonical === locationsSnap.canonical) {
    fail('/contact and /locations share the same canonical');
  } else {
    pass('/contact and /locations have distinct canonicals');
  }
}

async function auditHttpsRedirect() {
  const httpRes = await new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: 'healthyspinedoc.com', port: 80, path: '/', method: 'GET' },
      (res) => resolve({ status: res.statusCode, location: res.headers.location })
    );
    req.on('error', reject);
    req.end();
  });
  if (![301, 302, 307, 308].includes(httpRes.status)) {
    fail(`HTTP homepage did not redirect (${httpRes.status})`);
  } else {
    pass('HTTP redirects to HTTPS');
  }
}

async function auditAdminBlocked() {
  const res = await fetchUrl(`${BASE}/admin-cms/`);
  if (res.headers['x-robots-tag'] && /noindex/i.test(res.headers['x-robots-tag'])) {
    pass('admin-cms has X-Robots-Tag noindex');
  } else {
    fail('admin-cms missing X-Robots-Tag noindex');
  }
}

async function main() {
  console.log(`SEO audit — ${BASE}\n`);
  await auditRobots();
  await auditSitemap();
  await auditHttpsRedirect();
  await auditAdminBlocked();
  await auditHomepageLinks();

  const snapshots = {};
  for (const page of CORE_URLS) {
    const homeSnap = snapshots['/'] || { title: '', h1: '', fingerprint: '' };
    const snap = await auditPage(page, homeSnap);
    if (snap) snapshots[page.path] = snap;
    if (page.path === '/' && snap) {
      snapshots['/'] = snap;
    }
  }

  await auditContactLocationsDistinct(snapshots['/contact'], snapshots['/locations']);

  console.log(`\n${PASSES.length} passed, ${FAILURES.length} failed`);
  if (FAILURES.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
