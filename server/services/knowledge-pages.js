const fs = require('fs');
const path = require('path');
const { buildPublicContent } = require('../db/helpers');
const { clinicNode, clinicName } = require('./entity-schema');
const {
  LAUNCHED_KNOWLEDGE_SLUGS,
  KNOWLEDGE_CONFIG
} = require('./knowledge-config');
const { normalizeRootAssetPaths } = require('./html-utils');

const SITE_ROOT = path.join(__dirname, '../..');
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');


function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item
    }))
  };
}

function headTags(meta, canonicalPath) {
  const url = `${BASE}${canonicalPath}`;
  const image = `${BASE}/images/brand/logo.png`;
  return `
    <link rel="icon" href="${BASE}/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="${BASE}/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">
    <meta name="description" content="${esc(meta.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Healthy Spine">
    <meta property="og:title" content="${esc(meta.title)}">
    <meta property="og:description" content="${esc(meta.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(meta.title)}">
    <meta name="twitter:description" content="${esc(meta.description)}">
    <meta name="twitter:image" content="${image}">`;
}

function injectJsonLdScript(graphs) {
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graphs })}</script>`;
}

function findService(data, slug) {
  return (data?.departments || []).find((s) => s.id === slug);
}

function ctaBlock() {
  return `<nav class="seo-service-cta" aria-label="Next steps">
    <p><a href="/contact" class="hss-btn hss-btn--primary">Գրանցվել ընդունելության</a>
    <a href="/contact" class="hss-btn hss-btn--outline">Կապ</a>
    <a href="/locations" class="hss-link">Հասցե և ժամեր</a></p>
  </nav>`;
}

function safetyNote() {
  return `<section class="seo-service-section">
    <h2>Կարևոր նշում</h2>
    <div class="hss-prose">
      <p>Այս էջը տեղեկատվական է և չի փոխարինում բժշկական ախտորոշումը կամ խորհրդատվությունը։ Յուրաքանչյուր դեպք գնահատվում է առանձին՝ հաշվի առնելով բողոքները, պատմությունը և առկա ուսումնասիրությունները։</p>
      <p>Բուժման արդյունքները կարող են տարբեր լինել։ Կենտրոնը չի երաշխավորում կոնկրետ արդյունքներ կամ ամբողջական ազատում ցավից։</p>
    </div>
  </section>`;
}

function articleMeta(config, data) {
  const name = clinicName(data);
  return {
    title: `${config.titleSuffix} — ${name} | Երևան`,
    description: config.description.slice(0, 160),
    h1: config.h1,
    tagline: config.tagline
  };
}

function conditionLinksHtml(slugs) {
  const { CONDITION_CONFIG } = require('./condition-pages');
  const list = slugs
    .map((id) => {
      const c = CONDITION_CONFIG[id];
      if (!c) return '';
      return `<li><a href="/conditions/${esc(id)}"><strong>${esc(c.h1)}</strong></a></li>`;
    })
    .join('');
  return list
    ? `<section class="seo-service-section"><h2>Կապված ախտորոշումների էջեր</h2><ul class="hss-list">${list}</ul></section>`
    : '';
}

function knowledgeLinksHtml(slugs) {
  const list = slugs
    .map((id) => {
      const c = KNOWLEDGE_CONFIG[id];
      if (!c) return '';
      return `<li><a href="/knowledge/${esc(id)}"><strong>${esc(c.h1)}</strong></a></li>`;
    })
    .join('');
  return list
    ? `<section class="seo-service-section"><h2>Կապված հոդվածներ</h2><ul class="hss-list">${list}</ul></section>`
    : '';
}

function faqSection(faq) {
  if (!faq || !faq.length) return '';
  const items = faq
    .map((f) => `<details class="seo-faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
    .join('');
  return `<section class="seo-service-section"><h2>Հաճախ տրվող հարցեր</h2><div class="seo-faq">${items}</div></section>`;
}

function serviceLinksHtml(data, slugs, intro) {
  const items = slugs
    .map((id) => findService(data, id))
    .filter(Boolean)
    .map(
      (s) =>
        `<li><a href="/services/${esc(s.id)}"><strong>${esc(s.name)}</strong></a>${s.description ? ` — ${esc(s.description)}` : ''}</li>`
    )
    .join('');
  return `<section class="seo-service-section">
    <h2>Կապված ծառայություններ կենտրոնում</h2>
    <div class="hss-prose"><p>${intro}</p></div>
    <ul class="hss-list">${items}</ul>
    <p><a href="/services" class="hss-link">Բոլոր ծառայությունները</a> · <a href="/knowledge" class="hss-link">Գիտելիքների կենտրոն</a> · <a href="/conditions" class="hss-link">Ախտորոշումներ</a></p>
  </section>`;
}

