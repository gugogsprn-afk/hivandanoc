/**
 * Visual page editor — live preview iframe for each public page.
 */
const PageEditor = (function () {
  const PAGES = [
    { id: 'home', labelKey: 'pageEditor.home', path: 'index.html', previewPath: '' },
    { id: 'doctors', labelKey: 'pageEditor.doctors', path: 'doctors.html', previewPath: 'find-a-doctor' },
    { id: 'services', labelKey: 'pageEditor.services', path: 'services.html', previewPath: 'services' },
    { id: 'patient-care', labelKey: 'pageEditor.patientCare', path: 'departments.html', previewPath: 'patient-care' },
    { id: 'locations', labelKey: 'pageEditor.locations', path: 'contacts.html', previewPath: 'locations' },
    { id: 'about', labelKey: 'pageEditor.about', path: 'about.html', previewPath: 'about' },
    { id: 'appointment', labelKey: 'pageEditor.appointment', path: 'appointment.html', previewPath: 'appointment' },
    { id: 'reviews', labelKey: 'pageEditor.reviews', path: 'reviews.html', previewPath: 'reviews' },
    { id: 'knowledge', labelKey: 'pageEditor.knowledge', path: 'knowledge.html', previewPath: 'knowledge' },
    { id: 'conditions', labelKey: 'pageEditor.conditions', path: 'conditions.html', previewPath: 'conditions' },
    { id: 'patient-information', labelKey: 'pageEditor.patientInfo', path: 'patient-information.html', previewPath: 'patient-information' },
    { id: 'consultation-process', labelKey: 'pageEditor.consultation', path: 'consultation-process.html', previewPath: 'consultation-process' }
  ];

  const t = (key) => (typeof AdminI18n !== 'undefined' ? AdminI18n.t(key) : key);

  let currentLang = localStorage.getItem('gkb_lang') || 'hy';
  let currentPage = PAGES[0];
  let iframe = null;
  let rootEl = null;
  let editorEl = null;
  let isFullscreen = false;

  const ICON_MAXIMIZE =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  const ICON_MINIMIZE =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>';

  function previewUrl(page = currentPage) {
    const base = AdminConfig.publicSite().replace(/\/$/, '');
    const build = window.CMS_BUILD || '20260702';
    // Use clean public paths — .html URLs 301-redirect and drop ?cms-edit=1
    const slug =
      page.previewPath != null && page.previewPath !== undefined
        ? page.previewPath
        : String(page.path || '').replace(/\.html$/, '');
    const pathPart = slug ? `/${slug}` : '/';
    return `${base}${pathPart}?cms-edit=1&lang=${currentLang}&cms_build=${build}&_=${Date.now()}`;
  }

  function resizePreviewFrame() {
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const contentHeight = Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        doc.documentElement?.offsetHeight || 0,
        720
      );
      if (isFullscreen) {
        const wrap = rootEl?.querySelector('.cms-visual-editor__frame-wrap');
        const wrapHeight = wrap?.clientHeight || window.innerHeight;
        iframe.style.height = `${Math.max(contentHeight, wrapHeight - 8)}px`;
        iframe.style.width = '100%';
      } else {
        iframe.style.height = `${contentHeight + 24}px`;
        iframe.style.width = '1440px';
      }
    } catch {
      /* cross-origin guard */
    }
  }

  function fullscreenBtnHTML() {
    return `<button type="button" class="cms-preview-fs-btn" id="preview-fullscreen-toggle" aria-pressed="false" title="${t('pageEditor.maximize')}" aria-label="${t('pageEditor.maximize')}">
      <span class="cms-preview-fs-btn__icon cms-preview-fs-btn__icon--max">${ICON_MAXIMIZE}</span>
      <span class="cms-preview-fs-btn__icon cms-preview-fs-btn__icon--min" hidden>${ICON_MINIMIZE}</span>
    </button>`;
  }

  function updateFullscreenButton() {
    const btn = document.getElementById('preview-fullscreen-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
    btn.title = isFullscreen ? t('pageEditor.minimize') : t('pageEditor.maximize');
    btn.setAttribute('aria-label', btn.title);
    btn.querySelector('.cms-preview-fs-btn__icon--max')?.toggleAttribute('hidden', isFullscreen);
    btn.querySelector('.cms-preview-fs-btn__icon--min')?.toggleAttribute('hidden', !isFullscreen);
  }

  function enterFullscreen() {
    if (isFullscreen) return;
    isFullscreen = true;
    document.body.classList.add('cms-page-editor-fullscreen');
    editorEl?.classList.add('cms-visual-editor--fullscreen');
    updateFullscreenButton();
    resizePreviewFrame();
    setTimeout(resizePreviewFrame, 200);
    setTimeout(resizePreviewFrame, 800);
  }

  function exitFullscreen() {
    if (!isFullscreen) return;
    isFullscreen = false;
    document.body.classList.remove('cms-page-editor-fullscreen');
    editorEl?.classList.remove('cms-visual-editor--fullscreen');
    updateFullscreenButton();
    if (iframe) {
      iframe.style.width = '1440px';
    }
    resizePreviewFrame();
    setTimeout(resizePreviewFrame, 200);
  }

  function toggleFullscreen() {
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  }

  function onFullscreenKeydown(ev) {
    if (ev.key === 'Escape' && isFullscreen) {
      ev.preventDefault();
      exitFullscreen();
    }
  }

  function bindIframeResize() {
    if (!iframe || iframe.dataset.resizeBound) return;
    iframe.dataset.resizeBound = '1';
    iframe.addEventListener('load', () => {
      resizePreviewFrame();
      setTimeout(resizePreviewFrame, 400);
      setTimeout(resizePreviewFrame, 1200);
      setTimeout(resizePreviewFrame, 2500);
    });
  }

  function pageNavHTML(activeId) {
    return PAGES.map(
      (p) =>
        `<button type="button" class="cms-page-nav__item ${p.id === activeId ? 'active' : ''}" data-page-id="${p.id}">${t(p.labelKey)}</button>`
    ).join('');
  }

  function livePublicHref(page = currentPage) {
    const base = AdminConfig.publicSite().replace(/\/$/, '');
    if (page.previewPath != null && page.previewPath !== undefined) {
      return page.previewPath ? `${base}/${page.previewPath}` : `${base}/`;
    }
    return `${base}/${page.path}`;
  }

  function toolbarHTML() {
    const langs = AdminConfig.langs
      .map(
        (l) =>
          `<button type="button" class="cms-btn cms-btn--sm ${l.code === currentLang ? 'cms-btn--primary' : 'cms-btn--ghost'}" data-preview-lang="${l.code}">${l.label}</button>`
      )
      .join('');
    return `
      <div class="cms-visual-editor__toolbar">
        <div class="cms-visual-editor__hint">
          <strong>${t('pageEditor.hint')}</strong>
        </div>
        <div class="cms-visual-editor__actions">
          <span class="cms-muted">${t('pageEditor.language')}</span>
          <div class="cms-lang-tabs" style="margin:0">${langs}</div>
          <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" id="preview-save-all">${t('pageEditor.saveAll')}</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-refresh">${t('pageEditor.refresh')}</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-manage-doctors" hidden>${t('pageEditor.manageDoctors')}</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-fullscreen-toolbar" title="${t('pageEditor.maximize')}">${ICON_MAXIMIZE}<span class="cms-preview-fs-btn__label">${t('pageEditor.maximize')}</span></button>
          <a href="${livePublicHref()}" target="_blank" rel="noopener" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-open-public">${t('pageEditor.openLive')}</a>
        </div>
      </div>`;
  }

  function bindToolbar(root) {
    root.querySelectorAll('[data-preview-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.previewLang;
        localStorage.setItem('gkb_lang', currentLang);
        iframe.contentWindow?.postMessage({ type: 'cms-set-lang', lang: currentLang }, '*');
        setTimeout(() => {
          iframe.src = previewUrl();
          setTimeout(resizePreviewFrame, 800);
        }, 100);
        root.querySelectorAll('[data-preview-lang]').forEach((b) => {
          b.classList.toggle('cms-btn--primary', b.dataset.previewLang === currentLang);
          b.classList.toggle('cms-btn--ghost', b.dataset.previewLang !== currentLang);
        });
      });
    });

    document.getElementById('preview-fullscreen-toolbar')?.addEventListener('click', toggleFullscreen);

    document.getElementById('preview-refresh')?.addEventListener('click', () => {
      iframe.src = previewUrl();
      setTimeout(resizePreviewFrame, 800);
    });

    document.getElementById('preview-save-all')?.addEventListener('click', async () => {
      const btn = document.getElementById('preview-save-all');
      if (!btn || !iframe?.contentWindow) return;
      btn.disabled = true;
      const prev = btn.textContent.replace(/ \(\d+\)$/, '');

      try {
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Save All timed out — try again')), 20000);
          function onMsg(ev) {
            if (ev.data?.type === 'cms-save-all-done') {
              clearTimeout(timeout);
              window.removeEventListener('message', onMsg);
              resolve(ev.data);
            }
            if (ev.data?.type === 'cms-save-all-error') {
              clearTimeout(timeout);
              window.removeEventListener('message', onMsg);
              reject(new Error(ev.data.error || 'Save failed'));
            }
          }
          window.removeEventListener('message', onMsg);
          window.addEventListener('message', onMsg);
          btn.textContent = 'Saving…';
          iframe.contentWindow.postMessage({ type: 'cms-save-all' }, '*');
        });

        if (!result.verified) {
          throw new Error('Save was not verified against the public API');
        }

        AdminUI.toast(
          result.saved
            ? `Saved ${result.saved} field(s) — verified on healthyspinedoc.com`
            : 'Published — site is up to date',
          'success'
        );
        iframe.src = previewUrl();
      } catch (err) {
        AdminUI.toast(err.message, 'error');
      } finally {
        const n = btn.dataset.pending || '';
        btn.disabled = false;
        btn.textContent = n ? `${prev} (${n})` : prev;
      }
    });

    const manageBtn = document.getElementById('preview-manage-doctors');
    manageBtn?.addEventListener('click', () => {
      if (typeof window.__cmsShowView === 'function') window.__cmsShowView('doctors');
    });
    manageBtn.hidden = currentPage.id !== 'doctors';
  }

  function switchPage(pageId) {
    const page = PAGES.find((p) => p.id === pageId);
    if (!page) return;
    currentPage = page;
    if (rootEl) {
      rootEl.querySelector('.cms-page-nav').innerHTML = pageNavHTML(page.id);
      rootEl.querySelectorAll('.cms-page-nav__item').forEach((btn) => {
        btn.addEventListener('click', () => switchPage(btn.dataset.pageId));
      });
      const openLink = document.getElementById('preview-open-public');
      if (openLink) openLink.href = livePublicHref(page);
      const manageBtn = document.getElementById('preview-manage-doctors');
      if (manageBtn) manageBtn.hidden = page.id !== 'doctors';
    }
    if (iframe) iframe.src = previewUrl(page);
    setTimeout(resizePreviewFrame, 800);
  }

  function mount(root, initialPageId, options = {}) {
    const embed = !!options.embed;
    rootEl = root;
    if (initialPageId) {
      const p = PAGES.find((x) => x.id === initialPageId);
      if (p) currentPage = p;
    }

    const navHtml = embed
      ? ''
      : `<aside class="cms-page-nav" aria-label="Pages">${pageNavHTML(currentPage.id)}</aside>`;

    root.innerHTML = `
      <div class="cms-visual-editor cms-visual-editor--pages${embed ? ' cms-visual-editor--embed' : ''}">
        ${navHtml}
        <div class="cms-visual-editor__main">
          ${toolbarHTML()}
          <p class="cms-visual-editor__frame-scroll-hint">${t('pageEditor.scrollHint')}</p>
          <div class="cms-visual-editor__frame-wrap">
            <div class="cms-visual-editor__frame-toolbar">
              <span class="cms-visual-editor__frame-title">${t('pageEditor.fullscreenTitle')}</span>
              ${fullscreenBtnHTML()}
            </div>
            <iframe id="page-preview-frame" title="${t('pageEditor.fullscreenTitle')}" src="${previewUrl()}"></iframe>
          </div>
        </div>
      </div>`;

    iframe = document.getElementById('page-preview-frame');
    editorEl = root.querySelector('.cms-visual-editor--pages');
    bindIframeResize();

    document.getElementById('preview-fullscreen-toggle')?.addEventListener('click', toggleFullscreen);
    window.addEventListener('keydown', onFullscreenKeydown);
    window.addEventListener('resize', resizePreviewFrame);

    if (!embed) {
      root.querySelectorAll('.cms-page-nav__item').forEach((btn) => {
        btn.addEventListener('click', () => switchPage(btn.dataset.pageId));
      });
    }

    bindToolbar(root);

    window.addEventListener('message', onMessage);
    if (typeof AdminI18n !== 'undefined') {
      window.addEventListener('admin-lang-change', refreshToolbarLabels);
    }
  }

  function refreshToolbarLabels() {
    if (!rootEl) return;
    const hint = rootEl.querySelector('.cms-visual-editor__hint strong');
    if (hint) hint.textContent = t('pageEditor.hint');
    const langLabel = rootEl.querySelector('.cms-visual-editor__actions > .cms-muted');
    if (langLabel) langLabel.textContent = t('pageEditor.language');
    const saveBtn = document.getElementById('preview-save-all');
    if (saveBtn) {
      const n = saveBtn.dataset.pending;
      saveBtn.textContent = n ? `${t('pageEditor.saveAll')} (${n})` : t('pageEditor.saveAll');
    }
    const refreshBtn = document.getElementById('preview-refresh');
    if (refreshBtn) refreshBtn.textContent = t('pageEditor.refresh');
    const manageBtn = document.getElementById('preview-manage-doctors');
    if (manageBtn) manageBtn.textContent = t('pageEditor.manageDoctors');
    const openLink = document.getElementById('preview-open-public');
    if (openLink) openLink.textContent = t('pageEditor.openLive');
    const fsToolbar = document.getElementById('preview-fullscreen-toolbar');
    if (fsToolbar) {
      fsToolbar.title = isFullscreen ? t('pageEditor.minimize') : t('pageEditor.maximize');
      const label = fsToolbar.querySelector('.cms-preview-fs-btn__label');
      if (label) label.textContent = isFullscreen ? t('pageEditor.minimize') : t('pageEditor.maximize');
    }
    updateFullscreenButton();
    const scrollHint = rootEl.querySelector('.cms-visual-editor__frame-scroll-hint');
    if (scrollHint) scrollHint.textContent = t('pageEditor.scrollHint');
    const nav = rootEl.querySelector('.cms-page-nav');
    if (nav) {
      nav.innerHTML = pageNavHTML(currentPage.id);
      nav.querySelectorAll('.cms-page-nav__item').forEach((btn) => {
        btn.addEventListener('click', () => switchPage(btn.dataset.pageId));
      });
    }
  }

  function onMessage(ev) {
    if (ev.data?.type === 'cms-preview-height' && iframe) {
      const height = Math.max(Number(ev.data.height) || 0, 720);
      if (isFullscreen) {
        const wrap = rootEl?.querySelector('.cms-visual-editor__frame-wrap');
        const wrapHeight = wrap?.clientHeight || window.innerHeight;
        iframe.style.height = `${Math.max(height + 24, wrapHeight - 8)}px`;
      } else {
        iframe.style.height = `${height + 24}px`;
      }
      return;
    }
    if (ev.data?.type === 'cms-pending-count') {
      const btn = document.getElementById('preview-save-all');
      if (btn) {
        const base = t('pageEditor.saveAll');
        btn.dataset.pending = ev.data.count || '';
        btn.textContent = ev.data.count ? `${base} (${ev.data.count})` : base;
      }
      return;
    }
    if (ev.data?.type === 'cms-save-all-done') {
      return;
    }
    if (ev.data?.type === 'cms-saved') {
      return;
    }
    if (ev.data?.type === 'cms-open-doctors') {
      if (typeof window.__cmsShowView === 'function') {
        window.__cmsShowView('doctors', ev.data.doctorId);
      }
    }
  }

  function mountEmbed(root, pageId) {
    unmount();
    mount(root, pageId, { embed: true });
  }

  function unmount() {
    exitFullscreen();
    window.removeEventListener('message', onMessage);
    window.removeEventListener('keydown', onFullscreenKeydown);
    window.removeEventListener('resize', resizePreviewFrame);
    if (rootEl) rootEl.innerHTML = '';
    rootEl = null;
    editorEl = null;
    iframe = null;
  }

  return { mount, mountEmbed, unmount, PAGES, previewUrl };
})();
