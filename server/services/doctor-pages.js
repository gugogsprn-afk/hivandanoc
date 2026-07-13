const fs = require('fs');
const path = require('path');
const { buildPublicContent } = require('../db/helpers');
const { clinicNode, medicalClinicProvider, physicianNode } = require('./entity-schema');
const { normalizeRootAssetPaths } = require('./html-utils');
const {
  normalizeLang,
  ui,
  clinicDisplayName,
  breadcrumbNavHtml,
  jsonLdBreadcrumb,
  applyHtmlLang,
  localizedAddress,
  injectLocaleIntoLinks,
  localeHref,
  esc,
  emergencyRedFlagBlock,
  editorialTrustBlock,
  safetyNoteBlock,
  ctaBlockHtml
} = require('./i18n-ssr');

const SITE_ROOT = path.join(__dirname, '../..');
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');

const DOCTOR_SERVICE_MAP = {
  'doc-1': ['manual-therapy', 'osteopathy'],
  'doc-2': ['consult-spine', 'arthrosis', 'sports-rehab'],
  'doc-3': ['kinesiotherapy', 'physiotherapy', 'scoliosis'],
  'doc-4': ['physiotherapy', 'electrotherapy', 'traction'],
  'doc-5': ['consult-neuro', 'radiculitis', 'sciatica'],
  'doc-6': ['consult-spine', 'physiotherapy']
};

const DOCTOR_CONDITION_MAP = {
  'doc-1': ['back-pain-treatment', 'neck-pain-treatment', 'posture-disorders'],
  'doc-2': ['back-pain-treatment', 'joint-pain', 'shoulder-pain'],
  'doc-3': ['scoliosis-pain', 'posture-disorders', 'back-pain-treatment'],
  'doc-4': ['back-pain-treatment', 'osteochondrosis', 'radiculopathy'],
  'doc-5': ['sciatica', 'leg-numbness', 'radiculopathy', 'herniated-disc'],
  'doc-6': ['joint-pain', 'shoulder-pain', 'back-pain-treatment']
};

function findDoctor(data, slugOrId) {
  return (data?.doctors || []).find((d) => d.slug === slugOrId || d.id === slugOrId);
}

function findService(data, id) {
  return (data?.departments || []).find((s) => s.id === id);
}

function headTags(meta, canonicalPath) {
  const url = `${BASE}${canonicalPath}`;
  const image = `${BASE}/images/brand/logo.png`;
  return `<link rel="icon" href="${BASE}/favicon.ico">
    <link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">
    <meta name="description" content="${esc(meta.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="profile">
    <meta property="og:site_name" content="Healthy Spine">
    <meta property="og:title" content="${esc(meta.title)}">
    <meta property="og:description" content="${esc(meta.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">`;
}

function injectJsonLdScript(graphs) {
  const filtered = graphs.filter(Boolean);
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': filtered })}</script>`;
}

function doctorMeta(doctor, data, lang = 'hy') {
  lang = normalizeLang(lang);
  const name = clinicDisplayName(data, lang);
  const city = ui(lang).yerevan;
  const role = doctor.role || '';
  return {
    title: `${doctor.name}${role ? ` — ${role}` : ''} | ${name}`,
    description: (doctor.bio || `${doctor.name} — ${role}`).slice(0, 160),
    h1: doctor.name,
    tagline: role || ui(lang).findDoctors
  };
}

function verifiedField(value, lang) {
  if (value && String(value).trim()) return value;
  return ui(lang).infoVerified;
}

function localizedExperience(doctor, lang) {
  lang = normalizeLang(lang);
  if (!doctor.experience) return ui(lang).infoVerified;
  const raw = String(doctor.experience);
  if (lang === 'en' && /[А-Ֆа-ֆА-Яа-яЁё]/.test(raw)) {
    const m = raw.match(/(\d+)/);
    return m ? `${m[1]} years` : ui(lang).infoVerified;
  }
  return raw;
}

function serviceLinksHtml(data, doctor, lang) {
  const u = ui(lang);
  const slugs = DOCTOR_SERVICE_MAP[doctor.id] || (doctor.departmentId ? [doctor.departmentId] : []);
  const items = slugs
    .map((id) => findService(data, id))
    .filter(Boolean)
    .map((s) => `<li><a href="${localeHref(`/services/${esc(s.id)}`, lang)}">${esc(s.name)}</a></li>`)
    .join('');
  if (!items) return '';
  return `<section class="seo-service-section"><h2>${esc(u.relatedServices)}</h2><ul class="hss-list">${items}</ul></section>`;
}

function conditionLinksHtml(doctor, lang) {
  const { getConditionConfig } = require('./condition-pages');
  const u = ui(lang);
  const slugs = DOCTOR_CONDITION_MAP[doctor.id] || [];
  if (!slugs.length) return '';
  const items = slugs
    .map((id) => {
      const c = getConditionConfig(id, lang);
      if (!c) return '';
      return `<li><a href="${localeHref(`/conditions/${esc(id)}`, lang)}">${esc(c.h1)}</a></li>`;
    })
    .join('');
  return `<section class="seo-service-section"><h2>${esc(u.relatedConditions)}</h2><ul class="hss-list">${items}</ul></section>`;
}

