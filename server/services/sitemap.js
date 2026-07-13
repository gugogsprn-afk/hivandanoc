const fs = require('fs');
const path = require('path');
const { getLaunchedServiceSlugs } = require('./service-pages');
const { getLaunchedConditionSlugs } = require('./condition-pages');
const { getLaunchedKnowledgeSlugs } = require('./knowledge-pages');
const { LAUNCHED_AUTHORITY_SLUGS } = require('./local-authority-pages');
const { buildPublicContent } = require('../db/helpers');

const SITE_ROOT = path.join(__dirname, '../..');

/** Core public indexable routes (clean URLs only). */
const CORE_ROUTES = [
  { path: '/', file: 'index.html', priority: '1.0', changefreq: 'weekly' },
  { path: '/find-a-doctor', file: 'doctors.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/services', file: 'services.html', priority: '0.95', changefreq: 'weekly' },
  { path: '/patient-care', file: 'departments.html', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', file: 'about.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', file: 'contacts.html', priority: '0.85', changefreq: 'monthly' },
  { path: '/locations', file: 'contacts.html', priority: '0.85', changefreq: 'monthly' },
  { path: '/knowledge', file: 'knowledge.html', priority: '0.92', changefreq: 'weekly' },
  { path: '/consultation-process', file: 'consultation-process.html', priority: '0.85', changefreq: 'monthly' },
  { path: '/appointment', file: 'appointment.html', priority: '0.88', changefreq: 'monthly' },
  { path: '/reviews', file: 'reviews.html', priority: '0.75', changefreq: 'monthly' },
  { path: '/move-better', file: 'move-better.html', priority: '0.72', changefreq: 'weekly' },
  { path: '/submit-story', file: 'submit-story.html', priority: '0.65', changefreq: 'monthly' },
  { path: '/privacy-policy', file: 'privacy-policy.html', priority: '0.35', changefreq: 'yearly' },
  { path: '/terms', file: 'terms.html', priority: '0.35', changefreq: 'yearly' },
  { path: '/cookies-policy', file: 'cookies-policy.html', priority: '0.35', changefreq: 'yearly' },
  { path: '/patient-information', file: 'patient-information.html', priority: '0.35', changefreq: 'yearly' }
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
  const today = new Date().toISOString().slice(0, 10);
  const entries = CORE_ROUTES.map((route) => ({
    loc: route.path === '/' ? `${base}/` : `${base}${route.path}`,
    lastmod: fileLastMod(route.file),
    changefreq: route.changefreq,
    priority: route.priority
  }));

  for (const slug of getLaunchedServiceSlugs()) {
    entries.push({
      loc: `${base}/services/${slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.88'
    });
  }

  for (const slug of getLaunchedConditionSlugs()) {
    entries.push({
      loc: `${base}/conditions/${slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.87'
    });
  }

  for (const slug of getLaunchedKnowledgeSlugs()) {
    entries.push({
      loc: `${base}/knowledge/${slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.88'
    });
  }

  for (const authorityPath of LAUNCHED_AUTHORITY_SLUGS) {
    entries.push({
      loc: `${base}${authorityPath}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.85'
    });
  }

  try {
    const doctors = buildPublicContent('hy').doctors || [];
    for (const d of doctors) {
      const slug = d.slug || d.id;
      if (!slug) continue;
      entries.push({
        loc: `${base}/doctors/${slug}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.86'
      });
    }
  } catch {
    /* keep sitemap without doctor profiles if CMS unavailable */
  }

  return entries;
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
