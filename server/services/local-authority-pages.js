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

function faqMarkup(items) {
  if (!items || !items.length) return '';
  const dl = items.map((f) => `<dt>${esc(f.q)}</dt>\n<dd>${esc(f.a)}</dd>`).join('\n');
  return `<section class="seo-service-section"><h2>\u0540\u0561\u0573\u0561\u056d \u057f\u0580\u057e\u0578\u0572 \u0570\u0561\u0580\u0581\u0565\u0580</h2>\n<dl class="hss-faq">\n${dl}\n</dl></section>`;
}

function faqSchemaNodes(items) {
  if (!items || !items.length) return [];
  return [{ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }];
}

function servePage(routePath) {
  const config = PAGES[routePath];
  if (!config) return null;

  const data = buildPublicContent('hy');
  const url = `${BASE}${config.path}`;
  const bcItems = [{ name: '\u0533\u056c\u056d\u0561\u057e\u0578\u0580', url: `${BASE}/` }];
  if (config.parent) bcItems.push({ name: config.parent.name, url: `${BASE}${config.parent.path}` });
  bcItems.push({ name: config.h1, url });

  const graphs = config.schema ? config.schema(data, url) : [clinicNode(data)];
  graphs.push(breadcrumbSchema(bcItems));
  if (config.faq) graphs.push(...faqSchemaNodes(config.faq));

  const bcHtml = bcItems.map((item, i) =>
    i < bcItems.length - 1
      ? `<a href="${esc(item.url.replace(BASE, '') || '/')}">${esc(item.name)}</a> \u203A`
      : `<span>${esc(item.name)}</span>`
  ).join(' ');

  const body = typeof config.body === 'function' ? config.body(data) : '';

  return `<!DOCTYPE html>
<html lang="hy">
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
                ${faqMarkup(config.faq)}
                <nav class="seo-service-cta" aria-label="Next steps">
                  <p><a href="/contact" class="hss-btn hss-btn--primary">\u0533\u0580\u0561\u0576\u0581\u057e\u0565\u056c \u056d\u0578\u0580\u0570\u0580\u0564\u0561\u057f\u057e\u0578\u0582\u0569\u0575\u0561\u0576</a>
                  <a href="/locations" class="hss-btn hss-btn--outline">\u0540\u0561\u057d\u0581\u0565 \u0587 \u056a\u0561\u0574\u0565\u0580</a>
                  <a href="/consultation-process" class="hss-link">\u053d\u0578\u0580\u0570\u0580\u0564\u0561\u057f\u057e\u0578\u0582\u0569\u0575\u0561\u0576 \u0563\u0578\u0580\u056e\u0568\u0576\u0569\u0561\u0581</a></p>
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
}

// Page configurations are loaded from the config file
const { PAGES } = require('./local-authority-config');

const LAUNCHED_AUTHORITY_SLUGS = Object.keys(PAGES);

module.exports = { PAGES, servePage, LAUNCHED_AUTHORITY_SLUGS };
