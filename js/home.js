function proseHtml(paragraphs) {
  return (paragraphs || []).map((p) => `<p>${p}</p>`).join('');
}

const SPLIT_IMAGES = {
  approach: 'images/about-image-01.jpg',
  experts: 'images/team-member-01.jpg',
  imaging: 'images/team-member-02.jpg'
};

const HOME_CONDITION_SLUGS = [
  'osteochondrosis',
  'herniated-disc',
  'scoliosis-pain',
  'radiculopathy',
  'joint-pain',
  null,
  null,
  'lower-back-pain'
];

function internalHref(path) {
  if (typeof HospitalApp !== 'undefined' && typeof HospitalApp.routeHref === 'function') {
    return HospitalApp.routeHref(path);
  }
  return path;
}

function parseListLines(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function initDoctorSearch(data) {
  initDoctorSearchBand(data);
}

function renderHomeHeroBanner(data, pf = {}) {
  const h = data.hospital || {};
  const ph = data.patientHero;
  const url =
    pf['home-hero-image'] ||
    pf['patient-hero-image'] ||
    ph?.image ||
    h.heroImage ||
    '';
  const mediaType =
    pf['home-hero-image__type'] ||
    pf['patient-hero-image__type'] ||
    inferMediaType(url);
  HospitalApp.applyHomeHeroMedia(url, mediaType);

  const lowerSection = document.getElementById('patient-hero');
  if (lowerSection) {
    const mainMedia = pf['home-hero-image'] || pf['patient-hero-image'] || ph?.image;
    const isEdit = /[?&]cms-edit=1/.test(location.search);
    lowerSection.hidden = !isEdit && !!mainMedia;
  }
}

function renderPatientHero(ph, pf = {}) {
  const mainMedia = pf['home-hero-image'] || pf['patient-hero-image'] || ph?.image;
  if (mainMedia) return;
  if (!ph && !pf['patient-hero-image']) return;
  const url = pf['patient-hero-image'] || ph?.image || '';
  const mediaType = pf['patient-hero-image__type'] || inferMediaType(url);
  const el = HospitalApp.applyPatientHeroMedia(url, mediaType);
  if (el?.tagName === 'IMG' && !url) {
    el.alt = I18n.t('pages.home.reviewsTitle');
  }
}

function applyHomeMedia({ pf, fieldKey, containerSelector, elementId, fallback, alt = '', className = '' }) {
  const url = pf[fieldKey] || fallback || '';
  const type = pf[`${fieldKey}__type`] || inferMediaType(url);
  const el = HospitalApp.applyBlockMedia({
    containerSelector,
    elementId,
    url,
    type,
    className,
    defaultImage: fallback
  });
  if (el?.tagName === 'IMG' && alt) {
    el.alt = alt;
    el.loading = 'lazy';
    el.decoding = 'async';
  }
  return el;
}

function inferMediaType(url, explicitType) {
  if (typeof HospitalApp !== 'undefined' && HospitalApp.inferMediaType) {
    return HospitalApp.inferMediaType(url, explicitType);
  }
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '') ? 'video' : 'image';
}

function renderBackInGame(big, pf = {}) {
  if (!big && !pf['back-in-game-image']) return;
  applyHomeMedia({
    pf,
    fieldKey: 'back-in-game-image',
    containerSelector: '#brand-story .hss-split__media',
    elementId: 'back-in-game-image',
    fallback: big?.image || ''
  });
  const title = document.getElementById('back-in-game-title');
  const text = document.getElementById('back-in-game-text');
  const link = document.getElementById('back-in-game-link');
  if (title) title.textContent = pf['back-in-game-title'] || big?.title || '';
  if (text) text.innerHTML = `<p>${pf['back-in-game-text'] || big?.text || ''}</p>`;
  if (link) {
    link.textContent = pf['back-in-game-link'] || big?.linkText || '';
    link.href = internalHref(big?.linkHref || '/services');
  }
}

