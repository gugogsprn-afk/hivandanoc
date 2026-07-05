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

function ctaBlock(serviceId) {
  return `<nav class="seo-service-cta" aria-label="Next steps">
    <p><a href="/contact" class="hss-btn hss-btn--primary">Գրանցվել ընդունելության</a>
    <a href="/contact" class="hss-btn hss-btn--outline">Կապ</a>
    <a href="/locations" class="hss-link">Հասցե և ժամեր</a></p>
  </nav>`;
}

function safetyNote() {
  return `<section class="seo-service-section">
    <h2>Անվտանգություն և խորհրդատվություն</h2>
    <div class="hss-prose">
      <p>Յուրաքանչյուր բուժման պլան սկսվում է մասնագետի գնահատումից։ Ծառայությունը կարող է հարմար չլինել բոլոր դեպքերում։ 
      Խնդրում ենք կապ հաստատել կլինիկայի հետ և ներկայացնել առկա ախտորոշումները կամ ուսումնասիրությունների արդյունքները, եթե դրանք ունեք։</p>
      <p>Այս տեղեկատվությունը չի փոխարինում բժշկական խորհրդատվությունը։ Դուրսգրման կամ արտակարգ իրավիճակի դեպքում դիմեք 103 հեռախոսահամարով։</p>
    </div>
  </section>`;
}

function serviceAudienceParagraph(service) {
  const bySlug = {
    'manual-therapy':
      'Մանուալ թերապիան կարող է համարվել մասնագետների կողմից պոզանոցի, պարանոցի, կրծքային և գոտկային շրջանների մկանա-կմախքային խնդիրների գնահատման և բուժման պլանի մաս։ Այն հաճախ կիրառվում է որպես կոնսերվատիվ մոտեցման մաս՝ շարժունակության բարելավման և ցավի կառավարման աջակցության համար։',
    osteopathy:
      'Օստեոպաթիան կարող է ներառվել շարժական համակարգի վերականգնողական պլանի մեջ, երբ նպատակը հոդերի, մկանների և հոդվածների համաձայնեցված աշխատանքն է։ Սա կարող է օգնել որոշ հիվանդների ավելի հարմարավետ շարժմանը՝ մասնագիտական գնահատումից հետո։',
    physiotherapy:
      'Ֆիզիոթերապիան հաճախ ընտրվում է ցավի, բորբոքման և շարժունակության սահմանափակումների դեպքում՝ որպես բազմակողմանի վերականգնողական ծրագրի մաս։ Ապարատային մեթոդները կարող են համակցվել այլ թերապիաների հետ՝ ըստ մասնագետի ցուցումների։',
    'hernia-treatment':
      'Միջողային սկավառակի ճողվածքի կոնսերվատիվ բուժման ծրագիրը կարող է ներառվել այն հիվանդների համար, ում համար նախընտրելի է ոչ վիրահատական մոտեցում և մասնագիտական հսկողություն։ Յուրաքանչյուր դեպք գնահատվում է առանձին՝ հաշվի առնելով ախտորոշումը և բողոքները։',
    scoliosis:
      'Սկոլիոզի կոնսերվատիվ դիտարկումը և վերականգնողական աջակցությունը կարող են հարմար լինել պարանոցի և ուղղաձողի ձևի խանգարումներ ունեցող հիվանդների համար՝ մանկական և մեծահասակների դեպքերում, ըստ մասնագետի գնահատման։'
  };
  return bySlug[service.id] || 'Այս ծառայությունը կարող է մտնել վերականգնողական կենտրոնի բազմակողմանի պլանի մեջ՝ ըստ մասնագետի գնահատման։';
}

function serviceExpectParagraph(service) {
  return `«${service.name}» ծառայության ընթացքում հիվանդը, որպես կանոն, անցնում է սկզբնական խորհրդատվություն կամ գնահատում, ապա ստանում է անհատականացված պլան։ 
  Ընթացքի տևողությունը, հանդիպումների քանակը և կիրառվող մեթոդները որոշվում են մասնագետի կողմից՝ հիմնվելով կլինիկական պատկերին։ 
  Որոշ հիվանդներ նկատում են աստիճանական բարելավում շարժունակության կամ ցավի կառավարման ուղղությամբ, սակայն արդյունքները կարող են տարբեր լինել։
  Հանդիպումների միջև կարող են տրվել տնային խորհուրդներ՝ վարժությունների, դիրքի և առօրյա գործունեության վերաբերյալ, եթե դա համապատասխանում է բուժման պլանին։
  Կենտրոնում աշխատանքը, որպես կանոն, կառուցված է կոնսերվատիվ մոտեցման շուրջ՝ առանց վիրահատական միջամտության, մինչև մասնագետը այլ բան չի խորհուրի։`;
}

