/**
 * Visual page editor — live preview iframe for each public page.
 */
const PageEditor = (function () {
  const PAGES = [
    { id: 'home', labelKey: 'pageEditor.home', path: 'index.html' },
    { id: 'doctors', labelKey: 'pageEditor.doctors', path: 'doctors.html' },
    { id: 'locations', labelKey: 'pageEditor.locations', path: 'contacts.html' },
    { id: 'patient-care', labelKey: 'pageEditor.patientCare', path: 'departments.html' },
    { id: 'about', labelKey: 'pageEditor.about', path: 'about.html' }
  ];

  const t = (key) => (typeof AdminI18n !== 'undefined' ? AdminI18n.t(key) : key);

  let currentLang = localStorage.getItem('gkb_lang') || 'hy';
  let currentPage = PAGES[0];
  let iframe = null;
  let rootEl = null;

  function previewUrl(page = currentPage) {
    const base = AdminConfig.publicSite().replace(/\/$/, '');
    const build = window.CMS_BUILD || '20260702';
    return `${base}/${page.path}?cms-edit=1&lang=${currentLang}&cms_build=${build}&_=${Date.now()}`;
  }

  function resizePreviewFrame() {
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const height = Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        doc.documentElement?.offsetHeight || 0,
        720
      );
      iframe.style.height = `${height + 24}px`;
    } catch {
      /* cross-origin guard */
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
          <a href="${AdminConfig.publicSite()}/${currentPage.path}" target="_blank" rel="noopener" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-open-public">${t('pageEditor.openLive')}</a>
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
      if (openLink) openLink.href = `${AdminConfig.publicSite()}/${page.path}`;
      const manageBtn = document.getElementById('preview-manage-doctors');
      if (manageBtn) manageBtn.hidden = page.id !== 'doctors';
    }
    if (iframe) iframe.src = previewUrl(page);
    setTimeout(resizePreviewFrame, 800);
  }

  function mount(root, initialPageId) {
    rootEl = root;
    if (initialPageId) {
      const p = PAGES.find((x) => x.id === initialPageId);
      if (p) currentPage = p;
    }

    root.innerHTML = `
      <div class="cms-visual-editor cms-visual-editor--pages">
        <aside class="cms-page-nav" aria-label="Pages">${pageNavHTML(currentPage.id)}</aside>
        <div class="cms-visual-editor__main">
          ${toolbarHTML()}
          <p class="cms-visual-editor__frame-scroll-hint">${t('pageEditor.scrollHint')}</p>
          <div class="cms-visual-editor__frame-wrap">
            <iframe id="page-preview-frame" title="Page preview" src="${previewUrl()}"></iframe>
          </div>
        </div>
      </div>`;

    iframe = document.getElementById('page-preview-frame');
    bindIframeResize();

    root.querySelectorAll('.cms-page-nav__item').forEach((btn) => {
      btn.addEventListener('click', () => switchPage(btn.dataset.pageId));
    });

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
      iframe.style.height = `${height + 24}px`;
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

  function unmount() {
    window.removeEventListener('message', onMessage);
    rootEl = null;
    iframe = null;
  }

  return { mount, unmount, PAGES, previewUrl };
})();
