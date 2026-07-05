const fs = require('fs');
const path = require('path');
const { buildPublicContent } = require('../db/helpers');
const { getLaunchedServiceSlugs } = require('./service-pages');
const { clinicNode, localBusinessNode, clinicName } = require('./entity-schema');
const { normalizeRootAssetPaths } = require('./html-utils');

const SITE_ROOT = path.join(__dirname, '../..');
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');

let hyDictCache = null;

function loadLangDict(lang = 'hy') {
  if (lang === 'hy' && hyDictCache) return hyDictCache;
  try {
    const dict = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, `lang/${lang}.json`), 'utf8'));
    if (lang === 'hy') hyDictCache = dict;
    return dict;
  } catch {
    return {};
  }
}

function dictPath(dict, key) {
  return key.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), dict);
}

function normalizeLang(raw) {
  return ['hy', 'ru', 'en'].includes(raw) ? raw : 'hy';
}

const HOME_CRAWL = {
  hy: {
    navAria: 'Կայքի բաժիններ',
    conditionsH: 'Բուժվող վիճակներ',
    phone: 'Հեռախոս.',
    email: 'Էլ. փոստ.',
    address: 'Հասցե.',
    cta: '→ Գրանցվել խորհրդատվության',
    fallbackAbout: '«Առողջ ողնաշար» — ողնաշարի և հոդերի վերականգնողական կենտրոն Երևանում։',
    nav: [
      ['/services', 'Ծառայություններ'],
      ['/conditions', 'Ախտորոշումներ'],
      ['/knowledge', 'Գիտելիքների կենտրոն'],
      ['/patient-care', 'Բուժում և ծառայություններ'],
      ['/find-a-doctor', 'Գտնել բժիշկ'],
      ['/locations', 'Հասցեներ'],
      ['/contact', 'Կապ'],
      ['/about', 'Մեր մասին'],
      ['/consultation-process', 'Խորհրդատվության գործընթաց']
    ],
    extraLinks:
      '<p><a href="/conditions/back-pain-treatment">Մեջքի ցավ</a> · <a href="/conditions/neck-pain-treatment">Պարանոցի ցավ</a> · <a href="/conditions/sciatica">Իշիաս</a> · <a href="/conditions/herniated-disc">Սկավառակի ճողվածք</a> · <a href="/conditions/lower-back-pain">Գոտկային ցավ</a> · <a href="/conditions">Բոլոր ախտորոշումները</a></p>' +
      '<p><a href="/knowledge">Գիտելիքների կենտրոն</a> · <a href="/knowledge/back-pain-causes">Մեջքի ցավի պատճառներ</a> · <a href="/consultation-process">Խորհրդատվության գործընթաց</a> · <a href="/spine-specialist-yerevan">Ողնաշարի մասնագետ</a></p>'
  },
  ru: {
    navAria: 'Разделы сайта',
    conditionsH: 'Лечимые состояния',
    phone: 'Телефон:',
    email: 'Эл. почта:',
    address: 'Адрес:',
    cta: '→ Записаться на консультацию',
    fallbackAbout:
      '«Здоровый позвоночник» — реабилитационный центр консервативного лечения заболеваний позвоночника, суставов и опорно-двигательного аппарата в Ереване.',
    nav: [
      ['/services', 'Услуги'],
      ['/conditions', 'Диагнозы'],
      ['/knowledge', 'База знаний'],
      ['/patient-care', 'Лечение и услуги'],
      ['/find-a-doctor', 'Найти врача'],
      ['/locations', 'Адреса'],
      ['/contact', 'Контакты'],
      ['/about', 'О нас'],
      ['/consultation-process', 'Как проходит консультация']
    ],
    extraLinks:
      '<p><a href="/conditions/back-pain-treatment">Боль в спине</a> · <a href="/conditions/neck-pain-treatment">Боль в шее</a> · <a href="/conditions/sciatica">Ишиас</a> · <a href="/conditions/herniated-disc">Грыжа диска</a> · <a href="/conditions">Все диагнозы</a></p>' +
      '<p><a href="/knowledge">База знаний</a> · <a href="/consultation-process">Консультация</a> · <a href="/spine-specialist-yerevan">Специалист по позвоночнику</a> · <a href="/editorial-policy">Редакционная политика</a></p>'
  },
  en: {
    navAria: 'Site sections',
    conditionsH: 'Conditions we treat',
    phone: 'Phone:',
    email: 'Email:',
    address: 'Address:',
    cta: '→ Book a consultation',
    fallbackAbout:
      'Healthy Spine is a rehabilitation center in Yerevan offering conservative care for spine, joint, and musculoskeletal conditions.',
    nav: [
      ['/services', 'Services'],
      ['/conditions', 'Conditions'],
      ['/knowledge', 'Knowledge center'],
      ['/patient-care', 'Patient care'],
      ['/find-a-doctor', 'Find a doctor'],
      ['/locations', 'Locations'],
      ['/contact', 'Contact'],
      ['/about', 'About us'],
      ['/consultation-process', 'Consultation process']
    ],
    extraLinks:
      '<p><a href="/conditions/back-pain-treatment">Back pain</a> · <a href="/conditions/neck-pain-treatment">Neck pain</a> · <a href="/conditions/sciatica">Sciatica</a> · <a href="/conditions/herniated-disc">Herniated disc</a> · <a href="/conditions">All conditions</a></p>' +
      '<p><a href="/knowledge">Knowledge center</a> · <a href="/consultation-process">Consultation</a> · <a href="/spine-specialist-yerevan">Spine specialist</a> · <a href="/editorial-policy">Editorial policy</a></p>'
  }
};