function renderExpertise(ex, pf = {}) {
  if (!ex && !pf['expertise-image']) return;
  applyHomeMedia({
    pf,
    fieldKey: 'expertise-image',
    containerSelector: '#expertise',
    elementId: 'expertise-image',
    fallback: ex?.image || '',
    className: 'hss-expertise__bg'
  });
  const title = document.getElementById('expertise-title');
  const text = document.getElementById('expertise-text');
  const links = document.getElementById('expertise-links');
  if (title) title.textContent = pf['expertise-title'] || ex?.title || '';
  if (text) text.textContent = pf['expertise-text'] || ex?.text || '';
  if (links) {
    const fromPf = pf['home-expertise-links'];
    if (fromPf) {
      links.innerHTML = parseListLines(fromPf)
        .map((line) => {
          const [text, href] = line.split('|').map((s) => s.trim());
          return `<li><a href="${internalHref(href || '/about')}">${text || line}</a></li>`;
        })
        .join('');
    } else {
      links.innerHTML = (ex.links || [])
        .map((l) => `<li><a href="${internalHref(l.href || '/about')}">${l.text}</a></li>`)
        .join('');
    }
  }
}

function renderAwards(awards, pf = {}) {
  const grid = document.getElementById('home-awards-grid');
  if (!grid) return;
  const t = (k) => I18n.t(k);
  const fromPf = pf['home-awards'];
  let badges;
  if (fromPf) {
    badges = parseListLines(fromPf)
      .map(
        (line, i) => {
          const [label, desc] = line.split('|').map((s) => s.trim());
          return `
    <div class="hss-award-card">
      <div class="hss-award-card__badge">${i + 1}</div>
      <strong>${label || line}</strong>
      <span>${desc || ''}</span>
    </div>`;
        }
      )
      .join('');
  } else {
    badges = (awards || [])
      .map(
        (a, i) => `
    <div class="hss-award-card">
      <div class="hss-award-card__badge">${i + 1}</div>
      <strong>${a.label}</strong>
      <span>${a.desc}</span>
    </div>`
      )
      .join('');
  }
  grid.innerHTML =
    badges +
    `<div class="hss-awards__intro">
      <h2 class="hss-serif">${t('pages.home.awardsTitle')}</h2>
      <p>${t('pages.home.awardsDesc')}</p>
      <a href="${internalHref('/about#awards')}" class="hss-link">${t('pages.home.rankingsLink')}</a>
    </div>`;
}

function renderNewsCards(news, pf = {}) {
  const newsEl = document.getElementById('home-news');
  if (!newsEl) return;
  const fromPf = pf['home-news'];
  let items;
  if (fromPf) {
    items = parseListLines(fromPf).map((line) => {
      const [title, category, image] = line.split('|').map((s) => s.trim());
      return {
        title: title || line,
        category: category || '',
        image: image || 'images/about-image-01.jpg',
        url: '/move-better'
      };
    });
  } else {
    items = (news || []).slice(0, 3);
  }
  newsEl.innerHTML = items
    .map(
      (n) => `
    <a href="${internalHref(n.url || '/move-better')}" class="hss-news-card">
      <div class="hss-news-card__img">
        <img src="${n.image || 'images/about-image-01.jpg'}" alt="${n.title || ''}" loading="lazy" decoding="async" width="400" height="260">
      </div>
      <div class="hss-news-card__cat">${n.category || ''}</div>
      <h3>${n.title}</h3>
    </a>`
    )
    .join('');
}

function cmsTriplet(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  const v = obj[lang];
  if (v) return v;
  return lang === 'hy' ? obj.hy || '' : '';
}

function toggleSection(id, visible) {
  const el = document.getElementById(id);
  if (el) el.hidden = !visible;
}

