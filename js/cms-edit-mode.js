/**
 * Visual CMS edit mode — only loads when URL has ?cms-edit=1
 * Blocks navigation; click text/images to edit.
 */
(function () {
  if (!/[?&]cms-edit=1/.test(location.search)) return;

  const lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('gkb_lang') || 'hy';
  const pagePath = location.pathname.split('/').pop() || 'index.html';

  const PAGE_PATH_TO_KEY = {
    'index.html': 'home',
    'doctors.html': 'doctors',
    'contacts.html': 'contacts',
    'departments.html': 'departments',
    'about.html': 'about'
  };

  let pageFieldsCache = {};
  /** @type {Map<string, object>} */
  const pendingChanges = new Map();

  const apiBase = () => `${location.protocol}//${location.host}/api/v1`;

  function token() {
    return localStorage.getItem('cms_token') || '';
  }

  async function api(path, method, body) {
    const opts = {
      method,
      headers: { Authorization: `Bearer ${token()}` }
    };
    if (method !== 'GET' && body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${apiBase()}${path}`, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Save failed');
    return json;
  }

  function toast(msg) {
    let el = document.getElementById('cms-edit-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cms-edit-toast';
      el.className = 'cms-edit-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  function cmsKey(el) {
    if (el.id) return `${pagePath}#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const parent = el.parentElement;
    const siblings = parent ? [...parent.children].filter((c) => c.tagName === el.tagName) : [];
    const idx = siblings.indexOf(el);
    return `${pagePath}|${tag}|${idx}`;
  }

  function getText(el) {
    if (el.tagName === 'IMG') return el.getAttribute('src') || '';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.placeholder || '';
    return (el.innerText || el.textContent || '').trim();
  }

  function setText(el, val, field) {
    if (el.tagName === 'IMG') {
      el.src = val;
      return;
    }
    if (field?.type === 'placeholder') {
      el.placeholder = val;
      return;
    }
    if (el.id === 'hero-subtitle') {
      el.innerHTML = `<strong>${val}</strong>`;
      return;
    }
    if (el.classList.contains('hss-prose') || el.id === 'back-in-game-text') {
      el.innerHTML = val.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('');
      return;
    }
    el.textContent = val;
  }

  function cmsPageKey() {
    return PAGE_PATH_TO_KEY[pagePath] || pagePath.replace('.html', '');
  }

  function fieldKeyFor(el) {
    if (el.id) return el.id;
    return cmsKey(el).replace(/[|#]/g, '_');
  }

  function getCachedField(field_key) {
    return pageFieldsCache[field_key]?.[lang];
  }

  function sectionKeyFor(field_key) {
    if (field_key === 'hero-title' || field_key === 'hero-subtitle') return 'hero';
    if (field_key.startsWith('patient-hero')) return 'patient-hero';
    if (field_key.startsWith('home-feature')) return 'feature';
    if (field_key.startsWith('back-in-game')) return 'back-in-game';
    if (field_key.startsWith('expertise')) return 'expertise';
    return 'content';
  }

  function pendingKey(page_key, field_key, lng) {
    return `${page_key}:${field_key}:${lng}`;
  }

  function updatePendingUI() {
    const n = pendingChanges.size;
    window.parent.postMessage({ type: 'cms-pending-count', count: n }, '*');
    const bar = document.getElementById('cms-edit-banner');
    if (bar) {
      bar.textContent = n
        ? `✎ Edit mode — ${n} unsaved change(s). Press Save All in admin toolbar to publish.`
        : '✎ Edit mode — hover text or images to edit. Press Save All to publish changes.';
    }
  }

  function queueFieldChange(el, value, opts = {}) {
    const field_key = opts.fieldKey || fieldKeyFor(el);
    const page_key = cmsPageKey();
    const entry = {
      pageKey: page_key,
      page_key,
      sectionKey: opts.sectionKey || sectionKeyFor(field_key),
      section_key: opts.sectionKey || sectionKeyFor(field_key),
      fieldKey: field_key,
      field_key,
      lang,
      value,
      value_type: opts.valueType || (el?.tagName === 'IMG' || el?.tagName === 'VIDEO' ? 'image' : 'text')
    };

    pendingChanges.set(pendingKey(page_key, field_key, lang), entry);

    if (!pageFieldsCache[field_key]) pageFieldsCache[field_key] = { _type: entry.value_type };
    pageFieldsCache[field_key][lang] = value;
    pageFieldsCache[field_key]._type = entry.value_type;

    if (opts.i18nKey) {
      i18nOverrides[lang] = i18nOverrides[lang] || {};
      i18nOverrides[lang][opts.i18nKey] = value;
      if (typeof I18n !== 'undefined' && I18n.setOverrides) {
        I18n.setOverrides(i18nOverrides);
      }
    }

    updatePendingUI();
    console.log('[cms-edit] Queued change', entry);
    return { queued: true, entry };
  }

  async function verifyPublicFields(changes) {
    const failures = [];
    const langs = [...new Set(changes.map((c) => c.lang))];
    const snapshots = {};

    for (const lng of langs) {
      const res = await fetch(`${apiBase()}/public/content?lang=${lng}&_t=${Date.now()}`, {
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`Public API verification failed (${res.status})`);
      snapshots[lng] = await res.json();
    }

    for (const c of changes) {
      const got = snapshots[c.lang]?.pageFields?.[c.page_key || c.pageKey]?.[c.field_key || c.fieldKey];
      if (got !== c.value) {
        failures.push({
          field: c.field_key || c.fieldKey,
          lang: c.lang,
          expected: c.value,
          got: got ?? null
        });
      }
    }

    if (failures.length) {
      console.error('[cms-edit] Verification failed', failures);
      throw new Error(
        `Save verification failed for "${failures[0].field}" (${failures[0].lang}). Database may not have updated.`
      );
    }
    return true;
  }

  async function reloadPreviewFromServer() {
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    if (typeof HospitalApp !== 'undefined' && HospitalApp.reloadFromCms) {
      await HospitalApp.reloadFromCms();
    }
    try {
      const data = await api(`/admin/pages/${cmsPageKey()}`, 'GET');
      pageFieldsCache = data.fields || {};
    } catch {
      /* ignore */
    }
    setTimeout(attachAll, 250);
  }

  async function persistField(el, value, opts = {}) {
    return queueFieldChange(el, value, opts);
  }

  let contentExtra = {};
  let i18nOverrides = {};
  let elementStyles = {};

  async function loadStores() {
    const [extra, i18n, pages] = await Promise.all([
      api('/admin/settings/content-extra', 'GET'),
      api('/admin/settings/i18n-overrides', 'GET'),
      api(`/admin/pages/${cmsPageKey()}`, 'GET')
    ]);
    contentExtra = extra.content_extra || {};
    i18nOverrides = i18n.i18n_overrides || {};
    elementStyles = contentExtra.elementStyles || {};
    pageFieldsCache = pages.fields || {};
  }

  async function saveContentExtra(merge) {
    const res = await api('/admin/settings/content-extra', 'PUT', { merge });
    if (res.content_extra) contentExtra = res.content_extra;
    else contentExtra = deepMergeLocal(contentExtra, merge);
    elementStyles = contentExtra.elementStyles || {};
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    return res;
  }

  async function saveI18n(key, val) {
    const res = await api('/admin/settings/i18n-overrides', 'PUT', { merge: { [lang]: { [key]: val } } });
    if (res.i18n_overrides) i18nOverrides = res.i18n_overrides;
    else {
      i18nOverrides[lang] = i18nOverrides[lang] || {};
      i18nOverrides[lang][key] = val;
    }
    if (typeof I18n !== 'undefined' && I18n.setOverrides) {
      I18n.setOverrides(i18nOverrides);
    }
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    return res;
  }

  function deepMergeLocal(a, b) {
    const out = { ...a };
    for (const k of Object.keys(b || {})) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') {
        out[k] = deepMergeLocal(a[k], b[k]);
      } else {
        out[k] = b[k];
      }
    }
    return out;
  }

  async function saveHeroContent(content) {
    const res = await api('/admin/homepage/hero', 'PUT', {
      page_key: 'home',
      enabled: true,
      sort_order: 0,
      content
    });
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    return res;
  }

  async function loadHeroSection() {
    const data = await api('/admin/homepage?page=home', 'GET');
    const hero = (data.sections || []).find((s) => s.section_key === 'hero');
    return hero?.content || {};
  }

  const HOME_FIELDS = [
    { sel: '#hero-title', label: 'Hero title', type: 'text',
      async get() { return getCachedField('hero-title') || (await loadHeroSection()).title?.[lang] || getText(document.querySelector('#hero-title')); },
      async save(val, el) { await persistField(el || document.querySelector('#hero-title'), val); } },
    { sel: '#hero-subtitle', label: 'Hero subtitle', type: 'text',
      async get() { return getCachedField('hero-subtitle') || (await loadHeroSection()).subtitle?.[lang] || getText(document.querySelector('#hero-subtitle')); },
      async save(val, el) { await persistField(el || document.querySelector('#hero-subtitle'), val); } },
    { sel: '#patient-hero-image', label: 'Patient story image', type: 'image',
      async get() { return getCachedField('patient-hero-image') || contentExtra.patientHero?.image || document.querySelector('#patient-hero-image')?.src || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#patient-hero-image'), val, { valueType: 'image' }); } },
    { sel: '#patient-hero-quote', label: 'Patient quote', type: 'textarea',
      async get() { return getCachedField('patient-hero-quote') || contentExtra.patientHero?.quote || getText(document.querySelector('#patient-hero-quote')); },
      async save(val, el) { await persistField(el || document.querySelector('#patient-hero-quote'), val); } },
    { sel: '#patient-hero-cta', label: 'Patient story button', type: 'text',
      async get() { return getCachedField('patient-hero-cta') || contentExtra.patientHero?.ctaText || getText(document.querySelector('#patient-hero-cta')); },
      async save(val, el) { await persistField(el || document.querySelector('#patient-hero-cta'), val); } },
    { sel: '#home-feature-image', label: 'Feature image', type: 'image',
      async get() { return getCachedField('home-feature-image') || contentExtra.feature?.image || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#home-feature-image'), val, { valueType: 'image' }); } },
    { sel: '#home-feature-title', label: 'Feature title', type: 'text',
      async get() { return getCachedField('home-feature-title') || contentExtra.feature?.title || getText(document.querySelector('#home-feature-title')); },
      async save(val, el) { await persistField(el || document.querySelector('#home-feature-title'), val); } },
    { sel: '#home-feature-desc', label: 'Feature description', type: 'textarea',
      async get() { return getCachedField('home-feature-desc') || contentExtra.feature?.description || getText(document.querySelector('#home-feature-desc')); },
      async save(val, el) { await persistField(el || document.querySelector('#home-feature-desc'), val); } },
    { sel: '#back-in-game-image', label: 'Brand story image', type: 'image',
      async get() { return getCachedField('back-in-game-image') || contentExtra.backInGame?.image || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#back-in-game-image'), val, { valueType: 'image' }); } },
    { sel: '#back-in-game-title', label: 'Brand story title', type: 'text',
      async get() { return getCachedField('back-in-game-title') || contentExtra.backInGame?.title || getText(document.querySelector('#back-in-game-title')); },
      async save(val, el) { await persistField(el || document.querySelector('#back-in-game-title'), val); } },
    { sel: '#back-in-game-text', label: 'Brand story text', type: 'textarea',
      async get() { return getCachedField('back-in-game-text') || contentExtra.backInGame?.text || getText(document.querySelector('#back-in-game-text')); },
      async save(val, el) { await persistField(el || document.querySelector('#back-in-game-text'), val); } },
    { sel: '#back-in-game-link', label: 'Brand story link', type: 'text',
      async get() { return getCachedField('back-in-game-link') || contentExtra.backInGame?.linkText || getText(document.querySelector('#back-in-game-link')); },
      async save(val, el) { await persistField(el || document.querySelector('#back-in-game-link'), val); } },
    { sel: '#expertise-image', label: 'Expertise background', type: 'image',
      async get() { return getCachedField('expertise-image') || contentExtra.expertiseOverlay?.image || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#expertise-image'), val, { valueType: 'image' }); } },
    { sel: '#expertise-title', label: 'Expertise title', type: 'text',
      async get() { return getCachedField('expertise-title') || contentExtra.expertiseOverlay?.title || getText(document.querySelector('#expertise-title')); },
      async save(val, el) { await persistField(el || document.querySelector('#expertise-title'), val); } },
    { sel: '#expertise-text', label: 'Expertise text', type: 'textarea',
      async get() { return getCachedField('expertise-text') || contentExtra.expertiseOverlay?.text || getText(document.querySelector('#expertise-text')); },
      async save(val, el) { await persistField(el || document.querySelector('#expertise-text'), val); } },
    { sel: '#home-approach-image', label: 'Approach image', type: 'image',
      async get() { return getCachedField('home-approach-image') || contentExtra.approachImage || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#home-approach-image'), val, { valueType: 'image' }); } },
    { sel: '#home-approach-text', label: 'Approach text', type: 'textarea',
      async get() {
        return getCachedField('home-approach-text') || (contentExtra.approachParagraphs || []).join('\n') ||
          [...(document.querySelector('#home-approach-text')?.querySelectorAll('p') || [])].map((p) => p.textContent).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-approach-text'), val); } },
    { sel: '#home-experts-image', label: 'Experts image', type: 'image',
      async get() { return getCachedField('home-experts-image') || contentExtra.expertsImage || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#home-experts-image'), val, { valueType: 'image' }); } },
    { sel: '#home-experts-text', label: 'Experts text', type: 'textarea',
      async get() {
        return getCachedField('home-experts-text') || (contentExtra.expertsParagraphs || []).join('\n') ||
          [...(document.querySelector('#home-experts-text')?.querySelectorAll('p') || [])].map((p) => p.textContent).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-experts-text'), val); } },
    { sel: '#home-imaging-image', label: 'Equipment image', type: 'image',
      async get() { return getCachedField('home-imaging-image') || contentExtra.imagingImage || ''; },
      async save(val, el) { await persistField(el || document.querySelector('#home-imaging-image'), val, { valueType: 'image' }); } },
    { sel: '#home-imaging-text', label: 'Equipment text', type: 'textarea',
      async get() {
        return getCachedField('home-imaging-text') || (contentExtra.imagingParagraphs || []).join('\n') ||
          [...(document.querySelector('#home-imaging-text')?.querySelectorAll('p') || [])].map((p) => p.textContent).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-imaging-text'), val); } },
    { sel: '#home-intro-prose', label: 'Intro text', type: 'textarea',
      async get() {
        return getCachedField('home-intro-prose') || (contentExtra.introParagraphs || []).join('\n') ||
          [...(document.querySelector('#home-intro-prose')?.querySelectorAll('p') || [])].map((p) => p.textContent).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-intro-prose'), val); } }
  ];

  let popover = null;
  let activeEdit = null;
  const attached = new WeakSet();

  function closePopover() {
    activeEdit = null;
    if (popover) {
      popover.remove();
      popover = null;
    }
    document.querySelectorAll('.cms-editing').forEach((el) => el.classList.remove('cms-editing'));
  }

  async function flushPendingToServer() {
    const changes = [...pendingChanges.values()];
    console.log('[cms-edit] Pending changes before Save All', changes);
    if (!changes.length) {
      const pub = await api('/admin/publish', 'POST');
      return { saved: 0, publish: pub.publish, fields_by_page: {} };
    }

    const res = await api('/admin/pages/bulk/fields', 'PATCH', { changes });
    console.log('[cms-edit] Save All response', res);

    await verifyPublicFields(changes);

    if (res.fields_by_page) {
      const pageFields = res.fields_by_page[cmsPageKey()];
      if (pageFields) pageFieldsCache = pageFields;
    }

    pendingChanges.clear();
    updatePendingUI();
    return res;
  }

  async function saveAllChanges() {
    if (activeEdit && popover) {
      const val = activeEdit.getValue();
      if (val) {
        queueFieldChange(activeEdit.el, val, activeEdit.opts || {});
        setText(activeEdit.el, val, activeEdit.field);
      }
    }

    const res = await flushPendingToServer();

    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    await reloadPreviewFromServer();
    closePopover();

    window.parent.postMessage(
      {
        type: 'cms-save-all-done',
        verified: true,
        saved: res.saved,
        publish: res.publish
      },
      '*'
    );
    return res;
  }

  function notifyQueued() {
    const n = pendingChanges.size;
    toast(n === 1 ? '1 change queued — press Save All to publish' : `${n} changes queued — press Save All to publish`);
  }

  function notifySaved() {
    notifyQueued();
  }

  function notifyError(err) {
    const msg = err?.message || String(err) || 'Save failed';
    toast(msg);
    console.error('[cms-edit]', msg);
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cms-editor');
    const res = await fetch(`${apiBase()}/admin/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: fd
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);
    const url = json.media?.url || json.url;
    if (!url) throw new Error('Upload succeeded but no URL returned');
    return url;
  }

  function buildImagePopover(field, el, rect) {
    const isVideo = el.tagName === 'VIDEO' || field.mediaType === 'video';
    popover = document.createElement('div');
    popover.className = 'cms-edit-popover cms-edit-popover--image';
    popover.innerHTML = `
      <h4>${field.label}</h4>
      <div class="cms-edit-tabs">
        <button type="button" class="cms-edit-tab active" data-tab="upload">Upload file</button>
        <button type="button" class="cms-edit-tab" data-tab="url">Paste link</button>
      </div>
      <div class="cms-edit-panel" data-panel="upload">
        <button type="button" class="cms-upload-trigger">Choose photo or video from computer</button>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" class="cms-edit-file">
        <p class="cms-edit-hint" id="cms-upload-status">Max 10 MB · JPG, PNG, WebP, MP4, WebM</p>
      </div>
      <div class="cms-edit-panel" data-panel="url" hidden>
        <input type="url" class="cms-edit-url" placeholder="https://… or /api/v1/media/files/…">
      </div>
      <div class="cms-edit-popover__actions">
        <button type="button" class="cms-cancel">Cancel</button>
        <button type="button" class="cms-save">Save</button>
      </div>`;
    document.body.appendChild(popover);
    positionPopover(rect);

    const fileInput = popover.querySelector('.cms-edit-file');
    const uploadBtn = popover.querySelector('.cms-upload-trigger');
    const urlInput = popover.querySelector('.cms-edit-url');
    const statusEl = popover.querySelector('#cms-upload-status');
    let pendingUrl = '';

    fileInput.style.display = 'none';
    uploadBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    popover.querySelectorAll('.cms-edit-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.querySelectorAll('.cms-edit-tab').forEach((t) => t.classList.toggle('active', t === tab));
        popover.querySelectorAll('.cms-edit-panel').forEach((p) => {
          p.hidden = p.dataset.panel !== tab.dataset.tab;
        });
      });
    });

    field.get().then((v) => { urlInput.value = v || ''; pendingUrl = v || ''; }).catch(() => {});

    activeEdit = {
      field,
      el,
      opts: { valueType: 'image', fieldKey: fieldKeyFor(el) },
      getValue: () => (urlInput.value || pendingUrl).trim()
    };

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const btn = popover.querySelector('.cms-save');
      btn.disabled = true;
      btn.textContent = 'Uploading…';
      if (statusEl) statusEl.textContent = `Uploading ${file.name}…`;
      try {
        pendingUrl = await uploadFile(file);
        urlInput.value = pendingUrl;
        if (statusEl) statusEl.textContent = 'Upload complete — click Save';
        toast('File uploaded');
      } catch (err) {
        notifyError(err);
        if (statusEl) statusEl.textContent = err.message;
      }
      btn.disabled = false;
      btn.textContent = 'Save';
    });

    popover.querySelector('.cms-cancel').onclick = closePopover;
    popover.querySelector('.cms-save').onclick = async () => {
      const btn = popover.querySelector('.cms-save');
      const val = (urlInput.value || pendingUrl).trim();
      if (!val) {
        notifyError(new Error('Upload a file or paste a link first'));
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        await field.save(val, el);
        setText(el, val, field);
        notifySaved();
        closePopover();
      } catch (err) {
        notifyError(err);
        btn.disabled = false;
        btn.textContent = 'Save';
      }
    };
  }

  function buildTextPopover(field, el, rect) {
    popover = document.createElement('div');
    popover.className = 'cms-edit-popover';
    popover.innerHTML = `<h4>${field.label}</h4><p class="cms-edit-lang">Language: ${lang.toUpperCase()}</p>`;
    const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    input.value = 'Loading…';
    popover.appendChild(input);
    const actions = document.createElement('div');
    actions.className = 'cms-edit-popover__actions';
    actions.innerHTML = '<button type="button" class="cms-cancel">Cancel</button><button type="button" class="cms-save">Save</button>';
    popover.appendChild(actions);
    document.body.appendChild(popover);
    positionPopover(rect);

    field.get().then((v) => { input.value = v; }).catch(() => { input.value = getText(el); });

    activeEdit = {
      field,
      el,
      opts: {},
      getValue: () => input.value.trim()
    };

    actions.querySelector('.cms-cancel').onclick = closePopover;
    actions.querySelector('.cms-save').onclick = async () => {
      const btn = actions.querySelector('.cms-save');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        await field.save(input.value.trim(), el);
        setText(el, input.value.trim(), field);
        notifySaved();
        closePopover();
      } catch (err) {
        notifyError(err);
        btn.disabled = false;
        btn.textContent = 'Save';
      }
    };
    input.focus();
  }

  function positionPopover(rect) {
    const top = Math.min(rect.bottom + 8, window.innerHeight - 220);
    popover.style.top = `${Math.max(8, top)}px`;
    popover.style.left = `${Math.min(rect.left, window.innerWidth - 320)}px`;
  }

  function openEditor(field, el, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    closePopover();
    el.classList.add('cms-editing');
    const rect = el.getBoundingClientRect();
    if (field.type === 'image') buildImagePopover(field, el, rect);
    else buildTextPopover(field, el, rect);
  }

  function markEditable(el, field) {
    if (attached.has(el)) return;
    attached.add(el);
    el.setAttribute('data-cms-editable', '1');
    el.setAttribute('data-cms-label', field.label);
    el.addEventListener('click', (ev) => openEditor(field, el, ev));
  }

  function fieldFromI18n(el, key, isPlaceholder) {
    return {
      label: isPlaceholder ? `Placeholder: ${key}` : `Text: ${key}`,
      type: isPlaceholder ? 'text' : el.tagName === 'P' || el.classList.contains('hss-prose') ? 'textarea' : 'text',
      fieldType: isPlaceholder ? 'placeholder' : 'i18n',
      async get() {
        return getCachedField(`i18n_${key}`) || i18nOverrides[lang]?.[key] || (typeof I18n !== 'undefined' ? I18n.t(key) : getText(el));
      },
      async save(val) {
        await persistField(el, val, { fieldKey: `i18n_${key}`, i18nKey: key });
      }
    };
  }

  function fieldFromImage(el) {
    const fk = fieldKeyFor(el);
    return {
      label: 'Image / video',
      type: 'image',
      async get() {
        return getCachedField(fk) || contentExtra.pageImages?.[cmsKey(el)] || el.src || '';
      },
      async save(val) {
        await persistField(el, val, { fieldKey: fk, valueType: 'image' });
      }
    };
  }

  function fieldFromInline(el) {
    const fk = fieldKeyFor(el);
    return {
      label: 'Text',
      type: el.tagName === 'P' ? 'textarea' : 'text',
      async get() {
        return getCachedField(fk) || contentExtra.inlineText?.[cmsKey(el)]?.[lang] || getText(el);
      },
      async save(val) {
        await persistField(el, val, { fieldKey: fk });
      }
    };
  }

  function applyElementStyles() {
    Object.entries(elementStyles).forEach(([key, style]) => {
      const el = document.querySelector(`[data-cms-style-id="${key}"]`);
      if (!el || !style) return;
      if (style.width) el.style.width = style.width;
      if (style.height) el.style.height = style.height;
      if (style.fontSize) el.style.fontSize = style.fontSize;
      if (style.padding) el.style.padding = style.padding;
    });
  }

  function addResizeHandles(el) {
    if (el.dataset.cmsResize) return;
    el.dataset.cmsResize = '1';
    const styleId = cmsKey(el);
    el.setAttribute('data-cms-style-id', styleId);
    el.classList.add('cms-resizable');

    ['nw', 'ne', 'sw', 'se'].forEach((corner) => {
      const handle = document.createElement('span');
      handle.className = `cms-resize-handle cms-resize-handle--${corner}`;
      handle.dataset.corner = corner;
      el.appendChild(handle);

      handle.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const startX = ev.clientX;
        const startY = ev.clientY;
        const rect = el.getBoundingClientRect();
        const startW = rect.width;
        const startH = rect.height;

        function onMove(e) {
          let w = startW;
          let h = startH;
          if (corner.includes('e')) w = startW + (e.clientX - startX);
          if (corner.includes('w')) w = startW - (e.clientX - startX);
          if (corner.includes('s')) h = startH + (e.clientY - startY);
          if (corner.includes('n')) h = startH - (e.clientY - startY);
          w = Math.max(60, w);
          h = Math.max(28, h);
          el.style.width = `${Math.round(w)}px`;
          el.style.height = `${Math.round(h)}px`;
        }

        async function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          const saved = {
            width: el.style.width,
            height: el.style.height,
            fontSize: el.style.fontSize || ''
          };
          try {
            await saveContentExtra({
              elementStyles: { ...elementStyles, [styleId]: saved }
            });
            toast('Size saved');
          } catch (err) {
            toast(err.message);
          }
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  function isInsideChrome(el) {
    return el.closest('#site-nav, #site-footer, .cms-edit-popover, .cms-edit-toast, .cms-doctor-toolbar');
  }

  function attachAll() {
    const claimed = new Set(HOME_FIELDS.map((f) => f.sel));

    HOME_FIELDS.forEach((field) => {
      const el = document.querySelector(field.sel);
      if (el) markEditable(el, field);
    });

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (isInsideChrome(el) || claimed.has(`#${el.id}`)) return;
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      markEditable(el, fieldFromI18n(el, key, false));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      if (isInsideChrome(el)) return;
      const key = el.getAttribute('data-i18n-placeholder');
      markEditable(el, { ...fieldFromI18n(el, key, true), type: 'text', fieldType: 'placeholder' });
    });

    document.querySelectorAll('main img, .hss-wrap img, .hss-hero img, .hss-section img, .hss-about-hero img, .hss-video-hero__bg, #patient-hero-image').forEach((img) => {
      if (isInsideChrome(img) || img.closest('[data-cms-editable]')) return;
      if (HOME_FIELDS.some((f) => f.sel === `#${img.id}`)) return;
      markEditable(img, fieldFromImage(img));
    });

    document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main label span, .hss-btn, button.hss-btn, a.hss-btn').forEach((el) => {
      if (isInsideChrome(el) || el.hasAttribute('data-cms-editable') || el.closest('[data-cms-editable]')) return;
      if (el.children.length > 0 && !el.classList.contains('hss-btn')) return;
      const text = getText(el);
      if (!text || text.length < 2) return;
      markEditable(el, fieldFromInline(el));
    });

    document.querySelectorAll('.hss-btn, button.hss-btn, a.hss-btn, button[type="submit"]').forEach((btn) => {
      if (isInsideChrome(btn)) return;
      addResizeHandles(btn);
    });

    applyElementStyles();
    attachDoctorControls();
  }

  function attachDoctorControls() {
    document.querySelectorAll('.cms-doctor-toolbar').forEach((t) => t.remove());
    if (pagePath !== 'doctors.html') return;

    const grid = document.getElementById('doctors-grid');
    if (!grid) return;

    const bar = document.createElement('div');
    bar.className = 'cms-doctor-toolbar';
    bar.innerHTML = `
      <button type="button" class="cms-doctor-add">+ Add doctor</button>
      <span>Click a doctor row to edit · Delete removes from public site</span>`;
    grid.parentElement?.insertBefore(bar, grid);

    bar.querySelector('.cms-doctor-add')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.parent.postMessage({ type: 'cms-open-doctors' }, '*');
    });

    grid.querySelectorAll('.hss-doctor-item').forEach((row, i) => {
      if (row.querySelector('.cms-doctor-actions')) return;
      const actions = document.createElement('div');
      actions.className = 'cms-doctor-actions';
      actions.innerHTML = `
        <button type="button" class="cms-doctor-edit" title="Edit">✎</button>
        <button type="button" class="cms-doctor-del" title="Delete">✕</button>`;
      row.style.position = 'relative';
      row.appendChild(actions);

      actions.querySelector('.cms-doctor-edit')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'cms-open-doctors' }, '*');
      });

      actions.querySelector('.cms-doctor-del')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const docId = row.dataset.doctorId;
        const name = row.querySelector('.hss-doctor-item__name')?.textContent || 'this doctor';
        if (!docId || !confirm(`Delete ${name} from the website?`)) return;
        try {
          await api(`/admin/doctors/${docId}`, 'DELETE');
          toast('Doctor removed');
          location.reload();
        } catch (err) {
          toast(err.message);
        }
      });
    });
  }

  function blockInteractions() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.cms-edit-popover')) return;
      if (e.target.closest('.cms-resize-handle, .cms-doctor-toolbar, .cms-doctor-actions, [data-cms-editable]')) return;
      if (e.target.closest('a, button, input, select, textarea, form')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    document.addEventListener('submit', (e) => { e.preventDefault(); }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input, select')) e.preventDefault();
    }, true);

    document.querySelectorAll('a[href]').forEach((a) => {
      if (!a.hasAttribute('data-cms-editable')) a.addEventListener('click', (e) => e.preventDefault(), true);
    });
  }

  function injectStyles() {
    if (document.querySelector('link[href*="cms-edit-mode.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `js/cms-edit-mode.css?v=${new URLSearchParams(location.search).get('cms_build') || window.CMS_BUILD || '20260628'}`;
    document.head.appendChild(link);
  }

  function showEditBanner() {
    if (document.getElementById('cms-edit-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'cms-edit-banner';
    bar.className = 'cms-edit-banner';
    bar.textContent = '✎ Edit mode — hover text or images to edit. Links and buttons are disabled.';
    document.body.prepend(bar);
  }

  async function init() {
    if (!token()) {
      document.body.innerHTML = '<p style="padding:2rem;font-family:system-ui;text-align:center">Please sign in to the admin panel first.</p>';
      return;
    }
    document.body.classList.add('cms-edit-mode');
    injectStyles();
    showEditBanner();
    blockInteractions();
    try {
      await loadStores();
    } catch {
      /* partial edit still works */
    }
    attachAll();
    updatePendingUI();
    window.addEventListener('hospital:refresh', () => setTimeout(attachAll, 200));
    window.addEventListener('languagechange', () => setTimeout(attachAll, 300));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 900));
  } else {
    setTimeout(init, 900);
  }

  window.addEventListener('message', (ev) => {
    if (ev.data?.type === 'cms-set-lang' && ev.data.lang) {
      localStorage.setItem('gkb_lang', ev.data.lang);
      const u = new URL(location.href);
      u.searchParams.set('lang', ev.data.lang);
      location.href = u.toString();
    }
    if (ev.data?.type === 'cms-refresh') location.reload();
    if (ev.data?.type === 'cms-save-all') {
      saveAllChanges().catch((err) => {
        notifyError(err);
        window.parent.postMessage({ type: 'cms-save-all-error', error: err.message }, '*');
      });
    }
  });
})();