function localizedClinicName(h, lang) {
  if (lang === 'ru') return 'Здоровый позвоночник';
  if (lang === 'en') return 'Healthy Spine';
  return h.name || 'Առողջ ողնաշար';
}

function localizedClinicAbout(h, lang, ui) {
  if (lang !== 'hy') return ui.fallbackAbout;
  const dict = loadLangDict('hy');
  const intro = dict.content?.introParagraphs;
  if (Array.isArray(intro) && intro[0]) return intro[0];
  return h.about || ui.fallbackAbout;
}

function localizedClinicAddress(h, lang) {
  if (lang === 'ru') return h.address || 'ул. Маргарян, 6, Ереван 0078';
  if (lang === 'en') return h.address || '6 Margaryan St, Yerevan 0078';
  return h.address || '6 Մարգարյան փ., Երևան 0078';
}

function homeCrawlBlock(data, lang = 'hy') {
  lang = normalizeLang(lang);
  const ui = HOME_CRAWL[lang] || HOME_CRAWL.hy;
  const h = data?.hospital || {};
  const dict = loadLangDict(lang);
  const conditions = (dict.content?.conditions || data?.conditions || []).slice(0, 8);
  const conditionItems = conditions.length
    ? conditions.map((c) => `<li>${esc(typeof c === 'string' ? c : c.name || c)}</li>`).join('')
    : '';
  const navLinks = ui.nav.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join(' ·\n      ');
  const nav = `<nav class="seo-crawl-nav" aria-label="${esc(ui.navAria)}">${navLinks}</nav>`;
  const email = h.email || 'info@healthyspine.am';
  const address = localizedClinicAddress(h, lang);
  const displayName = localizedClinicName(h, lang);
  const aboutText = localizedClinicAbout(h, lang, ui);
  return `<section class="seo-crawl-content" id="seo-crawl-content">
    <h2>${esc(displayName)}</h2>
    <p>${esc(aboutText)}</p>
    ${lang === 'hy' && h.mission && h.about ? `<p>${esc(h.mission)}</p>` : ''}
    ${conditionItems ? `<h3>${esc(ui.conditionsH)}</h3><ul>${conditionItems}</ul>` : ''}
    ${ui.extraLinks}
    <p><strong>${esc(ui.phone)}</strong> <a href="tel:${(h.phone || '').replace(/[^+\d]/g, '')}" class="hss-tel">${esc(h.phone || '')}</a> · <strong>${esc(ui.email)}</strong> <a href="mailto:${esc(email)}">${esc(email)}</a> · <strong>${esc(ui.address)}</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(h.mapsQuery || address)}" target="_blank" rel="noopener">${esc(address)}</a></p>
    <p style="margin-top:0.5em"><a href="/consultation-process" class="hss-link hss-cta-link">${esc(ui.cta)}</a></p>
    ${nav}
  </section>`;
}

