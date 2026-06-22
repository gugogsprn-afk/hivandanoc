/** Shared doctor search band (index + doctors pages) */
function initDoctorSearchBand(data) {
  const datalist = document.getElementById('search-suggestions');
  const categorySelect = document.getElementById('doctor-search-category');
  if (!datalist) return;

  const lang = typeof I18n !== 'undefined' ? I18n.getLang() : 'hy';
  const loc = typeof I18n !== 'undefined' ? I18n.getContent() : null;
  let departments = data.departments || [];
  let doctors = data.doctors || [];
  let categories = data.serviceCategories || [];
  let conditions = data.conditions || [];

  if (loc) {
    if (loc.departments?.length) {
      const map = new Map(loc.departments.map((d) => [d.id, d]));
      departments = departments.map((d) => ({ ...d, ...map.get(d.id) }));
    }
    if (loc.doctors?.length) {
      const map = new Map(loc.doctors.map((d) => [d.id, d]));
      doctors = doctors.map((d) => ({ ...d, ...map.get(d.id) }));
    }
    if (loc.serviceCategories?.length) {
      const map = new Map(loc.serviceCategories.map((c) => [c.id, c]));
      categories = categories.map((c) => ({ ...c, ...map.get(c.id) }));
    }
    if (loc.conditions?.length) conditions = loc.conditions;
  }

  const terms = new Set();
  conditions.forEach((c) => terms.add(c));
  departments.forEach((d) => {
    if (d.name) terms.add(d.name);
    (d.services || []).forEach((s) => terms.add(s));
  });
  doctors.forEach((d) => {
    if (d.name) terms.add(d.name);
    if (d.role) terms.add(d.role);
  });

  datalist.innerHTML = [...terms]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, lang))
    .map((term) => `<option value="${String(term).replace(/"/g, '&quot;')}"></option>`)
    .join('');

  if (categorySelect) {
    const t = (k) => I18n.t(k);
    const saved = categorySelect.value;
    categorySelect.innerHTML =
      `<option value="">${t('pages.home.searchCategoryAll')}</option>` +
      categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
    if (saved) categorySelect.value = saved;
  }

  const form = document.getElementById('doctor-search-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.querySelector('[name="q"]')?.value?.trim();
      const cat = form.querySelector('[name="category"]')?.value;
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);
      const base = form.getAttribute('action') || '/find-a-doctor';
      window.location.href = `${base}${params.toString() ? `?${params}` : ''}`;
    });
  }

  const params = new URLSearchParams(window.location.search);
  const qInput = document.querySelector('#doctor-search-form [name="q"]');
  if (qInput && params.get('q')) qInput.value = params.get('q');
  if (categorySelect && params.get('category')) categorySelect.value = params.get('category');
}
