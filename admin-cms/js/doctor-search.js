/** Shared doctor search band (index + doctors pages) */

function buildDoctorSearchIndex(data) {
  const departments = data.departments || [];
  const doctors = data.doctors || [];
  const conditions = data.conditions || [];
  const termMap = new Map();

  conditions.forEach((c) => {
    if (c) termMap.set(c, { type: 'condition' });
  });
  departments.forEach((d) => {
    if (d.name) {
      termMap.set(d.name, { type: 'department', id: d.id, category: d.category || '' });
    }
  });
  doctors.forEach((d) => {
    if (!d.name) return;
    const dept = departments.find((x) => x.id === d.departmentId);
    termMap.set(d.name, {
      type: 'doctor',
      id: d.id,
      departmentId: d.departmentId,
      category: dept?.category || ''
    });
  });

  return { departments, doctors, conditions, termMap };
}

function doctorSearchTerms(index, categoryId) {
  const { departments, doctors, conditions, termMap } = index;
  const terms = new Set();

  conditions.forEach((c) => {
    if (c) terms.add(c);
  });

  departments.forEach((d) => {
    if (!d.name) return;
    if (categoryId && d.category !== categoryId) return;
    terms.add(d.name);
  });

  doctors.forEach((d) => {
    if (!d.name) return;
    const dept = departments.find((x) => x.id === d.departmentId);
    if (categoryId && dept?.category !== categoryId) return;
    terms.add(d.name);
  });

  return [...terms].filter(Boolean);
}

function resolveDoctorSearchQuery(q, index) {
  const text = (q || '').trim();
  if (!text) return { q: '' };

  const meta = index.termMap.get(text);
  if (meta?.type === 'department') {
    return { q: text, dept: meta.id, category: meta.category || '' };
  }
  if (meta?.type === 'doctor') {
    return { q: text, doctor: meta.id, category: meta.category || '' };
  }
  return { q: text };
}

function filterDoctorsForSearch(data, opts = {}) {
  const index = buildDoctorSearchIndex(data);
  let doctors = [...(data.doctors || [])];
  const q = (opts.q || '').trim();
  const category = opts.category || '';
  const deptId = opts.dept || '';
  const doctorId = opts.doctor || '';

  if (category) {
    const norm = (value) =>
      typeof ServiceCatalog !== 'undefined'
        ? ServiceCatalog.normalizeCategoryId(value)
        : String(value ?? '').trim().toLowerCase();
    const serviceCat = (item) =>
      typeof ServiceCatalog !== 'undefined'
        ? ServiceCatalog.serviceCategoryId(item)
        : String(item?.category ?? item?.category_id ?? '').trim().toLowerCase();
    const cat = norm(category);
    const allowed = new Set(
      index.departments.filter((d) => serviceCat(d) === cat).map((d) => d.id)
    );
    doctors = doctors.filter((d) => allowed.has(d.departmentId));
  }

  if (doctorId) {
    doctors = doctors.filter((d) => d.id === doctorId);
    return doctors;
  }

  if (deptId) {
    doctors = doctors.filter((d) => d.departmentId === deptId);
    return doctors;
  }

  if (!q) return doctors;

  const resolved = resolveDoctorSearchQuery(q, index);
  if (resolved.dept) {
    return doctors.filter((d) => d.departmentId === resolved.dept);
  }
  if (resolved.doctor) {
    return doctors.filter((d) => d.id === resolved.doctor);
  }

  const qLower = q.toLocaleLowerCase();
  return doctors.filter((d) => {
    const dept = index.departments.find((x) => x.id === d.departmentId);
    const deptName = dept?.name || '';
    return (
      d.name.toLocaleLowerCase().includes(qLower) ||
      (d.role || '').toLocaleLowerCase().includes(qLower) ||
      deptName.toLocaleLowerCase().includes(qLower)
    );
  });
}

