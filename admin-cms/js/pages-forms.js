/**
 * Server-backed page editor — saves to SQLite via API (no visual iframe).
 * Public site reads the same data from GET /api/v1/public/content
 */
const PagesForms = (function () {
  const PAGES = [
    { id: 'home', label: 'Home page', path: 'index.html' },
    { id: 'doctors', label: 'Find a Doctor', path: 'doctors.html' },
    { id: 'contacts', label: 'Locations', path: 'contacts.html' },
    { id: 'departments', label: 'Patient Care', path: 'departments.html' },
    { id: 'about', label: 'About', path: 'about.html' }
  ];

  const HOME_FIELDS = [
    { key: 'hero-title', label: 'Hero title', type: 'text' },
    { key: 'hero-subtitle', label: 'Hero subtitle', type: 'text' },
    { key: 'home-intro-prose', label: 'Intro text', type: 'textarea' },
    { key: 'home-hero-image', label: 'Main homepage banner (photo or video)', type: 'image' },
    { key: 'patient-hero-image', label: 'Homepage banner media (legacy — same as above)', type: 'image' },
    { key: 'home-feature-image', label: 'Feature block image / video', type: 'image' },
    { key: 'home-feature-title', label: 'Feature title', type: 'text' },
    { key: 'home-feature-desc', label: 'Feature description', type: 'textarea' },
    { key: 'back-in-game-image', label: 'Brand story image / video', type: 'image' },
    { key: 'back-in-game-title', label: 'Brand story title', type: 'text' },
    { key: 'back-in-game-text', label: 'Brand story text', type: 'textarea' },
    { key: 'back-in-game-link', label: 'Brand story link text', type: 'text' },
    { key: 'expertise-image', label: 'Expertise background image / video', type: 'image' },
    { key: 'expertise-title', label: 'Expertise title', type: 'text' },
    { key: 'expertise-text', label: 'Expertise text', type: 'textarea' },
    { key: 'home-approach-image', label: 'Approach section image / video', type: 'image' },
    { key: 'home-approach-text', label: 'Approach text', type: 'textarea' },
    { key: 'home-experts-image', label: 'Experts section image / video', type: 'image' },
    { key: 'home-experts-text', label: 'Experts text', type: 'textarea' },
    { key: 'home-imaging-image', label: 'Equipment section image / video', type: 'image' },
    { key: 'home-imaging-text', label: 'Equipment text', type: 'textarea' }
  ];

  const I18N_FIELDS = {
    doctors: [
      { i18nKey: 'pages.doctors.heroTitle', label: 'Hero title' },
      { i18nKey: 'pages.doctors.heroDesc', label: 'Hero description' }
    ],
    contacts: [
      { i18nKey: 'pages.contacts.heroTitle', label: 'Hero title' },
      { i18nKey: 'pages.contacts.heroDesc', label: 'Hero description' }
    ],
    departments: [
      { i18nKey: 'pages.departments.heroTitle', label: 'Hero title' },
      { i18nKey: 'pages.departments.heroDesc', label: 'Hero description' }
    ],
    about: [
      { i18nKey: 'pages.about.heroTitle', label: 'Hero title' },
      { i18nKey: 'pages.about.heroDesc', label: 'Hero description' }
    ]
  };

  let rootEl = null;
  let currentPage = PAGES[0];
  let currentLang = localStorage.getItem('gkb_lang') || 'hy';
  let pageFields = {};
  let i18nOverrides = {};

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function mediaUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = AdminConfig.apiBase().replace(/\/api\/v1$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  function fieldValue(key, i18nKey) {
    if (i18nKey) {
      return i18nOverrides[currentLang]?.[i18nKey] || '';
    }
    const row = pageFields[key];
    if (!row) return '';
    return row[currentLang] ?? row.hy ?? '';
  }

  async function uploadFile(file, statusEl) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cms-editor');
    if (statusEl) statusEl.textContent = `Uploading ${file.name}…`;
    const res = await AdminApi.upload('/admin/media/upload', fd);
    const url = res.media?.url || res.url;
    if (!url) throw new Error('Upload succeeded but no URL returned');
    if (statusEl) statusEl.textContent = 'Upload complete';
    return url;
  }

  function inferValueType(value, fallback = 'text') {
    if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(value || '')) return 'video';
    if (fallback === 'image' || /\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(value || '')) return 'image';
    return fallback;
  }

  function isSharedMediaField(key, valueType, value) {
    if (key.startsWith('i18n_')) return false;
    if (valueType !== 'image') return false;
    return !!value;
  }

  function mediaPreviewHTML(url) {
    if (!url) return '';
    const src = esc(mediaUrl(url));
    if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(url)) {
      return `<div class="cms-pages-preview-wrap cms-pages-preview-wrap--video"><video src="${src}" class="cms-pages-preview cms-pages-preview--video" controls preload="metadata" playsinline></video></div>`;
    }
    return `<img src="${src}" alt="" class="cms-pages-preview" onerror="this.style.display='none'">`;
  }

  function fieldHTML(field) {
    const fk = field.i18nKey ? `i18n_${field.i18nKey}` : field.key;
    const val = fieldValue(field.key, field.i18nKey);
    const id = `pf-${fk.replace(/[^a-z0-9_-]/gi, '_')}`;

    if (field.type === 'image') {
      const preview = val ? mediaPreviewHTML(val) : '';
      return `
        <div class="cms-field cms-field--image" data-field-key="${esc(fk)}" data-value-type="image">
          <label>${esc(field.label)}</label>
          <p class="cms-muted cms-field-hint">Photos and MP4/WebM videos apply to all languages on the public site.</p>
          ${preview}
          <input type="url" id="${id}" value="${esc(val)}" placeholder="/api/v1/media/files/… or https://…">
          <div class="cms-pages-upload-row">
            <input type="file" class="cms-pages-file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm" hidden>
            <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm cms-pages-pick">Choose file from computer</button>
            <span class="cms-muted cms-pages-upload-status"></span>
          </div>
        </div>`;
    }

    if (field.type === 'textarea') {
      return `
        <div class="cms-field" data-field-key="${esc(fk)}" data-value-type="text">
          <label for="${id}">${esc(field.label)}</label>
          <textarea id="${id}" rows="4">${esc(val)}</textarea>
        </div>`;
    }

    return `
      <div class="cms-field" data-field-key="${esc(fk)}" data-value-type="text">
        <label for="${id}">${esc(field.label)}</label>
        <input type="text" id="${id}" value="${esc(val)}">
      </div>`;
  }

  function i18nFieldHTML(field) {
    return fieldHTML({ ...field, key: `i18n_${field.i18nKey}`, type: 'text', i18nKey: field.i18nKey });
  }

  function fieldsForPage(pageId) {
    if (pageId === 'home') return HOME_FIELDS;
    return (I18N_FIELDS[pageId] || []).map((f) => ({ ...f, type: 'text' }));
  }

  function formHTML() {
    const fields = fieldsForPage(currentPage.id);
    const fieldsBlock =
      currentPage.id === 'home'
        ? fields.map(fieldHTML).join('')
        : (I18N_FIELDS[currentPage.id] || []).map(i18nFieldHTML).join('');

    const langs = AdminConfig.langs
      .map(
        (l) =>
          `<button type="button" class="cms-btn cms-btn--sm ${l.code === currentLang ? 'cms-btn--primary' : 'cms-btn--ghost'}" data-lang="${l.code}">${l.label}</button>`
      )
      .join('');

    const publicUrl = `${AdminConfig.publicSite()}/${currentPage.path}?_=${Date.now()}`;

    return `
      <div class="cms-pages-editor">
        <aside class="cms-pages-nav">
          ${PAGES.map(
            (p) =>
              `<button type="button" class="cms-pages-nav__item ${p.id === currentPage.id ? 'active' : ''}" data-page="${p.id}">${esc(p.label)}</button>`
          ).join('')}
        </aside>
        <div class="cms-pages-main">
          <div class="cms-pages-toolbar">
            <div>
              <strong>${esc(currentPage.label)}</strong>
              <p class="cms-muted">Edits save to the server database. Public site loads them from <code>/api/v1/public/content</code>.</p>
            </div>
            <div class="cms-pages-toolbar__actions">
              <span class="cms-muted">Language:</span>
              <div class="cms-lang-tabs">${langs}</div>
              <a href="${esc(publicUrl)}" target="_blank" rel="noopener" class="cms-btn cms-btn--ghost cms-btn--sm">View public page ↗</a>
            </div>
          </div>
          <form id="pages-form" class="cms-form cms-pages-form">
            ${fieldsBlock || '<p class="cms-muted">No editable fields for this page yet.</p>'}
            <div class="cms-form__actions">
              <button type="submit" class="cms-btn cms-btn--primary">Save to server</button>
              <span id="pages-save-status" class="cms-muted"></span>
            </div>
          </form>
        </div>
      </div>`;
  }

  async function loadData() {
    const [pageRes, i18nRes] = await Promise.all([
      AdminApi.get(`/admin/pages/${currentPage.id}`),
      AdminApi.get('/admin/settings/i18n-overrides')
    ]);
    pageFields = pageRes.fields || {};
    i18nOverrides = i18nRes.i18n_overrides || {};
  }

  function bindForm() {
    rootEl.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        currentPage = PAGES.find((p) => p.id === btn.dataset.page) || PAGES[0];
        await render();
      });
    });

    rootEl.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem('gkb_lang', currentLang);
        await render();
      });
    });

    rootEl.querySelectorAll('.cms-field--image').forEach((wrap) => {
      const fileInput = wrap.querySelector('.cms-pages-file');
      const pickBtn = wrap.querySelector('.cms-pages-pick');
      const urlInput = wrap.querySelector('input[type="url"]');
      const statusEl = wrap.querySelector('.cms-pages-upload-status');

      pickBtn?.addEventListener('click', () => fileInput?.click());

      fileInput?.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        pickBtn.disabled = true;
        try {
          const url = await uploadFile(file, statusEl);
          urlInput.value = url;
          const existingPreview = wrap.querySelector('.cms-pages-preview-wrap, .cms-pages-preview, .cms-pages-preview--video');
          if (existingPreview) existingPreview.remove();
          wrap.querySelector('label')?.insertAdjacentHTML('afterend', mediaPreviewHTML(url));
          AdminUI.toast('File uploaded — click Save to publish on public site', 'success');
        } catch (err) {
          AdminUI.toast(err.message, 'error');
          if (statusEl) statusEl.textContent = err.message;
        } finally {
          pickBtn.disabled = false;
          fileInput.value = '';
        }
      });
    });

    const form = rootEl.querySelector('#pages-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const status = rootEl.querySelector('#pages-save-status');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      if (status) status.textContent = '';

      const pageItems = [];
      const i18nMerge = {};

      form.querySelectorAll('[data-field-key]').forEach((wrap) => {
        const key = wrap.dataset.fieldKey;
        const valueType = wrap.dataset.valueType || 'text';
        const input = wrap.querySelector('input, textarea');
        if (!input) return;
        const value = input.value.trim();
        const resolvedType = inferValueType(value, valueType);
        if (key.startsWith('i18n_')) {
          const i18nKey = key.slice(5);
          if (!i18nMerge[currentLang]) i18nMerge[currentLang] = {};
          i18nMerge[currentLang][i18nKey] = value;
          pageItems.push({ field_key: key, lang: currentLang, value, value_type: 'text' });
        } else if (isSharedMediaField(key, valueType, value)) {
          AdminConfig.langs.forEach((l) => {
            pageItems.push({ field_key: key, lang: l.code, value, value_type: resolvedType });
          });
        } else {
          pageItems.push({ field_key: key, lang: currentLang, value, value_type: resolvedType });
        }
      });

      try {
        if (pageItems.length) {
          await AdminApi.patch(`/admin/pages/${currentPage.id}/fields`, { fields: pageItems });
        }
        if (Object.keys(i18nMerge).length) {
          await AdminApi.put('/admin/settings/i18n-overrides', { merge: i18nMerge });
        }
        await loadData();
        AdminUI.toast('Saved — changes are live on the public website', 'success');
        if (status) status.textContent = 'Saved to database. Refresh the public page to see updates.';
      } catch (err) {
        AdminUI.toast(err.message, 'error');
        if (status) status.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Save to server';
      }
    });
  }

  async function render() {
    if (!rootEl) return;
    rootEl.innerHTML = AdminUI.loadingHTML('Loading page content from server…');
    try {
      await loadData();
      rootEl.innerHTML = formHTML();
      bindForm();
    } catch (err) {
      rootEl.innerHTML = AdminUI.errorHTML(esc(err.message), 'pages-retry');
      rootEl.querySelector('#pages-retry')?.addEventListener('click', render);
    }
  }

  async function mount(root) {
    rootEl = root;
    await render();
  }

  return { mount };
})();
