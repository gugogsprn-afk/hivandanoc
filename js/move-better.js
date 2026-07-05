function articleCard(a) {
  return `
    <article class="hss-mb-card">
      <a href="#" class="hss-mb-card__img">
        <img src="${a.image}" alt="" loading="lazy">
      </a>
      <div class="hss-mb-card__body">
        <span class="hss-mb-card__cat">${a.category || ''}</span>
        <h3><a href="#">${a.title}</a></h3>
        ${a.excerpt ? `<p>${a.excerpt}</p>` : ''}
        ${a.author ? `<p class="hss-mb-card__author">${a.author}</p>` : ''}
      </div>
    </article>`;
}

function videoCard(v) {
  const overlay = v.overlay
    ? `<span class="hss-mb-video__overlay">${v.overlay}</span>`
    : '';
  return `
    <article class="hss-mb-video">
      <a href="#" class="hss-mb-video__thumb">
        <img src="${v.image}" alt="" loading="lazy">
        ${overlay}
        <span class="hss-mb-video__play" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </span>
      </a>
      <h3><a href="#">${v.title}</a></h3>
    </article>`;
}

function renderFeatured(mb) {
  const el = document.getElementById('mb-featured');
  if (!el || !mb?.featured) return;
  const f = mb.featured;
  const sidebar = (mb.sidebar || [])
    .map(
      (s) => `
    <article class="hss-mb-side">
      <a href="#" class="hss-mb-side__img"><img src="${s.image}" alt="" loading="lazy"></a>
      <div>
        <span class="hss-mb-card__cat">${s.category || ''}</span>
        <h3><a href="#">${s.title}</a></h3>
      </div>
    </article>`
    )
    .join('');

  el.innerHTML = `
    <div class="hss-mb-featured">
      <article class="hss-mb-featured__main">
        <a href="#" class="hss-mb-featured__img">
          <img src="${f.image}" alt="" loading="lazy">
        </a>
        <div class="hss-mb-featured__box">
          <span class="hss-mb-card__cat">${f.category || ''}</span>
          <h2 class="hss-serif"><a href="#">${f.title}</a></h2>
          ${f.excerpt ? `<p>${f.excerpt}</p>` : ''}
        </div>
      </article>
      <div class="hss-mb-featured__side">${sidebar}</div>
    </div>`;
}

function renderTopicSections(mb, t) {
  const el = document.getElementById('mb-topic-sections');
  if (!el) return;
  const titles = {
    hip: t('pages.moveBetter.sectionHip'),
    stretching: t('pages.moveBetter.sectionStretching'),
    backPain: t('pages.moveBetter.sectionBackPain')
  };

  el.innerHTML = (mb.topicSections || [])
    .map((sec) => {
      const cards = (sec.articles || []).map(articleCard).join('');
      return `
      <section class="hss-section${sec.id === 'stretching' ? ' hss-section--alt' : ''}">
        <div class="hss-wrap">
          <h2 class="hss-mb-section-title hss-serif">${titles[sec.id] || sec.id}</h2>
          <div class="hss-mb-grid">${cards}</div>
        </div>
      </section>`;
    })
    .join('');
}

function renderPrograms(mb, t) {
  const el = document.getElementById('mb-programs');
  const p = mb?.programsBanner;
  if (!el || !p) return;
  el.innerHTML = `
    <div class="hss-wrap hss-mb-programs__grid">
      <div class="hss-mb-programs__text">
        <span class="hss-mb-programs__badge">${p.badge}</span>
        <h2 class="hss-serif">${p.title}</h2>
        <p>${p.text}</p>
        <a href="appointment.html" class="hss-btn hss-btn--primary">${p.cta}</a>
      </div>
      <div class="hss-mb-programs__media">
        <img src="${p.image}" alt="" loading="lazy">
      </div>
    </div>`;
}

