const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '../..');
const LANGS = ['hy', 'ru', 'en'];

const BRAND = {
  hy: 'Առողջ ողնաշար',
  ru: 'Здоровый позвоночник',
  en: 'Healthy Spine'
};

const UI = {
  hy: {
    home: 'Գլխավոր',
    services: 'Ծառայություններ',
    conditions: 'Ախտորոշումներ',
    knowledge: 'Գիտելիքների կենտրոն',
    findDoctor: 'Գտնել բժիշկ',
    about: 'Մեր մասին',
    contact: 'Կապ',
    locations: 'Հասցեներ',
    patientCare: 'Բուժում և ծառայություններ',
    consultation: 'Խորհրդատվության գործընթաց',
    phone: 'Հեռախոս.',
    email: 'Էլ. փոստ.',
    address: 'Հասցե.',
    hours: 'Աշխատանքային ժամեր.',
    bookConsultation: '→ Գրանցվել խորհրդատվության',
    bookAppointment: 'Գրանցվել ընդունելության',
    ourDoctors: 'Մեր բժիշկները',
    allServices: 'Բոլոր ծառայությունները',
    relatedArticles: 'Կապված հոդվածներ',
    symptoms: 'Ախտանիշներ',
    whenToSeek: 'Երբ դիմել մասնագետ',
    relatedServices: 'Կապված ծառայություններ',
    disclaimer:
      'Այս էջը տեղեկատվական է և չի փոխարինում բժշկական խորհրդատվությանը։ Արդյունքները կարող են տարբեր լինել։',
    hubIntro:
      'Կենտրոնը կարող է առաջարկել կոնսերվատիվ գնահատում և վերականգնողական ծրագրեր՝ մասնագետի գնահատումից հետո։',
    yerevan: 'Երևան',
    emergencyTitle: 'Երբ դիմել շտապ բժշկական օգնության',
    editorialTrust:
      'Բովանդակությունը պատրաստված է «Առողջ ողնաշար» խմբագրական թիմի կողմից և վերանայվում է պարզության և հիվանդների անվտանգության համար։',
    infoVerified: 'Տվյալները ճշտվում են',
    education: 'Կրթություն',
    experience: 'Փորձ',
    languages: 'Լեզուներ',
    specialties: 'Մասնագիտացում',
    consultFor: 'Ինչի համար կարող եք դիմել',
    viewProfile: 'Դիտել պրոֆիլը',
    findDoctors: 'Գտնել մասնագետ',
    relatedConditions: 'Կապված ախտորոշումներ',
    whenNotSuitable: 'Երբ ծառայությունը կարող է հարմար չլինել',
    howVisitWorks: 'Ինչպես է սովորաբար ընթանում այցը',
    updatedLabel: 'Թարմացվել է'
  },
  ru: {
    home: 'Главная',
    services: 'Услуги',
    conditions: 'Диагнозы',
    knowledge: 'База знаний',
    findDoctor: 'Найти врача',
    about: 'О нас',
    contact: 'Контакты',
    locations: 'Адреса',
    patientCare: 'Лечение и услуги',
    consultation: 'Как проходит консультация',
    phone: 'Телефон:',
    email: 'Эл. почта:',
    address: 'Адрес:',
    hours: 'Режим работы:',
    bookConsultation: '→ Записаться на консультацию',
    bookAppointment: 'Записаться на приём',
    ourDoctors: 'Наши врачи',
    allServices: 'Все услуги',
    relatedArticles: 'Связанные статьи',
    symptoms: 'Симптомы',
    whenToSeek: 'Когда обратиться к специалисту',
    relatedServices: 'Связанные услуги',
    disclaimer:
      'Эта страница носит информационный характер и не заменяет консультацию врача. Результаты могут отличаться.',
    hubIntro:
      'Центр может предложить консервативную оценку и реабилитационные программы после оценки специалиста.',
    yerevan: 'Ереван',
    emergencyTitle: 'Когда обращаться за неотложной помощью',
    editorialTrust:
      'Материалы подготовлены редакционной командой «Здоровый позвоночник» и проверяются на ясность и безопасность для пациентов.',
    infoVerified: 'Информация уточняется',
    education: 'Образование',
    experience: 'Опыт',
    languages: 'Языки',
    specialties: 'Специализация',
    consultFor: 'По каким вопросам можно обратиться',
    viewProfile: 'Открыть профиль',
    findDoctors: 'Найти специалиста',
    relatedConditions: 'Связанные диагнозы',
    whenNotSuitable: 'Когда услуга может быть неподходящей',
    howVisitWorks: 'Как обычно проходит визит',
    updatedLabel: 'Обновлено'
  },
  en: {
    home: 'Home',
    services: 'Services',
    conditions: 'Conditions',
    knowledge: 'Knowledge center',
    findDoctor: 'Find a doctor',
    about: 'About us',
    contact: 'Contact',
    locations: 'Locations',
    patientCare: 'Patient care',
    consultation: 'Consultation process',
    phone: 'Phone:',
    email: 'Email:',
    address: 'Address:',
    hours: 'Opening hours:',
    bookConsultation: '→ Book a consultation',
    bookAppointment: 'Book an appointment',
    ourDoctors: 'Our doctors',
    allServices: 'All services',
    relatedArticles: 'Related articles',
    symptoms: 'Symptoms',
    whenToSeek: 'When to see a specialist',
    relatedServices: 'Related services',
    disclaimer:
      'This page is for information only and does not replace medical advice. Results may vary.',
    hubIntro:
      'The center may offer conservative assessment and rehabilitation programs after specialist evaluation.',
    yerevan: 'Yerevan',
    emergencyTitle: 'When to seek urgent medical care',
    editorialTrust:
      'Content is prepared by the Healthy Spine editorial team and reviewed for clarity and patient safety.',
    infoVerified: 'Information is being verified',
    education: 'Education',
    experience: 'Experience',
    languages: 'Languages',
    specialties: 'Specialties',
    consultFor: 'What you can consult about',
    viewProfile: 'View profile',
    findDoctors: 'Find a specialist',
    relatedConditions: 'Related conditions',
    whenNotSuitable: 'When the service may not be suitable',
    howVisitWorks: 'How a visit usually works',
    updatedLabel: 'Updated'
  }
};

