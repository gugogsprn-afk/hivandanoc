const fs = require('fs');
const path = require('path');
const { buildPublicContent } = require('../db/helpers');
const { getLaunchedServiceSlugs } = require('./service-pages');
const { clinicNode, localBusinessNode, clinicName } = require('./entity-schema');
const { normalizeRootAssetPaths } = require('./html-utils');
const {
  ui,
  clinicDisplayName,
  pageMetaFromDict,
  jsonLdBreadcrumb,
  breadcrumbNavHtml,
  applyHtmlLang,
  contactBlockHtml,
  normalizeLang,
  loadLangDict,
  dictPath,
  injectLocaleIntoLinks
} = require('./i18n-ssr');

const SITE_ROOT = path.join(__dirname, '../..');
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');

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
    jsonLd: (data, url, lang = 'hy') => [clinicNode(data), breadcrumb(url, ui(lang).home, lang)]
  },
  '/find-a-doctor': {
    file: 'doctors.html',
    pageKey: 'doctors',
    resolveMeta: (data, lang = 'hy') => pageMetaFromDict('doctors', lang, data),
    bodyHtml: (data, lang = 'hy') => {
      const u = ui(lang);
      const items = (data.doctors || [])
        .slice(0, 24)
        .map(
          (d) => {
            const slug = d.slug || d.id;
            return `<li><a href="/doctors/${esc(slug)}"><strong>${esc(d.name)}</strong></a> — ${esc(d.role || '')}${d.location ? ` (${esc(d.location)})` : ''}</li>`;
          }
        )
        .join('');
      return `<section class="seo-crawl-content" id="seo-crawl-content"><h2>${esc(u.ourDoctors)}</h2><ul>${items}</ul></section>`;
    },
    jsonLd: (data, url, lang = 'hy') => {
      const meta = pageMetaFromDict('doctors', lang, data);
      const u = ui(lang);
      return [
        clinicNode(data),
        breadcrumb(url, u.findDoctor, lang),
        {
          '@type': 'WebPage',
          name: meta.h1,
          url,
          description: meta.description,
          isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: `${BASE}/` }
        }
      ];
    }
  },
  '/patient-care': {
    file: 'departments.html',
    pageKey: 'departments',
    resolveMeta: (data, lang = 'hy') => pageMetaFromDict('departments', lang, data),
    bodyHtml: (data, lang = 'hy') => {
      const u = ui(lang);
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
      const lead =
        lang === 'hy'
          ? 'Ողնաշարի և հոդերի վերականգնողական ծառայություններ Երևանում։'
          : lang === 'ru'
            ? 'Реабилитационные услуги для позвоночника и суставов в Ереване.'
            : 'Rehabilitation services for spine and joints in Yerevan.';
      return `<section class="seo-crawl-content" id="seo-crawl-content">
        <p><a href="/services">${esc(u.services)}</a> — ${esc(lead)}</p>
        <h2>${esc(u.services)}</h2><ul>${items}</ul></section>`;
    },
    jsonLd: (data, url, lang = 'hy') => {
      const u = ui(lang);
      const graphs = [clinicNode(data), breadcrumb(url, u.patientCare, lang)];
      (data.departments || []).slice(0, 30).forEach((s) => {
        graphs.push({
          '@type': 'MedicalTherapy',
          name: s.name,
          description: s.description || '',
          provider: { '@type': 'MedicalClinic', name: clinicDisplayName(data, lang) }
        });
      });
      return graphs;
    }
  },
  '/about': {
    file: 'about.html',
    pageKey: 'about',
    resolveMeta: (data, lang = 'hy') => pageMetaFromDict('about', lang, data),
    bodyHtml: (data, lang = 'hy') => {
      const h = data.hospital || {};
      const fallback =
        lang === 'ru'
          ? 'Реабилитационный центр «Здоровый позвоночник» в Ереване.'
          : lang === 'en'
            ? 'Healthy Spine rehabilitation center in Yerevan.'
            : '«Առողջ ողնաշար» վերականգնողական կենտրոն Երևանում։';
      return `<section class="seo-crawl-content" id="seo-crawl-content"><p>${esc(h.about || h.mission || fallback)}</p></section>`;
    },
    jsonLd: (data, url, lang = 'hy') => {
      const meta = pageMetaFromDict('about', lang, data);
      return [clinicNode(data), breadcrumb(url, meta.h1, lang)];
    }
  },
  '/contact': {
    file: 'contacts.html',
    pageKey: 'contacts',
    resolveMeta: (data, lang = 'hy') => pageMetaFromDict('contacts', lang, data),
    bodyHtml: (data, lang = 'hy') => contactBlock(data, 'contact', lang),
    jsonLd: (data, url, lang = 'hy') => {
      const meta = pageMetaFromDict('contacts', lang, data);
      return [localBusinessNode(data, url), breadcrumb(url, meta.h1, lang)];
    }
  },
  '/consultation-process': {
    file: 'consultation-process.html',
    pageKey: 'consultation-process',
    resolveMeta: (data, lang = 'hy') => {
      lang = normalizeLang(lang);
      const name = clinicDisplayName(data, lang);
      const u = ui(lang);
      if (lang === 'hy') {
        return {
          title: `Խորհրդատվության գործընթաց — ${name}`,
          description:
            'Ինչպես է անցնում խորհրդատվությունը «Առողջ ողնաշար» վերականգնողական կենտրոնում՝ գնահատում, պլանավորում և հսկողություն։',
          h1: u.consultation,
          tagline: 'Ինչ սպասել առաջին այցից մինչև վերականգնողական պլանի ավարտը'
        };
      }
      return {
        title: `${u.consultation} — ${name}`,
        description:
          lang === 'ru'
            ? 'Как проходит консультация в центре: оценка, план и наблюдение.'
            : 'How consultation works at the center: assessment, plan, and follow-up.',
        h1: u.consultation,
        tagline:
          lang === 'ru'
            ? 'Чего ожидать от первого визита до завершения плана'
            : 'What to expect from the first visit through your plan'
      };
    },
    bodyHtml: (data, lang = 'hy') => consultationBodyHtml(data, lang),
    jsonLd: (data, url, lang = 'hy') => consultationJsonLd(data, url, lang)
  },
  '/locations': {
    file: 'contacts.html',
    pageKey: 'locations',
    resolveMeta: (data, lang = 'hy') => {
      lang = normalizeLang(lang);
      const name = clinicDisplayName(data, lang);
      const u = ui(lang);
      if (lang === 'hy') {
        return {
          title: `Հասցեներ — ${name}`,
          description: '«Առողջ ողնաշար» կլինիկայի հասցեն Երևանում — հասցե, ուղղություններ, հեռախոս և աշխատանքային ժամեր։',
          h1: 'Մեր հասցեն',
          tagline: '«Առողջ ողնաշար» վերականգնողական կենտրոնը Երևանում։'
        };
      }
      return {
        title: `${u.locations} — ${name}`,
        description:
          lang === 'ru'
            ? `Адрес клиники ${name} в Ереване, телефон и режим работы.`
            : `Clinic address for ${name} in Yerevan, phone and hours.`,
        h1: u.locations,
        tagline: lang === 'ru' ? `${name} в Ереване` : `${name} in Yerevan`
      };
    },
    bodyHtml: (data, lang = 'hy') => contactBlock(data, 'locations', lang),
    jsonLd: (data, url, lang = 'hy') => {
      const u = ui(lang);
      return [localBusinessNode(data, url), breadcrumb(url, u.locations, lang)];
    }
  },
  '/appointment': simpleDictPageRoute('appointment.html', 'appointment'),
  '/reviews': simpleDictPageRoute('reviews.html', 'reviews'),
  '/move-better': simpleDictPageRoute('move-better.html', 'moveBetter'),
  '/submit-story': simpleDictPageRoute('submit-story.html', 'submitStory'),
  '/patient-story': simpleDictPageRoute('patient-story.html', 'patientStory'),
  '/privacy-policy': footerDictPageRoute('privacy-policy.html', 'footer.policyPrivacy'),
  '/terms': footerDictPageRoute('terms.html', 'footer.policyTerms'),
  '/cookies-policy': footerDictPageRoute('cookies-policy.html', 'footer.policyCookies'),
  '/patient-information': footerDictPageRoute('patient-information.html', 'footer.policyPatient')
};