function resolveRouteMeta(route, data, lang = 'hy') {
  if (typeof route.resolveMeta === 'function') return route.resolveMeta(data, lang);
  return {
    title: route.title,
    description: route.description,
    h1: route.h1,
    tagline: route.tagline
  };
}

/** Clean URL → source HTML file + SEO profile */
const ROUTES = {
  '/': {
    file: 'index.html',
    pageKey: 'home',
    resolveMeta: (data, lang = 'hy') => {
      lang = normalizeLang(lang);
      const dict = loadLangDict(lang);
      const home = dict.pages?.home || {};
      const h = data?.hospital || {};
      const name = h.name || (lang === 'ru' ? 'Здоровый позвоночник' : lang === 'en' ? 'Healthy Spine' : 'Առողջ ողնաշար');
      return {
        title: home.title || `${name} — ${lang === 'ru' ? 'Реабилитационный центр' : lang === 'en' ? 'Rehabilitation Center' : 'Վերականգնողական կենտրոն'}`,
        description: dict.meta?.siteDescription || h.heroTagline || h.about || '',
        h1: name,
        tagline: home.heroSubtitle || h.heroTagline || h.tagline || ''
      };
    },
    bodyHtml: (data, lang) => homeCrawlBlock(data, lang),
    jsonLd: (data, url) => [clinicNode(data), breadcrumb(url, 'Գլխավոր')]
  },
  '/find-a-doctor': {
    file: 'doctors.html',
    pageKey: 'doctors',
    title: 'Գտնել բժիշկ — Առողջ ողնաշար',
    description:
      'Գտեք ողնաշարի, հոդերի և վերականգնողական մասնագետներ «Առողջ ողնաշար» կենտրոնում։ Որոնեք ըստ մասնագիտության և գրանցվեք առցանց։',
    h1: 'Գտնել բժիշկ',
    tagline: 'Մասնագետներ ողնաշարի, հոդերի և հենաշարժական համակարգի վերականգնման ոլորտում։',
    bodyHtml: (data) => {
      const items = (data.doctors || [])
        .slice(0, 24)
        .map(
          (d) =>
            `<li><strong>${esc(d.name)}</strong> — ${esc(d.role || '')}${d.location ? ` (${esc(d.location)})` : ''}</li>`
        )
        .join('');
      return `<section class="seo-crawl-content" id="seo-crawl-content"><h2>Մեր բժիշկները</h2><ul>${items}</ul></section>`;
    },
    jsonLd: (data, url) => [
      clinicNode(data),
      breadcrumb(url, 'Գտնել բժիշկ'),
      {
        '@type': 'WebPage',
        name: 'Գտնել բժիշկ',
        url,
        description:
          'Գտեք ողնաշարի, հոդերի և վերականգնողական մասնագետներ «Առողջ ողնաշար» կենտրոնում։',
        isPartOf: { '@type': 'WebSite', name: clinicName(data), url: `${BASE}/` }
      }
    ]
  },
  '/patient-care': {
    file: 'departments.html',
    pageKey: 'departments',
    title: 'Բուժում և ծառայություններ — Առողջ ողնաշար',
    description:
      'Ողնաշարի, հոդերի և հենաշարժական համակարգի վերականգնողական ծառայություններ «Առողջ ողնաշար» կենտրոնում — ֆիզիոթերապիա, ախտորոշում և վերականգնման ծրագրեր։',
    h1: 'Բուժում և ծառայություններ',
    tagline: 'Ողնաշարի և հոդերի համապարփակ վերականգնողական և բուժման ծրագրեր։',
    bodyHtml: (data) => {
      const launched = getLaunchedServiceSlugs();
      const items = (data.departments || [])
        .slice(0, 30)
        .map((s) => {
          const link = launched.includes(s.id)
            ? `<a href="/services/${esc(s.id)}">${esc(s.name)}</a>`
            : `<strong>${esc(s.name)}</strong>`;
          return `<li>${link}${s.description ? ` — ${esc(s.description)}` : ''}</li>`;
        })
        .join('');
      return `<section class="seo-crawl-content" id="seo-crawl-content">
        <p><a href="/services">Ծառայությունների հիմնական էջ</a> — ողնաշարի և հոդերի վերականգնողական ծառայություններ Երևանում։</p>
        <h2>Ծառայություններ և ծրագրեր</h2><ul>${items}</ul></section>`;
    },
    jsonLd: (data, url) => {
      const graphs = [clinicNode(data), breadcrumb(url, 'Բուժում և ծառայություններ')];
      (data.departments || []).slice(0, 30).forEach((s) => {
        graphs.push({
          '@type': 'MedicalTherapy',
          name: s.name,
          description: s.description || '',
          provider: { '@type': 'MedicalClinic', name: clinicName(data) }
        });
      });
      return graphs;
    }
  },
  '/about': {
    file: 'about.html',
    pageKey: 'about',
    title: 'Մեր մասին — Առողջ ողնաշար',
    description:
      '«Առողջ ողնաշար» վերականգնողական կենտրոնի մասին — առաքելություն, թիմ, արժեքներ և ապացուցված ողնաշարի և հոդերի խնամք։',
    h1: 'Մեր մասին',
    tagline: 'Կենտրոնի պատմություն, առաքելություն և արժեքներ։',
    bodyHtml: (data) => {
      const h = data.hospital || {};
      return `<section class="seo-crawl-content" id="seo-crawl-content"><p>${esc(h.about || h.mission || '«Առողջ ողնաշար» վերականգնողական կենտրոն Երևանում։')}</p></section>`;
    },
    jsonLd: (data, url) => [clinicNode(data), breadcrumb(url, 'Մեր մասին')]
  },
  '/contact': {
    file: 'contacts.html',
    pageKey: 'contacts',
    title: 'Կապ — Առողջ ողնաշար',
    description:
      'Կապ «Առողջ ողնաշար» կենտրոնի հետ — հեռախոս, էլ. փոստ, աշխատանքային ժամեր և առցանց գրանցում Երևանում։',
    h1: 'Կապ',
    tagline: 'Զանգահարեք, գրեք կամ ուղարկեք հաղորդագրություն գրանցման համար։',
    bodyHtml: (data) => contactBlock(data, 'contact'),
    jsonLd: (data, url) => [localBusinessNode(data, url), breadcrumb(url, 'Կապ')]
  },
  '/consultation-process': {
    file: 'consultation-process.html',
    pageKey: 'consultation-process',
    title: 'Խորհրդատվության գործընթաց — Առողջ ողնաշար',
    description:
      'Ինչպես է անցնում խորհրդատվությունը «Առողջ ողնաշար» վերականգնողական կենտրոնում՝ գնահատում, պլանավորում և հսկողություն։',
    h1: 'Խորհրդատվության գործընթաց',
    tagline: 'Ինչ սպասել առաջին այցից մինչև վերականգնողական պլանի ավարտը',
    bodyHtml: (data) => consultationBodyHtml(data),
    jsonLd: (data, url) => consultationJsonLd(data, url)
  },
  '/locations': {
    file: 'contacts.html',
    pageKey: 'locations',
    title: 'Հասցեներ — Առողջ ողնաշար',
    description:
      '«Առողջ ողնաշար» կլինիկայի հասցեն Երևանում — հասցե, ուղղություններ, հեռախոս և աշխատանքային ժամեր։',
    h1: 'Մեր հասցեն',
    tagline: '«Առողջ ողնաշար» վերականգնողական կենտրոնը Երևանում։',
    bodyHtml: (data) => contactBlock(data, 'locations'),
    jsonLd: (data, url) => [localBusinessNode(data, url), breadcrumb(url, 'Հասցեներ')]
  }
};


