#!/usr/bin/env node
/**
 * Live SEO indexing audit for healthyspinedoc.com
 * Usage: npm run seo:audit
 */
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { getLaunchedServiceSlugs } = require('../server/services/service-pages');
const { getLaunchedKnowledgeSlugs } = require('../server/services/knowledge-pages');
const { LAUNCHED_AUTHORITY_SLUGS } = require('../server/services/local-authority-pages');
const { buildSitemapEntries } = require('../server/services/sitemap');

const BASE = (process.env.SEO_AUDIT_BASE || 'https://healthyspinedoc.com').replace(/\/$/, '');
const FAILURES = [];
const PASSES = [];

const CORE_URLS = [
  { path: '/', label: 'Homepage' },
  { path: '/find-a-doctor', label: 'Find a Doctor' },
  { path: '/services', label: 'Services Hub' },
  { path: '/conditions', label: 'Conditions Hub' },
  { path: '/patient-care', label: 'Patient Care' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/locations', label: 'Locations' },
  { path: '/knowledge', label: 'Knowledge Hub' },
  { path: '/consultation-process', label: 'Consultation Process' },
  { path: '/appointment', label: 'Appointment' },
  { path: '/reviews', label: 'Reviews' },
  { path: '/move-better', label: 'Move Better' },
  { path: '/submit-story', label: 'Submit Story' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms' },
  { path: '/cookies-policy', label: 'Cookies Policy' },
  { path: '/patient-information', label: 'Patient Information' }
];

const LAUNCHED_SERVICE_URLS = getLaunchedServiceSlugs().map((slug) => ({
  path: `/services/${slug}`,
  label: slug.replace(/-/g, ' ')
}));

const { getLaunchedConditionSlugs } = require('../server/services/condition-pages');

const LAUNCHED_CONDITION_URLS = getLaunchedConditionSlugs().map((slug) => ({
  path: `/conditions/${slug}`,
  label: slug.replace(/-/g, ' ')
}));

const LAUNCHED_KNOWLEDGE_URLS = getLaunchedKnowledgeSlugs().map((slug) => ({
  path: `/knowledge/${slug}`,
  label: slug.replace(/-/g, ' ')
}));

const LAUNCHED_AUTHORITY_URLS = LAUNCHED_AUTHORITY_SLUGS.map((routePath) => ({
  path: routePath,
  label: routePath.replace(/^\//, '').replace(/-/g, ' ')
}));

/** Pages audited for 200/canonical/metadata (includes /conditions hub). */
const ALL_INDEXABLE_URLS = [
  ...CORE_URLS,
  ...LAUNCHED_SERVICE_URLS,
  ...LAUNCHED_CONDITION_URLS,
  ...LAUNCHED_KNOWLEDGE_URLS,
  ...LAUNCHED_AUTHORITY_URLS
];

/** URLs expected in sitemap.xml (/conditions hub excluded per P3.3G). */
const SITEMAP_URLS = [
  ...CORE_URLS.filter((u) => u.path !== '/conditions'),
  ...LAUNCHED_SERVICE_URLS,
  ...LAUNCHED_CONDITION_URLS,
  ...LAUNCHED_KNOWLEDGE_URLS,
  ...LAUNCHED_AUTHORITY_URLS
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
  const expected = buildSitemapEntries().map((e) => e.loc);
  if (locs.length !== expected.length) {
    fail(`sitemap should contain exactly ${expected.length} URLs (found ${locs.length})`);
  } else {
    pass(`sitemap contains exactly ${expected.length} indexable URLs`);
  }
  for (const loc of expected) {
    if (!locs.includes(loc)) fail(`sitemap missing required URL: ${loc}`);
    else pass(`sitemap includes ${loc}`);
  }
  const blocked = locs.filter((u) => /\/(admin-cms|admin|api)\//i.test(u) || /\.html$/i.test(u) || /login/i.test(u));
  if (blocked.length) fail(`sitemap contains blocked URLs: ${blocked.join(', ')}`);
  else pass('sitemap excludes admin/API/login/.html URLs');
  const unlaunched = locs.filter((u) => /\/services\//.test(u) && !LAUNCHED_SERVICE_URLS.some((s) => u.endsWith(s.path)));
  if (unlaunched.length) fail(`sitemap contains unlaunched service URLs: ${unlaunched.join(', ')}`);
  else pass('sitemap includes only launched service pages');
  const unlaunchedConditions = locs.filter(
    (u) => /\/conditions\//.test(u) && !LAUNCHED_CONDITION_URLS.some((s) => u.endsWith(s.path))
  );
  if (unlaunchedConditions.length) fail(`sitemap contains unlaunched condition URLs: ${unlaunchedConditions.join(', ')}`);
  else pass('sitemap includes only launched condition pages');
  if (locs.includes(`${BASE}/conditions`)) fail('sitemap must not include /conditions hub (only launched condition pages)');
  else pass('sitemap excludes /conditions hub');
  const unlaunchedKnowledge = locs.filter(
    (u) => /\/knowledge\//.test(u) && !LAUNCHED_KNOWLEDGE_URLS.some((s) => u.endsWith(s.path))
  );
  if (unlaunchedKnowledge.length) fail(`sitemap contains unlaunched knowledge URLs: ${unlaunchedKnowledge.join(', ')}`);
  else pass('sitemap includes only launched knowledge articles');
  if (!locs.includes(`${BASE}/knowledge`)) fail('sitemap missing /knowledge hub');
  else pass('sitemap includes /knowledge hub');
}

async function auditHomepageLinks() {
  const res = await fetchUrl(`${BASE}/`);
  const required = ['/find-a-doctor', '/services', '/conditions', '/knowledge', '/patient-care', '/about', '/contact', '/locations', '/consultation-process'];
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

  if (path.startsWith('/services/')) {
    if (/"@type"\s*:\s*"Physician"/i.test(res.body)) {
      fail(`${path} contains Physician schema (not allowed on service pages)`);
    } else {
      pass(`${path} has no Physician schema`);
    }
    if (!/"@type"\s*:\s*"MedicalWebPage"/i.test(res.body)) {
      fail(`${path} missing MedicalWebPage schema`);
    } else {
      pass(`${path} includes MedicalWebPage schema`);
    }
  }

  if (path === '/services') {
    if (!/"@type"\s*:\s*"WebPage"/i.test(res.body)) {
      fail(`${path} missing WebPage schema`);
    } else {
      pass(`${path} includes WebPage schema`);
    }
  }

  if (path.startsWith('/conditions/')) {
    if (/"@type"\s*:\s*"Physician"/i.test(res.body)) {
      fail(`${path} contains Physician schema (not allowed on condition pages)`);
    } else {
      pass(`${path} has no Physician schema`);
    }
    if (!/"@type"\s*:\s*"MedicalWebPage"/i.test(res.body)) {
      fail(`${path} missing MedicalWebPage schema`);
    } else {
      pass(`${path} includes MedicalWebPage schema`);
    }
    if (res.body.includes('AggregateRating') || res.body.includes('"Review"')) {
      fail(`${path} contains Review/Rating schema`);
    } else {
      pass(`${path} has no Review/Rating schema`);
    }
  }

  if (path === '/conditions') {
    if (!/"@type"\s*:\s*"WebPage"/i.test(res.body)) {
      fail(`${path} missing WebPage schema`);
    } else {
      pass(`${path} includes WebPage schema`);
    }
  }

  if (path === '/find-a-doctor') {
    if (/"@type"\s*:\s*"Physician"/i.test(res.body)) {
      fail(`${path} contains Physician schema (template doctors — not allowed)`);
    } else {
      pass(`${path} has no Physician schema`);
    }
    if (!/"@type"\s*:\s*"WebPage"/i.test(res.body)) {
      fail(`${path} missing WebPage schema`);
    } else {
      pass(`${path} includes WebPage schema`);
    }
  }

  if (path.startsWith('/knowledge/')) {
    if (/"@type"\s*:\s*"Physician"/i.test(res.body)) {
      fail(`${path} contains Physician schema (not allowed on knowledge pages)`);
    } else {
      pass(`${path} has no Physician schema`);
    }
    if (res.body.includes('AggregateRating') || /"@type"\s*:\s*"Review"/i.test(res.body)) {
      fail(`${path} contains Review/Rating schema`);
    } else {
      pass(`${path} has no Review/Rating schema`);
    }
    if (!/"@type"\s*:\s*"MedicalWebPage"/i.test(res.body)) {
      fail(`${path} missing MedicalWebPage schema`);
    } else {
      pass(`${path} includes MedicalWebPage schema`);
    }
    if (!/"@type"\s*:\s*"FAQPage"/i.test(res.body)) {
      fail(`${path} missing FAQPage schema`);
    } else {
      pass(`${path} includes FAQPage schema`);
    }
  }

  if (path === '/knowledge') {
    if (/"@type"\s*:\s*"Physician"/i.test(res.body)) {
      fail(`${path} contains Physician schema (not allowed on knowledge hub)`);
    } else {
      pass(`${path} has no Physician schema`);
    }
    if (!/"@type"\s*:\s*"WebPage"/i.test(res.body)) {
      fail(`${path} missing WebPage schema`);
    } else {
      pass(`${path} includes WebPage schema`);
    }
  }


  if (path === '/consultation-process') {
    if (!/"@type"\s*:\s*"WebPage"/i.test(res.body)) {
      fail(`${path} missing WebPage schema`);
    } else {
      pass(`${path} includes WebPage schema`);
    }
    if (/"@type"\s*:\s*"Physician"/i.test(res.body)) {
      fail(`${path} contains Physician schema`);
    } else {
      pass(`${path} has no Physician schema`);
    }
  }
  auditEntitySchemaFields(path, res.body);

  return { path, title, h1, canonical, robots, description, fingerprint: bodyFingerprint(res.body) };
}

const ENTITY_SCHEMA_PAGES = ['/', '/contact', '/locations', '/find-a-doctor', '/services/manual-therapy'];

function visibleBodyWithoutJsonLd(html) {
  return String(html).replace(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    ''
  );
}

function auditEntitySchemaFields(path, body) {
  if (!ENTITY_SCHEMA_PAGES.includes(path)) return;

  if (!/"@type"\s*:\s*"GeoCoordinates"/i.test(body)) {
    fail(`${path} JSON-LD missing GeoCoordinates`);
  } else {
    pass(`${path} JSON-LD includes GeoCoordinates`);
  }

  if (!/"sameAs"\s*:/i.test(body)) {
    fail(`${path} JSON-LD missing sameAs`);
  } else {
    pass(`${path} JSON-LD includes sameAs`);
  }

  if (!/"openingHoursSpecification"/i.test(body)) {
    fail(`${path} JSON-LD missing openingHoursSpecification`);
  } else {
    pass(`${path} JSON-LD includes openingHoursSpecification`);
  }

  if (!/"logo"\s*:/i.test(body)) {
    fail(`${path} JSON-LD missing logo`);
  } else {
    pass(`${path} JSON-LD includes logo`);
  }

  if (/tel:\+37410000000/i.test(body)) {
    fail(`${path} contains placeholder phone tel:+37410000000`);
  } else {
    pass(`${path} has no placeholder phone`);
  }

  const visible = visibleBodyWithoutJsonLd(body);
  if (/info@healthyspine\.am/i.test(visible)) {
    fail(`${path} contains placeholder email info@healthyspine.am`);
  } else {
    pass(`${path} has no placeholder email`);
  }
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

async function auditPatientCareRedirect() {
  const slug = 'manual-therapy';
  const res = await new Promise((resolve, reject) => {
    const lib = BASE.startsWith('https') ? https : http;
    const req = lib.request(
      `${BASE}/patient-care/${slug}`,
      { method: 'GET', headers: { 'User-Agent': 'HealthySpine-SEO-Audit/2.0' } },
      (res) => resolve({ status: res.statusCode, location: res.headers.location })
    );
    req.on('error', reject);
    req.end();
  });
  if (res.status !== 301) {
    fail(`/patient-care/${slug} should return 301 (got ${res.status})`);
  } else {
    pass(`/patient-care/${slug} returns 301 redirect`);
  }
  const expected = `${BASE}/services/${slug}`;
  if (res.location !== expected) {
    fail(`/patient-care/${slug} redirects to "${res.location}" (expected ${expected})`);
  } else {
    pass(`/patient-care/${slug} redirects to ${expected}`);
  }
}

async function auditPatientCareLinksToServices() {
  const res = await fetchUrl(`${BASE}/patient-care`);
  if (!res.body.includes('href="/services"')) {
    fail('/patient-care missing link to /services');
  } else {
    pass('/patient-care links to /services');
  }
}

async function auditServicesHubLinks() {
  const res = await fetchUrl(`${BASE}/services`);
  for (const s of LAUNCHED_SERVICE_URLS) {
    if (!res.body.includes(`href="${s.path}"`)) {
      fail(`/services missing link to ${s.path}`);
    } else {
      pass(`/services links to ${s.path}`);
    }
  }
  if (!res.body.includes('href="/conditions"')) {
    fail('/services missing link to /conditions');
  } else {
    pass('/services links to /conditions');
  }
}

async function auditServiceDuplicateMetadata(snapshots) {
  const serviceSnaps = LAUNCHED_SERVICE_URLS.map((u) => snapshots[u.path]).filter(Boolean);
  const titles = serviceSnaps.map((s) => normalizeText(s.title));
  const h1s = serviceSnaps.map((s) => normalizeText(s.h1));
  const dupTitle = titles.find((t, i) => titles.indexOf(t) !== i);
  const dupH1 = h1s.find((h, i) => h1s.indexOf(h) !== i);
  if (dupTitle) fail(`duplicate service page title detected: "${dupTitle}"`);
  else pass('all launched service titles are unique');
  if (dupH1) fail(`duplicate service page H1 detected: "${dupH1}"`);
  else pass('all launched service H1s are unique');
}

async function auditOrphanServicePages() {
  for (const s of LAUNCHED_SERVICE_URLS) {
    const res = await fetchUrl(`${BASE}${s.path}`);
    const hasHubLink = res.body.includes('href="/services"');
    const hasContact = res.body.includes('href="/contact"');
    if (!hasHubLink) fail(`${s.path} missing link back to /services hub`);
    else pass(`${s.path} links to /services hub`);
    if (!hasContact) fail(`${s.path} missing link to /contact`);
    else pass(`${s.path} links to /contact`);
  }
}
async function auditConditionServiceLinks() {
  const back = await fetchUrl(`${BASE}/conditions/back-pain-treatment`);
  for (const p of ['/services/manual-therapy', '/services/physiotherapy', '/services/hernia-treatment', '/services/osteopathy']) {
    if (!back.body.includes(`href="${p}"`)) fail(`/conditions/back-pain-treatment missing link to ${p}`);
    else pass(`/conditions/back-pain-treatment links to ${p}`);
  }
  for (const p of ['/contact', '/locations']) {
    if (!back.body.includes(`href="${p}"`)) fail(`/conditions/back-pain-treatment missing link to ${p}`);
    else pass(`/conditions/back-pain-treatment links to ${p}`);
  }
  if (back.body.includes('appointment.html')) fail('/conditions/back-pain-treatment contains deprecated appointment.html link');
  else pass('/conditions/back-pain-treatment has no appointment.html link');

  const neck = await fetchUrl(`${BASE}/conditions/neck-pain-treatment`);
  for (const p of ['/services/manual-therapy', '/services/physiotherapy', '/services/osteopathy']) {
    if (!neck.body.includes(`href="${p}"`)) fail(`/conditions/neck-pain-treatment missing link to ${p}`);
    else pass(`/conditions/neck-pain-treatment links to ${p}`);
  }
  for (const p of ['/contact', '/locations']) {
    if (!neck.body.includes(`href="${p}"`)) fail(`/conditions/neck-pain-treatment missing link to ${p}`);
    else pass(`/conditions/neck-pain-treatment links to ${p}`);
  }
  if (neck.body.includes('appointment.html')) fail('/conditions/neck-pain-treatment contains deprecated appointment.html link');
  else pass('/conditions/neck-pain-treatment has no appointment.html link');
}

async function auditKnowledgeHubLinks() {
  const res = await fetchUrl(`${BASE}/knowledge`);
  for (const k of LAUNCHED_KNOWLEDGE_URLS) {
    if (!res.body.includes(`href="${k.path}"`)) fail(`/knowledge missing link to ${k.path}`);
    else pass(`/knowledge links to ${k.path}`);
  }
  if (!res.body.includes('href="/services"')) fail('/knowledge missing link to /services');
  else pass('/knowledge links to /services');
}

async function auditOrphanKnowledgePages() {
  for (const k of LAUNCHED_KNOWLEDGE_URLS) {
    const res = await fetchUrl(`${BASE}${k.path}`);
    if (!res.body.includes('href="/knowledge"')) fail(`${k.path} missing link back to /knowledge hub`);
    else pass(`${k.path} links to /knowledge hub`);
    if (!res.body.includes('href="/contact"')) fail(`${k.path} missing link to /contact`);
    else pass(`${k.path} links to /contact`);
  }
}

async function auditKnowledgeCrossLinks() {
  const back = await fetchUrl(`${BASE}/conditions/back-pain-treatment`);
  if (!back.body.includes('href="/knowledge/back-pain-causes"')) {
    fail('/conditions/back-pain-treatment missing link to /knowledge/back-pain-causes');
  } else {
    pass('/conditions/back-pain-treatment links to knowledge article');
  }
  const manual = await fetchUrl(`${BASE}/services/manual-therapy`);
  if (!manual.body.includes('href="/knowledge/')) {
    fail('/services/manual-therapy missing link to knowledge article');
  } else {
    pass('/services/manual-therapy links to knowledge article');
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
  await auditPatientCareRedirect();
  await auditPatientCareLinksToServices();
  await auditServicesHubLinks();
  await auditKnowledgeHubLinks();
  await auditConditionServiceLinks();
  await auditKnowledgeCrossLinks();
  await auditOrphanServicePages();
  await auditOrphanKnowledgePages();
  await auditAdminBlocked();
  await auditHomepageLinks();

  const snapshots = {};
  for (const page of ALL_INDEXABLE_URLS) {
    const homeSnap = snapshots['/'] || { title: '', h1: '', fingerprint: '' };
    const snap = await auditPage(page, homeSnap);
    if (snap) snapshots[page.path] = snap;
    if (page.path === '/' && snap) {
      snapshots['/'] = snap;
    }
  }

  await auditContactLocationsDistinct(snapshots['/contact'], snapshots['/locations']);
  await auditServiceDuplicateMetadata(snapshots);

  console.log(`\n${PASSES.length} passed, ${FAILURES.length} failed`);
  if (FAILURES.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