function initDoctorSearchBand(data) {
  const categorySelect = document.getElementById('doctor-search-category');
  const form = document.getElementById('doctor-search-form');
  const qInput = form?.querySelector('[name="clinic-search"]') || form?.querySelector('[name="q"]');
  if (!form || !qInput) return;

  const lang = typeof I18n !== 'undefined' ? I18n.getLang() : 'hy';
  const categories = data.serviceCategories || [];
  const index = buildDoctorSearchIndex(data);

  let fieldWrap = qInput.closest('.hss-search-field');
  if (!fieldWrap) {
    fieldWrap = document.createElement('div');
    fieldWrap.className = 'hss-search-field';
    qInput.parentNode.insertBefore(fieldWrap, qInput);
    fieldWrap.appendChild(qInput);
  }

  let listEl = fieldWrap.querySelector('.hss-search-suggestions');
  if (!listEl) {
    listEl = document.createElement('ul');
    listEl.className = 'hss-search-suggestions';
    listEl.id = 'search-suggestions-list';
    listEl.setAttribute('role', 'listbox');
    listEl.hidden = true;
    fieldWrap.appendChild(listEl);
  }

  qInput.removeAttribute('list');
  qInput.setAttribute('autocomplete', 'off');
  qInput.setAttribute('autocorrect', 'off');
  qInput.setAttribute('autocapitalize', 'off');
  qInput.setAttribute('spellcheck', 'false');
  qInput.setAttribute('data-lpignore', 'true');
  qInput.setAttribute('data-1p-ignore', 'true');
  if (qInput.type === 'search') qInput.type = 'text';

  const datalist = document.getElementById('search-suggestions');
  if (datalist) datalist.remove();

  function currentCategory() {
    return categorySelect?.value || '';
  }

  function activeTerms() {
    return doctorSearchTerms(index, currentCategory()).sort((a, b) => a.localeCompare(b, lang));
  }

  function filterTerms(query) {
    const items = activeTerms();
    const q = query.trim().toLocaleLowerCase(lang);
    if (!q) return items.slice(0, 14);
    return items.filter((term) => term.toLocaleLowerCase(lang).includes(q)).slice(0, 14);
  }

  function hideSuggestions() {
    listEl.hidden = true;
    listEl.innerHTML = '';
  }

  function renderSuggestions(items) {
    if (!items.length) {
      hideSuggestions();
      return;
    }
    listEl.innerHTML = items
      .map(
        (term) =>
          `<li role="option"><button type="button" class="hss-search-suggestions__item">${String(term).replace(/</g, '&lt;')}</button></li>`
      )
      .join('');
    listEl.hidden = false;
  }

  function showSuggestions() {
    renderSuggestions(filterTerms(qInput.value));
  }

  if (!qInput.dataset.suggestionsBound) {
    qInput.dataset.suggestionsBound = '1';

    qInput.addEventListener('focus', showSuggestions);
    qInput.addEventListener('input', showSuggestions);

    listEl.addEventListener('mousedown', (e) => {
      const btn = e.target.closest('.hss-search-suggestions__item');
      if (!btn) return;
      e.preventDefault();
      const value = btn.textContent.trim();
      qInput.value = value;
      const meta = index.termMap.get(value);
      if (meta?.category && categorySelect) {
        categorySelect.value = meta.category;
      }
      hideSuggestions();
    });

    qInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideSuggestions();
    });

    document.addEventListener('click', (e) => {
      if (!fieldWrap.contains(e.target)) hideSuggestions();
    });
  }

  if (categorySelect) {
    const t = (k) => I18n.t(k);
    const saved = categorySelect.value;
    categorySelect.innerHTML =
      `<option value="">${t('pages.home.searchCategoryAll')}</option>` +
      categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
    if (saved) categorySelect.value = saved;

    if (!categorySelect.dataset.searchBound) {
      categorySelect.dataset.searchBound = '1';
      categorySelect.addEventListener('change', () => {
        showSuggestions();
      });
    }
  }

  if (!form.dataset.bound) {
    form.dataset.bound = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hideSuggestions();
      const q = qInput.value?.trim();
      const cat = form.querySelector('[name="category"]')?.value || '';
      if (!q && !cat) return;
      const resolved = resolveDoctorSearchQuery(q, index);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      const category = cat || resolved.category || '';
      if (category) params.set('category', category);
      if (resolved.dept) params.set('dept', resolved.dept);
      if (resolved.doctor) params.set('doctor', resolved.doctor);
      const base = form.getAttribute('action') || '/find-a-doctor';
      window.location.href = `${base}${params.toString() ? `?${params}` : ''}`;
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) qInput.value = params.get('q');
  if (categorySelect && params.get('category')) categorySelect.value = params.get('category');
}

if (typeof window !== 'undefined') {
  window.filterDoctorsForSearch = filterDoctorsForSearch;
  window.addEventListener('languagechange', () => {
    const data = typeof HospitalApp !== 'undefined' ? HospitalApp.getData() : null;
    if (data) initDoctorSearchBand(data);
  });
}