function doctorBodyHtml(data, doctor, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const h = data?.hospital || {};
  const addr = localizedAddress(h, lang);
  const consultIntro =
    lang === 'ru'
      ? 'На консультации можно обсудить ваши жалобы, имеющиеся исследования и возможные шаги восстановления после оценки специалиста.'
      : lang === 'en'
        ? 'At a consultation you can discuss your symptoms, existing studies, and possible recovery steps after specialist assessment.'
        : 'Խորհրդատվության ժամանակ կարող եք քննարկել ձեր բողոքները, առկա ուսումնասիրությունները և վերականգնման հնարավոր քայլերը՝ մասնագետի գնահատումից հետո։';

  return `<article class="seo-crawl-content seo-doctor-page" id="seo-crawl-content">
    ${breadcrumbNavHtml(
      [
        { href: '/find-a-doctor', label: u.findDoctor },
        { href: '#', label: doctor.name }
      ],
      lang
    )}
    <div class="hss-prose">
      <p><strong>${esc(u.specialties)}:</strong> ${esc(doctor.role || u.infoVerified)}</p>
      ${doctor.bio ? `<p>${esc(doctor.bio)}</p>` : ''}
      <p>${esc(consultIntro)}</p>
    </div>
    <section class="seo-service-section">
      <h2>${esc(u.consultFor)}</h2>
      <div class="hss-prose"><p>${esc(consultIntro)}</p></div>
    </section>
    <section class="seo-service-section">
      <h2>${esc(u.education)}</h2>
      <p>${esc(verifiedField(doctor.education, lang))}</p>
    </section>
    <section class="seo-service-section">
      <h2>${esc(u.experience)}</h2>
      <p>${esc(localizedExperience(doctor, lang))}</p>
    </section>
    <section class="seo-service-section">
      <h2>${esc(u.languages)}</h2>
      <p>${esc(verifiedField(doctor.languages, lang))}</p>
    </section>
    ${serviceLinksHtml(data, doctor, lang)}
    ${conditionLinksHtml(doctor, lang)}
    <section class="seo-service-section">
      <p><strong>${esc(u.address)}</strong> ${esc(doctor.location || addr)}</p>
      <p><strong>${esc(u.phone)}</strong> ${esc(h.phone || '')} · <strong>${esc(u.email)}</strong> ${esc(h.email || 'info@healthyspine.am')}</p>
    </section>
    ${editorialTrustBlock(lang)}
    ${safetyNoteBlock(lang)}
    ${emergencyRedFlagBlock(lang)}
    <p><a href="${localeHref('/find-a-doctor', lang)}" class="hss-link">← ${esc(u.findDoctor)}</a></p>
    ${ctaBlockHtml(lang)}
  </article>`;
}

function doctorJsonLd(data, doctor, url, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const meta = doctorMeta(doctor, data, lang);
  const physician = physicianNode(doctor, data, url);
  return [
    physician,
    {
      '@type': 'WebPage',
      name: meta.h1,
      url,
      description: meta.description,
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` }
    },
    clinicNode(data),
    jsonLdBreadcrumb(
      BASE,
      lang,
      { name: u.findDoctor, item: `${BASE}/find-a-doctor` },
      { name: doctor.name, item: url }
    )
  ].filter(Boolean);
}

function prepareHtml(meta, slug, bodyHtml, jsonLdGraphs, lang = 'hy') {
  const filePath = path.join(SITE_ROOT, 'doctor.html');
  if (!fs.existsSync(filePath)) return null;
  let html = fs.readFileSync(filePath, 'utf8');
  const canonicalPath = `/doctors/${slug}`;

  html = html.replace(/<meta name="description"[^>]*>/gi, '');
  html = html.replace(/<link rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = html.replace('</head>', `${headTags(meta, canonicalPath)}\n${injectJsonLdScript(jsonLdGraphs)}\n</head>`);
  html = html.replace(/(<h1 id="doctor-hero-title">)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  html = html.replace(/(<p class="hss-hero__tagline" id="doctor-hero-tagline">)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);
  html = html.replace(/(<div class="hss-wrap" id="doctor-page-root">)\s*(<\/div>)/, `$1${bodyHtml}$2`);
  html = html.replace(/<body([^>]*)>/, `<body$1 data-seo-canonical="${esc(canonicalPath)}" data-doctor-slug="${esc(slug)}">`);
  html = applyHtmlLang(html, lang);
  html = injectLocaleIntoLinks(html, lang);
  return normalizeRootAssetPaths(html);
}

function serveDoctorPage(slug, lang = 'hy') {
  lang = normalizeLang(lang);
  const data = buildPublicContent(lang);
  if (data?.hospital) data.hospital = { ...data.hospital, name: clinicDisplayName(data, lang) };
  const doctor = findDoctor(data, slug);
  if (!doctor) return null;
  const doctorSlug = doctor.slug || doctor.id;
  const meta = doctorMeta(doctor, data, lang);
  const body = doctorBodyHtml(data, doctor, lang);
  const url = `${BASE}/doctors/${doctorSlug}`;
  return prepareHtml(meta, doctorSlug, body, doctorJsonLd(data, doctor, url, lang), lang);
}

function getPublishedDoctorSlugs(data) {
  return (data?.doctors || []).map((d) => d.slug || d.id).filter(Boolean);
}

module.exports = {
  serveDoctorPage,
  getPublishedDoctorSlugs,
  findDoctor,
  DOCTOR_SERVICE_MAP,
  DOCTOR_CONDITION_MAP
};