const EMERGENCY_TEXT = {
  hy: 'Ուժեղ կամ արագ վատթարացող ցավի, թուլության, միզապարկի կամ աղիքների վերահսկման խանգարման, վնասվածքի կամ ջերմության դեպքում դիմեք շտապ բժշկական օգնության։',
  ru: 'При сильной или быстро усиливающейся боли, слабости, нарушении контроля мочевого пузыря или кишечника, травме или температуре обратитесь за неотложной медицинской помощью.',
  en: 'Seek urgent medical care for severe or rapidly worsening pain, weakness, bladder or bowel control problems, injury, or fever.'
};

let dictCache = {};

/** First valid hy|ru|en from Express query (string or duplicate array). */
function parseLangParam(raw) {
  if (raw == null || raw === '') return null;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const parsed = parseLangParam(item);
      if (parsed) return parsed;
    }
    return null;
  }
  const code = String(raw).trim().toLowerCase();
  return LANGS.includes(code) ? code : null;
}

function normalizeLang(raw) {
  return parseLangParam(raw) || 'hy';
}

function loadLangDict(lang = 'hy') {
  lang = normalizeLang(lang);
  if (dictCache[lang]) return dictCache[lang];
  try {
    dictCache[lang] = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, `lang/${lang}.json`), 'utf8'));
  } catch {
    dictCache[lang] = {};
  }
  return dictCache[lang];
}

function dictPath(dict, key) {
  return key.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), dict);
}

function ui(lang) {
  return UI[normalizeLang(lang)] || UI.hy;
}

function brandName(lang) {
  return BRAND[normalizeLang(lang)] || BRAND.hy;
}

function clinicDisplayName(data, lang) {
  lang = normalizeLang(lang);
  if (lang === 'hy') return data?.hospital?.name || BRAND.hy;
  return brandName(lang);
}

function pageMetaFromDict(pageKey, lang, data) {
  lang = normalizeLang(lang);
  const dict = loadLangDict(lang);
  const pages = dict.pages || {};
  const block = pages[pageKey] || {};
  const name = clinicDisplayName(data, lang);
  return {
    title: block.title || `${name}`,
    description: block.seoDescription || block.heroDesc || dict.meta?.siteDescription || '',
    h1: block.heroTitle || block.heroLabel || block.title?.split('—')[0]?.trim() || name,
    tagline: block.heroDesc || block.heroSubtitle || data?.hospital?.heroTagline || ''
  };
}

function breadcrumbSchema(items) {
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

function breadcrumbItems(names, baseUrl, lang) {
  const u = ui(lang);
  const items = [{ name: u.home, item: `${baseUrl}/` }];
  names.forEach((name, i) => {
    items.push({ name, item: i === names.length - 1 ? arguments[3] : undefined });
  });
  return items;
}

function breadcrumbNavHtml(segments, lang) {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const parts = [`<a href="${localeHref('/', lang)}">${esc(u.home)}</a>`];
  segments.forEach((seg, i) => {
    if (i < segments.length - 1) {
      parts.push(`<a href="${esc(localeHref(seg.href, lang))}">${esc(seg.label)}</a>`);
    } else {
      parts.push(`<span>${esc(seg.label)}</span>`);
    }
  });
  return `<nav class="seo-breadcrumb" aria-label="Breadcrumb">${parts.join(' › ')}</nav>`;
}

function jsonLdBreadcrumb(base, lang, ...crumbs) {
  const u = ui(lang);
  const items = [{ name: u.home, item: `${base}/` }, ...crumbs];
  return breadcrumbSchema(items);
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyHtmlLang(html, lang) {
  lang = normalizeLang(lang);
  if (html.includes('<html lang=')) {
    return html.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  }
  return html.replace('<html>', `<html lang="${lang}">`);
}

/** Append ?lang=ru|en to internal paths; HY uses clean URLs. */
function localeHref(path, lang = 'hy') {
  lang = normalizeLang(lang);
  if (!path || path === '#' || lang === 'hy') return path || '/';
  if (/^(mailto:|tel:|javascript:|https?:)/i.test(path)) return path;
  if (!path.startsWith('/')) return path;

  const hashIdx = path.indexOf('#');
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : '';
  const base = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const qIdx = base.indexOf('?');
  const pathname = qIdx >= 0 ? base.slice(0, qIdx) : base;
  const params = new URLSearchParams(qIdx >= 0 ? base.slice(qIdx + 1) : '');
  params.set('lang', lang);
  const qs = params.toString();
  return `${pathname}?${qs}${hash}`;
}

/** Rewrite anchor href attributes for RU/EN SSR output. Skips stylesheets and other link tags. */
function injectLocaleIntoLinks(html, lang = 'hy') {
  lang = normalizeLang(lang);
  if (lang === 'hy' || !html) return html;
  return html.replace(/<a\b([^>]*?)\bhref="(\/[^"]*)"/gi, (full, attrs, path) => {
    if (/^(mailto:|tel:|javascript:|https?:)/i.test(path)) return full;
    return `<a${attrs}href="${localeHref(path, lang)}"`;
  });
}

