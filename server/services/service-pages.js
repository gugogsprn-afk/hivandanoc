const fs = require('fs');
const path = require('path');
const { buildPublicContent } = require('../db/helpers');
const { clinicNode, clinicName, medicalClinicProvider } = require('./entity-schema');
const { getKnowledgeLinksForService, KNOWLEDGE_CONFIG } = require('./knowledge-pages');
const { normalizeRootAssetPaths } = require('./html-utils');

const SITE_ROOT = path.join(__dirname, '../..');
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');

/** P3.2 launch batch */
const P3_2_LAUNCHED = [
  'manual-therapy',
  'osteopathy',
  'physiotherapy',
  'hernia-treatment',
  'scoliosis'
];

/** P3.4 Wave 1 — highest CMS content quality + clinic/search relevance */
const WAVE_1_LAUNCHED = [
  'consult-spine',
  'consult-neuro',
  'kinesiotherapy',
  'massage',
  'acupuncture',
  'traction',
  'electrotherapy',
  'osteochondrosis',
  'radiculitis',
  'arthrosis',
  'sports-rehab',
  'rehab-surgery'
];

/** All indexable service slugs (P3.2 + Wave 1) */
const LAUNCHED_SERVICE_SLUGS = [...P3_2_LAUNCHED, ...WAVE_1_LAUNCHED];

const CATEGORY_LABELS = {
  consult: 'Խորհրդատվություններ',
  therapy: 'Թերապիա',
  treatment: 'Բուժում',
  rehab: 'Ռեաբիլիտացիա',
  diagnostics: 'Ախտորոշում'
};


const SERVICE_CONDITION_LINKS = {
  'physiotherapy': ['sciatica', 'lower-back-pain', 'back-pain-treatment', 'shoulder-pain', 'thoracic-back-pain', 'posture-disorders'],
  'manual-therapy': ['sciatica', 'lower-back-pain', 'back-pain-treatment', 'neck-pain-treatment', 'shoulder-pain', 'thoracic-back-pain'],
  'consult-spine': ['herniated-disc', 'lower-back-pain', 'back-pain-treatment', 'osteochondrosis'],
  'consult-neuro': ['leg-numbness', 'sciatica', 'radiculopathy'],
  'traction': ['herniated-disc', 'sciatica', 'osteochondrosis'],
  'hernia-treatment': ['herniated-disc', 'sciatica', 'radiculopathy'],
  'massage': ['lower-back-pain', 'back-pain-treatment', 'neck-pain-treatment', 'shoulder-pain'],
  'osteopathy': ['lower-back-pain', 'neck-pain-treatment', 'shoulder-pain', 'joint-pain'],
  'scoliosis': ['scoliosis-pain', 'back-pain-treatment'],
  'kinesiotherapy': ['scoliosis-pain', 'lower-back-pain', 'thoracic-back-pain', 'posture-disorders'],
  'osteochondrosis': ['osteochondrosis', 'back-pain-treatment'],
  'radiculitis': ['radiculopathy', 'sciatica'],
  'arthrosis': ['joint-pain', 'back-pain-treatment'],
  'sports-rehab': ['lower-back-pain', 'shoulder-pain']
};

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

function relatedServices(data, service, limit = 4) {
  return (data?.departments || [])
    .filter((s) => s.id !== service.id && s.category === service.category && LAUNCHED_SERVICE_SLUGS.includes(s.id))
    .slice(0, limit);
}


const {
  normalizeLang,
  ui,
  clinicDisplayName,
  breadcrumbNavHtml,
  jsonLdBreadcrumb,
  applyHtmlLang,
  injectLocaleIntoLinks,
  localizedAddress,
  emergencyRedFlagBlock,
  editorialTrustBlock
} = require('./i18n-ssr');
const { getConditionConfig } = require('./condition-pages');
const { localizeData } = require('./locale-content');

