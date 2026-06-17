/**
 * Admin CMS — shared UI helpers (loading, empty, toast, layout).
 */
const AdminUI = (function () {
  const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    homepage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    doctors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    services: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
  };

  const VIEW_TITLES = {
    dashboard: 'Dashboard',
    leads: 'Leads & Appointments',
    homepage: 'Homepage Editor',
    doctors: 'Doctors',
    services: 'Services',
    media: 'Media Library',
    settings: 'Global Settings'
  };

  function loadingHTML(message = 'Loading…') {
    return `<div class="cms-state cms-state--loading" role="status" aria-live="polite">
      <div class="cms-spinner" aria-hidden="true"></div>
      <p>${message}</p>
    </div>`;
  }

  function emptyHTML(title, description, actionHtml = '') {
    return `<div class="cms-state cms-state--empty">
      <div class="cms-state__icon" aria-hidden="true">📋</div>
      <h3>${title}</h3>
      <p>${description}</p>
      ${actionHtml}
    </div>`;
  }

  function errorHTML(message, retryId = '') {
    return `<div class="cms-state cms-state--error" role="alert">
      <div class="cms-state__icon" aria-hidden="true">⚠️</div>
      <h3>Something went wrong</h3>
      <p>${message}</p>
      ${retryId ? `<button type="button" class="cms-btn cms-btn--primary" id="${retryId}">Try again</button>` : ''}
    </div>`;
  }

  function statCard(value, label, variant = 'teal', icon = '') {
    return `<article class="cms-stat-card cms-stat-card--${variant}">
      <div class="cms-stat-card__icon" aria-hidden="true">${icon}</div>
      <div class="cms-stat-card__body">
        <strong>${value}</strong>
        <span>${label}</span>
      </div>
    </article>`;
  }

  function statusBadge(status) {
    const labels = { new: 'New', contacted: 'Contacted', booked: 'Booked', cancelled: 'Cancelled' };
    return `<span class="cms-status cms-status--${status}">${labels[status] || status}</span>`;
  }

  function pageIntro(text) {
    return `<p class="cms-page-intro">${text}</p>`;
  }

  function card(title, body, extraClass = '') {
    return `<div class="cms-card ${extraClass}">
      ${title ? `<div class="cms-card__head"><h2>${title}</h2></div>` : ''}
      <div class="cms-card__body">${body}</div>
    </div>`;
  }

  function tableResponsive(inner) {
    return `<div class="cms-table-wrap"><table class="cms-table">${inner}</table></div>`;
  }

  function toast(msg, type = 'info') {
    const el = document.getElementById('cms-toast');
    if (!el) return;
    el.className = `cms-toast cms-toast--${type} is-visible`;
    el.innerHTML = `<span class="cms-toast__text">${msg}</span>`;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.classList.remove('is-visible'); }, 3200);
  }

  function setViewTitle(name) {
    const title = VIEW_TITLES[name] || name;
    const el = document.getElementById('view-title');
    if (el) el.textContent = title;
    document.title = `${title} — CHIC CMS`;
  }

  function toggleSidebar(open) {
    document.body.classList.toggle('cms-sidebar-open', open);
  }

  function bindMobileNav() {
    const toggle = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    if (toggle) {
      toggle.addEventListener('click', () => toggleSidebar(!document.body.classList.contains('cms-sidebar-open')));
    }
    if (overlay) {
      overlay.addEventListener('click', () => toggleSidebar(false));
    }
    document.querySelectorAll('#main-nav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.innerWidth < 1024) toggleSidebar(false);
      });
    });
  }

  function setLoginLoading(loading) {
    const btn = document.querySelector('#login-form button[type="submit"]');
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
    btn.textContent = loading ? 'Signing in…' : 'Sign in';
  }

  return {
    ICONS,
    VIEW_TITLES,
    loadingHTML,
    emptyHTML,
    errorHTML,
    statCard,
    statusBadge,
    pageIntro,
    card,
    tableResponsive,
    toast,
    setViewTitle,
    bindMobileNav,
    setLoginLoading
  };
})();
