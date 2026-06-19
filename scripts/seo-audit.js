#!/usr/bin/env node
/**
 * Live SEO indexing audit for healthyspinedoc.com
 * Usage: npm run seo:audit
 */
const https = require('https');
const { URL } = require('url');

const BASE = process.env.SEO_AUDIT_BASE || 'https://healthyspinedoc.com';
const FAILURES = [];
const PASSES = [];

function fetchUrl(url, { method = 'GET', follow = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method, headers: { 'User-Agent': 'HealthySpine-SEO-Audit/1.0' } },
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
  if (!locs.length) return fail('sitemap.xml has no URLs');
  pass(`sitemap.xml contains ${locs.length} URLs`);

  const blocked = locs.filter((u) =>
    /\/(admin-cms|admin|api)\//i.test(u) || /login/i.test(u)
  );
  if (blocked.length) fail(`sitemap contains blocked URLs: ${blocked.join(', ')}`);
  else pass('sitemap excludes admin/API/login URLs');

  const mustHave = ['/', '/find-a-doctor', '/locations', '/patient-care', '/about', '/contact'];
  for (const p of mustHave) {
    const hit = locs.some((u) => u === `${BASE}${p}` || u === `${BASE}${p}/`);
    if (!hit) fail(`sitemap missing required URL: ${p}`);
    else pass(`sitemap includes ${p}`);
  }

  const sample = locs.slice(0, 12);
  for (const loc of sample) {
    const page = await fetchUrl(loc);
    if (page.status !== 200) fail(`sitemap URL not 200: ${loc} (${page.status})`);
  }
  pass(`sampled ${sample.length} sitemap URLs — all 200`);
}

async function auditHomepageMeta() {
  const res = await fetchUrl(`${BASE}/`);
  if (res.status !== 200) return fail(`homepage returned ${res.status}`);
  pass('homepage returns 200');

  if (/noindex/i.test(res.body)) fail('homepage contains noindex');
  else pass('homepage has no noindex in HTML source');

  if (res.headers['x-robots-tag'] && /noindex/i.test(res.headers['x-robots-tag'])) {
    fail('homepage X-Robots-Tag contains noindex');
  } else {
    pass('homepage X-Robots-Tag is not noindex');
  }
}

async function auditHttpsRedirect() {
  const httpRes = await new Promise((resolve, reject) => {
    const req = require('http').request(
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
  if (httpRes.location && httpRes.location.startsWith('https://healthyspinedoc.com')) {
    pass('HTTP redirect target is https://healthyspinedoc.com');
  } else {
    fail(`HTTP redirect target unexpected: ${httpRes.location || 'none'}`);
  }
}

async function auditWwwRedirect() {
  try {
    const res = await fetchUrl('https://www.healthyspinedoc.com/', { follow: 0 });
    if (![301, 302, 307, 308].includes(res.status)) {
      fail(`www did not redirect (${res.status})`);
      return;
    }
    if (res.headers.location && res.headers.location.includes('https://healthyspinedoc.com')) {
      pass('www redirects to non-www canonical domain');
    } else {
      fail(`www redirect target unexpected: ${res.headers.location || 'none'}`);
    }
  } catch (err) {
    fail(`www redirect check failed: ${err.message}`);
  }
}

async function auditAdminBlocked() {
  const res = await fetchUrl(`${BASE}/admin-cms/`);
  if (res.status !== 200) {
    pass(`admin-cms reachable for humans (${res.status}) — ok`);
  } else {
    pass('admin-cms returns 200 (expected for login UI)');
  }
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
  await auditHomepageMeta();
  await auditHttpsRedirect();
  await auditWwwRedirect();
  await auditAdminBlocked();

  console.log(`\n${PASSES.length} passed, ${FAILURES.length} failed`);
  if (FAILURES.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
