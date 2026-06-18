/**
 * Visual page editor — live preview iframe for each public page.
 */
const PageEditor = (function () {
  const PAGES = [
    { id: 'home', label: 'Home page', path: 'index.html' },
    { id: 'doctors', label: 'Find a Doctor', path: 'doctors.html' },
    { id: 'locations', label: 'Locations', path: 'contacts.html' },
    { id: 'patient-care', label: 'Patient Care', path: 'departments.html' },
    { id: 'about', label: 'About', path: 'about.html' }
  ];

  let currentLang = localStorage.getItem('gkb_lang') || 'hy';
  let currentPage = PAGES[0];
  let iframe = null;
  let rootEl = null;

  function previewUrl(page = currentPage) {
    const base = AdminConfig.publicSite().replace(/\/$/, '');
    const build = window.CMS_BUILD || '20260702';
    return `${base}/${page.path}?cms-edit=1&lang=${currentLang}&cms_build=${build}&_=${Date.now()}`;
  }

  function pageNavHTML(activeId) {
    return PAGES.map(
      (p) =>
        `<button type="button" class="cms-page-nav__item ${p.id === activeId ? 'active' : ''}" data-page-id="${p.id}">${p.label}</button>`
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
          <strong>Edit mode</strong> — click to edit, press <strong>Save</strong> to queue changes, then <strong>Save All</strong> to publish to the live website.
        </div>
        <div class="cms-visual-editor__actions">
          <span class="cms-muted">Language:</span>
          <div class="cms-lang-tabs" style="margin:0">${langs}</div>
          <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" id="preview-save-all">Save All</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-refresh">↻ Refresh</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-manage-doctors" hidden>Manage doctors</button>
          <a href="${AdminConfig.publicSite()}/${currentPage.path}" target="_blank" rel="noopener" class="cms-btn cms-btn--ghost cms-btn--sm" id="preview-open-public">Open live page ↗</a>
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
        }, 100);
        root.querySelectorAll('[data-preview-lang]').forEach((b) => {
          b.classList.toggle('cms-btn--primary', b.dataset.previewLang === currentLang);
          b.classList.toggle('cms-btn--ghost', b.dataset.previewLang !== currentLang);
        });
      });
    });

    document.getElementById('preview-refresh')?.addEventListener('click', () => {
      iframe.src = previewUrl();
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
          <div class="cms-visual-editor__frame-wrap">
            <iframe id="page-preview-frame" title="Page preview" src="${previewUrl()}"></iframe>
          </div>
        </div>
      </div>`;

    iframe = document.getElementById('page-preview-frame');

    root.querySelectorAll('.cms-page-nav__item').forEach((btn) => {
      btn.addEventListener('click', () => switchPage(btn.dataset.pageId));
    });

    bindToolbar(root);

    window.addEventListener('message', onMessage);
  }

  function onMessage(ev) {
    if (ev.data?.type === 'cms-pending-count') {
      const btn = document.getElementById('preview-save-all');
      if (btn) {
        const base = 'Save All';
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