function articleBodyHtml(data, slug, config) {
  const causeList = (config.causes || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const symptomList = (config.symptoms || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const whenList = (config.whenToSeek || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const servicesIntro =
    config.servicesIntro ||
    'Հետևյալ ծառայությունները կարող են դիտարկվել միայն մասնագետի գնահատումից հետո։';

  return `<article class="seo-crawl-content seo-knowledge-page" id="seo-crawl-content">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb">
      <a href="/">Գլխավոր</a> › <a href="/knowledge">Գիտելիքների կենտրոն</a> › <span>${esc(config.h1)}</span>
    </nav>
    <div class="hss-prose">
      <p>${config.intro}</p>
      <p>«${esc(clinicName(data))}» վերականգնողական կենտրոնը կարող է նախատեսել կոնսերվատիվ գնահատում մասնագետի կողմից։ Այս հոդվածը տեղեկատվական է և չի փոխարինում ախտորոշում։</p>
    </div>
    <section class="seo-service-section">
      <h2>Հաճախ նկարագրվող ախտանիշներ</h2>
      <ul class="hss-list">${symptomList}</ul>
    </section>
    <section class="seo-service-section">
      <h2>Հնարավոր պատջարներ</h2>
      <ul class="hss-list">${causeList}</ul>
    </section>
    <section class="seo-service-section">
      <h2>Երբ դիմել մասնագիտի</h2>
      <ul class="hss-list">${whenList}</ul>
    </section>
    ${conditionLinksHtml(config.conditionSlugs || [])}
    ${serviceLinksHtml(data, config.serviceSlugs || [], servicesIntro)}
    ${knowledgeLinksHtml(config.relatedKnowledgeSlugs || [])}
    ${faqSection(config.faq)}
    ${safetyNote()}
    <p><a href="/knowledge" class="hss-link">← Բոլոր հոդվածներ</a> · <a href="/services" class="hss-link">Ծառայություններ</a> · <a href="/conditions" class="hss-link">Ախտորոշումներ</a></p>
    ${ctaBlock()}
  </article>`;
}

function articleJsonLd(data, config, url) {
  const graphs = [
    {
      '@type': 'MedicalWebPage',
      name: config.h1,
      url,
      description: config.description,
      isPartOf: { '@type': 'WebSite', name: clinicName(data), url: `${BASE}/` },
      publisher: clinicNode(data)
    },
    clinicNode(data),
    breadcrumb([
      { name: 'Գլխավոր', item: `${BASE}/` },
      { name: 'Գիտելիքների կենտրոն', item: `${BASE}/knowledge` },
      { name: config.h1, item: url }
    ])
  ];
  if (config.faq && config.faq.length) {
    graphs.push({
      '@type': 'FAQPage',
      mainEntity: config.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    });
  }
  return graphs;
}

function hubMeta(data) {
  const name = clinicName(data);
  return {
    title: `${name} — Գիտելիքների կենտրոն և ցավի գնահատում | Երևան`,
    description:
      'Մեջքի և պարանոցի ցավի վերաբերյալ տեղեկատվություն և վերականգնողական խորհրդատվություն «Առողջ ողնաշար» կենտրոնում Երևանում։',
    h1: 'Գիտելիքների կենտրոն և ցավի թեմաներ',
    tagline: 'Տեղեկատվականան էջեր՝ ախտանիշային որոնումից ծառայությունների վերականգնողական մոտեցումներ'
  };
}

function hubBodyHtml() {
  const pages = LAUNCHED_KNOWLEDGE_SLUGS.map((slug) => KNOWLEDGE_CONFIG[slug]);
  return `<article class="seo-crawl-content seo-knowledge-hub" id="seo-crawl-content">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb">
      <a href="/">Գլխավոր</a> › <span>Գիտելիքների կենտրոն</span>
    </nav>
    <div class="hss-prose">
      <p>Այս բաժինը տեղեկատվական է և կարող է օգնել հասկանալ, թե երբ վերականգնողական խորհրդատվությունը կարող է հարմար լինել։ 
      Էջերը չեն տալիս ախտորոշում և չեն երաշխավորում բուժման արդյունք։</p>
    </div>
    <section class="seo-service-section">
      <h2>Հասանելի թեմաներ</h2>
      <ul class="hss-list">${pages
        .map(
          (c, i) =>
            `<li><a href="/knowledge/${esc(LAUNCHED_KNOWLEDGE_SLUGS[i])}"><strong>${esc(c.h1)}</strong></a> — ${esc(c.tagline)}</li>`
        )
        .join('')}</ul>
    </section>
    <p><a href="/services" class="hss-link">Ծառայություններ</a> · <a href="/conditions" class="hss-link">Ախտորոշումներ</a> · <a href="/contact" class="hss-link">Կապ</a> · <a href="/locations" class="hss-link">Հասցե</a></p>
    ${ctaBlock()}
  </article>`;
}

function hubJsonLd(data, url) {
  return [
    {
      '@type': 'WebPage',
      name: 'Գիտելիքների կենտրոն',
      url,
      description: hubMeta(data).description,
      isPartOf: { '@type': 'WebSite', name: clinicName(data), url: `${BASE}/` }
    },
    clinicNode(data),
    breadcrumb([
      { name: 'Գլխավոր', item: `${BASE}/` },
      { name: 'Գիտելիքների կենտրոն', item: url }
    ])
  ];
}

function prepareHtml(fileName, meta, canonicalPath, bodyHtml, jsonLdGraphs) {
  const filePath = path.join(SITE_ROOT, fileName);
  if (!fs.existsSync(filePath)) return null;

  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace(/<meta name="description"[^>]*>/gi, '');
  html = html.replace(/<meta name="robots"[^>]*>/gi, '');
  html = html.replace(/<link rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<link rel="alternate"[^>]*>/gi, '');
  html = html.replace(/<meta property="og:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<meta name="twitter:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = html.replace(
    '</head>',
    `${headTags(meta, canonicalPath)}\n${injectJsonLdScript(jsonLdGraphs)}\n</head>`
  );

  html = html.replace(/(<h1[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  html = html.replace(/(<h1 id="knowledge-hero-title">)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  html = html.replace(/(<h1 id="knowledge-article-hero-title">)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  html = html.replace(/(<p class="hss-hero__tagline"[^>]*>)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);
  html = html.replace(/(<p class="hss-hero__tagline" id="knowledge-article-hero-tagline">)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);

  const rootId = fileName === 'knowledge.html' ? 'knowledge-hub-root' : 'knowledge-article-root';
  if (html.includes(`id="${rootId}"`)) {
    html = html.replace(new RegExp(`(<div class="hss-wrap" id="${rootId}">)\\s*(</div>)`), `$1${bodyHtml}$2`);
  }

  html = html.replace(/<body([^>]*)>/, `<body$1 data-seo-canonical="${esc(canonicalPath)}">`);

  return normalizeRootAssetPaths(html);
}

function serveKnowledgeHub() {
  const data = buildPublicContent('hy');
  const meta = hubMeta(data);
  const body = hubBodyHtml();
  const url = `${BASE}/knowledge`;
  return prepareHtml('knowledge.html', meta, '/knowledge', body, hubJsonLd(data, url));
}

function serveKnowledgeArticle(slug) {
  if (!LAUNCHED_KNOWLEDGE_SLUGS.includes(slug)) return null;
  const config = KNOWLEDGE_CONFIG[slug];
  if (!config) return null;

  const data = buildPublicContent('hy');
  const meta = articleMeta(config, data);
  const body = articleBodyHtml(data, slug, config);
  const url = `${BASE}/knowledge/${slug}`;
  const html = prepareHtml('knowledge-article.html', meta, `/knowledge/${slug}`, body, articleJsonLd(data, config, url));
  if (html) {
    return html.replace('data-knowledge-slug=""', `data-knowledge-slug="${esc(slug)}"`);
  }
  return html;
}

function getKnowledgeLinksForService(serviceSlug) {
  return LAUNCHED_KNOWLEDGE_SLUGS.filter((slug) => (KNOWLEDGE_CONFIG[slug].serviceSlugs || []).includes(serviceSlug));
}

function getKnowledgeLinksForCondition(conditionSlug) {
  return LAUNCHED_KNOWLEDGE_SLUGS.filter((slug) => (KNOWLEDGE_CONFIG[slug].conditionSlugs || []).includes(conditionSlug));
}

function getLaunchedKnowledgeSlugs() {
  return [...LAUNCHED_KNOWLEDGE_SLUGS];
}

module.exports = {
  LAUNCHED_KNOWLEDGE_SLUGS,
  KNOWLEDGE_CONFIG,
  serveKnowledgeHub,
  serveKnowledgeArticle,
  getLaunchedKnowledgeSlugs,
  getKnowledgeLinksForService,
  getKnowledgeLinksForCondition
};

