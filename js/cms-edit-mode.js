/**
 * Visual CMS edit mode — only loads when URL has ?cms-edit=1
 * Blocks navigation; click text/images to edit.
 */
(function () {
  if (!/[?&]cms-edit=1/.test(location.search)) return;

  const lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('gkb_lang') || 'hy';
  const pagePath = location.pathname.split('/').pop() || 'index.html';

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

  let contentExtra = {};
  let i18nOverrides = {};
  let elementStyles = {};

  async function loadStores() {
    const [extra, i18n] = await Promise.all([
      api('/admin/settings/content-extra', 'GET'),
      api('/admin/settings/i18n-overrides', 'GET')
    ]);
    contentExtra = extra.content_extra || {};
    i18nOverrides = i18n.i18n_overrides || {};
    elementStyles = contentExtra.elementStyles || {};
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
      async get() { const c = await loadHeroSection(); return c.title?.[lang] || getText(document.querySelector('#hero-title')); },
      async save(val) { const c = await loadHeroSection(); c.title = c.title || {}; c.title[lang] = val; await saveHeroContent(c); } },
    { sel: '#hero-subtitle', label: 'Hero subtitle', type: 'text',
      async get() { const c = await loadHeroSection(); return c.subtitle?.[lang] || getText(document.querySelector('#hero-subtitle')); },
      async save(val) { const c = await loadHeroSection(); c.subtitle = c.subtitle || {}; c.subtitle[lang] = val; await saveHeroContent(c); } },
    { sel: '#patient-hero-image', label: 'Patient story image', type: 'image',
      async get() { return contentExtra.patientHero?.image || document.querySelector('#patient-hero-image')?.src || ''; },
      async save(val) { await saveContentExtra({ patientHero: { ...contentExtra.patientHero, image: val } }); } },
    { sel: '#patient-hero-quote', label: 'Patient quote', type: 'textarea',
      async get() { return contentExtra.patientHero?.quote || getText(document.querySelector('#patient-hero-quote')); },
      async save(val) { await saveContentExtra({ patientHero: { ...contentExtra.patientHero, quote: val } }); } },
    { sel: '#patient-hero-cta', label: 'Patient story button', type: 'text',
      async get() { return contentExtra.patientHero?.ctaText || getText(document.querySelector('#patient-hero-cta')); },
      async save(val) { await saveContentExtra({ patientHero: { ...contentExtra.patientHero, ctaText: val } }); } },
    { sel: '#home-feature-image', label: 'Feature image', type: 'image',
      async get() { return contentExtra.feature?.image || ''; },
      async save(val) { await saveContentExtra({ feature: { ...contentExtra.feature, image: val } }); } },
    { sel: '#home-feature-title', label: 'Feature title', type: 'text',
      async get() { return contentExtra.feature?.title || getText(document.querySelector('#home-feature-title')); },
      async save(val) { await saveContentExtra({ feature: { ...contentExtra.feature, title: val } }); } },
    { sel: '#home-feature-desc', label: 'Feature description', type: 'textarea',
      async get() { return contentExtra.feature?.description || getText(document.querySelector('#home-feature-desc')); },
      async save(val) { await saveContentExtra({ feature: { ...contentExtra.feature, description: val } }); } },
    { sel: '#back-in-game-image', label: 'Brand story image', type: 'image',
      async get() { return contentExtra.backInGame?.image || ''; },
      async save(val) { await saveContentExtra({ backInGame: { ...contentExtra.backInGame, image: val } }); } },
    { sel: '#back-in-game-title', label: 'Brand story title', type: 'text',
      async get() { return contentExtra.backInGame?.title || getText(document.querySelector('#back-in-game-title')); },
      async save(val) { await saveContentExtra({ backInGame: { ...contentExtra.backInGame, title: val } }); } },
    { sel: '#back-in-game-text', label: 'Brand story text', type: 'textarea',
      async get() { return contentExtra.backInGame?.text || getText(document.querySelector('#back-in-game-text')); },
      async save(val) { await saveContentExtra({ backInGame: { ...contentExtra.backInGame, text: val } }); } },
    { sel: '#back-in-game-link', label: 'Brand story link', type: 'text',
      async get() { return contentExtra.backInGame?.linkText || getText(document.querySelector('#back-in-game-link')); },
      async save(val) { await saveContentExtra({ backInGame: { ...contentExtra.backInGame, linkText: val } }); } },
    { sel: '#expertise-image', label: 'Expertise background', type: 'image',
      async get() { return contentExtra.expertiseOverlay?.image || ''; },
      async save(val) { await saveContentExtra({ expertiseOverlay: { ...contentExtra.expertiseOverlay, image: val } }); } },
    { sel: '#expertise-title', label: 'Expertise title', type: 'text',
      async get() { return contentExtra.expertiseOverlay?.title || getText(document.querySelector('#expertise-title')); },
      async save(val) { await saveContentExtra({ expertiseOverlay: { ...contentExtra.expertiseOverlay, title: val } }); } },
    { sel: '#expertise-text', label: 'Expertise text', type: 'textarea',
      async get() { return contentExtra.expertiseOverlay?.text || getText(document.querySelector('#expertise-text')); },
      async save(val) { await saveContentExtra({ expertiseOverlay: { ...contentExtra.expertiseOverlay, text: val } }); } },
    { sel: '#home-approach-image', label: 'Approach image', type: 'image',
      async get() { return contentExtra.approachImage || ''; },
      async save(val) { await saveContentExtra({ approachImage: val }); } },
    { sel: '#home-approach-text', label: 'Approach text', type: 'textarea',
      async get() {
        const paras = contentExtra.approachParagraphs || [];
        if (paras.length) return paras.join('\n');
        const el = document.querySelector('#home-approach-text');
        return el ? [...el.querySelectorAll('p')].map((p) => p.textContent).join('\n') : '';
      },
      async save(val) { await saveContentExtra({ approachParagraphs: val.split('\n').map((s) => s.trim()).filter(Boolean) }); } },
    { sel: '#home-experts-image', label: 'Experts image', type: 'image',
      async get() { return contentExtra.expertsImage || ''; },
      async save(val) { await saveContentExtra({ expertsImage: val }); } },
    { sel: '#home-experts-text', label: 'Experts text', type: 'textarea',
      async get() {
        const paras = contentExtra.expertsParagraphs || [];
        if (paras.length) return paras.join('\n');
        const el = document.querySelector('#home-experts-text');
        return el ? [...el.querySelectorAll('p')].map((p) => p.textContent).join('\n') : '';
      },
      async save(val) { await saveContentExtra({ expertsParagraphs: val.split('\n').map((s) => s.trim()).filter(Boolean) }); } },
    { sel: '#home-imaging-image', label: 'Equipment image', type: 'image',
      async get() { return contentExtra.imagingImage || ''; },
      async save(val) { await saveContentExtra({ imagingImage: val }); } },
    { sel: '#home-imaging-text', label: 'Equipment text', type: 'textarea',
      async get() {
        const paras = contentExtra.imagingParagraphs || [];
        if (paras.length) return paras.join('\n');
        const el = document.querySelector('#home-imaging-text');
        return el ? [...el.querySelectorAll('p')].map((p) => p.textContent).join('\n') : '';
      },
      async save(val) { await saveContentExtra({ imagingParagraphs: val.split('\n').map((s) => s.trim()).filter(Boolean) }); } },
    { sel: '#home-intro-prose', label: 'Intro text', type: 'textarea',
      async get() {
        const paras = contentExtra.introParagraphs || [];
        if (paras.length) return paras.join('\n');
        const el = document.querySelector('#home-intro-prose');
        return el ? [...el.querySelectorAll('p')].map((p) => p.textContent).join('\n') : '';
      },
      async save(val) { await saveContentExtra({ introParagraphs: val.split('\n').map((s) => s.trim()).filter(Boolean) }); } }
  ];

  let popover = null;
  const attached = new WeakSet();

  function closePopover() {
    if (popover) {
      popover.remove();
      popover = null;
    }
    document.querySelectorAll('.cms-editing').forEach((el) => el.classList.remove('cms-editing'));
  }

  function notifySaved() {
    toast('Saved successfully');
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    if (window.parent !== window) window.parent.postMessage({ type: 'cms-saved' }, '*');
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
        <label class="cms-upload-btn">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" class="cms-edit-file">
          <span>Choose photo or video from computer</span>
        </label>
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
    const urlInput = popover.querySelector('.cms-edit-url');
    const statusEl = popover.querySelector('#cms-upload-status');
    let pendingUrl = '';

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
        await field.save(val);
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

    actions.querySelector('.cms-cancel').onclick = closePopover;
    actions.querySelector('.cms-save').onclick = async () => {
      const btn = actions.querySelector('.cms-save');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        await field.save(input.value.trim());
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
        return i18nOverrides[lang]?.[key] || (typeof I18n !== 'undefined' ? I18n.t(key) : getText(el));
      },
      async save(val) {
        await saveI18n(key, val);
      }
    };
  }

  function fieldFromImage(el) {
    const key = cmsKey(el);
    const pageImages = contentExtra.pageImages || {};
    return {
      label: 'Image',
      type: 'image',
      async get() {
        return pageImages[key] || el.src || '';
      },
      async save(val) {
        await saveContentExtra({ pageImages: { [key]: val } });
      }
    };
  }

  function fieldFromInline(el) {
    const key = cmsKey(el);
    const inline = contentExtra.inlineText || {};
    return {
      label: 'Text',
      type: el.tagName === 'P' ? 'textarea' : 'text',
      async get() {
        return inline[key]?.[lang] || getText(el);
      },
      async save(val) {
        const next = { ...(inline[key] || {}), [lang]: val };
        await saveContentExtra({ inlineText: { ...inline, [key]: next } });
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
      if (e.target.closest('.cms-edit-popover, .cms-resize-handle, .cms-doctor-toolbar, .cms-doctor-actions, [data-cms-editable]')) return;
      if (e.target.closest('a, button, input, select, textarea, form, label')) {
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
    link.href = 'js/cms-edit-mode.css?v=20260626';
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
  });
})();