function serviceCarePathParagraph(service) {
  const paths = {
    'manual-therapy':
      'Մանուալ թերապիայի դեպքում գնահատումը կարող է ներառել շարժողականության ստուգում, ցավի բնույթի քննարկում և հնարավոր սահմանափակումների նույնականացում։ Թերապիայի քայլերը կարող են կիրառվել միայն այն դեպքում, երբ դրանք համապատասխանում են հիվանդի վիճակին և չեն հակասում առկա ախտորոշմանը։',
    osteopathy:
      'Օստեոպաթիական գնահատման ժամանակ մասնագետը կարող է ուսումնասիրել կեցվածքը, շարժման օրինաչափերը և մկանային լարվածությունը՝ հասկանալու, թե ինչպես է մարմինը փոխկապակցված։ Բուժման պլանը, որպես կանոն, ձևավորվում է աստիճանաբար և կարող է համակցվել այլ վերականգնողական ծառայությունների հետ։',
    physiotherapy:
      'Ֆիզիոթերապիայի ծրագիրը կարող է սկսվել ախտանիշների և ֆունկցիոնալ սահմանափակումների գնահատումից։ Ապարատային մեթոդների ընտրությունը կախված է ցավի բնույթից, բորբոքման առկայությունից և մասնագետի ցուցումներից։ Որոշ դեպքերում խորհուրդ է տրվում նաև վարժությունների կամ մանուալ մեթոդների համակցում։',
    'hernia-treatment':
      'Միջողային սկավառակի ճողվածքի կոնսերվատիվ ծրագրի դեպքում կարևոր է հաշվի առնել ախտորոշման տեսակը, ցավի ինտենսիվությունը և նյարդային ախտանիշների առկայությունը։ Մասնագետը կարող է խորհուրել տրակցիա, վերականգնողական վարժություններ, ֆիզիոթերապիա կամ այլ մեթոդներ՝ ըստ անհատական գնահատման։',
    scoliosis:
      'Սկոլիոզի դեպքում կարևոր է պարբերական դիտարկում և շարժման, կեցվածքի գնահատում։ Վերականգնողական աջակցությունը կարող է ներառել վարժություններ, կորսետավորման (օրթեզավորման) դիտարկում և հիվանդի տնային խնդրանքների քննարկում՝ միայն մասնագետի հսկողությամբ։'
  };
  return (
    paths[service.id] ||
    'Բուժման ուղին սկսվում է մասնագետի հետ խորհրդատվությունից և կարող է ներառել մի քանի փուլ՝ գնահատում, բուժման պլան և հսկողություն։'
  );
}

function serviceWhenToSeekParagraph() {
  return `Եթե ցավը չի նվազում, շարժունակությունը սահմանափակվում է կամ ախտանիշները խտանում են, խորհուրդ է տրվում կապ հաստատել կլինիկայի հետ կամ դիմել բժշկական օգնության, եթե իրավիճակը արտակարգ է։ 
  Վերականգնողական ծառայությունները չեն փոխարինում ախտորոշման կամ դեղամիջոցային բուժման ցուցումները, եթե դրանք նշանակված են բժշկի կողմից։
  Նախնական խորհրդատվությունը կարող է օգնել պարզել, թե արդյոք այս ծառայությունը հարմար է ձեր դեպքում և ինչ փաստաթղթեր կարելի է ներկայացնել առաջին այցի համար։`;
}

function serviceOverviewExtra(service) {
  const extras = {
    'manual-therapy':
      'Կենտրոնում մանուալ թերապիան կարող է համակցվել այլ վերականգնողական մեթոդների հետ՝ պոզանոցի և հոդերի խնդիրների համապարփակ կառավարման նպատակով։ Մոտեցումը կենտրոնացված է կոնսերվատիվ բուժման վրա՝ առանց վիրահատական միջամտության։',
    osteopathy:
      'Օստեոպաթիական մոտեցումը կարող է ներառել բիոդինամիկ տեխնիկաներ և մարմնի ամբողջական գնահատում՝ շարժման օրինաչափերն ու հավասարակշռությունը վերականգնելու համար։',
    physiotherapy:
      'Ֆիզիոթերապևտիկ ծրագիրը կարող է ներառել էլեկտրոթերապիա, ուլտրաձայն, մագնիսաթերապիա և լազերային մեթոդներ՝ ըստ ցուցումների և հիվանդի վիճակի։',
    'hernia-treatment':
      'Կոնսերվատիվ ծրագիրը կարող է ներառել տրակցիա, ֆիզիոթերապիա, մանուալ մեթոդներ և վերականգնողական վարժություններ՝ ցավը նվազեցնելու և ֆունկցիան պահպանելու համար։',
    scoliosis:
      'Սկոլիոզի դեպքում կարող են կիրառվել դիտարկում, վերականգնողական վարժություններ, կորսետավորման (օրթեզավորման) դիտարկում և պարբերական հսկողություն՝ միայն մասնագետի ցուցումներով։'
  };
  return extras[service.id] || '';
}