function localizedAddress(h, lang) {
  if (lang === 'ru') return h.address || 'ул. Маргарян, 6, Ереван 0078';
  if (lang === 'en') return h.address || '6 Margaryan St, Yerevan 0078';
  return h.address || '6 Մարգարյան փ., Երևան 0078';
}

function contactBlockHtml(data, lang, variant = 'contact', options = {}) {
  const h = data?.hospital || {};
  const u = ui(lang);
  const phone = h.phone || '';
  const phoneClean = phone.replace(/[^+\d]/g, '');
  const email = h.email || 'info@healthyspine.am';
  const address = localizedAddress(h, lang);
  const map =
    variant === 'locations'
      ? `<p><strong>${esc(u.address)}</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(h.mapsQuery || address)}" target="_blank" rel="noopener">${esc(address)}</a></p><p>${lang === 'ru' ? 'Карта и маршрут доступны на этой странице.' : lang === 'en' ? 'Map and directions are available on this page.' : 'Քարտեզը և ուղղությունները հասանելի են այս էջում։'}</p>`
      : '';
  const blockId = options.nested ? 'seo-contact-block' : 'seo-crawl-content';
  return `<section class="seo-crawl-content hss-contact-block" id="${blockId}">
    <p><strong>${esc(u.phone)}</strong> <a href="tel:${phoneClean}" class="hss-tel">${esc(phone)}</a></p>
    <p><strong>${esc(u.email)}</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
    <p><strong>${esc(u.hours)}</strong> ${esc(h.hours || '')}</p>
    ${map}
    <p style="margin-top:0.5em"><a href="${localeHref('/consultation-process', lang)}" class="hss-link hss-cta-link">${esc(u.bookConsultation)}</a></p>
  </section>`;
}

function emergencyRedFlagBlock(lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  return `<section class="seo-service-section hss-emergency-note">
    <h2>${esc(u.emergencyTitle)}</h2>
    <div class="hss-prose"><p>${esc(EMERGENCY_TEXT[lang] || EMERGENCY_TEXT.hy)}</p></div>
  </section>`;
}

function editorialTrustBlock(lang = 'hy') {
  const u = ui(normalizeLang(lang));
  return `<aside class="hss-editorial-trust"><p><em>${esc(u.editorialTrust)}</em></p></aside>`;
}

function safetyNoteBlock(lang = 'hy') {
  const u = ui(normalizeLang(lang));
  const h2 =
    lang === 'ru' ? 'Важное примечание' : lang === 'en' ? 'Important note' : 'Կարևոր նշում';
  return `<section class="seo-service-section">
    <h2>${esc(h2)}</h2>
    <div class="hss-prose"><p>${esc(u.disclaimer)}</p></div>
  </section>`;
}

function ctaBlockHtml(lang = 'hy') {
  const u = ui(normalizeLang(lang));
  return `<nav class="seo-service-cta" aria-label="Next steps">
    <p><a href="${localeHref('/contact', lang)}" class="hss-btn hss-btn--primary">${esc(u.bookAppointment)}</a>
    <a href="${localeHref('/consultation-process', lang)}" class="hss-btn hss-btn--outline">${esc(u.consultation)}</a>
    <a href="${localeHref('/find-a-doctor', lang)}" class="hss-link">${esc(u.findDoctors)}</a></p>
  </nav>`;
}

function resetDictCache() {
  dictCache = {};
}

module.exports = {
  LANGS,
  BRAND,
  UI,
  parseLangParam,
  normalizeLang,
  loadLangDict,
  dictPath,
  ui,
  brandName,
  clinicDisplayName,
  pageMetaFromDict,
  breadcrumbSchema,
  breadcrumbNavHtml,
  jsonLdBreadcrumb,
  esc,
  applyHtmlLang,
  localizedAddress,
  localeHref,
  injectLocaleIntoLinks,
  contactBlockHtml,
  emergencyRedFlagBlock,
  editorialTrustBlock,
  safetyNoteBlock,
  ctaBlockHtml,
  EMERGENCY_TEXT,
  resetDictCache
};