function renderTextArticles(mb) {
  const el = document.getElementById('mb-text-articles');
  if (!el) return;
  el.innerHTML = `
    <div class="hss-mb-text-grid">
      ${(mb.textArticles || [])
        .map(
          (a) => `
        <article class="hss-mb-text-card">
          <h3><a href="#">${a.title}</a></h3>
          <p>${a.excerpt || ''}</p>
          <p class="hss-mb-card__author">${a.author || ''}</p>
        </article>`
        )
        .join('')}
    </div>`;
}

function renderCtaDuo(t) {
  const el = document.getElementById('mb-cta-duo');
  if (!el) return;
  el.innerHTML = `
    <div class="hss-mb-cta-box">
      <h3>${t('pages.moveBetter.ctaCommunityTitle')}</h3>
      <p>${t('pages.moveBetter.ctaCommunityDesc')}</p>
      <a href="contacts.html" class="hss-btn hss-btn--white">${t('pages.moveBetter.ctaSubscribe')}</a>
    </div>
    <div class="hss-mb-cta-box">
      <h3>${t('pages.moveBetter.ctaEventsTitle')}</h3>
      <p>${t('pages.moveBetter.ctaEventsDesc')}</p>
      <a href="contacts.html" class="hss-btn hss-btn--white">${t('pages.moveBetter.ctaSubscribe')}</a>
    </div>`;
}

function renderVideos(mb, t) {
  const el = document.getElementById('mb-videos');
  if (!el) return;
  el.innerHTML = `
    <h2 class="hss-mb-section-title hss-serif">${t('pages.moveBetter.sectionVideos')}</h2>
    <div class="hss-mb-grid hss-mb-grid--videos">
      ${(mb.videos || []).map(videoCard).join('')}
    </div>`;
}

function renderPress(mb, t) {
  const el = document.getElementById('mb-press');
  const section = document.getElementById('mb-press-section');
  const items = mb?.pressNews || [];
  if (section) section.hidden = items.length === 0;
  if (!el || !items.length) {
    if (el) el.innerHTML = '';
    return;
  }
  el.innerHTML = `
    <h2 class="hss-mb-section-title hss-serif">${t('pages.moveBetter.sectionPress')}</h2>
    <div class="hss-mb-press-grid">
      ${(mb.pressNews || [])
        .map(
          (n) => `
        <article class="hss-mb-press-card">
          <span class="hss-mb-press-card__source">${n.source}</span>
          <h3><a href="#">${n.title}</a></h3>
          <p class="hss-mb-card__author">${n.author || ''}</p>
        </article>`
        )
        .join('')}
    </div>`;
}

function renderCategories(mb, t) {
  const el = document.getElementById('mb-categories');
  if (!el) return;
  el.innerHTML = `
    <h2 class="hss-mb-section-title hss-serif">${t('pages.moveBetter.sectionReadMore')}</h2>
    <div class="hss-mb-cat-tiles">
      ${(mb.categories || [])
        .map(
          (c) => `
        <a href="#" class="hss-mb-cat-tile">
          <img src="${c.image}" alt="" loading="lazy">
          <span>${c.label}</span>
        </a>`
        )
        .join('')}
    </div>`;
}

function renderMoveBetterPage() {
  const data = HospitalApp.getData();
  const mb = data?.moveBetter;
  if (!mb) return;
  const t = (k) => I18n.t(k);

  renderFeatured(mb);
  renderTopicSections(mb, t);
  renderPrograms(mb, t);
  renderTextArticles(mb);
  renderCtaDuo(t);
  renderVideos(mb, t);
  renderPress(mb, t);
  renderCategories(mb, t);
  HospitalApp.initAnimations();
}

document.addEventListener('DOMContentLoaded', async () => {
  await HospitalApp.init();
  I18n.applyDOM();
  renderMoveBetterPage();
  window.addEventListener('hospital:refresh', () => {
    I18n.applyDOM();
    renderMoveBetterPage();
  });
});