function ctaBlock(lang = 'hy') {
  const u = ui(lang);
  return `<nav class="seo-service-cta" aria-label="Next steps">
    <p><a href="/contact" class="hss-btn hss-btn--primary">${esc(u.bookAppointment)}</a>
    <a href="/contact" class="hss-btn hss-btn--outline">${esc(u.contact)}</a>
    <a href="/locations" class="hss-link">${esc(u.locations)}</a></p>
  </nav>`;
}

function safetyNote(lang = 'hy') {
  const u = ui(lang);
  const h2 = lang === 'ru' ? 'Безопасность и консультация' : lang === 'en' ? 'Safety and consultation' : 'Անվտանգություն և խորհրդատվություն';
  return `<section class="seo-service-section"><h2>${esc(h2)}</h2><div class="hss-prose"><p>${esc(u.disclaimer)}</p></div></section>`;
}

function serviceAudienceParagraph(service, lang = 'hy') {
  if (lang === 'hy') {
    const bySlug = {
      'manual-therapy':
        'Մանուալ թերապիան կարող է համարվել մասնագետների կողմից ողնաշարի, պարանոցի, կրծքային և գոտկային շրջանների մկանա-կմախքային խնդիրների գնահատման և բուժման պլանի մաս։',
      osteopathy:
        'Օստեոպաթիան կարող է ներառվել հենաշարժական համակարգի վերականգնողական պլանի մեջ՝ մասնագետի գնահատումից հետո։',
      physiotherapy:
        'Ֆիզիոթերապիան հաճախ ընտրվում է ցավի, բորբոքման և շարժունակության սահմանափակումների դեպքում՝ որպես վերականգնողական ծրագրի մաս։',
      'hernia-treatment':
        'Միջողային սկավառակի ճողվածքի կոնսերվատիվ ծրագիրը կարող է ներառվել այն հիվանդների համար, ում համար նախընտրելի է ոչ վիրահատական մոտեցում։',
      scoliosis:
        'Սկոլիոզի կոնսերվատիվ դիտարկումը կարող է հարմար լինել պարանոցի և ուղղաձողի ձևի խանգարումներ ունեցող հիվանդների համար՝ մասնագետի գնահատումից հետո։'
    };
    return bySlug[service.id] || 'Այս ծառայությունը կարող է մտնել վերականգնողական կենտրոնի բազմակողմանի պլանի մեջ՝ ըստ մասնագետի գնահատման։';
  }
  const u = ui(lang);
  return lang === 'ru'
    ? `Услуга «${service.name}» может быть частью индивидуального реабилитационного плана после оценки специалиста. ${u.disclaimer}`
    : `Service «${service.name}» may be part of an individual rehabilitation plan after specialist assessment. ${u.disclaimer}`;
}

function serviceExpectParagraph(service, lang = 'hy') {
  if (lang === 'hy') {
    return `«${service.name}» ծառայության ընթացքում հիվանդը, որպես կանոն, անցնում է սկզբնական գնահատում, ապա ստանում է անհատականացված պլան։ Արդյունքները կարող են տարբեր լինել։`;
  }
  return lang === 'ru'
    ? `В рамках услуги «${service.name}» обычно проводится первичная оценка и составляется индивидуальный план. Результаты могут отличаться.`
    : `During «${service.name}», patients typically receive an initial assessment and individual plan. Results may vary.`;
}

function serviceWhenToSeekParagraph(lang = 'hy') {
  if (lang === 'hy') {
    return 'Եթե ցավը չի նվազում կամ ախտանիշները խտանում են, խորհուրդ է տրվում կապ հաստատել կլինիկայի հետ։ Վերականգնողական ծառայությունները չեն փոխարինում բժշկական ցուցումները.';
  }
  return lang === 'ru'
    ? 'Если симптомы сохраняются или усиливаются, свяжитесь с клиникой. Реабилитация не заменяет назначения врача.'
    : 'If symptoms persist or worsen, contact the clinic. Rehabilitation does not replace medical prescriptions.';
}

