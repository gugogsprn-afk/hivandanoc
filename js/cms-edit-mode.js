/**
 * Visual CMS edit mode — only loads when URL has ?cms-edit=1
 * Blocks navigation; click text/images to edit.
 */
(function () {
  if (!/[?&]cms-edit=1/.test(location.search)) return;

  let lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('gkb_lang') || 'hy';

  const CMS_UI = {
    hy: {
      banner: '✎ Խմբագրման ռեժիմ — սեղմեք տեքստի կամ նկարի վրա։ Հղումներն ու կոճակները անջատված են։',
      language: 'Լեզու',
      cancel: 'Չեղարկել',
      save: 'Պահպանել',
      saving: 'Պահպանվում է…',
      uploading: 'Վերբեռնվում է…',
      uploadFile: 'Վերբեռնել ֆայլ',
      pasteLink: 'Տեղադրել հղում',
      chooseFile: 'Ընտրել լուսանկար կամ տեսանյութ',
      uploadHint: 'Մաքս. 10 ՄԲ · JPG, PNG, WebP, MP4, WebM',
      imageVideo: 'Նկար / տեսանյութ',
      text: 'Տեքստ',
      placeholder: 'Տեղադրիչ',
      onePerLine: 'մեկ տողում մեկ',
      linkFormat: 'տեքստ|հղում',
      itemFormat: 'անուն|նկարագրություն'
    },
    ru: {
      banner: '✎ Режим редактирования — нажмите на текст или изображение. Ссылки и кнопки отключены.',
      language: 'Язык',
      cancel: 'Отмена',
      save: 'Сохранить',
      saving: 'Сохранение…',
      uploading: 'Загрузка…',
      uploadFile: 'Загрузить файл',
      pasteLink: 'Вставить ссылку',
      chooseFile: 'Выбрать фото или видео',
      uploadHint: 'Макс. 10 МБ · JPG, PNG, WebP, MP4, WebM',
      imageVideo: 'Изображение / видео',
      text: 'Текст',
      placeholder: 'Подсказка',
      onePerLine: 'по одному на строку',
      linkFormat: 'текст|ссылка',
      itemFormat: 'название|описание'
    },
    en: {
      banner: '✎ Edit mode — click text or images to edit. Links and buttons are disabled.',
      language: 'Language',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving…',
      uploading: 'Uploading…',
      uploadFile: 'Upload file',
      pasteLink: 'Paste link',
      chooseFile: 'Choose photo or video',
      uploadHint: 'Max 10 MB · JPG, PNG, WebP, MP4, WebM',
      imageVideo: 'Image / video',
      text: 'Text',
      placeholder: 'Placeholder',
      onePerLine: 'one per line',
      linkFormat: 'text|link',
      itemFormat: 'name|description'
    }
  };

  const FIELD_LABELS = {
    hy: {
      'hero-title': 'Գլխավոր վերնագիր',
      'hero-subtitle': 'Գլխավոր ենթավերնագիր',
      'home-hero-image': 'Գլխավոր բաներ (լուսանկար / տեսանյութ)',
      'patient-hero-image': 'Տեսանյութ բաներ (ներքև)',
      'home-conditions': 'Հիվանդությունների ցանկ',
      'home-imaging-list': 'Սարքավորումների ցանկ',
      'home-expertise-links': 'Փորձագիտության հղումներ',
      'home-awards': 'Պարգևների քարտեր',
      'home-news': 'Նորությունների քարտեր',
      'home-intro-prose': 'Ներածական տեքստ',
      'home-feature-image': 'Բլոկի լուսանկար / տեսանյութ',
      'home-feature-title': 'Բլոկի վերնագիր',
      'home-feature-desc': 'Բլոկի նկարագրություն'
    },
    ru: {
      'hero-title': 'Заголовок героя',
      'hero-subtitle': 'Подзаголовок героя',
      'home-hero-image': 'Главный баннер (фото / видео)',
      'patient-hero-image': 'Видео-баннер (нижний)',
      'home-conditions': 'Список заболеваний',
      'home-imaging-list': 'Список оборудования',
      'home-expertise-links': 'Ссылки экспертизы',
      'home-awards': 'Карточки наград',
      'home-news': 'Карточки новостей',
      'home-intro-prose': 'Вводный текст',
      'home-feature-image': 'Фото / видео блока',
      'home-feature-title': 'Заголовок блока',
      'home-feature-desc': 'Описание блока'
    },
    en: {
      'hero-title': 'Hero title',
      'hero-subtitle': 'Hero subtitle',
      'home-hero-image': 'Main banner (photo / video)',
      'patient-hero-image': 'Video banner (lower)',
      'home-conditions': 'Conditions list',
      'home-imaging-list': 'Equipment list',
      'home-expertise-links': 'Expertise links',
      'home-awards': 'Award cards',
      'home-news': 'News cards',
      'home-intro-prose': 'Intro text',
      'home-feature-image': 'Feature photo / video',
      'home-feature-title': 'Feature title',
      'home-feature-desc': 'Feature description'
    }
  };

  function ui(key) {
    return CMS_UI[lang]?.[key] || CMS_UI.en[key] || key;
  }

  function fieldLabel(fieldKey, fallback) {
    return FIELD_LABELS[lang]?.[fieldKey] || FIELD_LABELS.en?.[fieldKey] || fallback || fieldKey;
  }

  function listFieldText(selector) {
    return [...document.querySelectorAll(`${selector} li`)].map((li) => li.textContent.trim()).join('\n');
  }

  function listFieldLinks(selector) {
    return [...document.querySelectorAll(`${selector} li a`)].map((a) => {
      const href = a.getAttribute('href') || '#';
      return `${a.textContent.trim()}|${href}`;
    }).join('\n');
  }

  function listFieldAwards(selector) {
    return [...document.querySelectorAll(`${selector} .hss-award-card`)].map((card) => {
      const label = card.querySelector('strong')?.textContent?.trim() || '';
      const desc = card.querySelector('span')?.textContent?.trim() || '';
      return `${label}|${desc}`;
    }).join('\n');
  }

  function listFieldNews(selector) {
    return [...document.querySelectorAll(`${selector} .hss-news-card`)].map((card) => {
      const title = card.querySelector('h3')?.textContent?.trim() || '';
      const category = card.querySelector('.hss-news-card__cat')?.textContent?.trim() || '';
      const image = card.querySelector('img')?.getAttribute('src') || '';
      return `${title}|${category}|${image}`;
    }).join('\n');
  }
  const pagePath = resolvePagePath();

  const PAGE_PATH_TO_KEY = {
    'index.html': 'home',
    'doctors.html': 'doctors',
    'contacts.html': 'contacts',
    'departments.html': 'departments',
    'about.html': 'about',
    'services.html': 'services',
    'service.html': 'service',
    'doctor.html': 'doctor',
    'appointment.html': 'appointment',
    'reviews.html': 'reviews',
    'knowledge.html': 'knowledge',
    'knowledge-article.html': 'knowledge-article',
    'conditions.html': 'conditions',
    'condition.html': 'condition',
    'patient-information.html': 'patient-information',
    'consultation-process.html': 'consultation-process',
    'move-better.html': 'move-better',
    'patient-story.html': 'patient-story',
    'submit-story.html': 'submit-story',
    'privacy-policy.html': 'privacy-policy',
    'cookies-policy.html': 'cookies-policy',
    'terms.html': 'terms'
  };

  function resolvePagePath() {
    const raw = (location.pathname || '/').replace(/\/+$/, '') || '/';
    if (raw === '/' || raw === '/index.html') return 'index.html';
    const cleanMap = {
      '/doctors': 'doctors.html',
      '/find-a-doctor': 'doctors.html',
      '/contact': 'contacts.html',
      '/contacts': 'contacts.html',
      '/departments': 'departments.html',
      '/patient-care': 'departments.html',
      '/about': 'about.html',
      '/services': 'services.html',
      '/appointment': 'appointment.html',
      '/reviews': 'reviews.html',
      '/knowledge': 'knowledge.html',
      '/conditions': 'conditions.html',
      '/patient-information': 'patient-information.html',
      '/consultation-process': 'consultation-process.html',
      '/move-better': 'move-better.html',
      '/submit-story': 'submit-story.html',
      '/privacy-policy': 'privacy-policy.html',
      '/cookies-policy': 'cookies-policy.html',
      '/terms': 'terms.html'
    };
    if (cleanMap[raw]) return cleanMap[raw];
    if (raw.startsWith('/services/')) return 'service.html';
    if (raw.startsWith('/doctors/') || raw.startsWith('/find-a-doctor/')) return 'doctor.html';
    if (raw.startsWith('/conditions/')) return 'condition.html';
    if (raw.startsWith('/knowledge/')) return 'knowledge-article.html';
    if (raw.startsWith('/patient-stories/') || raw.startsWith('/patient-story')) return 'patient-story.html';
    const last = raw.split('/').pop() || 'index.html';
    return last.endsWith('.html') ? last : `${last}.html`;
  }

  let pageFieldsCache = {};
  /** @type {Map<string, object>} */
  const pendingChanges = new Map();
  /** @type {Map<string, object>} */
  const pendingGlobalChanges = new Map();

  let globalSettings = {};

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

  function isVideoUrl(url) {
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || '');
  }

  function inferFieldValueType(value, el, opts = {}) {
    if (opts.valueType === 'video' || opts.valueType === 'image') return opts.valueType;
    if (isVideoUrl(value)) return 'video';
    if (/\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(value || '')) return 'image';
    if (el?.tagName === 'VIDEO') return 'video';
    if (el?.tagName === 'IMG') return 'image';
    return 'text';
  }

  function setText(el, val, field) {
    if ((el?.id === 'home-hero-image' || el?.id === 'home-hero-media') && typeof HospitalApp !== 'undefined') {
      HospitalApp.applyHomeHeroMedia(val, inferFieldValueType(val, el));
      return;
    }
    if ((el?.id === 'patient-hero-image' || el?.id === 'patient-hero-media') && typeof HospitalApp !== 'undefined') {
      HospitalApp.applyPatientHeroMedia(val, inferFieldValueType(val, el));
      return;
    }
    if (el?.id === 'home-feature-image' && typeof HospitalApp !== 'undefined') {
      HospitalApp.applyFeatureMedia(val, inferFieldValueType(val, el));
      return;
    }
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {
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
    if (el.id === 'header-phone-text') {
      el.textContent = val;
      const link = document.getElementById('header-phone');
      if (link && typeof HospitalApp !== 'undefined') {
        link.href = `tel:${HospitalApp.phoneTelUri(val)}`;
      }
      return;
    }
    if (el.id === 'header-email') {
      el.textContent = val;
      if (el.tagName === 'A') el.href = `mailto:${val}`;
      return;
    }
    if (el.id === 'header-brand-name') {
      document.querySelectorAll('.logo-brand__name').forEach((n) => {
        n.textContent = val;
      });
      return;
    }
    if (el.id === 'header-logo') {
      document.querySelectorAll('#header-logo, .logo-img--mark').forEach((img) => {
        const url = val && !img.closest('.logo-brand--footer') ? val : null;
        img.src =
          typeof HospitalApp !== 'undefined' && HospitalApp.normalizeAssetUrl
            ? HospitalApp.normalizeAssetUrl(url || '/images/brand/logo-mark.png')
            : url || '/images/brand/logo-mark.png';
      });
      return;
    }
    if (el.id === 'home-conditions') {
      el.innerHTML = val.split('\n').filter(Boolean).map((item) => `<li>${item.trim()}</li>`).join('');
      return;
    }
    if (el.id === 'home-imaging-list') {
      el.innerHTML = val.split('\n').filter(Boolean).map((line) => {
        const sep = line.includes('|') ? '|' : ' — ';
        const parts = line.split(sep).map((s) => s.trim());
        const name = parts[0] || '';
        const desc = parts.slice(1).join(sep.trim()).trim();
        return desc ? `<li><strong>${name}</strong> — ${desc}</li>` : `<li><strong>${name}</strong></li>`;
      }).join('');
      return;
    }
    if (el.id === 'expertise-links') {
      el.innerHTML = val.split('\n').filter(Boolean).map((line) => {
        const [text, href] = line.split('|').map((s) => s.trim());
        return `<li><a href="${href || '#'}">${text || line}</a></li>`;
      }).join('');
      return;
    }
    if (el.id === 'home-awards-grid') {
      const cards = val.split('\n').filter(Boolean).map((line, i) => {
        const [label, desc] = line.split('|').map((s) => s.trim());
        return `<div class="hss-award-card"><div class="hss-award-card__badge">${i + 1}</div><strong>${label || line}</strong><span>${desc || ''}</span></div>`;
      }).join('');
      const intro = el.querySelector('.hss-awards__intro');
      el.innerHTML = cards + (intro ? intro.outerHTML : '');
      return;
    }
    if (el.id === 'home-news') {
      el.innerHTML = val.split('\n').filter(Boolean).map((line) => {
        const [title, category, image] = line.split('|').map((s) => s.trim());
        return `<a href="#" class="hss-news-card"><div class="hss-news-card__img"><img src="${image || 'images/about-image-01.jpg'}" alt="${title || ''}" loading="lazy" decoding="async" width="400" height="260"></div><div class="hss-news-card__cat">${category || ''}</div><h3>${title || line}</h3></a>`;
      }).join('');
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
    const n = pendingChanges.size + pendingGlobalChanges.size;
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
      value_type: inferFieldValueType(value, el, opts)
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

  function queueGlobalHospitalChange(key, value, opts = {}) {
    const lng = opts.lang || lang;
    const id = `global:${key}:${lng}`;
    pendingGlobalChanges.set(id, { key, value, lang: lng });
    globalSettings.hospital = globalSettings.hospital || {};
    const h = globalSettings.hospital;
    if (['name', 'shortName', 'tagline', 'address', 'hours'].includes(key)) {
      h[key] = { ...(h[key] || {}), [lng]: value };
      if (key === 'name') {
        h.shortName = { ...(h.shortName || {}), [lng]: value };
      }
    } else {
      h[key] = value;
    }
    updatePendingUI();
    console.log('[cms-edit] Queued global change', { key, value, lang: lng });
    return { queued: true };
  }

  function hospitalField(key, lng) {
    const h = globalSettings.hospital || {};
    const tri = h[key];
    if (tri && typeof tri === 'object' && !Array.isArray(tri)) {
      return tri[lng] || tri.hy || tri.ru || tri.en || '';
    }
    return h[key] || '';
  }

  async function flushGlobalHospitalChanges() {
    if (!pendingGlobalChanges.size) return 0;
    const patch = {};
    for (const ch of pendingGlobalChanges.values()) {
      if (['name', 'shortName', 'tagline', 'address', 'hours'].includes(ch.key)) {
        patch[ch.key] = { ...(patch[ch.key] || {}), [ch.lang]: ch.value };
        if (ch.key === 'name') {
          patch.shortName = { ...(patch.shortName || {}), [ch.lang]: ch.value };
        }
      } else {
        patch[ch.key] = ch.value;
      }
    }
    await api('/admin/settings/global', 'PUT', { merge: true, hospital: patch });
    pendingGlobalChanges.clear();
    updatePendingUI();
    return Object.keys(patch).length;
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
    const [extra, i18n, pages, settings] = await Promise.all([
      api('/admin/settings/content-extra', 'GET'),
      api('/admin/settings/i18n-overrides', 'GET'),
      api(`/admin/pages/${cmsPageKey()}`, 'GET'),
      api('/admin/settings', 'GET').catch(() => ({ global: {} }))
    ]);
    contentExtra = extra.content_extra || {};
    i18nOverrides = i18n.i18n_overrides || {};
    elementStyles = contentExtra.elementStyles || {};
    pageFieldsCache = pages.fields || {};
    globalSettings = settings.global || {};
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
    { sel: '#home-hero-image', fieldKey: 'home-hero-image', label: 'Homepage banner photo / video', type: 'image',
      async get() {
        const el = document.getElementById('home-hero-image');
        return (
          getCachedField('home-hero-image') ||
          getCachedField('patient-hero-image') ||
          contentExtra.patientHero?.image ||
          el?.src ||
          el?.currentSrc ||
          ''
        );
      },
      async save(val, el) {
        const target = document.getElementById('home-hero-image') || document.getElementById('home-hero-media') || el;
        const valueType = inferFieldValueType(val, target);
        await persistField(target, val, {
          fieldKey: 'home-hero-image',
          valueType
        });
        if (typeof HospitalApp !== 'undefined') {
          HospitalApp.applyHomeHeroMedia(val, valueType);
        }
        const lower = document.getElementById('patient-hero');
        const isEdit = /[?&]cms-edit=1/.test(location.search);
        if (lower && !isEdit) lower.hidden = !!val;
      } },
    { sel: '#home-hero-media', fieldKey: 'home-hero-image', label: 'Homepage banner photo / video', type: 'image',
      async get() {
        const heroField = HOME_FIELDS.find((f) => f.fieldKey === 'home-hero-image' && f.sel === '#home-hero-image');
        return heroField ? heroField.get() : '';
      },
      async save(val, el) {
        const heroField = HOME_FIELDS.find((f) => f.fieldKey === 'home-hero-image' && f.sel === '#home-hero-image');
        if (heroField) return heroField.save(val, el);
      } },
    { sel: '#patient-hero-image', fieldKey: 'patient-hero-image', label: 'Lower video banner', type: 'image',
      async get() {
        const el = document.getElementById('patient-hero-image');
        return getCachedField('patient-hero-image') || contentExtra.patientHero?.image || el?.src || el?.currentSrc || '';
      },
      async save(val, el) {
        const target = document.getElementById('patient-hero-image') || document.getElementById('patient-hero-media') || el;
        const valueType = inferFieldValueType(val, target);
        await persistField(target, val, { fieldKey: 'patient-hero-image', valueType });
        if (typeof HospitalApp !== 'undefined') {
          HospitalApp.applyPatientHeroMedia(val, valueType);
        }
      } },
    { sel: '#patient-hero-media', fieldKey: 'patient-hero-image', label: 'Lower video banner', type: 'image',
      async get() {
        const field = HOME_FIELDS.find((f) => f.fieldKey === 'patient-hero-image' && f.sel === '#patient-hero-image');
        return field ? field.get() : '';
      },
      async save(val, el) {
        const field = HOME_FIELDS.find((f) => f.fieldKey === 'patient-hero-image' && f.sel === '#patient-hero-image');
        if (field) return field.save(val, el);
      } },
    { sel: '#home-feature-image', label: 'Feature photo / video', type: 'image',
      async get() {
        const el = document.getElementById('home-feature-image');
        return getCachedField('home-feature-image') || contentExtra.feature?.image || el?.src || el?.currentSrc || '';
      },
      async save(val, el) {
        const target = el || document.getElementById('home-feature-image');
        await persistField(target, val, {
          fieldKey: 'home-feature-image',
          valueType: inferFieldValueType(val, target)
        });
      } },
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
      async save(val, el) { await persistField(el || document.querySelector('#home-intro-prose'), val); } },
    { sel: '#home-conditions', fieldKey: 'home-conditions', label: 'Conditions list', type: 'textarea',
      hintKey: 'onePerLine',
      async get() {
        return getCachedField('home-conditions') ||
          listFieldText('#home-conditions') ||
          (contentExtra.conditions || []).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-conditions'), val, { fieldKey: 'home-conditions' }); } },
    { sel: '#home-imaging-list', fieldKey: 'home-imaging-list', label: 'Equipment list', type: 'textarea',
      hintKey: 'itemFormat',
      async get() {
        if (getCachedField('home-imaging-list')) return getCachedField('home-imaging-list');
        const lines = listFieldText('#home-imaging-list');
        if (lines) return lines;
        return (contentExtra.equipment || []).map((eq) => `${eq.name}|${eq.description}`).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-imaging-list'), val, { fieldKey: 'home-imaging-list' }); } },
    { sel: '#expertise-links', fieldKey: 'home-expertise-links', label: 'Expertise links', type: 'textarea',
      hintKey: 'linkFormat',
      async get() {
        return getCachedField('home-expertise-links') ||
          listFieldLinks('#expertise-links') ||
          (contentExtra.expertiseOverlay?.links || []).map((l) => `${l.text}|${l.href}`).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#expertise-links'), val, { fieldKey: 'home-expertise-links' }); } },
    { sel: '#home-awards-grid', fieldKey: 'home-awards', label: 'Award cards', type: 'textarea',
      hintKey: 'itemFormat',
      async get() {
        return getCachedField('home-awards') ||
          listFieldAwards('#home-awards-grid') ||
          (contentExtra.awards || []).map((a) => `${a.label}|${a.desc}`).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-awards-grid'), val, { fieldKey: 'home-awards' }); } },
    { sel: '#home-news', fieldKey: 'home-news', label: 'News cards', type: 'textarea',
      hintKey: 'linkFormat',
      async get() {
        return getCachedField('home-news') ||
          listFieldNews('#home-news') ||
          (contentExtra.news || []).map((n) => `${n.title}|${n.category}|${n.image || ''}`).join('\n');
      },
      async save(val, el) { await persistField(el || document.querySelector('#home-news'), val, { fieldKey: 'home-news' }); } }
  ];

  const HEADER_FIELDS = [
    { sel: '#header-logo', label: 'Logo image', type: 'image',
      async get() {
        const el = document.querySelector('#header-logo');
        return hospitalField('logo', lang) || el?.src || '';
      },
      async save(val, el) {
        queueGlobalHospitalChange('logo', val);
      } },
    { sel: '#header-phone-text', label: 'Phone number', type: 'text',
      async get() {
        return hospitalField('phone', lang) || getText(document.querySelector('#header-phone-text'));
      },
      async save(val, el) {
        queueGlobalHospitalChange('phone', val);
      } },
    { sel: '#header-email', label: 'Email (header bar)', type: 'text',
      async get() {
        return hospitalField('email', lang) || getText(document.querySelector('#header-email'));
      },
      async save(val, el) {
        queueGlobalHospitalChange('email', val);
      } },
    { sel: '#header-rate-btn', label: 'Rate us button', type: 'text',
      i18nKey: 'common.rateUs',
      async get() {
        return getCachedField('i18n_common.rateUs') || i18nOverrides[lang]?.['common.rateUs'] ||
          (typeof I18n !== 'undefined' ? I18n.t('common.rateUs') : getText(document.querySelector('#header-rate-btn')));
      },
      async save(val, el) {
        await persistField(el, val, { fieldKey: 'i18n_common.rateUs', i18nKey: 'common.rateUs' });
      } }
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
    const globalSaved = await flushGlobalHospitalChanges();
    const changes = [...pendingChanges.values()];
    console.log('[cms-edit] Pending changes before Save All', changes);

    if (!changes.length) {
      const pub = await api('/admin/publish', 'POST');
      return { saved: globalSaved, publish: pub.publish, fields_by_page: {} };
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
    return { ...res, saved: (res.saved || 0) + globalSaved };
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
    const n = pendingChanges.size + pendingGlobalChanges.size;
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
        <button type="button" class="cms-edit-tab active" data-tab="upload">${ui('uploadFile')}</button>
        <button type="button" class="cms-edit-tab" data-tab="url">${ui('pasteLink')}</button>
      </div>
      <div class="cms-edit-panel" data-panel="upload">
        <button type="button" class="cms-upload-trigger">${ui('chooseFile')}</button>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" class="cms-edit-file">
        <p class="cms-edit-hint" id="cms-upload-status">${ui('uploadHint')}</p>
      </div>
      <div class="cms-edit-panel" data-panel="url" hidden>
        <input type="url" class="cms-edit-url" placeholder="https://… or /api/v1/media/files/…">
      </div>
      <div class="cms-edit-popover__actions">
        <button type="button" class="cms-cancel">${ui('cancel')}</button>
        <button type="button" class="cms-save">${ui('save')}</button>
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
      btn.textContent = ui('uploading');
      if (statusEl) statusEl.textContent = `Uploading ${file.name}…`;
      try {
        pendingUrl = await uploadFile(file);
        urlInput.value = pendingUrl;
        const uploadedType = file.type.startsWith('video/') || isVideoUrl(pendingUrl) ? 'video' : 'image';
        if (activeEdit) activeEdit.opts.valueType = uploadedType;
        if (statusEl) {
          statusEl.textContent =
            uploadedType === 'video'
              ? 'Video uploaded — click Save'
              : 'Upload complete — click Save';
        }
        toast(uploadedType === 'video' ? 'Video uploaded' : 'File uploaded');
      } catch (err) {
        notifyError(err);
        if (statusEl) statusEl.textContent = err.message;
      }
      btn.disabled = false;
      btn.textContent = ui('save');
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
      btn.textContent = ui('saving');
      try {
        const valueType = inferFieldValueType(val, el, activeEdit?.opts || {});
        await field.save(val, el);
        setText(el, val, field);
        if (el?.id === 'home-hero-image' && typeof HospitalApp !== 'undefined') {
          HospitalApp.applyHomeHeroMedia(val, valueType);
        } else if (el?.id === 'patient-hero-image' && typeof HospitalApp !== 'undefined') {
          HospitalApp.applyHomeHeroMedia(val, valueType);
        } else if (el?.id === 'home-feature-image' && typeof HospitalApp !== 'undefined') {
          HospitalApp.applyFeatureMedia(val, valueType);
        }
        notifySaved();
        closePopover();
      } catch (err) {
        notifyError(err);
        btn.disabled = false;
        btn.textContent = ui('save');
      }
    };
  }

  function buildTextPopover(field, el, rect) {
    popover = document.createElement('div');
    popover.className = 'cms-edit-popover';
    popover.innerHTML = `<h4>${field.label}</h4><p class="cms-edit-lang">${ui('language')}: ${({ hy: 'Հայերեն', ru: 'Русский', en: 'English' })[lang] || lang.toUpperCase()}</p>`;
    const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    input.value = 'Loading…';
    popover.appendChild(input);
    const actions = document.createElement('div');
    actions.className = 'cms-edit-popover__actions';
    actions.innerHTML = `<button type="button" class="cms-cancel">${ui('cancel')}</button><button type="button" class="cms-save">${ui('save')}</button>`;
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
      btn.textContent = ui('saving');
      try {
        await field.save(input.value.trim(), el);
        setText(el, input.value.trim(), field);
        notifySaved();
        closePopover();
      } catch (err) {
        notifyError(err);
        btn.disabled = false;
        btn.textContent = ui('save');
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
      label: isPlaceholder ? `${ui('placeholder')}: ${key}` : `${ui('text')}: ${key}`,
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
      label: ui('imageVideo'),
      type: 'image',
      async get() {
        return getCachedField(fk) || contentExtra.pageImages?.[cmsKey(el)] || el.src || el.currentSrc || '';
      },
      async save(val) {
        const target = document.getElementById(el.id) || el;
        await persistField(target, val, {
          fieldKey: fk,
          valueType: inferFieldValueType(val, target)
        });
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

  function isNonEditableChrome(el) {
    return el.closest('.lang-switcher, .mobile-menu, #nav-search-btn, .nav-search, .cms-edit-banner');
  }

  function isInsideChrome(el) {
    return el.closest('#site-footer, .cms-edit-popover, .cms-edit-toast, .cms-doctor-toolbar');
  }

  function attachAll() {
    const claimed = new Set([
      ...HOME_FIELDS.map((f) => f.sel),
      ...HEADER_FIELDS.map((f) => f.sel)
    ]);

    HEADER_FIELDS.forEach((field) => {
      const el = document.querySelector(field.sel);
      if (el) {
        markEditable(el, {
          ...field,
          label: fieldLabel(field.sel.replace('#', ''), field.label)
        });
      }
    });

    HOME_FIELDS.forEach((field) => {
      if (field.sel === '#home-hero-media' && document.getElementById('home-hero-image')) return;
      if (field.sel === '#patient-hero-media' && document.getElementById('patient-hero-image')) return;
      const el = document.querySelector(field.sel);
      if (!el) return;
      const localized = {
        ...field,
        label: fieldLabel(field.fieldKey || field.sel.replace('#', ''), field.label)
      };
      if (localized.hintKey) {
        localized.label = `${localized.label} (${ui(localized.hintKey)})`;
      }
      markEditable(el, localized);
    });

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (isInsideChrome(el) || isNonEditableChrome(el) || claimed.has(`#${el.id}`)) return;
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      markEditable(el, fieldFromI18n(el, key, false));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      if (isInsideChrome(el) || isNonEditableChrome(el)) return;
      const key = el.getAttribute('data-i18n-placeholder');
      markEditable(el, { ...fieldFromI18n(el, key, true), type: 'text', fieldType: 'placeholder' });
    });

    const mediaSel = [
      'main img', 'main video',
      '.hss-wrap img', '.hss-wrap video',
      '.hss-hero img', '.hss-section img', '.hss-about-hero img',
      '.hss-video-hero__bg', '.hss-service-item__photo img',
      '.hss-doctor-item__photo-img',
      '#home-hero-image', '#patient-hero-image', '#home-feature-image'
    ].join(', ');
    document.querySelectorAll(mediaSel).forEach((img) => {
      if (isInsideChrome(img) || img.closest('[data-cms-editable]')) return;
      if (img.id && HOME_FIELDS.some((f) => f.sel === `#${img.id}`)) return;
      markEditable(img, fieldFromImage(img));
    });

    // Pages like doctors/patient-care have no <main> — cover hero + sections + cards
    const textSel = [
      'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li', 'main span', 'main label span',
      '.hss-hero h1', '.hss-hero h2', '.hss-hero p', '.hss-hero__tagline',
      '.hss-section h1', '.hss-section h2', '.hss-section h3', '.hss-section h4',
      '.hss-section p', '.hss-section li',
      '.hss-service-group__title', '.hss-service-item__name', '.hss-service-item__desc',
      '.hss-service-item__meta', '.hss-service-item__bullets li',
      '.hss-doctor-item__name', '.hss-doctor-item__role', '.hss-doctor-item__exp',
      '.hss-doctor-item__loc', '.hss-doctor-item__bio',
      '.hss-about-section__title', '.hss-about-section__lead', '.hss-about-section__body',
      '.hss-btn', 'button.hss-btn', 'a.hss-btn'
    ].join(', ');
    document.querySelectorAll(textSel).forEach((el) => {
      if (isInsideChrome(el) || isNonEditableChrome(el) || el.closest('#site-header') || el.hasAttribute('data-cms-editable') || el.closest('[data-cms-editable]')) return;
      if (el.children.length > 0 && !el.classList.contains('hss-btn') && el.tagName !== 'A') return;
      const text = getText(el);
      if (!text || text.length < 2) return;
      markEditable(el, fieldFromInline(el));
    });

    document.querySelectorAll('.hss-btn, button.hss-btn, a.hss-btn, button[type="submit"]').forEach((btn) => {
      if (isInsideChrome(btn) || isNonEditableChrome(btn)) return;
      if (btn.closest('#site-header') && btn.id !== 'header-rate-btn') return;
      if (btn.id === 'header-rate-btn') return;
      addResizeHandles(btn);
    });

    syncEditLayout();
    applyElementStyles();
    attachDoctorControls();
    reportPreviewHeight();
  }

  async function waitForPageContent() {
    await waitForHomeContent();
    const grids = ['#departments-grid', '#doctors-grid', '#services-hub-root', '#conditions-hub-root', '#knowledge-hub-root', '#reviews-list', '#about-leadership'];
    const need = grids.map((s) => document.querySelector(s)).filter(Boolean);
    if (!need.length) return;
    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      const ready = () =>
        need.some((el) => el.children.length > 0 || el.querySelector('h1, h2, h3, .hss-service-item, .hss-doctor-item'));
      if (ready()) {
        finish();
        return;
      }
      const obs = new MutationObserver(() => {
        if (ready()) {
          obs.disconnect();
          finish();
        }
      });
      need.forEach((el) => obs.observe(el, { childList: true, subtree: true }));
      setTimeout(() => {
        obs.disconnect();
        finish();
      }, 4000);
    });
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
        const docId = row.dataset.doctorId || '';
        window.parent.postMessage({ type: 'cms-open-doctors', doctorId: docId }, '*');
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
    const rootBase = (document.querySelector('script[src*="common.js"]')?.src || '').replace(/\/js\/common\.js.*$/, '/') || '/';
    link.href = `${rootBase}js/cms-edit-mode.css?v=${new URLSearchParams(location.search).get('cms_build') || window.CMS_BUILD || '20260628'}`;
    document.head.appendChild(link);
  }

  function syncEditLayout() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--hss-header-h', `${h}px`);
  }

  function showEditBanner() {
    if (document.getElementById('cms-edit-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'cms-edit-banner';
    bar.className = 'cms-edit-banner';
    bar.textContent = ui('banner');
    document.body.prepend(bar);
  }

  function reportPreviewHeight() {
    if (!window.parent || window.parent === window) return;
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      720
    );
    window.parent.postMessage({ type: 'cms-preview-height', height }, '*');
  }

  let previewResizeObserver = null;
  function watchPreviewHeight() {
    reportPreviewHeight();
    if (previewResizeObserver || typeof ResizeObserver === 'undefined') return;
    previewResizeObserver = new ResizeObserver(() => reportPreviewHeight());
    previewResizeObserver.observe(document.body);
    previewResizeObserver.observe(document.documentElement);
    const hero = document.querySelector('.hss-home-hero');
    if (hero) previewResizeObserver.observe(hero);
  }

  async function syncSiteLanguage() {
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (!urlLang || !['hy', 'ru', 'en'].includes(urlLang)) return;
    lang = urlLang;
    try {
      localStorage.setItem('gkb_lang', urlLang);
    } catch {
      /* private mode */
    }
    if (typeof I18n !== 'undefined') {
      await I18n.init().catch(() => {});
      if (I18n.getLang() !== urlLang) {
        await I18n.setLanguage(urlLang);
      }
    }
  }

  async function waitForHomeContent() {
    if (pagePath !== 'index.html' && pagePath !== '') return;
    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      if (document.getElementById('home-hero-image')) {
        finish();
        return;
      }
      window.addEventListener('cms-hero-media-ready', finish, { once: true });
      setTimeout(finish, 3500);
    });
  }

  async function init() {
    if (!token()) {
      document.body.innerHTML = '<p style="padding:2rem;font-family:system-ui;text-align:center">Please sign in to the admin panel first.</p>';
      return;
    }
    document.body.classList.add('cms-edit-mode');
    injectStyles();
    showEditBanner();
    syncEditLayout();
    setTimeout(syncEditLayout, 150);
    setTimeout(syncEditLayout, 600);
    window.addEventListener('resize', syncEditLayout, { passive: true });
    blockInteractions();
    try {
      await syncSiteLanguage();
    } catch {
      /* continue */
    }
    try {
      await loadStores();
    } catch {
      /* partial edit still works */
    }
    try {
      if (typeof HospitalApp !== 'undefined') {
        await HospitalApp.init().catch(() => {});
      }
      await waitForPageContent();
    } catch {
      /* continue */
    }
    attachAll();
    // Dynamic grids may populate slightly later — re-scan
    setTimeout(attachAll, 500);
    setTimeout(attachAll, 1500);
    setTimeout(attachAll, 3000);
    updatePendingUI();
    watchPreviewHeight();
    setTimeout(reportPreviewHeight, 300);
    setTimeout(reportPreviewHeight, 1200);
    window.addEventListener('hospital:refresh', () => {
      setTimeout(attachAll, 200);
      setTimeout(attachAll, 800);
      setTimeout(syncEditLayout, 250);
      setTimeout(reportPreviewHeight, 400);
    });
    window.addEventListener('languagechange', () => {
      setTimeout(attachAll, 300);
      setTimeout(syncEditLayout, 350);
      setTimeout(reportPreviewHeight, 500);
    });
    window.addEventListener('cms-hero-media-ready', () => {
      setTimeout(() => {
        attachAll();
        syncEditLayout();
        reportPreviewHeight();
      }, 50);
      setTimeout(reportPreviewHeight, 400);
    });
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
