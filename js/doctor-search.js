/** Shared doctor search band (index + doctors pages) */
function initDoctorSearchBand(data) {
  const datalist = document.getElementById('search-suggestions');
  const categorySelect = document.getElementById('doctor-search-category');
  if (!datalist) return;

  const terms = new Set();
  (data.conditions || []).forEach((c) => terms.add(c));
  (data.departments || []).forEach((d) => {
    terms.add(d.name);
    (d.services || []).forEach((s) => terms.add(s));
  });
  (data.doctors || []).forEach((d) => {
    terms.add(d.name);
    terms.add(d.role);
  });

  datalist.innerHTML = [...terms]
    .sort()
    .map((t) => `<option value="${t.replace(/"/g, '&quot;')}"></option>`)
    .join('');

  if (categorySelect) {
    const t = (k) => I18n.t(k);
    const saved = categorySelect.value;
    categorySelect.innerHTML =
      `<option value="">${t('pages.home.searchCategoryAll')}</option>` +
      (data.serviceCategories || [])
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join('');
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