function serviceOverviewExtra(service, lang = 'hy') {
  if (lang !== 'hy') return '';
  const extras = {
    'manual-therapy': 'Կենտրոնում մանուալ թերապիան կարող է համակցվել այլ վերականգնողական մեթոդների հետ։',
    osteopathy: 'Օստեոպաթիական մոտեցումը կարող է ներառել բիոդինամիկ տեխնիկաներ և մարմնի ամբողջական գնահատում։',
    physiotherapy: 'Ֆիզիոթերապևտիկ ծրագիրը կարող է ներառել ապարատային մեթոդներ՝ ըստ ցուցումների։'
  };
  return extras[service.id] || '';
}

function serviceCarePathParagraph(service, lang = 'hy') {
  if (lang !== 'hy') {
    return lang === 'ru'
      ? 'Путь лечения начинается с консультации и может включать оценку, план и наблюдение.'
      : 'The care path starts with consultation and may include assessment, plan, and follow-up.';
  }
  return 'Բուժման ուղին սկսվում է մասնագետի հետ խորհրդատվությունից և կարող է ներառել մի քանի փուլ՝ գնահատում, բուժման պլան և հսկողություն։';
}

function serviceConditionLinksHtml(service, lang = 'hy') {
  const u = ui(lang);
  const slugs = SERVICE_CONDITION_LINKS[service.id] || [];
  if (!slugs.length) return '';
  const items = slugs
    .map((id) => {
      const c = getConditionConfig(id, lang);
      if (!c) return '';
      return `<li><a href="/conditions/${esc(id)}">${esc(c.h1)}</a></li>`;
    })
    .join('');
  return `<section class="seo-service-section"><h2>${esc(u.relatedConditions)}</h2><ul class="hss-list">${items}</ul></section>`;
}

function serviceWhenNotSuitable(lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const text =
    lang === 'ru'
      ? 'Услуга может быть неподходящей при острых инфекциях, нестабильных состояниях, противопоказаниях по результатам обследования или без предварительной оценки специалиста. Решение принимается индивидуально.'
      : lang === 'en'
        ? 'The service may not be suitable during acute infection, unstable conditions, contraindications on imaging, or without prior specialist assessment. Decisions are made individually.'
        : 'Ծառայությունը կարող է հարմար չլինել սուր վարակային, անկայուն վիճակների, հետազոտություններով հաստատված противопоказаний կամ առանց նախնական մասնագետի գնահատման դեպքում։';
  return `<section class="seo-service-section"><h2>${esc(u.whenNotSuitable)}</h2><div class="hss-prose"><p>${esc(text)}</p></div></section>`;
}