function consultationBodyHtml(data) {
  const h = data?.hospital || {};
  return `<article class="seo-crawl-content" id="seo-crawl-content">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb">
      <a href="/">Գլխավոր</a> › <span>Խորհրդատվության գործընթաց</span>
    </nav>
    <div class="hss-prose">
      <p>«Առողջ ողնաշար» վերականգնողական կենտրոնը Երևանում աշխատում է կոնսերվատիվ մոտեցմամբ՝ գնահատումից մինչև վերականգնողական պլանի կազմում։</p>
    </div>
    <section class="seo-service-section">
      <h2>Փուլ 1 — Կապ հաստատել</h2>
      <div class="hss-prose"><p>Կապ հաստատեք կլինիկայի հետ հեռախոսով կամ օնլայն ձևով։ Ներկայացրեք ձեր բողոքները և առկա ուսումնասիրությունների արդյունքները, եթե դրանք ունեք։</p></div>
    </section>
    <section class="seo-service-section">
      <h2>Փուլ 2 — Սկզբնական գնահատում</h2>
      <div class="hss-prose"><p>Առաջին այցի ժամանակ մասնագետը կհավաքի բողոքների պատմությունը, կկատարի ստուգում և կքննարկի հնարավոր հաջորդ քայլերը։ Գնահատումը կարող է տևել 20–40 րոպե։</p></div>
    </section>
    <section class="seo-service-section">
      <h2>Փուլ 3 — Վերականգնողական պլան</h2>
      <div class="hss-prose"><p>Գնահատումից հետո մասնագետը կարող է առաջարկել անհատականացված վերականգնողական պլան՝ ներառյալ թերապիաների համակցում, հանդիպումների քանակը և տնային խորհուրդները։</p></div>
    </section>
    <section class="seo-service-section">
      <h2>Փուլ 4 — Հսկողություն և հարմարեցում</h2>
      <div class="hss-prose"><p>Վերականգնողական ընթացքում մասնագետը կհետևի գնահատման արդյունքները և կառաջարկի պլանի հարմարեցումը, եթե անհրաժեշտ։ Արդյունքները կարող են տարբեր լինել։</p></div>
    </section>
    <section class="seo-service-section">
      <h2>Կարևոր նշում</h2>
      <div class="hss-prose"><p>Այս էջը տեղեկատվական է և չի փոխարինում բժշկական ախտորոշումը կամ խորհրդատվությունը։ Կենտրոնը չի երաշխավորում կոնկրետ արդյունքներ կամ ամբողջական ազատում ցավից։</p></div>
    </section>
    <p><a href="/services" class="hss-link">Ծառայություններ</a> · <a href="/conditions" class="hss-link">Ախտորոշումներ</a> · <a href="/knowledge" class="hss-link">Գիտելիքների կենտրոն</a></p>
    <section class="seo-service-section hss-contact-block">
      <h2>Կապ հաստատել</h2>
      <p><strong>Հեռախոս՝</strong> <a href="tel:${(h.phone || '').replace(/[^+\d]/g, '')}" class="hss-tel">${esc(h.phone || '')}</a></p>
      <p><strong>Էլ. փոստ՝</strong> <a href="mailto:${esc(h.email || '')}">${esc(h.email || '')}</a></p>
      <p><strong>Հասցե՝</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(h.mapsQuery || h.address || '')}" target="_blank" rel="noopener">${esc(h.address || '')}</a></p>
      <p><strong>Աշխատանքային ժամեր՝</strong> ${esc(h.hours || '')}</p>
    </section>
    <nav class="seo-service-cta" aria-label="Next steps">
      <p><a href="/contact" class="hss-btn hss-btn--primary">Գրանցվել ընդունելության</a>
      <a href="/contact" class="hss-btn hss-btn--outline">Կապ</a>
      <a href="/locations" class="hss-link">Հասցե և ժամեր</a></p>
    </nav>
  </article>`;
}

