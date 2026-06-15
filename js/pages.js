let pagesData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (!page || page === 'home') return;

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
      signImg.src = h.aboutImage || 'images/about/center-sign.png';
      signImg.alt = I18n.t('pages.about.signCaption');
    }

    initAboutArticle();

    const leadershipEl = document.getElementById('about-leadership');
    if (leadershipEl && data.doctors?.length) {
      const chairs = data.doctors.slice(0, 2);
      const members = data.doctors.slice(2, 6);
      leadershipEl.innerHTML = `
        <div class="hss-about-council__col">
          <h3>${t('pages.about.leadershipCoChairs')}</h3>
          <ul>${chairs.map((d) => `<li>${d.name}<span>${d.role}</span></li>`).join('')}</ul>
        </div>
        <div class="hss-about-council__col">
          <h3>${t('pages.about.leadershipMembers')}</h3>
          <ul>${members.map((d) => `<li>${d.name}<span>${d.role}</span></li>`).join('')}</ul>
        </div>`;
    }

    const awardsEl = document.getElementById('about-awards');
    if (awardsEl && data.awards?.length) {
      awardsEl.innerHTML = data.awards
        .map((a) => `<div class="hss-about-award"><strong>${a.label}</strong><span>${a.desc}</span></div>`)
        .join('');
    }

    const valuesEl = document.getElementById('about-values');
    if (valuesEl) {
      valuesEl.innerHTML = [1, 2, 3, 4]
        .map((n) => `<li>${t(`pages.about.value${n}`)}</li>`)
        .join('');
    }

    initAboutSubnav();
  }

  if (page === 'doctors') {
    initDoctorSearchBand(data);
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').toLowerCase();
    let doctors = data.doctors;
    if (q) {
      doctors = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          HospitalApp.departmentName(d.departmentId).toLowerCase().includes(q)
      );
    }
    renderDoctors({ ...data, doctors });
    initDoctorFilter(data);
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
    const map = document.getElementById('map-placeholder');
    if (map) map.textContent = h.address;
  }
}

function doctorCategory(doc, departments) {
  const dept = departments.find((d) => d.id === doc.departmentId);
  return dept?.category || '';
}

function isSurgeonDoc(doc) {
  if (doc.isSurgeon === true) return true;
  return /ортопед|хирург|surgeon|orthop/i.test(doc.role || '');
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
    <article class="hss-doctor-item fade-in" data-dept="${doc.departmentId}">
      <div class="hss-doctor-item__main">
        <div class="hss-doctor-item__name">${doc.name}</div>
        <div class="hss-doctor-item__role">${doc.role}</div>
        <div class="hss-doctor-item__loc">${doc.location || h.address || ''}</div>
      </div>
      <div class="hss-doctor-item__actions">
        <a href="appointment.html?doctor=${doc.id}" class="hss-btn hss-btn--primary">${t('common.bookOnline')}</a>
        <a href="tel:${tel}" class="hss-btn hss-btn--outline">${t('common.callUs')}</a>
      </div>
    </article>`
    )
    .join('');
  observeNewCards();
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
      const cat = btn.dataset.category;
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

  bar.onclick = (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderDepartments(data, btn.dataset.category || null);
  };
}

function observeNewCards() {
  document.querySelectorAll('.team-member, .doctor-row, .hss-doctor-item, .dept-card, .hss-service-group, .hss-service-item').forEach((el) => {
    delete el.dataset.animObserved;
  });
  HospitalApp.initAnimations();
}

function renderDepartments(data, filterCategory) {
  const grid = document.getElementById('departments-grid');
  if (!grid) return;
  const t = (k) => I18n.t(k);
  const categories = data.serviceCategories || [];
  const list = filterCategory
    ? data.departments.filter((d) => d.category === filterCategory)
    : data.departments;

  const groups = filterCategory
    ? [{ id: filterCategory, name: categories.find((c) => c.id === filterCategory)?.name || '' }]
    : categories;

  grid.innerHTML = groups
    .map((cat) => {
      const items = list.filter((d) => d.category === cat.id);
      if (!items.length) return '';
      return `
      <section class="hss-service-group fade-in" data-category="${cat.id}">
        <h2 class="hss-service-group__title">${cat.name}</h2>
        <ul class="hss-service-list">
          ${items
            .map(
              (d) => `
            <li class="hss-service-item">
              <div class="hss-service-item__main">
                <h3 class="hss-service-item__name">${d.name}</h3>
                <p class="hss-service-item__desc">${d.description}</p>
              </div>
              <a href="appointment.html?department=${d.id}" class="hss-btn hss-btn--outline">${t('common.bookOnline')}</a>
            </li>`
            )
            .join('')}
        </ul>
      </section>`;
    })
    .join('');
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
