let pagesData = null;

const HUB_ROOTS = {
  'conditions-hub': 'conditions-hub-root',
  'services-hub': 'services-hub-root',
  'knowledge-hub': 'knowledge-hub-root'
};

async function hydrateHubRoot(rootId) {
  const root = document.getElementById(rootId);
  if (!root || root.querySelector('.seo-crawl-content')) return;
  try {
    const res = await fetch(window.location.pathname, { credentials: 'same-origin' });
    if (!res.ok) return;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const src = doc.getElementById(rootId);
    if (src?.innerHTML?.trim()) root.innerHTML = src.innerHTML;
  } catch (err) {
    console.warn('Hub content hydrate failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (!page || page === 'home') return;

  const hubRootId = HUB_ROOTS[page];
  if (hubRootId) await hydrateHubRoot(hubRootId);

  pagesData = await HospitalApp.init();
  renderPageContent(page);

  window.addEventListener('hospital:refresh', () => {
    pagesData = HospitalApp.getData();
    renderPageContent(page);
  });
});

function renderPageContent(page) {
  const data = pagesData || HospitalApp.getData();
  if (!data) return;
  const h = data.hospital;
  const t = (k) => I18n.t(k);

  if (page === 'about') {
    const missionEl = document.getElementById('mission-text');
    if (missionEl) missionEl.textContent = h.mission || '';

    const heroImg = document.getElementById('about-hero-img');
    if (heroImg && h.heroImage) heroImg.src = h.heroImage;

    const signImg = document.getElementById('about-sign-img');
    if (signImg) {
      signImg.src = h.aboutImage || 'images/about/center-building.png';
      signImg.alt = I18n.t('pages.about.signCaption');
    }

    initAboutArticle();

    const leadershipEl = document.getElementById('about-leadership');
    if (leadershipEl && data.doctors?.length) {
      const chairs = data.doctors.slice(0, 2);
      const members = data.doctors.slice(2, 6);
      const councilCard = (d) => {
        const initials = String(d.name || '?')
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase();
        return `<li class="hss-about-council__card">
          <span class="hss-about-council__avatar" aria-hidden="true">${initials}</span>
          <div class="hss-about-council__meta">
            <strong>${d.name}</strong>
            <span>${d.role}</span>
          </div>
        </li>`;
      };
      leadershipEl.innerHTML = `
        <div class="hss-about-council__col hss-about-council__panel">
          <h3>${t('pages.about.leadershipCoChairs')}</h3>
          <ul>${chairs.map(councilCard).join('')}</ul>
        </div>
        <div class="hss-about-council__col hss-about-council__panel">
          <h3>${t('pages.about.leadershipMembers')}</h3>
          <ul>${members.map(councilCard).join('')}</ul>
        </div>`;
    }

    const awardsEl = document.getElementById('about-awards');
    if (awardsEl && data.awards?.length) {
      awardsEl.innerHTML = data.awards
        .map(
          (a, i) =>
            `<div class="hss-about-award hss-about-award--premium">
              <span class="hss-about-award__badge" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
              <div class="hss-about-award__content">
                <strong>${a.label}</strong>
                <span>${a.desc}</span>
              </div>
            </div>`
        )
        .join('');
    }

    const valuesEl = document.getElementById('about-values');
    if (valuesEl) {
      valuesEl.innerHTML = [1, 2, 3, 4]
        .map(
          (n) =>
            `<li class="hss-about-value-card">
              <span class="hss-about-value-card__num" aria-hidden="true">${n}</span>
              <span class="hss-about-value-card__text">${t(`pages.about.value${n}`)}</span>
            </li>`
        )
        .join('');
    }

    initAboutSubnav();
  }

  if (page === 'doctors') {
    initDoctorSearchBand(data);
    const params = new URLSearchParams(window.location.search);
    const searchOpts = {
      q: params.get('q') || '',
      category: params.get('category') || '',
      dept: params.get('dept') || '',
      doctor: params.get('doctor') || ''
    };
    const filteredDoctors =
      typeof filterDoctorsForSearch === 'function'
        ? filterDoctorsForSearch(data, searchOpts)
        : data.doctors;
    const viewData = { ...data, doctors: filteredDoctors };
    renderDoctors(viewData);
    initDoctorFilter(viewData);
  }

  if (page === 'departments') {
    initServiceFilter(data);
    renderDepartments(data);
    observeNewCards();
  }

  if (page === 'contacts') {
    const phoneEl = document.getElementById('contact-phone');
    if (phoneEl) {
      const tel = HospitalApp.phoneTelUri(h.phone);
      phoneEl.innerHTML = tel
        ? `<a href="tel:${tel}" class="hss-link hss-link--tel">${h.phone}</a>`
        : h.phone;
    }
    document.getElementById('contact-email').textContent = h.email;
    document.getElementById('contact-address').textContent = h.address;
    document.getElementById('contact-hours').textContent = h.hours;
    HospitalApp.updatePhoneLinks(h);
    if (typeof ContactMap !== 'undefined') {
      ContactMap.render(document.getElementById('map-placeholder'), h);
    } else if (typeof HospitalApp.renderHospitalMap === 'function') {
      HospitalApp.renderHospitalMap(document.getElementById('map-placeholder'), h);
    }
  }
}

function doctorCategory(doc, departments) {
  const dept = (departments || []).find((d) => d.id === doc.departmentId);
  if (typeof ServiceCatalog !== 'undefined') {
    return ServiceCatalog.serviceCategoryId(dept);
  }
  return dept?.category || '';
}

function isSurgeonDoc(doc) {
  if (doc.isSurgeon === true) return true;
  return /ортопед|хирург|surgeon|orthop/i.test(doc.role || '');
}

function doctorInitials(name) {
  if (typeof DoctorPortrait !== 'undefined') return DoctorPortrait.initials(name);
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
}

function resolveDoctorImageUrl(url) {
  if (typeof DoctorPortrait !== 'undefined') return DoctorPortrait.resolveUploadedUrl(url);
  const raw = String(url || '').trim();
  if (!raw || /placeholder\.svg(\?|#|$)/i.test(raw)) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  const prefix =
    typeof HospitalApp !== 'undefined' && typeof HospitalApp.pathPrefix === 'function'
      ? HospitalApp.pathPrefix()
      : '';
  return `${prefix}${raw}`;
}

function doctorPhotoHTML(doc) {
  if (typeof DoctorPortrait !== 'undefined') return DoctorPortrait.html(doc);
  const src = resolveDoctorImageUrl(doc.image || doc.image_url);
  const initials = doctorInitials(doc.name);
  const alt = doc.name ? String(doc.name).replace(/"/g, '&quot;') : 'Doctor';

  if (src) {
    return `<div class="hss-doctor-item__photo-wrap">
      <div class="hss-doctor-item__photo">
        <div class="hss-doctor-item__photo-inner">
          <img src="${src}" alt="${alt}" class="hss-doctor-item__photo-img" loading="lazy" decoding="async">
        </div>
      </div>
    </div>`;
  }

  return `<div class="hss-doctor-item__photo-wrap">
    <div class="hss-doctor-item__photo">
      <div class="hss-doctor-item__photo-inner hss-doctor-item__photo-inner--fallback">
        <span class="hss-doctor-item__initials">${initials}</span>
      </div>
    </div>
  </div>`;
}

function renderDoctors(data, surgeonOnly) {
  const grid = document.getElementById('doctors-grid');
  if (!grid) return;
  const t = (k) => I18n.t(k);
  const h = data.hospital || {};
  const tel = HospitalApp.phoneTelUri(h.phone);

  const list = surgeonOnly ? data.doctors.filter(isSurgeonDoc) : data.doctors;

  grid.innerHTML = list
    .map(
      (doc) => `
    <article class="hss-doctor-item fade-in" data-dept="${doc.departmentId}" data-doctor-id="${doc.id}">
      ${doctorPhotoHTML(doc)}
      <div class="hss-doctor-item__main">
        <div class="hss-doctor-item__name">${doc.name}</div>
        <div class="hss-doctor-item__role">${doc.role}</div>
        ${doc.experience ? `<div class="hss-doctor-item__exp">${doc.experience}</div>` : ''}
        <div class="hss-doctor-item__loc">${doc.location || h.address || ''}</div>
        ${doc.bio ? `<p class="hss-doctor-item__bio">${doc.bio}</p>` : ''}
      </div>
      <div class="hss-doctor-item__actions">
        <a href="appointment.html?doctor=${doc.id}" class="hss-btn hss-btn--primary">${t('common.bookOnline')}</a>
        <a href="tel:${tel}" class="hss-btn hss-btn--outline">${t('common.callUs')}</a>
      </div>
    </article>`
    )
    .join('');
  observeNewCards({ instant: true });
}

function initDoctorFilter(data) {
  const bar = document.getElementById('doctor-filters');
  if (bar) {
    const t = (k) => I18n.t(k);
    const categories = data.serviceCategories || [];
    bar.innerHTML =
      `<button type="button" class="filter-btn active" data-category="">${t('common.filterAll')}</button>` +
      categories
        .map(
          (c) =>
            `<button type="button" class="filter-btn" data-category="${c.id}">${c.name}</button>`
        )
        .join('');
    bar.onclick = (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = ServiceCatalog?.normalizeCategoryId(btn.dataset.category) || btn.dataset.category;
      if (!cat) {
        renderDoctors(data, false);
        return;
      }
      const filtered = data.doctors.filter(
        (d) => doctorCategory(d, data.departments) === cat
      );
      renderDoctors({ ...data, doctors: filtered }, false);
    };
    return;
  }

  const cb = document.getElementById('surgeon-only-filter');
  if (!cb || cb.dataset.bound) return;
  cb.dataset.bound = '1';
  cb.addEventListener('change', () => {
    renderDoctors(data, cb.checked);
  });
}

function initServiceFilter(data) {
  const bar = document.getElementById('service-filters');
  if (!bar) return;
  const t = (k) => I18n.t(k);
  const categories = data.serviceCategories || [];

  bar.innerHTML =
    `<button type="button" class="filter-btn active" data-category="">${t('common.filterAll')}</button>` +
    categories
      .map(
        (c) =>
          `<button type="button" class="filter-btn" data-category="${c.id}">${c.name}</button>`
      )
      .join('');

  if (bar.dataset.bound) return;
  bar.dataset.bound = '1';

  bar.onclick = (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const current = typeof HospitalApp !== 'undefined' ? HospitalApp.getData() : data;
    renderDepartments(current || data, btn.dataset.category || null, { instant: true });
  };
}

function observeNewCards(opts) {
  const instant = opts === true || opts?.instant;
  document.querySelectorAll('.team-member, .doctor-row, .hss-doctor-item, .dept-card, .hss-service-group, .hss-service-item').forEach((el) => {
    delete el.dataset.animObserved;
  });
  if (instant) {
    document
      .querySelectorAll('#departments-grid .fade-in, #doctors-grid .fade-in')
      .forEach((el) => el.classList.add('animate'));
    return;
  }
  HospitalApp.initAnimations();
}

function renderDepartments(data, filterCategory, options) {
  const grid = document.getElementById('departments-grid');
  if (!grid) return;
  const t = (k) => I18n.t(k);
  const departments = data.departments || [];
  const categories = data.serviceCategories || [];
  const catalog =
    typeof ServiceCatalog !== 'undefined'
      ? ServiceCatalog.groupServicesByCategory(departments, categories, filterCategory || null)
      : fallbackServiceGroups(departments, categories, filterCategory);

  const categoryIcons = {
    consult: '🩺',
    therapy: '🖐',
    treatment: '💊',
    rehab: '🏃',
    diagnostics: '🔬'
  };

  if (!catalog?.length) {
    grid.innerHTML = `<div class="hss-service-empty fade-in animate" role="status">
      <p class="hss-service-empty__title">${t('pages.departments.emptyTitle') || 'No services in this category yet'}</p>
      <p class="hss-service-empty__hint">${t('pages.departments.emptyHint') || 'Try another category or view all services.'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = catalog
    .map(({ category: cat, items }) => {
      const catIcon = categoryIcons[cat.id] || categoryIcons[ServiceCatalog?.normalizeCategoryId(cat.id)] || '🏥';
      return `
      <section class="hss-service-group fade-in" data-category="${cat.id}">
        <header class="hss-service-group__head">
          <span class="hss-service-group__badge" aria-hidden="true">${catIcon}</span>
          <h2 class="hss-service-group__title">${cat.name}</h2>
        </header>
        <ul class="hss-service-list">
          ${items
            .map((d) => {
              const src = resolveDoctorImageUrl(d.image || d.image_url);
              const icon = d.icon || catIcon || '🩺';
              const bullets = (d.services || []).filter(Boolean).slice(0, 3);
              const meta = [d.price, d.duration].filter(Boolean).join(' · ');
              const visual = src
                ? `<div class="hss-service-item__media"><div class="hss-service-item__photo"><img src="${src}" alt="" loading="lazy" decoding="async"></div></div>`
                : `<div class="hss-service-item__media"><div class="hss-service-item__icon" aria-hidden="true">${icon}</div></div>`;

              return `
            <li class="hss-service-item">
              <article class="hss-service-item__card">
                <div class="hss-service-item__head">
                  ${visual}
                  <div class="hss-service-item__head-text">
                    <h3 class="hss-service-item__name">${d.name}</h3>
                    ${meta ? `<p class="hss-service-item__meta">${meta}</p>` : ''}
                  </div>
                </div>
                <p class="hss-service-item__desc">${d.description}</p>
                ${
                  bullets.length
                    ? `<ul class="hss-service-item__bullets">${bullets.map((s) => `<li>${s}</li>`).join('')}</ul>`
                    : ''
                }
                <div class="hss-service-item__footer">
                  <a href="appointment.html?department=${d.id}" class="hss-btn hss-btn--primary hss-service-item__cta">${t('common.bookOnline')}</a>
                </div>
              </article>
            </li>`;
            })
            .join('')}
        </ul>
      </section>`;
    })
    .join('');
  observeNewCards({ instant: !!(options && options.instant) || !!filterCategory });
}

function fallbackServiceGroups(departments, categories, filterCategory) {
  const norm = (value) => String(value ?? '').trim().toLowerCase();
  const serviceCat = (item) => norm(item?.category ?? item?.category_id ?? item?.categoryId);
  const catFilter = norm(filterCategory);
  const list = catFilter ? departments.filter((d) => serviceCat(d) === catFilter) : departments;
  const pickCategories = catFilter
    ? categories.filter((c) => norm(c.id) === catFilter)
    : categories;

  return pickCategories
    .map((category) => ({
      category,
      items: list.filter((d) => serviceCat(d) === norm(category.id))
    }))
    .filter((group) => group.items.length);
}

function initAboutSubnav() {
  const subnav = document.getElementById('about-subnav');
  if (!subnav) return;

  const links = subnav.querySelectorAll('a[data-section]');
  const sections = [...links].map((a) => document.getElementById(a.dataset.section)).filter(Boolean);

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle('is-active', a.dataset.section === id));
  };

  const syncFromScroll = () => {
    const offset = 200;
    let current = 'overview';
    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= offset) current = sec.id;
    });
    setActive(current);
  };

  const hash = (window.location.hash || '#overview').slice(1);
  if (hash) setActive(hash);

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  syncFromScroll();
}