function simpleDictPageRoute(file, pageKey) {
  return {
    file,
    pageKey,
    fillDictionary: true,
    resolveMeta: (data, lang) => pageMetaFromDict(pageKey, lang, data),
    bodyHtml: (data, lang) => {
      const meta = pageMetaFromDict(pageKey, lang, data);
      const text = meta.description || meta.tagline;
      if (!text) return '';
      return `<section class="seo-crawl-content" id="seo-crawl-content"><p>${esc(text)}</p></section>`;
    },
    jsonLd: (data, url, lang) => {
      const meta = pageMetaFromDict(pageKey, lang, data);
      return [clinicNode(data), breadcrumb(url, meta.h1, lang)];
    }
  };
}

function footerDictPageRoute(file, footerKey) {
  const pageKey = file.replace('.html', '');
  return {
    file,
    pageKey,
    fillDictionary: true,
    resolveMeta: (data, lang) => {
      lang = normalizeLang(lang);
      const dict = loadLangDict(lang);
      const label = dictPath(dict, footerKey) || '';
      const name = clinicDisplayName(data, lang);
      return {
        title: label ? `${label} — ${name}` : name,
        description: dict.meta?.siteDescription || '',
        h1: label || name,
        tagline: ''
      };
    },
    bodyHtml: (data, lang) => {
      lang = normalizeLang(lang);
      const dict = loadLangDict(lang);
      const label = dictPath(dict, footerKey) || '';
      if (!label) return '';
      return `<section class="seo-crawl-content" id="seo-crawl-content"><p>${esc(label)}</p></section>`;
    },
    jsonLd: (data, url, lang) => {
      lang = normalizeLang(lang);
      const dict = loadLangDict(lang);
      const label = dictPath(dict, footerKey) || ui(lang).home;
      return [clinicNode(data), breadcrumb(url, label, lang)];
    }
  };
}
function consultationBodyHtml(data, lang = 'hy') {
  lang = normalizeLang(lang);
  const h = data?.hospital || {};
  const u = ui(lang);
  const intro =
    lang === 'hy'
      ? '«Առողջ ողնաշար» վերականգնողական կենտրոնը Երևանում աշխատում է կոնսերվատիվ մոտեցմամբ՝ գնահատումից մինչև վերականգնողական պլանի կազմում։'
      : lang === 'ru'
        ? 'Реабилитационный центр «Здоровый позвоночник» в Ереване работает консервативно: от первичной оценки до составления индивидуального плана реабилитации. Информация на этой странице не заменяет очную консультацию; результаты могут отличаться.'
        : 'Healthy Spine in Yerevan follows a conservative pathway from initial assessment to an individual rehabilitation plan. This page is informational and does not replace an in-person visit; results may vary.';
  const context =
    lang === 'hy'
      ? ''
      : lang === 'ru'
        ? '<div class="hss-prose"><p>На консультации специалист уточняет жалобы, собирает анамнез и проводит осмотр. При необходимости могут быть назначены дополнительные исследования. Рекомендации по мануальной терапии, ЛФК, физиотерапии или другим методам даются только после оценки и могут корректироваться при наблюдении.</p><p>Центр не обещает излечение, не ставит диагноз по телефону и не гарантирует отказ от операции. При острых или нарастающих симптомах обратитесь за медицинской помощью без отлагательств.</p></div>'
        : '<div class="hss-prose"><p>At consultation, a specialist reviews complaints, history, and examination findings. Further tests may be ordered when needed. Recommendations for manual therapy, exercise, physiotherapy, or other methods are made only after assessment and may change during follow-up.</p><p>The center does not promise cure, diagnose by phone, or guarantee surgery avoidance. Seek prompt medical care for acute or worsening symptoms.</p></div>';
  const steps =
    lang === 'hy'
      ? [
          ['Փուլ 1 — Կապ հաստատել', 'Կապ հաստատեք կլինիկայի հետ հեռախոսով կամ օնլայն ձևով։'],
          ['Փուլ 2 — Սկզբնական գնահատում', 'Առաջին այցի ժամանակ մասնագետը կհավաքի բողոքների պատմությունը և կկատարի ստուգում։'],
          ['Փուլ 3 — Վերականգնողական պլան', 'Գնահատումից հետո մասնագետը կարող է առաջարկել անհատականացված պլան։'],
          ['Փուլ 4 — Հսկողություն', 'Արդյունքները կարող են տարբեր լինել; պլանը կարող է հարմարեցվել։']
        ]
      : lang === 'ru'
        ? [
            ['Шаг 1 — Связаться', 'Свяжитесь с клиникой по телефону или через онлайн-форму.'],
            ['Шаг 2 — Оценка', 'На первом визите специалист соберёт анамнез и проведёт осмотр.'],
            ['Шаг 3 — План', 'После оценки может быть предложен индивидуальный план.'],
            ['Шаг 4 — Наблюдение', 'Результаты могут отличаться; план может корректироваться.']
          ]
        : [
            ['Step 1 — Contact', 'Contact the clinic by phone or online form.'],
            ['Step 2 — Assessment', 'At the first visit, a specialist takes history and examines you.'],
            ['Step 3 — Plan', 'After assessment, an individual plan may be proposed.'],
            ['Step 4 — Follow-up', 'Results may vary; the plan may be adjusted.']
          ];
  const stepsHtml = steps
    .map(([t, p]) => `<section class="seo-service-section"><h2>${esc(t)}</h2><div class="hss-prose"><p>${esc(p)}</p></div></section>`)
    .join('');
  const noteH = lang === 'ru' ? 'Важное примечание' : lang === 'en' ? 'Important note' : 'Կարևոր նշում';
  return `<article class="seo-crawl-content" id="seo-crawl-content">
    ${breadcrumbNavHtml([{ href: '#', label: u.consultation }], lang)}
    <div class="hss-prose"><p>${esc(intro)}</p></div>
    ${context}
    ${stepsHtml}
    <section class="seo-service-section"><h2>${esc(noteH)}</h2><div class="hss-prose"><p>${esc(u.disclaimer)}</p></div></section>
    <p><a href="/services" class="hss-link">${esc(u.services)}</a> · <a href="/conditions" class="hss-link">${esc(u.conditions)}</a> · <a href="/knowledge" class="hss-link">${esc(u.knowledge)}</a> · <a href="/find-a-doctor" class="hss-link">${esc(u.findDoctors)}</a></p>
    ${contactBlockHtml(data, lang, 'contact', { nested: true })}
    <nav class="seo-service-cta" aria-label="Next steps"><p><a href="/contact" class="hss-btn hss-btn--primary">${esc(u.bookAppointment)}</a> <a href="/contact" class="hss-btn hss-btn--outline">${esc(u.contact)}</a></p></nav>
  </article>`;
}

