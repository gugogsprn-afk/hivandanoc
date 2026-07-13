/**
 * Early i18n: hide body until embed dictionary applies (prevents English flash).
 */
(function () {
  const CODES = ['hy', 'ru', 'en'];
  const STORAGE_KEY = 'gkb_lang';

  function parseLangParam(raw) {
    if (raw == null || raw === '') return null;
    const code = String(raw).trim().toLowerCase();
    return CODES.includes(code) ? code : null;
  }

  function resolveLang() {
    if (typeof LocalePolicy !== 'undefined') {
      if (typeof LocalePolicy.resolvePreferredLang === 'function') {
        return LocalePolicy.resolvePreferredLang(STORAGE_KEY);
      }
      if (typeof LocalePolicy.resolveLangFromSearch === 'function') {
        const fromUrl = LocalePolicy.resolveLangFromSearch();
        if (fromUrl) return fromUrl;
      }
    }
    try {
      const params = new URLSearchParams(location.search);
      for (const code of params.getAll('lang')) {
        const parsed = parseLangParam(code);
        if (parsed) return parsed;
      }
    } catch {
      /* ignore */
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = parseLangParam(saved);
      if (parsed) return parsed;
    } catch {
      /* private mode */
    }
    return 'hy';
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

  setTimeout(() => {
    document.documentElement.classList.remove('i18n-pending');
    document.documentElement.classList.add('i18n-ready');
  }, 4000);
})();
