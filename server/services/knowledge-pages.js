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


const KNOWLEDGE_I18N = require('./knowledge-i18n');
const { getKnowledgeParityOverlay } = require('./knowledge-i18n-parity');
const {
  missingKnowledgeConfig,
  logMissingTranslation,
  KNOWLEDGE_HUB,
  KNOWLEDGE_HUB_DISPLAY,
  applyHubDisplay,
  localizeData
} = require('./locale-content');
const {
  normalizeLang,
  ui,
  clinicDisplayName,
  breadcrumbNavHtml,
  jsonLdBreadcrumb,
  applyHtmlLang,
  injectLocaleIntoLinks,
  emergencyRedFlagBlock,
  editorialTrustBlock
} = require('./i18n-ssr');

function getKnowledgeConfig(slug, lang) {
  lang = normalizeLang(lang);
  if (lang === 'hy') return KNOWLEDGE_CONFIG[slug];
  const overlay = KNOWLEDGE_I18N[lang]?.[slug] || KNOWLEDGE_I18N.en?.[slug];
  if (!overlay) {
    logMissingTranslation('knowledge', slug, lang);
    return missingKnowledgeConfig(slug, lang);
  }
  const parity = getKnowledgeParityOverlay(slug, lang);
  return parity ? { ...overlay, ...parity } : overlay;
}

function hubMeta(data, lang = 'hy') {
  lang = normalizeLang(lang);
  const name = clinicDisplayName(data, lang);
  const city = ui(lang).yerevan;
  const u = ui(lang);
  if (lang === 'hy') {
    return {
      title: `${name} — Գիտելիքների կենտրոն և ցավի գնահատում | ${city}`,
      description: 'Տեղեկատվական հոդվածներ ողնաշարի, ցավի և վերականգնման թեմաներով «Առողջ ողնաշար» կենտրոնից։',
      h1: 'Գիտելիքների կենտրոն',
      tagline: KNOWLEDGE_HUB.hy.tagline
    };
  }
  const hub = KNOWLEDGE_HUB[lang];
  return {
    title: `${name} — ${u.knowledge} | ${city}`,
    description:
      lang === 'ru'
        ? `Информационные статьи центра ${name} о здоровье позвоночника.`
        : `Informational articles from ${name} about spine health.`,
    h1: u.knowledge,
    tagline: hub.tagline
  };
}

function articleMeta(config, data, lang = 'hy') {
  lang = normalizeLang(lang);
  const name = clinicDisplayName(data, lang);
  const city = ui(lang).yerevan;
  return {
    title: `${config.titleSuffix} — ${name} | ${city}`,
    description: config.description.slice(0, 160),
    h1: config.h1,
    tagline: config.tagline
  };
}

function hubBodyHtml(lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const hub = KNOWLEDGE_HUB[lang];
  const pages = LAUNCHED_KNOWLEDGE_SLUGS.map((slug) =>
    applyHubDisplay(getKnowledgeConfig(slug, lang), slug, lang, KNOWLEDGE_HUB_DISPLAY)
  );
  return `<article class="seo-crawl-content seo-knowledge-hub" id="seo-crawl-content">
    ${breadcrumbNavHtml([{ href: '#', label: u.knowledge }], lang)}
    <div class="hss-prose"><p>${esc(hub.intro)}</p></div>
    <section class="seo-service-section"><h2>${esc(hub.topicsHeading)}</h2><ul class="hss-list">${pages
      .map(
        (c, i) =>
          `<li><a href="/knowledge/${esc(LAUNCHED_KNOWLEDGE_SLUGS[i])}"><strong>${esc(c.h1)}</strong></a> — ${esc(c.tagline)}</li>`
      )
      .join('')}</ul></section>
    <p><a href="/services" class="hss-link">${esc(u.services)}</a> · <a href="/conditions" class="hss-link">${esc(u.conditions)}</a></p>
  </article>`;
}