function serviceBodyHtml(data, service, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const h = data?.hospital || {};
  const items = Array.isArray(service.services) ? service.services : [];
  const related = relatedServices(data, service);
  const itemList = items.length ? `<ul class="hss-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
  const relatedHtml = related.length
    ? `<section class="seo-service-section"><h2>${lang === 'ru' ? 'Похожие услуги' : lang === 'en' ? 'Related services' : 'Նմանատիպ ծառայություններ'}</h2><ul class="hss-list">${related
        .map((r) => `<li><a href="/services/${esc(r.id)}">${esc(r.name)}</a></li>`)
        .join('')}</ul></section>`
    : '';
  const intro =
    lang === 'hy'
      ? `«${esc(clinicDisplayName(data, lang))}» վերականգնողական կենտրոնը Երևանում աշխատում է ողնաշարի, հոդերի և հենաշարժական համակարգի խնդիրների կոնսերվատիվ բուժման և վերականգնման ուղղությամբ։`
      : u.hubIntro;
  const includesH = lang === 'ru' ? 'Что может включать услуга' : lang === 'en' ? 'What the service may include' : 'Ինչ կարող է ներառել ծառայությունը';

  return `<article class="seo-crawl-content seo-service-page" id="seo-crawl-content">
    ${breadcrumbNavHtml(
      [
        { href: '/services', label: u.services },
        { href: '#', label: service.name }
      ],
      lang
    )}
    <div class="hss-prose"><p>${intro}</p><p>${esc(serviceAudienceParagraph(service, lang))}</p></div>
    <section class="seo-service-section"><h2>${esc(includesH)}</h2>${itemList || `<p>${esc(service.description || '')}</p>`}</section>
    <section class="seo-service-section"><h2>${lang === 'ru' ? 'Как проходит услуга' : lang === 'en' ? 'What to expect' : 'Ինչ սպասել'}</h2><div class="hss-prose"><p>${esc(serviceExpectParagraph(service, lang))}</p><p>${esc(serviceCarePathParagraph(service, lang))}</p></div></section>
    ${serviceConditionLinksHtml(service, lang)}
    ${relatedHtml}
    ${serviceWhenNotSuitable(lang)}
    ${editorialTrustBlock(lang)}
    ${safetyNote(lang)}
    ${emergencyRedFlagBlock(lang)}
    <p><a href="/find-a-doctor" class="hss-link">${esc(u.findDoctors)}</a> · <a href="/services" class="hss-link">← ${esc(u.allServices)}</a></p>
    ${ctaBlock(lang)}
  </article>`;
}

function hubMeta(data, lang = 'hy') {
  lang = normalizeLang(lang);
  const name = clinicDisplayName(data, lang);
  const city = ui(lang).yerevan;
  const u = ui(lang);
  if (lang === 'hy') {
    return {
      title: `${name} — Ծառայություններ և բուժում | ${city}`,
      description:
        'Վերականգնողական ծառայություններ՝ մանուալ թերապիա, ֆիզիոթերապիա և այլ թերապիաներ «Առողջ ողնաշար» կենտրոնում Երևանում։',
      h1: 'Ծառայություններ',
      tagline: 'Ողնաշարի, հոդերի և հենաշարժական համակարգի կոնսերվատիվ բուժում և վերականգնում Երևանում'
    };
  }
  return {
    title: `${name} — ${u.services} | ${city}`,
    description:
      lang === 'ru'
        ? `Реабилитационные услуги центра ${name} в ${city}.`
        : `Rehabilitation services at ${name} in ${city}.`,
    h1: u.services,
    tagline: lang === 'ru' ? 'Консервативное лечение и реабилитация позвоночника и суставов' : 'Conservative spine and joint care and rehabilitation'
  };
}

function serviceMeta(service, data, lang = 'hy') {
  lang = normalizeLang(lang);
  const name = clinicDisplayName(data, lang);
  const city = ui(lang).yerevan;
  const desc = service.description
    ? `${service.description} — ${name}, ${city}.`
    : `${service.name} — ${name}, ${city}.`;
  return {
    title: `${service.name} — ${name} | ${city}`,
    description: desc.slice(0, 160),
    h1: service.name,
    tagline: service.description || ui(lang).hubIntro
  };
}

function hubBodyHtml(data, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const categories = data?.serviceCategories || [];
  const launched = LAUNCHED_SERVICE_SLUGS.map((id) => findService(data, id)).filter(Boolean);
  const allH = lang === 'ru' ? 'Все услуги' : lang === 'en' ? 'All services' : 'Բոլոր ծառայություններ';
  const priorityBlock = `<section class="seo-service-section"><h2>${esc(allH)}</h2><ul class="hss-list">${launched
    .map((s) => `<li><a href="/services/${esc(s.id)}"><strong>${esc(s.name)}</strong></a>${s.description ? ` — ${esc(s.description)}` : ''}</li>`)
    .join('')}</ul></section>`;
  const categoryBlocks = categories
    .map((cat) => {
      const items = (data.departments || []).filter((s) => s.category === cat.id);
      if (!items.length) return '';
      return `<section class="seo-service-section" id="category-${esc(cat.id)}"><h2>${esc(cat.name || CATEGORY_LABELS[cat.id] || cat.id)}</h2><ul class="hss-list">${items
        .map((s) => {
          const link = LAUNCHED_SERVICE_SLUGS.includes(s.id)
            ? `<a href="/services/${esc(s.id)}">${esc(s.name)}</a>`
            : `<span>${esc(s.name)}</span>`;
          return `<li>${link}${s.description ? ` — ${esc(s.description)}` : ''}</li>`;
        })
        .join('')}</ul></section>`;
    })
    .join('');
  const intro =
    lang === 'hy'
      ? `«${esc(clinicDisplayName(data, lang))}» վերականգնողական կենտրոնը Երևանում մատուցում է ողնաշարի, հոդերի և հենաշարժական համակարգի կոնսերվատիվ բուժում և վերականգնում։`
      : u.hubIntro;
  return `<article class="seo-crawl-content seo-services-hub" id="seo-crawl-content">
    ${breadcrumbNavHtml([{ href: '#', label: u.services }], lang)}
    <div class="hss-prose"><p>${intro}</p><p>${esc(data.hospital?.about || '')}</p></div>
    ${priorityBlock}${categoryBlocks}
    ${ctaBlock(lang)}
  </article>`;
}

function hubJsonLd(data, url, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const meta = hubMeta(data, lang);
  return [
    {
      '@type': 'WebPage',
      name: u.services,
      url,
      description: meta.description,
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` }
    },
    clinicNode(data),
    jsonLdBreadcrumb(BASE, lang, { name: u.services, item: url })
  ];
}