function consultationJsonLd(data, url) {
  return [
    { '@type': 'WebPage', name: 'Խորհրդատվության գործընթաց', url, description: 'Ինչպես է անցնում խորհրդատվությունը կենտրոնում։', isPartOf: { '@type': 'WebSite', name: clinicName(data), url: BASE + '/' } },
    clinicNode(data),
    breadcrumb(url, 'Խորհրդատվության գործընթաց')
  ];
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Place SEO crawl block above footer without disturbing page layout. */
function wrapSeoDock(body) {
  return `<section class="hss-seo-dock hss-section hss-section--alt" id="seo-crawl-dock" aria-label="Site information">
    <div class="hss-wrap hss-seo-dock__inner">${body}</div>
  </section>`;
}

function breadcrumb(url, name) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Գլխավոր', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name, item: url }
    ]
  };
}

function contactBlock(data, variant) {
  const h = data?.hospital || {};
  const phone = h.phone || '';
  const phoneClean = phone.replace(/[^+\d]/g, '');
  const email = h.email || '';
  const address = h.address || 'Երևան, Հայաստան';
  const map =
    variant === 'locations'
      ? `<p><strong>Հասցե.</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(h.mapsQuery || address)}" target="_blank" rel="noopener">${esc(address)}</a></p><p>Քարտեզը և ուղղությունները հասանելի են այս էջում։</p>`
      : '';
  return `<section class="seo-crawl-content hss-contact-block" id="seo-crawl-content">
    <p><strong>Հեռախոս.</strong> <a href="tel:${phoneClean}" class="hss-tel">${esc(phone)}</a></p>
    <p><strong>Էլ. փոստ.</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
    <p><strong>Աշխատանքային ժամեր.</strong> ${esc(h.hours || '')}</p>
    ${map}
    <p style="margin-top:0.5em"><a href="/consultation-process" class="hss-link hss-cta-link">→ Գրանցվել խորհրդատվության</a></p>
  </section>`;
}

