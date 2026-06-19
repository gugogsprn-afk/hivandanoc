const fs = require('fs');
const path = require('path');
const { getDb } = require('../db');
const { getSetting } = require('../db/helpers');

const SITE_ROOT = path.join(__dirname, '../..');

/** Public indexable routes (clean URLs served via nginx rewrite). */
const STATIC_ROUTES = [
  { path: '/', file: 'index.html', priority: '1.0', changefreq: 'weekly' },
  { path: '/find-a-doctor', file: 'doctors.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/locations', file: 'contacts.html', priority: '0.85', changefreq: 'monthly' },
  { path: '/contact', file: 'contacts.html', priority: '0.85', changefreq: 'monthly' },
  { path: '/patient-care', file: 'departments.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', file: 'about.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/move-better', file: 'move-better.html', priority: '0.7', changefreq: 'weekly' },
  { path: '/appointment.html', file: 'appointment.html', priority: '0.95', changefreq: 'monthly' },
  { path: '/privacy-policy.html', file: 'privacy-policy.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/cookies-policy.html', file: 'cookies-policy.html', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms.html', file: 'terms.html', priority: '0.3', changefreq: 'yearly' },
  { path: '/patient-information.html', file: 'patient-information.html', priority: '0.4', changefreq: 'yearly' }
];

const EXCLUDED_PATTERNS = [
  /^\/admin-cms\//i,
  /^\/admin\//i,
  /^\/api\//i,
  /login/i,
  /submit-story/i
];

function siteBase() {
  return (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');
}

function fileLastMod(fileName) {
  try {
    const stat = fs.statSync(path.join(SITE_ROOT, fileName));
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, { lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>'
  ]
    .filter(Boolean)
    .join('\n');
}

function getPublishedDoctors() {
  try {
    return getDb()
      .prepare('SELECT slug, updated_at FROM doctors WHERE published = 1 ORDER BY sort_order, id')
      .all();
  } catch {
    return [];
  }
}

function getPublishedServices() {
  try {
    return getDb()
      .prepare('SELECT id, updated_at FROM services WHERE published = 1 ORDER BY sort_order, id')
      .all();
  } catch {
    return [];
  }
}

function getPatientStories() {
  const extra = getSetting('content_extra', {});
  return Array.isArray(extra.patientStories) ? extra.patientStories : [];
}

function buildSitemapEntries() {
  const base = siteBase();
  const entries = [];
  const seen = new Set();

  function add(pathname, meta = {}) {
    const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
    if (EXCLUDED_PATTERNS.some((re) => re.test(p))) return;
    const loc = `${base}${p}`;
    if (seen.has(loc)) return;
    seen.add(loc);
    entries.push({ loc, ...meta });
  }

  for (const route of STATIC_ROUTES) {
    add(route.path, {
      lastmod: fileLastMod(route.file),
      changefreq: route.changefreq,
      priority: route.priority
    });
  }

  for (const story of getPatientStories()) {
    if (!story?.id) continue;
    add(`/patient-story.html?id=${encodeURIComponent(story.id)}`, {
      lastmod: fileLastMod('patient-story.html'),
      changefreq: 'monthly',
      priority: '0.6'
    });
  }

  for (const doctor of getPublishedDoctors()) {
    if (!doctor.slug) continue;
    add(`/find-a-doctor/${encodeURIComponent(doctor.slug)}`, {
      lastmod: (doctor.updated_at || '').slice(0, 10) || fileLastMod('doctors.html'),
      changefreq: 'weekly',
      priority: '0.75'
    });
  }

  for (const service of getPublishedServices()) {
    if (!service.id) continue;
    add(`/patient-care/${encodeURIComponent(service.id)}`, {
      lastmod: (service.updated_at || '').slice(0, 10) || fileLastMod('departments.html'),
      changefreq: 'monthly',
      priority: '0.7'
    });
  }

  return entries;
}

function buildSitemapXml() {
  const entries = buildSitemapEntries();
  const body = entries
    .map((e) => urlEntry(e.loc, e))
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

module.exports = {
  STATIC_ROUTES,
  EXCLUDED_PATTERNS,
  siteBase,
  buildSitemapEntries,
  buildSitemapXml
};
