const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '../..');

/** Core public indexable routes (clean URLs only). */
const CORE_ROUTES = [
  { path: '/', file: 'index.html', priority: '1.0', changefreq: 'weekly' },
  { path: '/find-a-doctor', file: 'doctors.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/patient-care', file: 'departments.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', file: 'about.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', file: 'contacts.html', priority: '0.85', changefreq: 'monthly' },
  { path: '/locations', file: 'contacts.html', priority: '0.85', changefreq: 'monthly' }
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

function buildSitemapEntries() {
  const base = siteBase();
  return CORE_ROUTES.map((route) => ({
    loc: route.path === '/' ? `${base}/` : `${base}${route.path}`,
    lastmod: fileLastMod(route.file),
    changefreq: route.changefreq,
    priority: route.priority
  }));
}

function buildSitemapXml() {
  const entries = buildSitemapEntries();
  const body = entries.map((e) => urlEntry(e.loc, e)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

module.exports = {
  CORE_ROUTES,
  STATIC_ROUTES: CORE_ROUTES,
  siteBase,
  buildSitemapEntries,
  buildSitemapXml
};
