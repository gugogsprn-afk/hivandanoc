function proseHtml(paragraphs) {
  return (paragraphs || []).map((p) => `<p>${p}</p>`).join('');
}

const SPLIT_IMAGES = {
  approach: 'images/about-image-01.jpg',
  experts: 'images/team-member-01.jpg',
  imaging: 'images/team-member-02.jpg'
};

function initDoctorSearch(data) {
  initDoctorSearchBand(data);
}

function renderPatientHero(ph) {
  if (!ph) return;
  const img = document.getElementById('patient-hero-image');
  const quote = document.getElementById('patient-hero-quote');
  const cta = document.getElementById('patient-hero-cta');
  if (img) {
    img.src = ph.image || 'images/about-image-01.jpg';
    img.alt = ph.quote ? ph.quote.slice(0, 120) : I18n.t('pages.home.reviewsTitle');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 1200;
    img.height = 675;
  }
  if (quote) quote.textContent = ph.quote || '';
  if (cta) cta.textContent = ph.ctaText || I18n.t('pages.home.patientHeroCta');
}

function renderBackInGame(big) {
  if (!big) return;
  const img = document.getElementById('back-in-game-image');
  const title = document.getElementById('back-in-game-title');
  const text = document.getElementById('back-in-game-text');
  const link = document.getElementById('back-in-game-link');
  if (img) img.src = big.image || '';
  if (title) title.textContent = big.title || '';
  if (text) text.innerHTML = `<p>${big.text || ''}</p>`;
  if (link) link.textContent = big.linkText || '';
}

function renderExpertise(ex) {
  if (!ex) return;
  const img = document.getElementById('expertise-image');
  const title = document.getElementById('expertise-title');
  const text = document.getElementById('expertise-text');
  const links = document.getElementById('expertise-links');
  if (img) img.src = ex.image || '';
  if (title) title.textContent = ex.title || '';
  if (text) text.textContent = ex.text || '';
  if (links) {
    links.innerHTML = (ex.links || [])
      .map((l) => `<li><a href="${l.href || '#'}">${l.text}</a></li>`)
      .join('');
  }
}

function renderAwards(awards) {
  const grid = document.getElementById('home-awards-grid');
  if (!grid) return;
  const t = (k) => I18n.t(k);
  const badges = (awards || [])
    .map(
      (a, i) => `
    <div class="hss-award-card">
      <div class="hss-award-card__badge">${i + 1}</div>
      <strong>${a.label}</strong>
      <span>${a.desc}</span>
    </div>`
    )
    .join('');
  grid.innerHTML =
    badges +
    `<div class="hss-awards__intro">
      <h2 class="hss-serif">${t('pages.home.awardsTitle')}</h2>
      <p>${t('pages.home.awardsDesc')}</p>
      <a href="about.html" class="hss-link">${t('pages.home.rankingsLink')}</a>
    </div>`;
}

function renderNewsCards(news) {
  const newsEl = document.getElementById('home-news');
  if (!newsEl) return;
  newsEl.innerHTML = (news || [])
    .slice(0, 3)
    .map(
      (n) => `
    <a href="#" class="hss-news-card">
      <div class="hss-news-card__img">
        <img src="${n.image || 'images/about-image-01.jpg'}" alt="${n.title || ''}" loading="lazy" decoding="async" width="400" height="260">
      </div>
      <div class="hss-news-card__cat">${n.category || ''}</div>
      <h3>${n.title}</h3>
    </a>`
    )
    .join('');
}