function articleBodyHtml(data, slug, config, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const symptomList = (config.symptoms || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const causeList = (config.causes || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const whenList = (config.whenToSeek || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const faqHeading = lang === 'ru' ? 'Часто задаваемые вопросы' : lang === 'en' ? 'Frequently asked questions' : 'Հաճախ տրվող հարցեր';
  const faq =
    (config.faq || []).length
      ? `<section class="seo-service-section"><h2>${esc(faqHeading)}</h2><dl class="hss-faq">${config.faq
          .map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`)
          .join('')}</dl></section>`
      : '';
  return `<article class="seo-crawl-content seo-knowledge-article" id="seo-crawl-content">
    ${breadcrumbNavHtml(
      [
        { href: '/knowledge', label: u.knowledge },
        { href: '#', label: config.h1 }
      ],
      lang
    )}
    <div class="hss-prose"><p>${esc(config.intro)}</p><p>${esc(u.disclaimer)}</p></div>
    ${symptomList ? `<section class="seo-service-section"><h2>${esc(u.symptoms)}</h2><ul class="hss-list">${symptomList}</ul></section>` : ''}
    ${causeList ? `<section class="seo-service-section"><h2>${lang === 'ru' ? 'Возможные причины' : lang === 'en' ? 'Possible causes' : 'Պատճառներ'}</h2><ul class="hss-list">${causeList}</ul></section>` : ''}
    ${whenList ? `<section class="seo-service-section"><h2>${esc(u.whenToSeek)}</h2><ul class="hss-list">${whenList}</ul></section>` : ''}
    ${faq}
    ${editorialTrustBlock(lang)}
    ${emergencyRedFlagBlock(lang)}
    <p><a href="/services" class="hss-link">${esc(u.services)}</a> · <a href="/conditions" class="hss-link">${esc(u.conditions)}</a> · <a href="/consultation-process" class="hss-link">${esc(u.consultation)}</a> · <a href="/find-a-doctor" class="hss-link">${esc(u.findDoctors)}</a></p>
    <p><a href="/knowledge" class="hss-link">← ${esc(u.knowledge)}</a></p>
  </article>`;
}

function hubJsonLd(data, url, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const meta = hubMeta(data, lang);
  return [
    {
      '@type': 'WebPage',
      name: u.knowledge,
      url,
      description: meta.description,
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` }
    },
    clinicNode(data),
    jsonLdBreadcrumb(BASE, lang, { name: u.knowledge, item: url })
  ];
}

function articleJsonLd(data, config, url, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  return [
    {
      '@type': 'MedicalWebPage',
      name: config.h1,
      url,
      description: config.description,
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` },
      publisher: clinicNode(data)
    },
    clinicNode(data),
    jsonLdBreadcrumb(
      BASE,
      lang,
      { name: u.knowledge, item: `${BASE}/knowledge` },
      { name: config.h1, item: url }
    )
  ];
}

function prepareHtml(fileName, meta, canonicalPath, bodyHtml, jsonLdGraphs, lang = 'hy') {
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
  html = html.replace('</head>', `${headTags(meta, canonicalPath)}\n${injectJsonLdScript(jsonLdGraphs)}\n</head>`);
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
  html = applyHtmlLang(html, lang);
  html = injectLocaleIntoLinks(html, lang);
  return normalizeRootAssetPaths(html);
}

function serveKnowledgeHub(lang = 'hy') {
  lang = normalizeLang(lang);
  const data = localizeData(buildPublicContent(lang), lang);
  const meta = hubMeta(data, lang);
  const body = hubBodyHtml(lang);
  const url = `${BASE}/knowledge`;
  return prepareHtml('knowledge.html', meta, '/knowledge', body, hubJsonLd(data, url, lang), lang);
}

function serveKnowledgeArticle(slug, lang = 'hy') {
  if (!LAUNCHED_KNOWLEDGE_SLUGS.includes(slug)) return null;
  lang = normalizeLang(lang);
  const config = getKnowledgeConfig(slug, lang);
  if (!config) return null;
  const data = localizeData(buildPublicContent(lang), lang);
  const meta = articleMeta(config, data, lang);
  const body = articleBodyHtml(data, slug, config, lang);
  const url = `${BASE}/knowledge/${slug}`;
  const html = prepareHtml('knowledge-article.html', meta, `/knowledge/${slug}`, body, articleJsonLd(data, config, url, lang), lang);
  if (html) return html.replace('data-knowledge-slug=""', `data-knowledge-slug="${esc(slug)}"`);
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

