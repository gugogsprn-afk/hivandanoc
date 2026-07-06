// Общая логика сайта больницы (навигация, данные, анимации, i18n)

const HospitalApp = (function () {
  const NAV_ITEMS = [
    { href: '/services', key: 'nav.services', id: 'services' },
    { href: '/conditions', key: 'nav.conditions', id: 'conditions' },
    { href: '/knowledge', key: 'nav.knowledge', id: 'knowledge' },
    { href: '/find-a-doctor', key: 'nav.doctors', id: 'doctors' },
    { href: '/locations', key: 'nav.locations', id: 'contacts' },
    { href: '/about', key: 'nav.about', id: 'about' }
  ];

  let baseData = null;
  let initPromise = null;
  let animObserver = null;
  let i18nHooked = false;

  const VIDEO_URL_RE = /\.(mp4|webm|ogg)(\?|#|$)/i;

  function isVideoUrl(url) {
    return typeof url === 'string' && VIDEO_URL_RE.test(url);
  }

  function inferMediaType(url, explicitType) {
    if (explicitType === 'video' || explicitType === 'image') return explicitType;
    return isVideoUrl(url) ? 'video' : 'image';
  }

  /** Canonical homepage banner — home-hero-image wins over legacy patient-hero-image */
  function resolveHomeBannerMedia(fields = {}) {
    const url = String(fields['home-hero-image'] || fields['patient-hero-image'] || '').trim();
    const type = fields['home-hero-image']
      ? fields['home-hero-image__type'] || inferMediaType(url)
      : fields['patient-hero-image__type'] || inferMediaType(url);
    return { url, type };
  }

  function mirrorBannerFieldChanges(fields = {}) {
    const { url, type } = resolveHomeBannerMedia(fields);
    if (!url) return fields;
    return {
      ...fields,
      'home-hero-image': url,
      'patient-hero-image': url,
      'home-hero-image__type': type,
      'patient-hero-image__type': type
    };
  }

  function applyMediaElement({ container, elementId, url, type, className, defaultImage }) {
    if (!container) return null;
    const mediaUrl = (url || '').trim();
    const fallback = defaultImage || '';
    const isVideo = mediaUrl && inferMediaType(mediaUrl, type) === 'video';
    let el = document.getElementById(elementId);

    if (!mediaUrl) {
      if (el?.tagName === 'IMG' && fallback) el.src = fallback;
      return el;
    }

    if (isVideo) {
      if (!el || el.tagName !== 'VIDEO') {
        if (el) el.remove();
        el = document.createElement('video');
        el.id = elementId;
        if (className) el.className = className;
        el.muted = true;
        el.loop = true;
        el.autoplay = true;
        el.controls = true;
      el.playsInline = true;
      el.setAttribute('playsinline', '');
      el.preload = 'metadata';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.objectFit = 'cover';
      el.style.objectPosition = 'center';
      container.insertBefore(el, container.firstChild);
      }
      el.src = mediaUrl;
      container.classList.add('has-video');
      el.play().catch(() => {});
    } else {
      if (!el || el.tagName !== 'IMG') {
        if (el) el.remove();
        el = document.createElement('img');
        el.id = elementId;
        if (className) el.className = className;
        el.alt = '';
        el.loading = 'lazy';
        el.decoding = 'async';
        container.insertBefore(el, container.firstChild);
      }
      el.src = mediaUrl;
      container.classList.remove('has-video');
    }
    return el;
  }

  function applyBlockMedia({ containerSelector, elementId, url, type, className = '', defaultImage = '' }) {
    const container = document.querySelector(containerSelector);
    return applyMediaElement({
      container,
      elementId,
      url,
      type,
      className,
      defaultImage
    });
  }

  function applyHeroMediaElementStyles(el) {
    if (!el) return;
    if (/[?&]cms-edit=1/.test(location.search)) {
      el.style.position = 'absolute';
      el.style.top = '50%';
      el.style.left = '50%';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.minWidth = '100%';
      el.style.minHeight = '100%';
      el.style.transform = 'translate(-50%, -50%) scale(1.02)';
      el.style.objectFit = 'cover';
      el.style.objectPosition = 'center center';
      return;
    }
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.objectFit = 'cover';
    el.style.objectPosition = 'center';
  }

  function applyHomeHeroMedia(url, type) {
    const container = document.getElementById('home-hero-media');
    if (!container) return null;
    const defaultImage =
      'https://images.unsplash.com/photo-1579684385127-1ef15f558a2a?w=1800&q=88';
    const mediaUrl = (url || '').trim() || defaultImage;
    const isVideo = inferMediaType(mediaUrl, type) === 'video';
    let el = document.getElementById('home-hero-image');

    if (isVideo) {
      if (!el || el.tagName !== 'VIDEO') {
        if (el) el.remove();
        el = document.createElement('video');
        el.id = 'home-hero-image';
        el.className = 'hss-home-hero__bg';
        el.muted = true;
        el.playsInline = true;
        el.setAttribute('playsinline', '');
        el.setAttribute('aria-hidden', 'true');
        applyHeroMediaElementStyles(el);
        container.insertBefore(el, container.firstChild);
      }
      const editPreview = /[?&]cms-edit=1/.test(location.search);
      el.loop = !editPreview;
      el.autoplay = !editPreview;
      el.preload = editPreview ? 'metadata' : 'auto';
      el.src = mediaUrl;
      container?.classList.add('has-video');
      applyHeroMediaElementStyles(el);
      if (editPreview) {
        el.pause();
      } else {
        el.play().catch(() => {});
        el.addEventListener(
          'loadeddata',
          () => {
            el.play().catch(() => {});
            notifyCmsHeroMediaReady();
          },
          { once: true }
        );
      }
    } else {
      if (!el || el.tagName !== 'IMG') {
        if (el) el.remove();
        el = document.createElement('img');
        el.id = 'home-hero-image';
        el.className = 'hss-home-hero__bg';
        el.alt = '';
        el.loading = 'eager';
        el.decoding = 'async';
        applyHeroMediaElementStyles(el);
        container.insertBefore(el, container.firstChild);
      }
      el.src = mediaUrl;
      container?.classList.remove('has-video');
      applyHeroMediaElementStyles(el);
      el.addEventListener('load', notifyCmsHeroMediaReady, { once: true });
    }
    notifyCmsHeroMediaReady();
    return el;
  }

  function notifyCmsHeroMediaReady() {
    if (!/[?&]cms-edit=1/.test(location.search)) return;
    window.dispatchEvent(new CustomEvent('cms-hero-media-ready'));
    if (window.parent && window.parent !== window) {
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        720
      );
      window.parent.postMessage({ type: 'cms-preview-height', height }, '*');
    }
  }

  function applyPatientHeroMedia(url, type) {
    const section = document.getElementById('patient-hero');
    const container = document.getElementById('patient-hero-media') || section;
    const el = applyMediaElement({
      container,
      elementId: 'patient-hero-image',
      url,
      type,
      className: 'hss-video-hero__bg',
      defaultImage: rootAsset('images/about-image-01.jpg')
    });
    if (el?.tagName === 'IMG') {
      el.width = 1200;
      el.height = 675;
    }
    return el;
  }

  function applyFeatureMedia(url, type) {
    const container = document.querySelector('#feature .hss-feature__media');
    return applyMediaElement({
      container,
      elementId: 'home-feature-image',
      url,
      type,
      className: '',
      defaultImage: rootAsset('images/about-image-01.jpg')
    });
  }

  function initVideoHeroPlayers() {
    /* Native video controls only — no overlay play button */
  }

  function isAdminPath() {
    return window.location.pathname.includes('/admin/');
  }

  function pathPrefix() {
    return isAdminPath() ? '../' : '';
  }

  /** Root-relative asset URL — works on clean URLs like /conditions/slug */
  function rootAsset(relativePath) {
    const clean = String(relativePath).replace(/^\//, '');
    return isAdminPath() ? `../${clean}` : `/${clean}`;
  }

  /** Normalize CMS / legacy relative paths to root-relative on public pages */
  function normalizeAssetUrl(url) {
    if (!url || typeof url !== 'string') return url;
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return rootAsset(url);
  }

  /** Root-relative route — works on nested clean URLs */
  function routeHref(path) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return isAdminPath() ? `../${normalized.replace(/^\//, '')}` : normalized;
  }

  function logoPath() {
    return rootAsset('images/brand/logo.png');
  }

  function logoMarkPath() {
    return rootAsset('images/brand/logo-mark.png');
  }

  function checkPreviewMode() {
    /* No on-page dev banner — use browser console if opened via file:// */
    if (window.location.protocol === 'file:') {
      console.warn('[Healthy Spine] Open via npm start → http://127.0.0.1:8765/');
    }
  }

  function brandName() {
    const loc = typeof I18n !== 'undefined' ? I18n.getContent() : null;
    if (loc?.hospital?.shortName) return loc.hospital.shortName;
    if (loc?.hospital?.name) return loc.hospital.name;
    const h = getData()?.hospital;
    if (h?.shortName) return h.shortName;
    if (h?.name) return h.name;
    if (typeof I18n !== 'undefined') {
      const fromMeta = I18n.t('meta.siteTitle');
      if (fromMeta && fromMeta !== 'meta.siteTitle') {
        return fromMeta.split('—')[0].split(' - ')[0].trim();
      }
    }
    return 'Առողջ ողնաշար';
  }

  function logoAlt() {
    return brandName();
  }

  function logoMarkup(prefix, variant) {
    const name = brandName();
    if (variant === 'footer') {
      const mark = logoPath();
      return `
        <span class="logo-brand logo-brand--footer">
          <img src="${mark}" alt="" class="logo-img logo-img--mark" width="48" height="48" loading="lazy" aria-hidden="true" />
          <span class="logo-brand__name">${name}</span>
        </span>`;
    }
    const mark = logoMarkPath();
    return `
      <span class="logo-brand logo-brand--header">
        <img src="${mark}" alt="" id="header-logo" class="logo-img logo-img--mark" width="96" height="96" loading="eager" aria-hidden="true" />
      </span>`;
  }

  function mergeMoveBetter(baseMb, locMb) {
    if (!baseMb) return locMb || null;
    if (!locMb) return baseMb;
    const out = { ...baseMb, ...locMb };
    if (locMb.featured) out.featured = { ...baseMb.featured, ...locMb.featured };
    if (locMb.programsBanner) out.programsBanner = { ...baseMb.programsBanner, ...locMb.programsBanner };
    if (locMb.sidebar) out.sidebar = mergeById(baseMb.sidebar || [], locMb.sidebar);
    if (locMb.topicSections) {
      out.topicSections = (baseMb.topicSections || []).map((sec) => {
        const tr = (locMb.topicSections || []).find((s) => s.id === sec.id);
        if (!tr) return sec;
        return { ...sec, articles: mergeById(sec.articles || [], tr.articles) };
      });
    }
    if (locMb.textArticles) out.textArticles = mergeById(baseMb.textArticles || [], locMb.textArticles);
    if (locMb.videos) out.videos = mergeById(baseMb.videos || [], locMb.videos);
    if (locMb.pressNews) out.pressNews = mergeById(baseMb.pressNews || [], locMb.pressNews);
    if (locMb.categories) out.categories = mergeById(baseMb.categories || [], locMb.categories);
    return out;
  }

  function mergeById(baseList, locList) {
    if (!locList?.length) return baseList;
    const TEXT = [
      'name', 'role', 'bio', 'experience', 'location', 'description', 'title', 'text',
      'category', 'treatment', 'label', 'desc', 'linkText', 'quote', 'ctaText', 'author'
    ];
    return (baseList || []).map((item) => {
      const tr = locList.find((x) => x.id === item.id);
      if (!tr) return item;
      const out = { ...item };
      for (const key of TEXT) {
        if (tr[key]) out[key] = tr[key];
      }
      if (tr.services?.length) out.services = tr.services;
      return out;
    });
  }

  function overlayLocaleFields(data, loc) {
    if (!loc || !data) return data;
    return {
      ...data,
      departments: loc.departments?.length
        ? mergeById(data.departments || [], loc.departments)
        : data.departments,
      doctors: loc.doctors?.length ? mergeById(data.doctors || [], loc.doctors) : data.doctors,
      serviceCategories: loc.serviceCategories?.length
        ? mergeById(data.serviceCategories || [], loc.serviceCategories)
        : data.serviceCategories,
      news: loc.news?.length ? mergeById(data.news || [], loc.news) : data.news,
      storyVideos: loc.storyVideos?.length
        ? mergeById(data.storyVideos || [], loc.storyVideos)
        : data.storyVideos,
      patientStories: loc.patientStories?.length
        ? mergeById(data.patientStories || [], loc.patientStories)
        : data.patientStories,
      awards: loc.awards?.length ? loc.awards : data.awards,
      backInGame: loc.backInGame ? { ...data.backInGame, ...loc.backInGame } : data.backInGame,
      patientHero: loc.patientHero ? { ...data.patientHero, ...loc.patientHero } : data.patientHero,
      expertiseOverlay: loc.expertiseOverlay
        ? { ...data.expertiseOverlay, ...loc.expertiseOverlay }
        : data.expertiseOverlay,
      introParagraphs: loc.introParagraphs?.length ? loc.introParagraphs : data.introParagraphs,
      approachParagraphs: loc.approachParagraphs?.length
        ? loc.approachParagraphs
        : data.approachParagraphs,
      expertsParagraphs: loc.expertsParagraphs?.length ? loc.expertsParagraphs : data.expertsParagraphs,
      imagingParagraphs: loc.imagingParagraphs?.length ? loc.imagingParagraphs : data.imagingParagraphs,
      feature: loc.feature ? { ...data.feature, ...loc.feature } : data.feature,
      conditions: loc.conditions?.length ? loc.conditions : data.conditions
    };
  }

  function phoneTelUri(phone) {
    if (!phone) return '';
    let digits = String(phone).replace(/[^\d+]/g, '');
    if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
    return digits;
  }

  function updatePhoneLinks(h) {
    if (!h) return;
    const tel = phoneTelUri(h.phone);
    const telHref = tel ? `tel:${tel}` : '#';

    const headerPhone = document.getElementById('header-phone');
    if (headerPhone) {
      headerPhone.href = telHref;
      const span = headerPhone.querySelector('span');
      if (span) span.textContent = h.phone || span.textContent;
    }

    const mobilePhone = document.getElementById('mobile-bar-phone');
    if (mobilePhone && tel) {
      mobilePhone.href = telHref;
      if (!mobilePhone.hasAttribute('data-i18n')) {
        mobilePhone.textContent = h.phone;
      }
    }

    const footerPhone = document.getElementById('footer-phone');
    if (footerPhone) {
      footerPhone.href = telHref;
      footerPhone.textContent = h.phone || footerPhone.textContent;
    }

    document.querySelectorAll('[data-phone-call]').forEach((el) => {
      if (!tel) return;
      el.href = telHref;
      if (el.dataset.phoneDisplay !== 'false') {
        const label = el.querySelector('[data-phone-label]');
        if (label) label.textContent = h.phone;
        else if (!el.hasAttribute('data-i18n')) el.textContent = h.phone;
      }
    });

    const emergency = h.emergency || '103';
    const emergencyTel = phoneTelUri(emergency);
    ['contact-emergency', 'appointment-emergency'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !emergencyTel) return;
      el.innerHTML = `<a href="tel:${emergencyTel}" class="hss-link hss-link--tel">${emergency}</a>`;
    });
  }

  function renderNav() {
    const mount = document.getElementById('site-nav');
    if (!mount) return;

    const prefix = pathPrefix();
    const page = document.body.dataset.page || '';

    const h = getData()?.hospital || {};
    const tel = phoneTelUri(h.phone) || '+74951234567';

    const links = NAV_ITEMS.map((item) => {
      const cls = page === item.id ? 'active' : '';
      return `<li><a href="${routeHref(item.href)}" class="${cls}" data-nav-id="${item.id}" data-i18n="${item.key}">${I18n.t(item.key)}</a></li>`;
    }).join('');

    mount.innerHTML = `
      <header class="header-wrap hss-header" id="site-header">
        <nav class="navbar">
          <div class="nav-container">
            <a href="${routeHref('/')}" class="logo logo--brand" aria-label="${brandName()}">
              ${logoMarkup(prefix, 'header')}
            </a>
            <ul class="nav-links nav-links--hss" id="site-mobile-nav">${links}</ul>
            <div class="nav-actions">
              <button type="button" class="nav-search" aria-label="${I18n.t('nav.search')}" id="nav-search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <div class="lang-switcher" role="group" aria-label="${I18n.t('nav.langAria')}"></div>
              <a href="tel:${tel}" class="nav-phone" id="header-phone" aria-label="${I18n.t('common.callUs')}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span id="header-phone-text">${h.phone || '+7 (495) 123-45-67'}</span>
              </a>
              <a href="${routeHref('/reviews')}" class="nav-cta hss-btn hss-btn--primary" id="header-rate-btn" data-i18n="common.rateUs">${I18n.t('common.rateUs')}</a>
            </div>
            <button type="button" class="mobile-menu" aria-label="${I18n.t('nav.menuAria')}" aria-expanded="false" aria-controls="site-mobile-nav">
              <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
            </button>
          </div>
        </nav>
      </header>`;

    I18n.renderSwitcher(mount.querySelector('.lang-switcher'));
    initMobileMenu();
    syncHeaderOffset();
    initHeaderScroll();
  }

  function socialIconSvg(name) {
    const icons = {
      facebook:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
      twitter:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      youtube:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>',
      instagram:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
      tiktok:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>',
      linkedin:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
      print:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
      mail:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
      pinterest:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.16 2.55 7.72 6.17 9.2-.09-.82-.17-2.08.03-2.98.19-.84 1.22-5.66 1.22-5.66s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.89 0 1.32.67 1.32 1.47 0 .89-.57 2.23-.86 3.47-.24 1.04.52 1.89 1.54 1.89 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.35-4.23-2.96 0-4.7 2.22-4.7 4.51 0 .89.34 1.85.77 2.37a.3.3 0 0 1 .07.28l-.28 1.12c-.04.18-.15.22-.34.13-1.26-.59-2.05-2.43-2.05-3.93 0-3.2 2.33-6.14 6.72-6.14 3.53 0 6.27 2.51 6.27 5.87 0 3.5-2.21 6.32-5.27 6.32-1.03 0-2-.54-2.33-1.18l-.63 2.4c-.23.89-.86 2.01-1.28 2.69A10 10 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>',
      tumblr:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.95 21.3c-3.1.5-5.48-.3-6.08-2.1-.2 1.1-.55 2.15-1.05 3.1-.9 1.7-2.05 3.35-3.5 4.95-.15.15-.35.2-.55.1-.2-.05-.3-.25-.25-.45.35-1.5.75-3.05 1.2-4.65-2.5-1.35-3.85-3.6-4.05-6.75-.05-.85-.05-1.7 0-2.55.15-2.65 1.35-4.7 3.6-6.15 1.9-1.25 4.05-1.75 6.45-1.5.05 1.35-.05 2.65-.3 3.9-.25 1.15-.7 2.2-1.35 3.15-.65.95-1.45 1.7-2.4 2.25-.3.2-.65.35-1 .45 0 .85.25 1.55.75 2.1.5.55 1.2.85 2.1.9 1.35.1 2.55-.25 3.6-1.05.35-.25.7-.55 1.05-.85.4-.35.85-.6 1.35-.75.25-.05.5 0 .7.15.2.15.25.4.15.65-.45 1.05-1.05 2-1.8 2.85z"/></svg>',
      reddit:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
      vk:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.08 14.27h-1.46c-.55 0-.72-.44-1.71-1.42-.86-.82-1.24-.93-1.46-.93-.3 0-.39.09-.39.5v1.3c0 .36-.12.58-1.08.58-1.59 0-3.35-.96-4.59-2.75-1.87-2.64-2.38-4.63-2.38-5.05 0-.22.09-.42.5-.42h1.46c.37 0 .51.17.65.57.72 2.09 1.93 3.92 2.43 3.92.19 0 .27-.09.27-.57V9.6c-.06-.99-.58-1.07-.58-1.45 0-.17.14-.34.37-.34h2.3c.31 0 .42.17.42.53v2.84c0 .31.14.42.23.42.19 0 .34-.12.68-.46 1.05-1.17 1.8-2.98 1.8-2.98.1-.22.27-.42.64-.42h1.46c.44 0 .53.23.44.53-.18.84-1.93 3.31-1.93 3.31-.15.25-.21.36 0 .65.15.21.66.64 1 1.03.64.72 1.13 1.33 1.26 1.75.14.42-.09.64-.52.64z"/></svg>',
      xing:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 4.5h3.2l4.1 7.1-2.6 4.5H5.8l2.6-4.5L4.5 4.5zm14.3 0h-3.2l-6.4 11.1 2.6 4.5h3.2l-2.6-4.5 6.4-11.1z"/></svg>'
    };
    return icons[name] || '';
  }

  function publicContactLinks(social, email) {
    const s = social || {};
    const links = [];
    [
      { key: 'facebook', label: 'Facebook' },
      { key: 'instagram', label: 'Instagram' },
      { key: 'tiktok', label: 'TikTok' }
    ].forEach(({ key, label }) => {
      const href = (s[key] || '').trim();
      if (href && href !== '#') links.push({ href, label, icon: key, external: true });
    });
    const mail = (email || '').trim();
    if (mail) links.push({ href: `mailto:${mail}`, label: 'Email', icon: 'mail', external: false });
    return links;
  }

  function getSharePageMeta() {
    const titleKey = document.body?.getAttribute('data-i18n-title');
    const title = titleKey ? I18n.t(titleKey) : document.title;
    return { title, url: window.location.href };
  }

  function buildShareUrl(network) {
    const { title, url } = getSharePageMeta();
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?posttype=link&canonicalUrl=${u}&title=${t}`,
      xing: `https://www.xing.com/spi/shares/new?url=${u}`,
      reddit: `https://reddit.com/submit?url=${u}&title=${t}`,
      vk: `https://vk.com/share.php?url=${u}&title=${t}`,
      email: `mailto:?subject=${t}&body=${u}`
    };
    return urls[network] || url;
  }

  function openSharePopup(url) {
    const w = 626;
    const h = 500;
    const left = Math.max(0, Math.round((window.screen.width - w) / 2));
    const top = Math.max(0, Math.round((window.screen.height - h) / 2));
    const popup = window.open(
      url,
      'hss_share',
      `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no`
    );
    if (popup) popup.focus();
  }

  function runShareAction(network) {
    if (network === 'print') {
      window.print();
      return;
    }
    if (network === 'email') {
      window.location.href = buildShareUrl('email');
      return;
    }
    openSharePopup(buildShareUrl(network));
  }

  function shareModalNetworks() {
    return [
      { id: 'facebook', labelKey: 'share.facebook', cls: 'fb' },
      { id: 'linkedin', labelKey: 'share.linkedin', cls: 'in' },
      { id: 'email', labelKey: 'share.email', cls: 'mail' }
    ];
  }

  function ensureShareModal() {
    let modal = document.getElementById('hss-share-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'hss-share-modal';
    modal.className = 'hss-share-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="hss-share-modal__backdrop" data-share-close></div>
      <div class="hss-share-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="hss-share-modal-title">
        <button type="button" class="hss-share-modal__close" data-share-close aria-label="Close">×</button>
        <h2 id="hss-share-modal-title" data-i18n="share.modalTitle"></h2>
        <p class="hss-share-modal__meta"><span id="hss-share-modal-page-title"></span> | <span id="hss-share-modal-page-url"></span></p>
        <div class="hss-share-modal__grid" id="hss-share-modal-grid"></div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-share-close]').forEach((el) => {
      el.addEventListener('click', closeShareModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeShareModal();
    });

    return modal;
  }

  function renderShareModal() {
    const modal = ensureShareModal();
    const { title, url } = getSharePageMeta();
    const titleEl = modal.querySelector('#hss-share-modal-title');
    if (titleEl) titleEl.textContent = I18n.t('share.modalTitle');
    const pageTitle = modal.querySelector('#hss-share-modal-page-title');
    const pageUrl = modal.querySelector('#hss-share-modal-page-url');
    if (pageTitle) pageTitle.textContent = title;
    if (pageUrl) pageUrl.textContent = url;

    const grid = modal.querySelector('#hss-share-modal-grid');
    if (!grid) return;
    grid.innerHTML = shareModalNetworks()
      .map(
        (n) => `
      <button type="button" class="hss-share-item hss-share-item--${n.cls}" data-share-network="${n.id}">
        <span class="hss-share-item__icon">${socialIconSvg(n.id === 'twitter' ? 'twitter' : n.id)}</span>
        <span class="hss-share-item__label">${I18n.t(n.labelKey)}</span>
      </button>`
      )
      .join('');

    grid.querySelectorAll('[data-share-network]').forEach((btn) => {
      btn.addEventListener('click', () => {
        runShareAction(btn.dataset.shareNetwork);
        if (btn.dataset.shareNetwork !== 'print') closeShareModal();
      });
    });
  }

  function openShareModal() {
    renderShareModal();
    const modal = document.getElementById('hss-share-modal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('hss-share-open');
    modal.querySelector('.hss-share-modal__close')?.focus();
  }

  function closeShareModal() {
    const modal = document.getElementById('hss-share-modal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('hss-share-open');
  }

  function bindShareBar(bar) {
    if (!bar) return;
    delete bar.dataset.shareBound;
    bar.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const net = btn.dataset.share;
        if (net === 'more') openShareModal();
        else runShareAction(net);
      });
    });
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mapEmbedUrl(h) {
    if (typeof ClinicMap !== 'undefined' && ClinicMap.mapEmbedUrl) {
      return ClinicMap.mapEmbedUrl(h);
    }
    if (!h) h = {};
    const lat = Number(h.mapLat ?? h.latitude ?? 40.2074194);
    const lng = Number(h.mapLng ?? h.longitude ?? 44.4782661);
    const params = new URLSearchParams({ ll: `${lat},${lng}`, z: '17', hl: 'ru', output: 'embed' });
    return `https://maps.google.com/maps?${params.toString()}`;
  }

  function mapDirectionsUrl(h) {
    if (!h) h = {};
    if (h.mapsDirections) return h.mapsDirections;
    const lat = h.mapLat ?? h.latitude;
    const lng = h.mapLng ?? h.longitude;
    if (lat != null && lng != null && String(lat) !== '' && String(lng) !== '') {
      return `https://yandex.ru/navi/?rtext=~${lat},${lng}`;
    }
    const q = h.mapsQuery || h.address || brandName() + ', Yerevan, Armenia';
    return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(q)}&rtt=auto`;
  }

  function renderHospitalMap(container, h) {
    if (!container) return;
    const hospital = h || getData()?.hospital || {};
    const address = hospital.address || '';
    const directionsLabel =
      typeof I18n !== 'undefined' ? I18n.t('footer.mapDirections') : 'Open in Google Maps';
    const directions = mapDirectionsUrl(hospital);

    if (typeof ClinicMap !== 'undefined') {
      ClinicMap.render(container, hospital, { footer: container.id === 'footer-map' });
    } else {
      const title = typeof I18n !== 'undefined' ? I18n.t('footer.mapTitle') : 'Our location';
      const embed = mapEmbedUrl(hospital);
      const isFooter = container.id === 'footer-map';
      container.className = container.classList.contains('hss-map')
        ? `${container.className} hss-map--embed${isFooter ? ' hss-map--footer' : ''}`.trim()
        : `hss-map hss-map--embed${isFooter ? ' hss-map--footer' : ''}`;
      container.innerHTML = `
      <div class="hss-map__wrap">
        <iframe
          class="hss-map__iframe"
          title="${escHtml(title)}"
          src="${embed}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
      </div>`;
    }

    const addrEl = document.getElementById('footer-map-address');
    if (addrEl) addrEl.textContent = address;

    const dirEl = document.getElementById('footer-map-directions');
    if (dirEl) {
      dirEl.href = directions;
      dirEl.setAttribute('aria-label', directionsLabel);
    }

    const contactsAddr = document.getElementById('contact-map-address');
    if (contactsAddr) contactsAddr.textContent = address;
    const contactsDir = document.getElementById('contact-map-directions');
    if (contactsDir) contactsDir.href = directions;
  }

  function renderFooter() {
    const mount = document.getElementById('site-footer');
    if (!mount) return;
    const prefix = pathPrefix();
    const h = getData()?.hospital || {};
    const social = h.social || {};
    const year = new Date().getFullYear();
    const name = brandName();
    const t = (k, params) => I18n.t(k, params);

    const socialRow = publicContactLinks(social, h.email)
      .map((link) => {
        const ext = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${link.href}" class="hss-footer__social"${ext} aria-label="${link.label}">${socialIconSvg(link.icon)}</a>`;
      })
      .join('');

    const site = getData()?.site || {};
    const devName = 'DEWEBAM.COM';
    const devUrl = (site.developerUrl || '').trim() || 'https://dewebam.com';
    const developerHtml = devUrl
      ? `<p class="hss-footer__developer"><span data-i18n="footer.developedBy">${t('footer.developedBy')}</span> <a href="${devUrl}" target="_blank" rel="noopener noreferrer">${devName}</a></p>`
      : '';

    mount.innerHTML = `
      <footer class="site-footer hss-footer">
        <div class="hss-footer__cta">
          <div class="hss-wrap">
            <a href="${routeHref('/contact')}" class="hss-footer__cta-link" data-footer-brand="ctaLink">${t('footer.ctaLink', { name })}</a>
          </div>
        </div>
        <section class="hss-footer-map" aria-labelledby="footer-map-title">
          <div class="hss-footer-map__bar">
            <div class="hss-wrap hss-footer-map__bar-inner">
              <div class="hss-footer-map__info">
                <h2 id="footer-map-title" data-i18n="footer.mapTitle">${t('footer.mapTitle')}</h2>
                <p class="hss-footer-map__address" id="footer-map-address">${h.address || ''}</p>
              </div>
              <a
                href="${mapDirectionsUrl(h)}"
                class="hss-btn hss-btn--outline hss-footer-map__directions"
                id="footer-map-directions"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="footer.mapDirections"
              >${t('footer.mapDirections')}</a>
            </div>
          </div>
          <div class="hss-footer-map__frame" id="footer-map" role="region" aria-label="${t('footer.mapTitle')}"></div>
        </section>
        <div class="hss-footer__body">
          <div class="hss-wrap hss-footer__grid">
            <div class="hss-footer__brand">
              <a href="${routeHref('/')}" class="hss-footer__logo" aria-label="${name}">
                ${logoMarkup(prefix, 'footer')}
              </a>
              <div class="hss-footer__socials">${socialRow}</div>
            </div>
            <div class="hss-footer__col">
              <h4 data-i18n="footer.learnTitle">${t('footer.learnTitle')}</h4>
              <a href="${routeHref('/about')}" data-footer-brand="aboutOrg">${t('nav.aboutOrg')}</a>
              <a href="${routeHref('/contact')}" data-footer-brand="linkSupport">${t('footer.linkSupport', { name })}</a>
            </div>
            <div class="hss-footer__col">
              <h4 data-i18n="footer.infoTitle">${t('footer.infoTitle')}</h4>
              <a href="${routeHref('/services')}" data-i18n="nav.services">${t('nav.services')}</a>
              <a href="${routeHref('/conditions')}" data-i18n="nav.conditions">${t('nav.conditions')}</a>
              <a href="${routeHref('/knowledge')}" data-i18n="nav.knowledge">${t('nav.knowledge')}</a>
              <a href="${routeHref('/contact')}" data-i18n="footer.infoPatients">${t('footer.infoPatients')}</a>
              <a href="${routeHref('/find-a-doctor')}" data-i18n="footer.infoDoctors">${t('footer.infoDoctors')}</a>
              <a href="${routeHref('/locations')}" data-i18n="footer.infoHours">${t('footer.infoHours')}</a>
              <a href="${routeHref('/contact')}" data-i18n="footer.infoBook">${t('footer.infoBook')}</a>
            </div>
            <div class="hss-footer__col">
              <h4 data-i18n="footer.policiesTitle">${t('footer.policiesTitle')}</h4>
              <a href="${routeHref('/privacy-policy')}" data-i18n="footer.policyPrivacy">${t('footer.policyPrivacy')}</a>
              <a href="${routeHref('/cookies-policy')}" data-i18n="footer.policyCookies">${t('footer.policyCookies')}</a>
              <a href="${routeHref('/terms')}" data-i18n="footer.policyTerms">${t('footer.policyTerms')}</a>
              <a href="${routeHref('/patient-information')}" data-i18n="footer.policyPatient">${t('footer.policyPatient')}</a>
            </div>
          </div>
        </div>
        <div class="hss-footer__legal">
          <div class="hss-wrap hss-footer__legal-inner">
            <div class="hss-footer__legal-copy">
              <p id="footer-copy">${t('footer.copyright', { year, name })}</p>
              <p><span data-i18n="footer.legalAddress">${t('footer.legalAddress')}</span>: <span id="footer-address">${h.address || ''}</span></p>
              <p data-i18n="footer.legalDisclaimer">${t('footer.legalDisclaimer')}</p>
            </div>
            ${developerHtml}
          </div>
        </div>
      </footer>`;

    renderHospitalMap(document.getElementById('footer-map'), h);
  }

  function syncHeaderOffset() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--hss-header-h', `${h}px`);
  }

  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    syncHeaderOffset();
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncHeaderOffset, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncHeaderOffset, { passive: true });
      window.visualViewport.addEventListener('scroll', syncHeaderOffset, { passive: true });
    }
    onScroll();
  }

  function initMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    if (!mobileMenu || !navLinks) return;

    mobileMenu.replaceWith(mobileMenu.cloneNode(true));
    const menu = document.querySelector('.mobile-menu');
    const links = document.querySelector('.nav-links');

    const setOpen = (open) => {
      links.classList.toggle('active', open);
      navActions?.classList.toggle('active', open);
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const close = () => setOpen(false);

    menu.addEventListener('click', () => {
      setOpen(!links.classList.contains('active'));
    });

    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    navActions?.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', close));
  }

  async function loadData() {
    const baseUrl = typeof I18n.getAssetBase === 'function' ? I18n.getAssetBase() : '';
    const prefix = pathPrefix();
    let base = null;

    try {
      const dataUrl = baseUrl
        ? `${baseUrl.replace(/\/?$/, '/')}data/hospital.json`
        : rootAsset('data/hospital.json');
      const res = await fetch(dataUrl);
      if (res.ok) base = await res.json();
    } catch {
      /* offline / file:// */
    }

    if (!base && window.__HOSPITAL_BASE__) {
      base = window.__HOSPITAL_BASE__;
    }

    if (!base) throw new Error('hospital data not found');
    const loc = I18n.getContent();

    let hospital = {
      ...base.hospital,
      ...(loc.hospital || {}),
      heroTagline: loc.hospital?.heroTagline || base.hospital.heroTagline || base.hospital.tagline,
      social: { ...base.hospital?.social, ...(loc.hospital?.social || {}) }
    };

    let data = {
      hospital,
      advantages: loc.advantages || base.advantages,
      serviceCategories: mergeById(base.serviceCategories || [], loc.serviceCategories),
      trustPoints: loc.trustPoints || base.trustPoints || [],
      conditions: loc.conditions || base.conditions || [],
      introParagraphs: loc.introParagraphs || base.introParagraphs || [],
      feature: { ...base.feature, ...(loc.feature || {}) },
      approachParagraphs: loc.approachParagraphs || base.approachParagraphs || [],
      expertsParagraphs: loc.expertsParagraphs || base.expertsParagraphs || [],
      imagingParagraphs: loc.imagingParagraphs || base.imagingParagraphs || [],
      news: mergeById(base.news || [], loc.news),
      storyVideos: mergeById(base.storyVideos || [], loc.storyVideos),
      patientStories: mergeById(base.patientStories || [], loc.patientStories),
      patientHero: { ...base.patientHero, ...(loc.patientHero || {}) },
      backInGame: { ...base.backInGame, ...(loc.backInGame || {}) },
      expertiseOverlay: { ...base.expertiseOverlay, ...(loc.expertiseOverlay || {}) },
      awards: loc.awards || base.awards || [],
      equipment: mergeById(base.equipment || [], loc.equipment),
      programs: mergeById(base.programs || [], loc.programs),
      reviews: mergeById(base.reviews || [], loc.reviews),
      departments: mergeById(base.departments, loc.departments),
      doctors: mergeById(base.doctors, loc.doctors),
      moveBetter: mergeMoveBetter(base.moveBetter, loc.moveBetter),
      timeSlots: base.timeSlots
    };

    const override = HospitalStorage.getContentOverride();
    const cmsWillLoad = typeof CmsContent !== 'undefined';
    if (override && !cmsWillLoad) {
      data = {
        ...data,
        ...override,
        hospital: { ...data.hospital, ...(override.hospital || {}) },
        serviceCategories: override.serviceCategories || data.serviceCategories,
        trustPoints: override.trustPoints || data.trustPoints,
        conditions: override.conditions || data.conditions,
        introParagraphs: override.introParagraphs || data.introParagraphs,
        feature: override.feature || data.feature,
        approachParagraphs: override.approachParagraphs || data.approachParagraphs,
        expertsParagraphs: override.expertsParagraphs || data.expertsParagraphs,
        imagingParagraphs: override.imagingParagraphs || data.imagingParagraphs,
        news: override.news || data.news,
        storyVideos: override.storyVideos || data.storyVideos,
        patientStories: override.patientStories || data.patientStories,
        equipment: override.equipment || data.equipment,
        programs: override.programs || data.programs,
        reviews: override.reviews || data.reviews,
        departments: override.departments || data.departments,
        doctors: override.doctors || data.doctors,
        advantages: override.advantages || data.advantages
      };
    }

    if (typeof CmsContent !== 'undefined') {
      const cms = await CmsContent.fetchContent(I18n.getLang());
      if (cms) {
        data = CmsContent.mergeIntoHospital(data, cms);
      }
    }

    data = overlayLocaleFields(data, loc);

    baseData = data;
    return baseData;
  }

  function getData() {
    return baseData;
  }

  function applyBranding() {
    const data = getData();
    if (!data?.hospital) return;
    const locH = typeof I18n !== 'undefined' ? I18n.getContent()?.hospital || {} : {};
    const h = { ...data.hospital };
    const TEXT = ['name', 'shortName', 'tagline', 'heroTagline', 'address', 'hours', 'about', 'mission'];
    TEXT.forEach((k) => {
      if (locH[k]) h[k] = locH[k];
    });

    document.querySelectorAll('.logo-img--mark').forEach((img) => {
      img.alt = '';
      if (img.id === 'header-logo' || img.closest('.logo-brand--header')) {
        img.src = logoMarkPath();
      } else if (img.closest('.logo-brand--footer')) {
        img.src = logoPath();
      }
    });

    const displayName = h.shortName || h.name || brandName();
    document.querySelectorAll('.logo-brand--footer .logo-brand__name').forEach((el) => {
      el.textContent = displayName;
    });

    document.querySelectorAll('.logo.logo--brand').forEach((el) => {
      el.setAttribute('aria-label', displayName);
    });

    const footer = document.getElementById('footer-copy');
    if (footer) {
      footer.textContent = I18n.t('footer.copyright', {
        year: new Date().getFullYear(),
        name: displayName
      });
    }

    document.querySelectorAll('[data-footer-brand]').forEach((el) => {
      const key = el.getAttribute('data-footer-brand');
      if (key === 'ctaLink') el.textContent = I18n.t('footer.ctaLink', { name: displayName });
      else if (key === 'linkSupport') el.textContent = I18n.t('footer.linkSupport', { name: displayName });
      else if (key === 'aboutOrg') el.textContent = I18n.t('nav.aboutOrg');
    });

    const tagline = document.getElementById('footer-tagline');
    if (tagline && !tagline.hasAttribute('data-i18n')) {
      tagline.textContent = h.tagline || I18n.t('footer.tagline') || h.about?.slice(0, 100);
    }

    const setHref = (id, href, text) => {
      const el = document.getElementById(id);
      if (el) {
        el.href = href;
        if (text) el.textContent = text;
      }
    };

    setHref('header-email', `mailto:${h.email}`, h.email);
    setHref('footer-email', `mailto:${h.email}`, h.email);
    updatePhoneLinks(h);

    const addr = document.getElementById('footer-address');
    if (addr) addr.textContent = h.address;

    renderHospitalMap(document.getElementById('footer-map'), h);
    const contactMap = document.getElementById('map-placeholder');
    if (contactMap && typeof ContactMap !== 'undefined') {
      ContactMap.render(contactMap, h);
    } else if (contactMap) {
      renderHospitalMap(contactMap, h);
    }

    const titleKey = document.body.getAttribute('data-i18n-title');
    if (titleKey) document.title = I18n.t(titleKey);

    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = logoPath();
    favicon.type = 'image/png';
  }

  function initAnimations() {
    if (!animObserver) {
      animObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('animate');
                if (entry.target.classList.contains('counter')) {
                  animateCounter(entry.target);
                }
              }, index * 60);
              animObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
    }

    const selectors =
      '.fade-in, .reveal, .team-member, .dept-card, .service-card, .advantage-card, .testimonial, .counter, .section-header';
    document.querySelectorAll(selectors).forEach((el) => {
      if (!el.dataset.animObserved) {
        el.dataset.animObserved = '1';
        animObserver.observe(el);
      }
    });
  }

  function resetAnimations() {
    document.querySelectorAll('[data-anim-observed]').forEach((el) => {
      delete el.dataset.animObserved;
      el.classList.remove('animate');
    });
  }

  function animateCounter(element) {
    if (element.classList.contains('animated')) return;
    element.classList.add('animated');
    const target = parseInt(element.getAttribute('data-count'), 10);
    const suffix = element.getAttribute('data-suffix') || '';
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        element.textContent = target + suffix;
        clearInterval(timer);
      } else {
        element.textContent = current + suffix;
      }
    }, 25);
  }

  function departmentName(id) {
    const dept = getData()?.departments?.find((d) => d.id === id);
    return dept ? dept.name : id;
  }

  function utilityBarHtml(social, email) {
    return publicContactLinks(social, email)
      .map((link) => {
        const cls =
          link.icon === 'facebook'
            ? 'hss-utilities__btn--fb'
            : link.icon === 'instagram'
              ? 'hss-utilities__btn--ig'
              : link.icon === 'tiktok'
                ? 'hss-utilities__btn--tt'
                : 'hss-utilities__btn--mail';
        const ext = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        const bg =
          link.icon === 'tiktok'
            ? ' style="background-color:#000"'
            : '';
        return `<a href="${link.href}" class="hss-utilities__btn ${cls}"${bg}${ext} aria-label="${link.label}">${socialIconSvg(link.icon)}</a>`;
      })
      .join('');
  }

  function initPageUtilities() {
    if (!document.body.classList.contains('hss-page')) return;

    const social = getData()?.hospital?.social || {};
    const email = getData()?.hospital?.email || '';
    let bar = document.getElementById('hss-utilities');
    if (!bar) {
      bar = document.createElement('aside');
      bar.id = 'hss-utilities';
      bar.className = 'hss-utilities';
      bar.setAttribute('aria-label', I18n.t('share.barAria'));
      document.body.appendChild(bar);
    }
    bar.innerHTML = utilityBarHtml(social, email);

    let topBtn = document.getElementById('hss-back-top');
    if (!topBtn) {
      topBtn = document.createElement('button');
      topBtn.id = 'hss-back-top';
      topBtn.className = 'hss-back-top';
      topBtn.type = 'button';
      topBtn.setAttribute('aria-label', 'Back to top');
      topBtn.innerHTML = '↑';
      topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      document.body.appendChild(topBtn);
    }

    const onScroll = () => topBtn.classList.toggle('is-visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function loadScriptOnce(src) {
    const name = src.split('/').pop().split('?')[0];
    if (document.querySelector(`script[src*="${name}"]`)) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
    });
  }

  async function initCompliance() {
    if (document.body.classList.contains('admin-body')) return;
    const prefix = pathPrefix();
    if (!document.querySelector('link[href*="legal.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${rootAsset('css/legal.css')}?v=20260619`;
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="seo.js"]')) {
      await loadScriptOnce(`${rootAsset('js/seo.js')}?v=20260711`);
    }
    if (!document.querySelector('script[src*="cookie-consent"]')) {
      await loadScriptOnce(`${rootAsset('js/legal-page.js')}`);
      await loadScriptOnce(`${rootAsset('js/cookie-consent.js')}`);
    }
    injectFormConsentText();
  }

  async function injectFormConsentText() {
    const el = document.getElementById('form-privacy-consent-text');
    if (!el) return;
    const prefix = pathPrefix();
    try {
      const res = await fetch(rootAsset('lang/legal.json'));
      if (res.ok) {
        const data = await res.json();
        const bundle = data[I18n.getLang()] || data.en || {};
        if (bundle.formConsent) {
          el.innerHTML = bundle.formConsent.replace(/href="([^"]+)"/g, (_, href) => `href="${routeHref(href)}"`);
          return;
        }
      }
    } catch {
      /* fallback */
    }
    el.innerHTML = `I agree to the <a href="${routeHref('/privacy-policy')}">Privacy Policy</a>.`;
  }

  async function refreshLanguage() {
    animObserver = null;
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    await loadData();
    renderNav();
    renderFooter();
    applyBranding();
    initPageUtilities();
    injectFormConsentText();
    I18n.applyDOM();
    const data = getData();
    const page = document.body.dataset.page || 'home';
    const pageKeyMap = {
      home: 'home',
      doctors: 'doctors',
      contacts: 'contacts',
      departments: 'departments',
      about: 'about'
    };
    applyPageFields(data.pageFields?.[pageKeyMap[page] || page]);
    applyCmsVisuals(data);
    document.querySelectorAll('[data-anim-observed]').forEach((el) => {
      delete el.dataset.animObserved;
    });
    initAnimations();
    window.dispatchEvent(new Event('hospital:refresh'));
    if (document.getElementById('hss-share-modal') && !document.getElementById('hss-share-modal').hidden) {
      renderShareModal();
    }
  }

  function resolveCmsStyleKey(key) {
    if (key.includes('#')) {
      return document.getElementById(key.split('#').pop());
    }
    const [page, tag, idxStr] = key.split('|');
    const pageName = location.pathname.split('/').pop() || 'index.html';
    if (page !== pageName) return null;
    const list = document.getElementsByTagName(tag);
    return list[parseInt(idxStr, 10)] || null;
  }

  function applyPageFields(fields) {
    if (!fields || typeof fields !== 'object') return;
    fields = mirrorBannerFieldChanges(fields);
    const banner = resolveHomeBannerMedia(fields);
    if (banner.url) {
      applyHomeHeroMedia(banner.url, banner.type);
      const lower = document.getElementById('patient-hero');
      if (lower) lower.hidden = true;
    }
    const BANNER_KEYS = new Set(['home-hero-image', 'patient-hero-image']);
    const MEDIA_FIELDS = {
      'home-hero-image': applyHomeHeroMedia,
      'patient-hero-image': (url, type) => {
        applyHomeHeroMedia(url, type);
        const lower = document.getElementById('patient-hero');
        if (lower) lower.hidden = !!(url || '').trim();
      },
      'home-feature-image': applyFeatureMedia,
      'back-in-game-image': (url, type) =>
        applyBlockMedia({
          containerSelector: '#brand-story .hss-split__media',
          elementId: 'back-in-game-image',
          url,
          type
        }),
      'home-approach-image': (url, type) =>
        applyBlockMedia({
          containerSelector: '#approach .hss-split__media',
          elementId: 'home-approach-image',
          url,
          type,
          defaultImage: rootAsset('images/about-image-01.jpg')
        }),
      'home-experts-image': (url, type) =>
        applyBlockMedia({
          containerSelector: '#experts .hss-split__media',
          elementId: 'home-experts-image',
          url,
          type,
          defaultImage: rootAsset('images/team-member-01.jpg')
        }),
      'home-imaging-image': (url, type) =>
        applyBlockMedia({
          containerSelector: '#imaging .hss-split__media',
          elementId: 'home-imaging-image',
          url,
          type,
          defaultImage: rootAsset('images/team-member-02.jpg')
        }),
      'expertise-image': (url, type) =>
        applyBlockMedia({
          containerSelector: '#expertise',
          elementId: 'expertise-image',
          url,
          type,
          className: 'hss-expertise__bg'
        })
    };
    Object.entries(fields).forEach(([key, val]) => {
      if (key.endsWith('__type') || val == null || val === '') return;
      if (BANNER_KEYS.has(key)) return;
      if (key.startsWith('i18n_')) {
        const i18nKey = key.slice(5);
        document.querySelectorAll(`[data-i18n="${i18nKey}"]`).forEach((el) => {
          const attr = el.getAttribute('data-i18n-attr');
          if (attr) el.setAttribute(attr, val);
          else el.textContent = val;
        });
        return;
      }
      if (MEDIA_FIELDS[key]) {
        const mediaType = fields[`${key}__type`] || inferMediaType(val);
        MEDIA_FIELDS[key](val, mediaType);
        return;
      }
      const el = document.getElementById(key);
      if (!el) return;
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {
        el.src = normalizeAssetUrl(val);
        return;
      }
      if (el.id === 'hero-subtitle') {
        el.innerHTML = `<strong>${val}</strong>`;
        return;
      }
      if (el.classList.contains('hss-prose') || el.id === 'back-in-game-text') {
        el.innerHTML = String(val).split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('');
        return;
      }
      if (el.hasAttribute('data-i18n')) return;
      el.textContent = val;
    });
  }

  function applyCmsVisuals(cms) {
    if (!cms) return;
    Object.entries(cms.pageImages || {}).forEach(([key, url]) => {
      if (!url) return;
      const el = resolveCmsStyleKey(key);
      if (el?.tagName === 'IMG') el.src = normalizeAssetUrl(url);
    });
    const lang = I18n.getLang();
    Object.entries(cms.inlineText || {}).forEach(([key, texts]) => {
      const text = texts?.[lang];
      if (!text) return;
      const el = resolveCmsStyleKey(key);
      if (el && !el.hasAttribute('data-i18n')) el.textContent = text;
    });
    Object.entries(cms.elementStyles || {}).forEach(([key, style]) => {
      const el = resolveCmsStyleKey(key);
      if (!el || !style) return;
      if (style.width) el.style.width = style.width;
      if (style.height) el.style.height = style.height;
      if (style.fontSize) el.style.fontSize = style.fontSize;
    });
  }

  async function reloadFromCms() {
    if (typeof CmsContent !== 'undefined') CmsContent.invalidate();
    await loadData();
    I18n.applyDOM();
    const data = getData();
    const page = document.body.dataset.page || 'home';
    const pageKeyMap = {
      home: 'home',
      doctors: 'doctors',
      contacts: 'contacts',
      departments: 'departments',
      about: 'about'
    };
    const pk = pageKeyMap[page] || page;
    applyPageFields(data.pageFields?.[pk]);
    applyCmsVisuals(data);
    initPageUtilities();
    window.dispatchEvent(new Event('hospital:refresh'));
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      try {
        await I18n.init();
      } catch {
        /* nav всё равно рисуем с fallback-языками */
      }

      renderNav();
      renderFooter();

      checkPreviewMode();

      try {
        await loadData();
        applyBranding();
        renderNav();
        renderFooter();
      } catch (err) {
        console.error('[HospitalApp] loadData failed:', err);
      }

      I18n.applyDOM();
      initAnimations();
      initPageUtilities();
      initCompliance();

      if (!i18nHooked) {
        i18nHooked = true;
        I18n.onChange(() => refreshLanguage());
      }

      if (typeof CmsContent !== 'undefined' && CmsContent.startVersionWatch) {
        CmsContent.startVersionWatch(30000);
      }

      document.documentElement.classList.remove('i18n-pending');
      document.documentElement.classList.add('i18n-ready');

      return getData();
    })();
    return initPromise;
  }

  return {
    init,
    refreshLanguage,
    getData,
    departmentName,
    pathPrefix,
    rootAsset,
    normalizeAssetUrl,
    routeHref,
    initAnimations,
    resetAnimations,
    applyCmsVisuals,
    applyPageFields,
    reloadFromCms,
    phoneTelUri,
    updatePhoneLinks,
    mapEmbedUrl,
    mapDirectionsUrl,
    renderHospitalMap,
    isVideoUrl,
    inferMediaType,
    applyPatientHeroMedia,
    applyHomeHeroMedia,
    applyFeatureMedia,
    applyBlockMedia,
    initVideoHeroPlayers,
    resolveHomeBannerMedia,
    mirrorBannerFieldChanges
  };
})();

/** Load visual CMS editor on public pages when ?cms-edit=1 */
(function loadCmsEditIfNeeded() {
  if (!/[?&]cms-edit=1/.test(location.search)) return;
  const base = (document.querySelector('script[src*="common.js"]')?.src || '').replace(/\/js\/common\.js.*$/, '/');
  const s = document.createElement('script');
  const build = new URLSearchParams(location.search).get('cms_build') || window.CMS_BUILD || '20260628';
  s.src = `${base}js/cms-edit-mode.js?v=${build}`;
  document.body.appendChild(s);
})();

/** Резервная инициализация, если страница не вызвала HospitalApp.init() */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-nav') && !document.getElementById('site-header')) {
    HospitalApp.init();
  }
});