function consultationJsonLd(data, url, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const meta = pageMetaFromDict('contacts', lang, data);
  return [
    {
      '@type': 'WebPage',
      name: u.consultation,
      url,
      description: meta.description,
      isPartOf: { '@type': 'WebSite', name: clinicDisplayName(data, lang), url: BASE + '/' }
    },
    clinicNode(data),
    breadcrumb(url, u.consultation, lang)
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

function breadcrumb(url, name, lang = 'hy') {
  lang = normalizeLang(lang);
  return jsonLdBreadcrumb(BASE, lang, { name, item: url });
}

function contactBlock(data, variant, lang = 'hy') {
  return contactBlockHtml(data, lang, variant === 'locations' ? 'locations' : 'contact');
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
  if (data?.hospital) {
    data.hospital = { ...data.hospital, name: clinicDisplayName(data, lang) };
  }
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
  const jsonLdGraphs = typeof route.jsonLd === 'function' ? route.jsonLd(data, url, lang) : [];
  html = html.replace('</head>', `${tags}\n${injectJsonLdScript(jsonLdGraphs)}\n</head>`);

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
  } else if (route.fillDictionary) {
    html = fillI18nPlaceholders(html, lang);
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

  html = applyHtmlLang(html, lang);
  html = injectLocaleIntoLinks(html, lang);
  return normalizeRootAssetPaths(html);
}

module.exports = { ROUTES, serveSeoPage, BASE };
