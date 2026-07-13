/**
 * P1.5 — Local SEO + E-E-A-T Authority Pages
 * Server-side rendered pages for local search, doctor authority, and medical trust.
 */
const { buildPublicContent } = require('../db/helpers');
const { clinicNode, localBusinessNode, clinicName, BASE } = require('./entity-schema');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function breadcrumbSchema(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem', position: i + 1, name: item.name, item: item.url
    }))
  };
}

function headMeta(config) {
  const url = `${BASE}${config.path}`;
  const image = `${BASE}/images/brand/logo.png`;
  return `<link rel="icon" href="${BASE}/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">
    <meta name="description" content="${esc(config.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Healthy Spine">
    <meta property="og:title" content="${esc(config.title)}">
    <meta property="og:description" content="${esc(config.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(config.title)}">
    <meta name="twitter:description" content="${esc(config.description)}">
    <meta name="twitter:image" content="${image}">`;
}

function jsonLd(graphs) {
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graphs })}</script>`;
}

const AUTHORITY_I18N = require('./authority-i18n');
const AUTHORITY_I18N_PAGES = require('./authority-i18n-pages');
const {
  normalizeLang,
  ui,
  clinicDisplayName,
  jsonLdBreadcrumb,
  contactBlockHtml,
  injectLocaleIntoLinks
} = require('./i18n-ssr');
const { normalizeRootAssetPaths } = require('./html-utils');

function resolveAuthorityConfig(routePath, lang) {
  lang = normalizeLang(lang);
  const base = PAGES[routePath];
  if (!base) return null;
  if (lang === 'hy') return base;
  const overlay = AUTHORITY_I18N[lang]?.[routePath];
  const expanded = AUTHORITY_I18N_PAGES[lang]?.[routePath];
  if (!overlay && !expanded) return base;
  return { ...base, ...(overlay || {}), ...(expanded || {}) };
}

function faqHeading(lang) {
  if (lang === 'ru') return 'Часто задаваемые вопросы';
  if (lang === 'en') return 'Frequently asked questions';
  return 'Հաճախ տրվող հարցեր';
}

function faqMarkup(items, lang = 'hy') {
  if (!items || !items.length) return '';
  const dl = items.map((f) => `<dt>${esc(f.q)}</dt>\n<dd>${esc(f.a)}</dd>`).join('\n');
  return `<section class="seo-service-section"><h2>${esc(faqHeading(lang))}</h2>\n<dl class="hss-faq">\n${dl}\n</dl></section>`;
}

function servePage(routePath, lang = 'hy') {
  lang = normalizeLang(lang);
  const config = resolveAuthorityConfig(routePath, lang);
  if (!config) return null;

  const data = buildPublicContent(lang);
  data.hospital = { ...(data.hospital || {}), name: clinicDisplayName(data, lang) };
  const u = ui(lang);
  const url = `${BASE}${config.path}`;
  const bcItems = [{ name: u.home, url: `${BASE}/` }];
  if (config.parent) {
    bcItems.push({ name: config.parent.name, url: `${BASE}${config.parent.path}` });
  }
  bcItems.push({ name: config.h1, url });

  const graphs = [
    {
      '@type': 'WebPage',
      name: config.h1,
      url,
      description: config.description,
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` }
    }
  ];
  graphs.push(
    jsonLdBreadcrumb(
      BASE,
      lang,
      ...bcItems.slice(1).map((item) => ({ name: item.name, item: item.url }))
    )
  );
  if (config.faq && config.faq.length) graphs.push(...faqSchemaNodes(config.faq));

  const bcHtml = bcItems
    .map((item, i) =>
      i < bcItems.length - 1
        ? `<a href="${esc(item.url.replace(BASE, '') || '/')}">${esc(item.name)}</a> ›`
        : `<span>${esc(item.name)}</span>`
    )
    .join(' ');

  let body = typeof config.body === 'function' ? config.body(data) : '';
  if (lang !== 'hy') {
    if (config.bodyHtml) {
      body = config.bodyHtml;
    } else if (config.bodyIntro) {
      body = `<div class="hss-prose"><p>${esc(config.bodyIntro)}</p></div>`;
    }
  }

  let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(config.title)}</title>
    <link rel="stylesheet" href="/css/hospital-theme.css?v=20260704">
    <link rel="stylesheet" href="/css/hss-spine.css?v=20260759">
    ${headMeta(config)}
    ${jsonLd(graphs)}
</head>
<body class="hss-page" data-page="${esc(config.pageKey)}" data-seo-canonical="${esc(config.path)}">
    <div id="site-nav"></div>
    <header class="hss-hero hss-hero--inner">
        <div class="hss-wrap">
            <h1>${esc(config.h1)}</h1>
            <p class="hss-hero__tagline">${esc(config.tagline)}</p>
        </div>
    </header>
    <section class="hss-section">
        <div class="hss-wrap">
            <article class="seo-crawl-content seo-authority-page" id="seo-crawl-content">
                <nav class="seo-breadcrumb" aria-label="Breadcrumb">${bcHtml}</nav>
                ${body}
                ${faqMarkup(config.faq, lang)}
                <nav class="seo-service-cta" aria-label="Next steps">
                  <p><a href="/contact" class="hss-btn hss-btn--primary">${esc(u.bookAppointment)}</a>
                  <a href="/locations" class="hss-btn hss-btn--outline">${esc(u.locations)}</a>
                  <a href="/consultation-process" class="hss-link">${esc(u.consultation)}</a></p>
                </nav>
            </article>
        </div>
    </section>
    <div id="site-footer"></div>
    <script src="/data/hospital.embed.js"></script>
    <script src="/js/storage.js"></script>
    <script src="/js/i18n.js?v=20260702"></script>
    <script src="/js/cms-config.js?v=20260710"></script>
    <script src="/js/cms-content.js?v=20260718"></script>
    <script src="/js/common.js?v=20260771"></script>
</body>
</html>`;
  html = injectLocaleIntoLinks(html, lang);
  return normalizeRootAssetPaths(html);
}

function faqSchemaNodes(items) {
  if (!items || !items.length) return [];
  return [{ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }];
}

// Page configurations are loaded from the config file
const { PAGES } = require('./local-authority-config');

const LAUNCHED_AUTHORITY_SLUGS = Object.keys(PAGES);

module.exports = { PAGES, servePage, LAUNCHED_AUTHORITY_SLUGS };