function serviceBodyHtml(data, service) {
  const h = data?.hospital || {};
  const items = Array.isArray(service.services) ? service.services : [];
  const related = relatedServices(data, service);
  const itemList = items.length
    ? `<ul class="hss-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
    : '';
  const relatedHtml = related.length
    ? `<section class="seo-service-section">
        <h2>Նմանատիպ ծառայություններ</h2>
        <ul class="hss-list">${related.map((r) => `<li><a href="/services/${esc(r.id)}">${esc(r.name)}</a></li>`).join('')}</ul>
      </section>`
    : '';

  return `<article class="seo-crawl-content seo-service-page" id="seo-crawl-content">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb">
      <a href="/">Գլխավոր</a> › <a href="/services">Ծառայություններ</a> › <span>${esc(service.name)}</span>
    </nav>
    <div class="hss-prose">
      <p>${esc(service.description || '')}</p>
      <p>${serviceOverviewExtra(service)}</p>
      <p>«${esc(clinicName(data))}» վերականգնողական կենտրոնը Երևանում աշխատում է պոզանոցի, հոդերի և շարժական համակարգի խնդիրների կոնսերվատիվ բուժման և վերականգնման ուղղությամբ։ 
      Այս ծառայությունը կարող է մտնել ընդհանուր բուժման պլանի մեջ՝ միասին այլ թերապիաների, ախտորոշման և հսկողության հետ, եթե դա համապատասխանում է մասնագետի գնահատմանը։</p>
      <p>${serviceExpectParagraph(service)}</p>
    </div>
    <section class="seo-service-section">
      <h2>Ծառայության բաղադրիչներ</h2>
      <p class="hss-prose">Ստորև ներկայացված են այս ուղղության հիմնական բաղադրիչները, որոնք կարող են ներառվել բուժման պլանում՝ ըստ մասնագետի գնահատման։ Ցանկը չի փոխարինում անհատական խորհրդատվությունը։</p>
      ${itemList || '<p>Մանրամասները հասանելի են խորհրդատվության ժամանակ։</p>'}
    </section>
    <section class="seo-service-section">
      <h2>Ում համար կարող է հարմար լինել</h2>
      <div class="hss-prose">
        <p>${serviceAudienceParagraph(service)}</p>
        <p>Վերականգնողական ծառայությունները, որպես կանոն, դիտարկվում են այն դեպքերում, երբ ցանկանում են բարելավել շարժունակությունը, նվազեցնել ցավի ազդեցությունը առօրյա գործունեության վրա կամ աջակցել վերականգնմանը վնասվածքից, վիրահատությունից կամ երկարատև նստած աշխատանքից հետո։ 
        Յուրաքանչյուր հիվանդի համար հարմարությունը որոշվում է անհատապես՝ հաշվի առնելով բողոքները, ախտորոշումը և ընդհանուր առողջական վիճակը։</p>
      </div>
    </section>
    <section class="seo-service-section">
      <h2>Ինչ սպասել</h2>
      <div class="hss-prose">
        <p>Առաջին այցի ժամանակ մասնագետը կարող է հավաքել բողոքներ, անցնել ստուգում և քննարկել հնարավոր բուժման քայլերը։ 
        Ծրագիրը կարող է ներառել մի քանի հանդիպում և տնային խորհուրդներ՝ ըստ անհատական պլանի։</p>
        <p>${serviceCarePathParagraph(service)}</p>
        <p>${serviceWhenToSeekParagraph()}</p>
        <p>Կլինիկան գտնվում է Երևանում (${esc(h.address || 'Yerevan, Armenia')})։ Հեռախոս՝ ${esc(h.phone || '')}։ 
        Այցի համար կարող եք <a href="/contact">կապ հաստատել</a> մեզ հետ։</p>
      </div>
    </section>
        ${(() => {
      const { CONDITION_CONFIG } = require('./condition-pages');
      const condSlugs = SERVICE_CONDITION_LINKS[service.id] || [];
      if (!condSlugs.length) return '';
      const items = condSlugs
        .map((id) => {
          const c = CONDITION_CONFIG[id];
          return c ? `<li><a href="/conditions/${esc(id)}">${esc(c.h1)}</a></li>` : '';
        })
        .join('');
      return `<section class="seo-service-section"><h2>Կապված ախտորոշումներ</h2><ul class="hss-list">${items}</ul><p><a href="/conditions" class="hss-link">Բոլոր ախտորոշումները</a></p></section>`;
    })()}
    ${safetyNote()}
    ${relatedHtml}
    ${(() => {
      const kSlugs = getKnowledgeLinksForService(service.id);
      if (!kSlugs.length) return '';
      const items = kSlugs
        .map((id) => {
          const c = KNOWLEDGE_CONFIG[id];
          return c ? `<li><a href="/knowledge/${esc(id)}">${esc(c.h1)}</a></li>` : '';
        })
        .join('');
      return `<section class="seo-service-section"><h2>Կապված հոդվածներ</h2><ul class="hss-list">${items}</ul><p><a href="/knowledge" class="hss-link">Գիտելիքների կենտրոն</a></p></section>`;
    })()}
    <p><a href="/services" class="hss-link">← Բոլոր ծառայությունները</a> · <a href="/knowledge" class="hss-link">Գիտելիքների կենտրոն</a> · <a href="/patient-care" class="hss-link">Բուժման ամբողջական ցանկ</a></p>
    ${ctaBlock(service.id)}
  </article>`;
}

function hubMeta(data) {
  const h = data?.hospital || {};
  const name = clinicName(data);
  return {
    title: `${name} — Ծառայություններ և բուժում | Երևան`,
    description:
      'Վերականգնողական ծառայություններ՝ մանուալ թերապիա, օստեոպաթիա, ֆիզիոթերապիա, տրակցիա, կինեզիոթերապիա, մասաժ և այլ թերապիաներ «Առողջ ողնաշար» կենտրոնում Երևանում։',
    h1: 'Ծառայություններ',
    tagline: 'Պոզանոցի, հոդերի և շարժական համակարգի կոնսերվատիվ բուժում և վերականգնում Երևանում'
  };
}

function serviceMeta(service, data) {
  const name = clinicName(data);
  const desc = service.description
    ? `${service.description} — ${name}, Երևան։`
    : `${service.name} — ${name} վերականգնողական կենտրոն, Երևան։`;
  return {
    title: `${service.name} — ${name} | Երևան`,
    description: desc.slice(0, 160),
    h1: service.name,
    tagline: service.description || 'Վերականգնողական ծառայություն Երևանում'
  };
}

function hubBodyHtml(data) {
  const h = data?.hospital || {};
  const categories = data?.serviceCategories || [];
  const launched = LAUNCHED_SERVICE_SLUGS.map((id) => findService(data, id)).filter(Boolean);

  const priorityBlock = `<section class="seo-service-section">
    <h2>Բոլոր ծառայություններ</h2>
    <ul class="hss-list">${launched
      .map(
        (s) =>
          `<li><a href="/services/${esc(s.id)}"><strong>${esc(s.name)}</strong></a>${s.description ? ` — ${esc(s.description)}` : ''}</li>`
      )
      .join('')}</ul>
  </section>`;

  const categoryBlocks = categories
    .map((cat) => {
      const items = (data.departments || []).filter((s) => s.category === cat.id);
      if (!items.length) return '';
      return `<section class="seo-service-section" id="category-${esc(cat.id)}">
        <h2>${esc(cat.name || CATEGORY_LABELS[cat.id] || cat.id)}</h2>
        <ul class="hss-list">${items
          .map((s) => {
            const launchedLink = LAUNCHED_SERVICE_SLUGS.includes(s.id)
              ? `<a href="/services/${esc(s.id)}">${esc(s.name)}</a>`
              : `<span>${esc(s.name)}</span>`;
            return `<li>${launchedLink}${s.description ? ` — ${esc(s.description)}` : ''}</li>`;
          })
          .join('')}</ul>
      </section>`;
    })
    .join('');

  return `<article class="seo-crawl-content seo-services-hub" id="seo-crawl-content">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb">
      <a href="/">Գլխավոր</a> › <span>Ծառայություններ</span>
    </nav>
    <div class="hss-prose">
      <p>«${esc(clinicName(data))}» վերականգնողական կենտրոնը Երևանում մատուցում է պոզանոցի, հոդերի և շարժական համակարգի կոնսերվատիվ բուժում և վերականգնում։ 
      Կենտրոնը կարող է առաջարկել մանուալ թերապիա, օստեոպաթիա, ֆիզիոթերապիա, խորհրդատվություն և այլ վերականգնողական ծառայություններ՝ մասնագիտական գնահատումից հետո։</p>
      <p>${esc(h.about || h.mission || '')}</p>
      <p><strong>Հասցե:</strong> ${esc(h.address || 'Yerevan, Armenia')} · <strong>Հեռախոս:</strong> ${esc(h.phone || '')}</p>
    </div>
    ${priorityBlock}
    ${categoryBlocks}
    <p><a href="/conditions" class="hss-link">Ախտորոշումներ և ցավի թեմաներ</a> · <a href="/knowledge" class="hss-link">Գիտելիքների կենտրոն</a> · <a href="/patient-care" class="hss-link">Բժշկական ծառայությունների ամբողջական ցանկ</a> · <a href="/find-a-doctor" class="hss-link">Գտնել բժիշկ</a> · <a href="/locations" class="hss-link">Հասցե</a> · <a href="/about-doctor" class="hss-link">Բժշկի մասին</a> · <a href="/spine-specialist-yerevan" class="hss-link">Ողնաշարի մասնագետ</a></p>
    ${ctaBlock('')}
  </article>`;
}

function hubJsonLd(data, url) {
  return [
    {
      '@type': 'WebPage',
      name: 'Ծառայություններ',
      url,
      description: hubMeta(data).description,
      isPartOf: { '@type': 'WebSite', name: clinicName(data), url: `${BASE}/` }
    },
    clinicNode(data),
    breadcrumb([
      { name: 'Գլխավոր', item: `${BASE}/` },
      { name: 'Ծառայություններ', item: url }
    ])
  ];
}

function serviceJsonLd(data, service, url) {
  const clinic = clinicNode(data);
  return [
    {
      '@type': 'MedicalWebPage',
      name: service.name,
      url,
      description: service.description || '',
      about: { '@type': 'MedicalTherapy', name: service.name },
      isPartOf: { '@type': 'WebSite', name: clinicName(data), url: `${BASE}/` },
      publisher: clinic
    },
    clinic,
    {
      '@type': 'MedicalTherapy',
      name: service.name,
      description: service.description || '',
      url,
      provider: medicalClinicProvider(data)
    },
    breadcrumb([
      { name: 'Գլխավոր', item: `${BASE}/` },
      { name: 'Ծառայություններ', item: `${BASE}/services` },
      { name: service.name, item: url }
    ])
  ];
}

function prepareHtml(fileName, meta, canonicalPath, bodyHtml, jsonLdGraphs) {
  const filePath = path.join(SITE_ROOT, fileName);
  if (!fs.existsSync(filePath)) return null;

  let html = fs.readFileSync(filePath, 'utf8');
  const url = `${BASE}${canonicalPath}`;

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
  html = html.replace(/(<h1 id="service-hero-title">)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  html = html.replace(
    /(<p class="hss-hero__tagline"[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/p>)/,
    `$1${esc(meta.tagline)}$2`
  );
  html = html.replace(/(<p class="hss-hero__tagline" id="service-hero-tagline">)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);

  const rootId = fileName === 'services.html' ? 'services-hub-root' : 'service-page-root';
  if (html.includes(`id="${rootId}"`)) {
    html = html.replace(new RegExp(`(<div class="hss-wrap" id="${rootId}">)\\s*(</div>)`), `$1${bodyHtml}$2`);
  }

  html = html.replace(/<body([^>]*)>/, `<body$1 data-seo-canonical="${esc(canonicalPath)}">`);

  return normalizeRootAssetPaths(html);
}

function serveServicesHub() {
  const data = buildPublicContent('hy');
  const meta = hubMeta(data);
  const body = hubBodyHtml(data);
  const url = `${BASE}/services`;
  return prepareHtml('services.html', meta, '/services', body, hubJsonLd(data, url));
}

function serveServicePage(slug) {
  if (!LAUNCHED_SERVICE_SLUGS.includes(slug)) return null;
  const data = buildPublicContent('hy');
  const service = findService(data, slug);
  if (!service) return null;

  const meta = serviceMeta(service, data);
  const body = serviceBodyHtml(data, service);
  const url = `${BASE}/services/${slug}`;
  const html = prepareHtml('service.html', meta, `/services/${slug}`, body, serviceJsonLd(data, service, url));
  if (html) {
    return html.replace('data-service-slug=""', `data-service-slug="${esc(slug)}"`);
  }
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
