// Общая логика сайта больницы (навигация, данные, анимации, i18n)

const HospitalApp = (function () {
  const NAV_ITEMS = [
    { href: 'doctors.html', key: 'nav.doctors', id: 'doctors' },
    { href: 'contacts.html', key: 'nav.locations', id: 'contacts' },
    { href: 'departments.html', key: 'nav.patientCare', id: 'departments' },
    { href: 'about.html', key: 'nav.about', id: 'about' }
  ];

  let baseData = null;
  let initPromise = null;
  let animObserver = null;
  let i18nHooked = false;

  function pathPrefix() {
    return window.location.pathname.includes('/admin/') ? '../' : '';
  }

  function logoPath() {
    return `${pathPrefix()}images/brand/logo-chic.png`;
  }

  function showPreviewNotice(message) {
    if (document.getElementById('preview-notice')) return;
    const bar = document.createElement('div');
    bar.id = 'preview-notice';
    bar.className = 'preview-notice';
    bar.innerHTML = message;
    document.body.prepend(bar);
  }

  function checkPreviewMode() {
    if (window.location.protocol !== 'file:') return;
    showPreviewNotice(
      '<strong>Не открывайте файл напрямую!</strong> Запустите <code>СМОТРЕТЬ.bat</code> → ' +
        '<a href="http://127.0.0.1:8765/index.html">http://127.0.0.1:8765/index.html</a> ' +
        '· В браузере нажмите <strong>Ctrl+F5</strong>'
    );
  }

  function logoAlt() {
    return 'CHIC';
  }

  function logoMarkPath() {
    return `${pathPrefix()}images/brand/logo-chic.png`;
  }

  function logoMarkup(prefix, variant) {
    const mark = logoMarkPath();
    if (variant === 'footer') {
      return `
        <span class="logo-brand logo-brand--footer">
          <img src="${mark}" alt="" class="logo-img logo-img--mark" width="48" height="48" loading="lazy" aria-hidden="true" />
          <span class="logo-brand__name">CHIC</span>
        </span>`;
    }
    return `
      <span class="logo-brand">
        <img src="${mark}" alt="" class="logo-img logo-img--mark" width="48" height="48" loading="eager" aria-hidden="true" />
        <span class="logo-brand__name">CHIC</span>
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
    return baseList.map((item) => {
      const tr = locList.find((x) => x.id === item.id);
      return tr ? { ...item, ...tr } : item;
    });
  }

  function renderNav() {
    const mount = document.getElementById('site-nav');
    if (!mount) return;

    const prefix = pathPrefix();
    const page = document.body.dataset.page || '';

    const h = getData()?.hospital || {};
    const tel = (h.phone || '').replace(/[^\d+]/g, '') || '+74951234567';

    const links = NAV_ITEMS.map((item) => {
      const cls = page === item.id ? 'active' : '';
      return `<li><a href="${prefix}${item.href}" class="${cls}" data-nav-id="${item.id}">${I18n.t(item.key)}</a></li>`;
    }).join('');

    mount.innerHTML = `
      <header class="header-wrap hss-header" id="site-header">
        <div class="header-top">
          <a href="${prefix}about.html" data-i18n="nav.whyUs">${I18n.t('nav.whyUs')}</a>
          <a href="${prefix}about.html" data-i18n="nav.aboutOrg">${I18n.t('nav.aboutOrg')}</a>
          <span class="header-top__sep" aria-hidden="true">|</span>
          <a href="mailto:${h.email || 'info@gkb1.ru'}" id="header-email">${h.email || 'info@gkb1.ru'}</a>
        </div>
        <nav class="navbar">
          <div class="nav-container">
            <a href="${prefix}index.html" class="logo logo--brand" aria-label="CHIC">
              ${logoMarkup(prefix, 'header')}
            </a>
            <ul class="nav-links nav-links--hss">${links}</ul>
            <div class="nav-actions">
              <button type="button" class="nav-search" aria-label="${I18n.t('nav.search')}" id="nav-search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <div class="lang-switcher" role="group" aria-label="${I18n.t('nav.langAria')}"></div>
              <a href="tel:${tel}" class="nav-phone" id="header-phone">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${h.phone || '+7 (495) 123-45-67'}</span>
              </a>
              <a href="${prefix}appointment.html" class="nav-cta hss-btn hss-btn--primary">${I18n.t('common.bookAppointment')}</a>
            </div>
            <div class="mobile-menu" aria-label="${I18n.t('nav.menuAria')}">
              <span></span><span></span><span></span>
            </div>
          </div>
        </nav>
      </header>`;

    I18n.renderSwitcher(mount.querySelector('.lang-switcher'));
    initMobileMenu();
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
      { id: 'twitter', labelKey: 'share.twitter', cls: 'tw' },
      { id: 'linkedin', labelKey: 'share.linkedin', cls: 'in' },
      { id: 'pinterest', labelKey: 'share.pinterest', cls: 'pi' },
      { id: 'tumblr', labelKey: 'share.tumblr', cls: 'tu' },
      { id: 'xing', labelKey: 'share.xing', cls: 'xi' },
      { id: 'reddit', labelKey: 'share.reddit', cls: 're' },
      { id: 'vk', labelKey: 'share.vk', cls: 'vk' },
      { id: 'print', labelKey: 'share.print', cls: 'print' },
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
    if (!bar || bar.dataset.shareBound) return;
    bar.dataset.shareBound = '1';
    bar.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const net = btn.dataset.share;
        if (net === 'more') openShareModal();
        else runShareAction(net);
      });
    });
  }

  function renderFooter() {
    const mount = document.getElementById('site-footer');
    if (!mount) return;
    const prefix = pathPrefix();
    const h = getData()?.hospital || {};
    const social = h.social || {};
    const year = new Date().getFullYear();
    const name = h.shortName || h.name || '—';
    const t = (k) => I18n.t(k);

    const socialRow = ['facebook', 'twitter', 'youtube', 'instagram', 'linkedin']
      .map(
        (net) =>
          `<a href="${social[net] || '#'}" class="hss-footer__social" target="_blank" rel="noopener noreferrer" aria-label="${net}">${socialIconSvg(net)}</a>`
      )
      .join('');

    mount.innerHTML = `
      <footer class="site-footer hss-footer">
        <div class="hss-footer__cta">
          <div class="hss-wrap">
            <a href="${prefix}appointment.html" class="hss-footer__cta-link" data-i18n="footer.ctaLink">${t('footer.ctaLink')}</a>
          </div>
        </div>
        <div class="hss-footer__body">
          <div class="hss-wrap hss-footer__grid">
            <div class="hss-footer__brand">
              <a href="${prefix}index.html" class="hss-footer__logo" aria-label="${name}">
                ${logoMarkup(prefix, 'footer')}
              </a>
              <div class="hss-footer__socials">${socialRow}</div>
              <nav class="hss-footer__brand-links" aria-label="Footer">
                <a href="${prefix}contacts.html" data-i18n="footer.linkContact">${t('footer.linkContact')}</a>
                <a href="${prefix}submit-story.html" data-i18n="footer.linkStory">${t('footer.linkStory')}</a>
                <a href="${prefix}move-better.html" data-i18n="footer.linkArticles">${t('footer.linkArticles')}</a>
                <a href="${prefix}contacts.html" data-i18n="footer.linkNewsletter">${t('footer.linkNewsletter')}</a>
                <a href="${prefix}about.html" data-i18n="footer.linkSupport">${t('footer.linkSupport')}</a>
              </nav>
            </div>
            <div class="hss-footer__col">
              <h4 data-i18n="footer.learnTitle">${t('footer.learnTitle')}</h4>
              <a href="${prefix}about.html" data-i18n="footer.learnAbout">${t('footer.learnAbout')}</a>
              <a href="${prefix}index.html#news" data-i18n="footer.learnNews">${t('footer.learnNews')}</a>
              <a href="${prefix}about.html" data-i18n="footer.learnChic">${t('footer.learnChic')}</a>
              <a href="${prefix}contacts.html" data-i18n="footer.learnContact">${t('footer.learnContact')}</a>
            </div>
            <div class="hss-footer__col">
              <h4 data-i18n="footer.infoTitle">${t('footer.infoTitle')}</h4>
              <a href="${prefix}appointment.html" data-i18n="footer.infoPatients">${t('footer.infoPatients')}</a>
              <a href="${prefix}doctors.html" data-i18n="footer.infoDoctors">${t('footer.infoDoctors')}</a>
              <a href="${prefix}departments.html" data-i18n="footer.infoServices">${t('footer.infoServices')}</a>
              <a href="${prefix}contacts.html" data-i18n="footer.infoHours">${t('footer.infoHours')}</a>
              <a href="${prefix}appointment.html" data-i18n="footer.infoBook">${t('footer.infoBook')}</a>
            </div>
            <div class="hss-footer__col">
              <h4 data-i18n="footer.policiesTitle">${t('footer.policiesTitle')}</h4>
              <a href="#" data-i18n="footer.policyPrivacy">${t('footer.policyPrivacy')}</a>
              <a href="#" data-i18n="footer.policyTerms">${t('footer.policyTerms')}</a>
              <a href="#" data-i18n="footer.policyPatient">${t('footer.policyPatient')}</a>
            </div>
          </div>
        </div>
        <div class="hss-footer__legal">
          <div class="hss-wrap">
            <p id="footer-copy">${t('footer.copyright', { year, name: h.name || name })}</p>
            <p><span data-i18n="footer.legalAddress">${t('footer.legalAddress')}</span>: <span id="footer-address">${h.address || ''}</span></p>
            <p data-i18n="footer.legalDisclaimer">${t('footer.legalDisclaimer')}</p>
          </div>
        </div>
      </footer>`;
  }

  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
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

    const toggle = () => {
      links.classList.toggle('active');
      navActions?.classList.toggle('active');
    };

    menu.addEventListener('click', () => {
      toggle();
      const spans = menu.querySelectorAll('span');
      spans.forEach((span, index) => {
        span.style.transform = links.classList.contains('active')
          ? index === 0
            ? 'rotate(45deg) translate(5px, 5px)'
            : index === 1
              ? 'opacity(0)'
              : 'rotate(-45deg) translate(7px, -6px)'
          : 'none';
      });
    });

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        links.classList.remove('active');
        navActions?.classList.remove('active');
      });
    });
  }

  async function loadData() {
    const baseUrl = typeof I18n.getAssetBase === 'function' ? I18n.getAssetBase() : '';
    const prefix = pathPrefix();
    let base = null;

    try {
      const res = await fetch(`${baseUrl || prefix}data/hospital.json`);
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
    if (override) {
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

    baseData = data;
    return baseData;
  }

  function getData() {
    return baseData;
  }

  function applyBranding() {
    const data = getData();
    if (!data?.hospital) return;
    const h = data.hospital;

    document.querySelectorAll('.logo-img--mark').forEach((img) => {
      img.alt = '';
    });

    document.querySelectorAll('.logo-brand__name').forEach((el) => {
      el.textContent = 'CHIC';
    });

    const footer = document.getElementById('footer-copy');
    if (footer) {
      footer.textContent = I18n.t('footer.copyright', {
        year: new Date().getFullYear(),
        name: h.name
      });
    }

    const tagline = document.getElementById('footer-tagline');
    if (tagline && !tagline.hasAttribute('data-i18n')) {
      tagline.textContent = h.tagline || h.about?.slice(0, 100);
    }

    const setHref = (id, href, text) => {
      const el = document.getElementById(id);
      if (el) {
        el.href = href;
        if (text) el.textContent = text;
      }
    };

    setHref('header-phone', `tel:${h.phone?.replace(/\s/g, '')}`, h.phone);
    setHref('footer-phone', `tel:${h.phone?.replace(/\s/g, '')}`, h.phone);
    setHref('header-email', `mailto:${h.email}`, h.email);
    setHref('footer-email', `mailto:${h.email}`, h.email);

    const addr = document.getElementById('footer-address');
    if (addr) addr.textContent = h.address;

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

  function initPageUtilities() {
    if (!document.body.classList.contains('hss-page')) return;

    let bar = document.getElementById('hss-utilities');
    if (!bar) {
      bar = document.createElement('aside');
      bar.id = 'hss-utilities';
      bar.className = 'hss-utilities';
      bar.setAttribute('aria-label', I18n.t('share.barAria'));
      bar.innerHTML = `
        <button type="button" class="hss-utilities__btn hss-utilities__btn--fb" data-share="facebook" aria-label="Facebook">${socialIconSvg('facebook')}</button>
        <button type="button" class="hss-utilities__btn hss-utilities__btn--tw" data-share="twitter" aria-label="X">${socialIconSvg('twitter')}</button>
        <button type="button" class="hss-utilities__btn hss-utilities__btn--in" data-share="linkedin" aria-label="LinkedIn">${socialIconSvg('linkedin')}</button>
        <button type="button" class="hss-utilities__btn hss-utilities__btn--print" data-share="print" aria-label="${I18n.t('share.print')}">${socialIconSvg('print')}</button>
        <button type="button" class="hss-utilities__btn hss-utilities__btn--mail" data-share="email" aria-label="${I18n.t('share.email')}">${socialIconSvg('mail')}</button>
        <button type="button" class="hss-utilities__btn hss-utilities__btn--more" data-share="more" aria-label="${I18n.t('share.more')}">⋯</button>`;
      document.body.appendChild(bar);
    }
    bindShareBar(bar);
    ensureShareModal();

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

  async function refreshLanguage() {
    animObserver = null;
    await loadData();
    renderNav();
    renderFooter();
    applyBranding();
    I18n.applyDOM();
    document.querySelectorAll('[data-anim-observed]').forEach((el) => {
      delete el.dataset.animObserved;
    });
    initAnimations();
    window.dispatchEvent(new Event('hospital:refresh'));
    if (document.getElementById('hss-share-modal') && !document.getElementById('hss-share-modal').hidden) {
      renderShareModal();
    }
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
      } catch (err) {
        showPreviewNotice(
          '<strong>Запустите файл <code>СМОТРЕТЬ.bat</code></strong> в папке проекта. ' +
            'Ссылка: <a href="http://127.0.0.1:8765/index.html">http://127.0.0.1:8765/index.html</a>'
        );
        console.error(err);
      }

      I18n.applyDOM();
      initAnimations();
      initPageUtilities();

      if (!i18nHooked) {
        i18nHooked = true;
        I18n.onChange(() => refreshLanguage());
      }

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
    initAnimations,
    resetAnimations
  };
})();

/** Резервная инициализация, если страница не вызвала HospitalApp.init() */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-nav') && !document.getElementById('site-header')) {
    HospitalApp.init();
  }
});