function renderHomePage() {
  const data = HospitalApp.getData();
  if (!data) return;
  const h = data.hospital;
  const t = (k) => I18n.t(k);

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const cmsHero = data._cms?.homeSections?.hero;
    const cmsTitle = cmsHero?.title?.[I18n.getLang()] || cmsHero?.title?.hy;
    heroTitle.textContent = cmsTitle || h.name || h.shortName;
  }

  const heroSubtitle = document.getElementById('hero-subtitle');
  if (heroSubtitle) {
    const cmsHero = data._cms?.homeSections?.hero;
    const cmsSub =
      cmsHero?.subtitle?.[I18n.getLang()] ||
      cmsHero?.subtitle?.hy ||
      h.heroTagline ||
      h.tagline ||
      t('pages.home.heroSubtitle');
    heroSubtitle.innerHTML = `<strong>${cmsSub}</strong>`;
  }

  initDoctorSearch(data);

  const introProse = document.getElementById('home-intro-prose');
  if (introProse) introProse.innerHTML = proseHtml(data.introParagraphs);

  const conditionsEl = document.getElementById('home-conditions');
  if (conditionsEl) {
    const items = (data.conditions || []).slice(0, 3);
    conditionsEl.innerHTML = items.map((c) => `<li>${c}</li>`).join('');
  }

  renderPatientHero(data.patientHero);
  renderBackInGame(data.backInGame);
  renderExpertise(data.expertiseOverlay);
  renderAwards(data.awards);

  const feature = data.feature || {};
  const featImg = document.getElementById('home-feature-image');
  if (featImg) {
    featImg.src = feature.image || h.heroImage || 'images/about-image-01.jpg';
    featImg.alt = feature.title || h.name || '';
    featImg.loading = 'lazy';
    featImg.decoding = 'async';
    featImg.width = 800;
    featImg.height = 500;
  }
  const featTitle = document.getElementById('home-feature-title');
  if (featTitle) featTitle.textContent = feature.title || '';
  const featDesc = document.getElementById('home-feature-desc');
  if (featDesc) featDesc.textContent = feature.description || '';

  const approachImg = document.getElementById('home-approach-image');
  if (approachImg) {
    approachImg.src = data.approachImage || SPLIT_IMAGES.approach;
    approachImg.alt = t('pages.home.approachTitle');
    approachImg.loading = 'lazy';
    approachImg.decoding = 'async';
    approachImg.width = 800;
    approachImg.height = 533;
  }
  const approachText = document.getElementById('home-approach-text');
  if (approachText) approachText.innerHTML = proseHtml(data.approachParagraphs);

  const expertsImg = document.getElementById('home-experts-image');
  if (expertsImg) {
    expertsImg.src = data.expertsImage || SPLIT_IMAGES.experts;
    expertsImg.alt = t('pages.home.expertsTitle');
    expertsImg.loading = 'lazy';
    expertsImg.decoding = 'async';
    expertsImg.width = 800;
    expertsImg.height = 533;
  }
  const expertsText = document.getElementById('home-experts-text');
  if (expertsText) expertsText.innerHTML = proseHtml(data.expertsParagraphs);

  const imagingImg = document.getElementById('home-imaging-image');
  if (imagingImg) {
    imagingImg.src = data.imagingImage || data.equipment?.[0]?.image || SPLIT_IMAGES.imaging;
    imagingImg.alt = t('pages.home.equipmentTitle');
    imagingImg.loading = 'lazy';
    imagingImg.decoding = 'async';
    imagingImg.width = 800;
    imagingImg.height = 533;
  }
  const imagingText = document.getElementById('home-imaging-text');
  if (imagingText) imagingText.innerHTML = proseHtml(data.imagingParagraphs);

  const imagingList = document.getElementById('home-imaging-list');
  if (imagingList) {
    imagingList.innerHTML = (data.equipment || [])
      .map((eq) => `<li><strong>${eq.name}</strong> — ${eq.description}</li>`)
      .join('');
  }

  const storyVideos = document.getElementById('home-story-videos');
  if (storyVideos) {
    storyVideos.innerHTML = (data.storyVideos || [])
      .map(
        (v) => `
      <article class="hss-video-card">
        <div class="hss-video-card__thumb">
          <img src="${v.image || 'images/team-member-03.jpg'}" alt="${v.title || ''}" loading="lazy" decoding="async" width="360" height="202" />
          <span class="hss-video-card__play" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </span>
        </div>
        <p>${v.title}</p>
      </article>`
      )
      .join('');
  }

  renderNewsCards(data.news || []);

  const patientStories = document.getElementById('home-patient-stories');
  if (patientStories) {
    patientStories.innerHTML = (data.patientStories || [])
      .map(
        (s) => `
      <a href="patient-story.html?id=${s.id}" class="hss-patient hss-patient--link" aria-label="${s.name}">
        <div class="hss-patient__photo">
          <img src="${s.image || 'images/team-member-03.jpg'}" alt="${s.name}" loading="lazy" decoding="async" width="320" height="320" />
        </div>
        <h3>${s.name}</h3>
        <p class="hss-patient__loc">${s.location}</p>
        <p class="hss-patient__tx">${s.treatment}</p>
      </a>`
      )
      .join('');
  }

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
  if (typeof I18n !== 'undefined' && data._cms?.i18nOverrides) {
    I18n.setOverrides(data._cms.i18nOverrides);
    I18n.applyDOM();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await HospitalApp.init();
  renderHomePage();
  window.addEventListener('hospital:refresh', () => {
    renderHomePage();
  });
});