function renderHomePage() {
  const data = HospitalApp.getData();
  if (!data) return;
  const h = data.hospital;
  const lang = I18n.getLang();
  const locH = I18n.getContent()?.hospital || {};
  const t = (k) => I18n.t(k);
  const pf = data.pageFields?.home || {};

  renderHomeHeroBanner(data, pf);

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const cmsHero = data._cms?.homeSections?.hero;
    const cmsTitle = cmsTriplet(cmsHero?.title, lang);
    heroTitle.textContent =
      pf['hero-title'] ||
      cmsTitle ||
      locH.name ||
      locH.shortName ||
      h.name ||
      h.shortName ||
      '';
  }

  const heroSubtitle = document.getElementById('hero-subtitle');
  if (heroSubtitle) {
    const cmsHero = data._cms?.homeSections?.hero;
    const cmsSub =
      pf['hero-subtitle'] ||
      locH.heroTagline ||
      locH.tagline ||
      cmsTriplet(cmsHero?.subtitle, lang) ||
      h.heroTagline ||
      h.tagline ||
      t('pages.home.heroSubtitle');
    heroSubtitle.innerHTML = `<strong>${cmsSub}</strong>`;
  }

  initDoctorSearch(data);

  const introProse = document.getElementById('home-intro-prose');
  if (introProse) {
    const intro = pf['home-intro-prose'];
    introProse.innerHTML = intro
      ? intro.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('')
      : proseHtml(data.introParagraphs);
  }

  const conditionsEl = document.getElementById('home-conditions');
  if (conditionsEl) {
    const fromPf = pf['home-conditions'];
    if (fromPf) {
      conditionsEl.innerHTML = parseListLines(fromPf)
        .map((item) => `<li>${item}</li>`)
        .join('');
    } else {
      const items =
        (typeof I18n !== 'undefined' && typeof I18n.getContent === 'function'
          ? I18n.getContent()?.conditions
          : null) ||
        data.conditions ||
        [];
      conditionsEl.innerHTML = items
        .map((c, i) => {
          const label = typeof c === 'string' ? c : c.name || c;
          const slug = typeof c === 'object' && c.slug ? c.slug : HOME_CONDITION_SLUGS[i];
          if (slug) {
            return `<li><a href="${internalHref(`/conditions/${slug}`)}">${label}</a></li>`;
          }
          return `<li><a href="${internalHref('/conditions')}">${label}</a></li>`;
        })
        .join('');
    }
  }

  const newsViewAll = document.querySelector('a[data-i18n="pages.home.newsViewAll"]');
  if (newsViewAll) newsViewAll.href = internalHref('/move-better');

  const shareStory = document.querySelector('a[data-i18n="footer.linkStory"]');
  if (shareStory) shareStory.href = internalHref('/submit-story');

  renderPatientHero(data.patientHero, pf);
  renderBackInGame(data.backInGame, pf);
  renderExpertise(data.expertiseOverlay, pf);
  renderAwards(data.awards, pf);

  const feature = data.feature || {};
  const featUrl = pf['home-feature-image'] || feature.image || h.heroImage || 'images/about-image-01.jpg';
  const featType = pf['home-feature-image__type'] || inferMediaType(featUrl);
  const featImg = HospitalApp.applyFeatureMedia(featUrl, featType);
  if (featImg?.tagName === 'IMG') {
    featImg.alt = feature.title || h.name || '';
    featImg.width = 800;
    featImg.height = 500;
  }
  const featTitle = document.getElementById('home-feature-title');
  if (featTitle) featTitle.textContent = pf['home-feature-title'] || feature.title || '';
  const featDesc = document.getElementById('home-feature-desc');
  if (featDesc) featDesc.textContent = pf['home-feature-desc'] || feature.description || '';

  const approachText = document.getElementById('home-approach-text');
  if (approachText) {
    const ap = pf['home-approach-text'];
    approachText.innerHTML = ap
      ? ap.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('')
      : proseHtml(data.approachParagraphs);
  }

  applyHomeMedia({
    pf,
    fieldKey: 'home-approach-image',
    containerSelector: '#approach .hss-split__media',
    elementId: 'home-approach-image',
    fallback: data.approachImage || SPLIT_IMAGES.approach,
    alt: t('pages.home.approachTitle')
  });

  const expertsText = document.getElementById('home-experts-text');
  if (expertsText) {
    const ep = pf['home-experts-text'];
    expertsText.innerHTML = ep
      ? ep.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('')
      : proseHtml(data.expertsParagraphs);
  }

  applyHomeMedia({
    pf,
    fieldKey: 'home-experts-image',
    containerSelector: '#experts .hss-split__media',
    elementId: 'home-experts-image',
    fallback: data.expertsImage || SPLIT_IMAGES.experts,
    alt: t('pages.home.expertsTitle')
  });

  const imagingText = document.getElementById('home-imaging-text');
  if (imagingText) {
    const ip = pf['home-imaging-text'];
    imagingText.innerHTML = ip
      ? ip.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('')
      : proseHtml(data.imagingParagraphs);
  }

  applyHomeMedia({
    pf,
    fieldKey: 'home-imaging-image',
    containerSelector: '#imaging .hss-split__media',
    elementId: 'home-imaging-image',
    fallback: data.imagingImage || data.equipment?.[0]?.image || SPLIT_IMAGES.imaging,
    alt: t('pages.home.equipmentTitle')
  });

  const imagingList = document.getElementById('home-imaging-list');
  if (imagingList) {
    const fromPf = pf['home-imaging-list'];
    if (fromPf) {
      imagingList.innerHTML = parseListLines(fromPf)
        .map((line) => {
          const sep = line.includes('|') ? '|' : ' — ';
          const parts = line.split(sep).map((s) => s.trim());
          const name = parts[0] || '';
          const desc = parts.slice(1).join(sep.trim()).trim();
          return desc
            ? `<li><strong>${name}</strong> — ${desc}</li>`
            : `<li><strong>${name}</strong></li>`;
        })
        .join('');
    } else {
      imagingList.innerHTML = (data.equipment || [])
        .map((eq) => `<li><strong>${eq.name}</strong> — ${eq.description}</li>`)
        .join('');
    }
  }

  renderNewsCards(data.news || [], pf);
  toggleSection('news', !!(pf['home-news'] || (data.news || []).length));

  const patientStories = document.getElementById('home-patient-stories');
  if (patientStories) {
    const storyHref = (id) => {
      const path = `/patient-story?id=${encodeURIComponent(id)}`;
      if (typeof HospitalApp !== 'undefined' && typeof HospitalApp.routeHref === 'function') {
        return HospitalApp.routeHref(path);
      }
      if (typeof LocalePolicy !== 'undefined' && typeof LocalePolicy.withLang === 'function') {
        const lang =
          typeof LocalePolicy.getActiveLang === 'function' ? LocalePolicy.getActiveLang() : 'hy';
        return LocalePolicy.withLang(path, lang);
      }
      return path;
    };
    patientStories.innerHTML = (data.patientStories || [])
      .map(
        (s) => `
      <a href="${storyHref(s.id)}" class="hss-patient hss-patient--link" aria-label="${s.name}">
        <article class="hss-patient__card">
          <div class="hss-patient__photo">
            <span class="hss-patient__ring" aria-hidden="true"></span>
            <img src="${s.image || 'images/team-member-03.jpg'}" alt="${s.name}" loading="lazy" decoding="async" width="320" height="320" />
          </div>
          <div class="hss-patient__body">
            <h3>${s.name}</h3>
            <p class="hss-patient__loc">${s.location}</p>
            <p class="hss-patient__tx"><span>${s.treatment}</span></p>
          </div>
        </article>
      </a>`
      )
      .join('');
  }
  toggleSection('patient-stories', (data.patientStories || []).length > 0);

  const tel = HospitalApp.phoneTelUri(h.phone);
  const mobilePhone = document.getElementById('mobile-bar-phone');
  if (mobilePhone && tel) {
    mobilePhone.href = `tel:${tel}`;
  }

  HospitalApp.initAnimations();

  if (HospitalApp.applyCmsVisuals) {
    HospitalApp.applyCmsVisuals({
      pageImages: data.pageImages,
      inlineText: data.inlineText,
      elementStyles: data.elementStyles
    });
  }
  if (HospitalApp.applyPageFields) {
    HospitalApp.applyPageFields(pf);
  }
  if (/[?&]cms-edit=1/.test(location.search)) {
    window.dispatchEvent(new CustomEvent('cms-hero-media-ready'));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await HospitalApp.init();
  renderHomePage();
  window.addEventListener('hospital:refresh', () => {
    renderHomePage();
  });
});
