/**
 * Early i18n: hide body until embed dictionary applies (prevents English flash).
 */
(function () {
  const CODES = ['hy', 'ru', 'en'];
  const STORAGE_KEY = 'gkb_lang';

  function resolveLang() {
    let lang = 'hy';
    try {
      const qp = new URLSearchParams(location.search).get('lang');
      if (qp && CODES.includes(qp)) return qp;
    } catch {
      /* ignore */
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CODES.includes(saved)) lang = saved;
    } catch {
      /* private mode */
    }
    return lang;
  }

  function t(dict, key) {
    const parts = key.split('.');
    let val = dict;
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) return null;
    }
    return typeof val === 'string' ? val : null;
  }

  function applyDictionary(dict) {
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const value = t(dict, key);
      if (value == null) return;
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, value);
      else el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = t(dict, key);
      if (value != null) el.placeholder = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const value = t(dict, key);
      if (value != null) el.innerHTML = value;
    });
    const titleKey = document.body?.getAttribute('data-i18n-title');
    if (titleKey) {
      const title = t(dict, titleKey);
      if (title) document.title = title;
    }
    const meta = document.querySelector('meta[name="description"]');
    if (meta && dict.meta?.siteDescription) {
      meta.setAttribute('content', dict.meta.siteDescription);
    }
  }

  const lang = resolveLang();
  document.documentElement.lang = lang;
  if (!document.documentElement.classList.contains('i18n-pending')) {
    document.documentElement.classList.add('i18n-pending');
  }

  function boot() {
    const dict = window.__I18N__?.[lang];
    if (dict) applyDictionary(dict);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.__I18N_BOOT_LANG__ = lang;
})();