function fillI18nPlaceholders(html, lang = 'hy') {
  const dict = loadLangDict(lang);
  let out = html.replace(
    /(<([a-z][a-z0-9]*)[^>]*\sdata-i18n="([^"]+)"[^>]*>)—(<\/\2>)/gi,
    (_match, open, _tag, key, close) => {
      const val = dictPath(dict, key);
      return val ? `${open}${esc(val)}${close}` : `${open}${close}`;
    }
  );
  out = out.replace(/(<a href="\/contact" class="hss-link"[^>]*data-i18n="nav\.contacts"[^>]*>)—(<\/a>)/g, (_m, open, close) => {
    const val = dictPath(dict, 'nav.contacts');
    return val ? `${open}${esc(val)}${close}` : `${open}${close}`;
  });
  out = out.replace(/(<a href="\/contact" class="hss-link">)—(<\/a>)/g, (_m, open, close) => {
    const val = dictPath(dict, 'nav.contacts') || (lang === 'ru' ? 'Контакты' : lang === 'en' ? 'Contact' : 'Կապ');
    return `${open}${esc(val)}${close}`;
  });
  return out;
}

function injectHomeHero(html, meta) {
  let out = html;
  out = out.replace(/(<h1[^>]*id="hero-title"[^>]*>)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  out = out.replace(
    /(<p class="hss-hero__tagline"[^>]*id="hero-subtitle"[^>]*>)[^<]*(<\/p>)/,
    `$1${esc(meta.tagline)}$2`
  );
  return out;
}

function stripHomeDynamicPlaceholders(html) {
  const ids = [
    'home-feature-title',
    'home-feature-desc',
    'back-in-game-title',
    'back-in-game-link',
    'expertise-title',
    'expertise-text'
  ];
  let out = html;
  for (const id of ids) {
    const re = new RegExp(`(<[^>]+id="${id}"[^>]*>)—(<\/[^>]+>)`, 'g');
    out = out.replace(re, '$1$2');
  }
  return out;
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

function replaceFirstHeroText(html, meta) {
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  out = out.replace(/(<h1[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  out = out.replace(
    /(<p class="hss-hero__tagline"[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/p>)/,
    `$1${esc(meta.tagline)}$2`
  );
  out = out.replace(/(<h1 class="hss-about-section__title"[^>]*id="about-article-title"[^>]*>)[^<]*(<\/h1>)/, `$1${esc(meta.h1)}$2`);
  out = out.replace(/(<p class="hss-about-section__lead"[^>]*id="about-text"[^>]*>)[^<]*(<\/p>)/, `$1${esc(meta.tagline)}$2`);
  return out;
}

function injectContactFields(html, data) {
  const h = data?.hospital || {};
  let out = html;
  out = out.replace(/(<p id="contact-phone"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.phone || '')}$2`);
  out = out.replace(/(<p id="contact-email"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.email || '')}$2`);
  out = out.replace(/(<p id="contact-address"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.address || '')}$2`);
  out = out.replace(/(<p id="contact-hours"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.hours || '')}$2`);
  return out;
}

function serveSeoPage(routePath, lang = 'hy') {
  lang = normalizeLang(lang);
  const route = ROUTES[routePath];
  if (!route) return null;

  const filePath = path.join(SITE_ROOT, route.file);
  if (!fs.existsSync(filePath)) return null;

  const data = buildPublicContent(lang);
  let html = fs.readFileSync(filePath, 'utf8');
  const url = `${BASE}${routePath}`;

  html = html.replace(/<meta name="description"[^>]*>/gi, '');
  html = html.replace(/<meta name="robots"[^>]*>/gi, '');
  html = html.replace(/<link rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<link rel="alternate"[^>]*>/gi, '');
  html = html.replace(/<meta property="og:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<meta name="twitter:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');

  const meta = resolveRouteMeta(route, data, lang);
  const tags = headTags(meta, routePath);
  html = html.replace('</head>', `${tags}\n${injectJsonLdScript(route.jsonLd(data, url))}\n</head>`);

  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);

  html = replaceFirstHeroText(html, meta);

  if (route.pageKey === 'home') {
    html = injectHomeHero(html, meta);
    html = fillI18nPlaceholders(html, lang);
    html = stripHomeDynamicPlaceholders(html);
    const phoneDigits = String(data?.hospital?.phone || '').replace(/\D/g, '');
    if (phoneDigits) {
      html = html.replace(/tel:\+37410000000/g, `tel:+${phoneDigits}`);
    }
  }

  if (route.pageKey === 'contacts' || route.pageKey === 'locations') {
    html = injectContactFields(html, data);
  }

  const body = route.bodyHtml ? route.bodyHtml(data, lang) : '';
  if (body) {
    const dock = wrapSeoDock(body);
    if (html.includes('id="seo-crawl-slot"')) {
      html = html.replace(/(<div id="seo-crawl-slot">)\s*(<\/div>)/, `$1${dock}$2`);
    } else if (html.includes('</main>')) {
      html = html.replace('</main>', `${dock}\n</main>`);
    } else if (html.includes('id="site-footer"')) {
      html = html.replace(/(<div id="site-footer">)/, `${dock}\n$1`);
    } else {
      html = html.replace('</body>', `${dock}\n</body>`);
    }
  }

  html = html.replace(
    '<body',
    `<body data-seo-canonical="${esc(routePath)}" data-seo-page="${esc(route.pageKey)}"`
  );

  return normalizeRootAssetPaths(html);
}

module.exports = { ROUTES, serveSeoPage, BASE };