function serviceJsonLd(data, service, url, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const clinic = clinicNode(data);
  return [
    {
      '@type': 'MedicalTherapy',
      name: service.name,
      description: service.description || '',
      url,
      provider: medicalClinicProvider(data)
    },
    {
      '@type': 'WebPage',
      name: service.name,
      url,
      description: service.description || '',
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` }
    },
    clinic,
    jsonLdBreadcrumb(
      BASE,
      lang,
      { name: u.services, item: `${BASE}/services` },
      { name: service.name, item: url }
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
  html = html.replace(/(<h1 id="service-hero-title">)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  html = html.replace(/(<p class="hss-hero__tagline"[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);
  html = html.replace(/(<p class="hss-hero__tagline" id="service-hero-tagline">)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);
  const rootId = fileName === 'services.html' ? 'services-hub-root' : 'service-page-root';
  if (html.includes(`id="${rootId}"`)) {
    html = html.replace(new RegExp(`(<div class="hss-wrap" id="${rootId}">)\\s*(</div>)`), `$1${bodyHtml}$2`);
  }
  html = html.replace(/<body([^>]*)>/, `<body$1 data-seo-canonical="${esc(canonicalPath)}">`);
  html = applyHtmlLang(html, lang);
  html = injectLocaleIntoLinks(html, lang);
  return normalizeRootAssetPaths(html);
}

function serveServicesHub(lang = 'hy') {
  lang = normalizeLang(lang);
  const data = localizeData(buildPublicContent(lang), lang);
  const meta = hubMeta(data, lang);
  const body = hubBodyHtml(data, lang);
  const url = `${BASE}/services`;
  return prepareHtml('services.html', meta, '/services', body, hubJsonLd(data, url, lang), lang);
}

function serveServicePage(slug, lang = 'hy') {
  if (!LAUNCHED_SERVICE_SLUGS.includes(slug)) return null;
  lang = normalizeLang(lang);
  const data = localizeData(buildPublicContent(lang), lang);
  const service = findService(data, slug);
  if (!service) return null;
  const meta = serviceMeta(service, data, lang);
  const body = serviceBodyHtml(data, service, lang);
  const url = `${BASE}/services/${slug}`;
  const html = prepareHtml('service.html', meta, `/services/${slug}`, body, serviceJsonLd(data, service, url, lang), lang);
  if (html) return html.replace('data-service-slug=""', `data-service-slug="${esc(slug)}"`);
  return html;
}

function isLaunchedServiceSlug(slug) {
  return LAUNCHED_SERVICE_SLUGS.includes(slug);
}

function getLaunchedServiceSlugs() {
  return [...LAUNCHED_SERVICE_SLUGS];
}

module.exports = {
  P3_2_LAUNCHED,
  WAVE_1_LAUNCHED,
  LAUNCHED_SERVICE_SLUGS,
  serveServicesHub,
  serveServicePage,
  isLaunchedServiceSlug,
  getLaunchedServiceSlugs
};
