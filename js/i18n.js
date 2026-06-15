/**
 * Многоязычность сайта (vanilla JS).
 * Переводы: lang/{код}.json · конфиг: lang/config.json
 */
const I18n = (function () {
  const DEFAULT_CONFIG = {
    default: 'hy',
    storageKey: 'gkb_lang',
    languages: [
      { code: 'hy', label: 'HY', name: 'Հայերեն', dir: 'ltr' },
      { code: 'ru', label: 'RU', name: 'Русский', dir: 'ltr' },
      { code: 'en', label: 'EN', name: 'English', dir: 'ltr' }
    ]
  };

  let currentLang = 'hy';
  let dictionary = {};
  let config = { ...DEFAULT_CONFIG, languages: [...DEFAULT_CONFIG.languages] };
  const listeners = new Set();
  let initPromise = null;

  /** Базовый URL папки сайта (где лежат lang/, data/) */
  function getAssetBase() {
    const script = document.querySelector('script[src*="i18n.js"]');
    if (script?.src) {
      return script.src.replace(/\/js\/[^/]*$/, '/');
    }
    if (window.location.pathname.includes('/admin/')) {
      return new URL('../', window.location.href).href;
    }
    return new URL('./', window.location.href).href;
  }

  function pathPrefix() {
    const base = getAssetBase();
    const pageUrl = new URL('./', window.location.href).href;
    if (base === pageUrl) return '';
    if (window.location.pathname.includes('/admin/')) return '../';
    return '';
  }

  function supportedCodes() {
    const codes = (config.languages || []).map((l) => l.code).filter(Boolean);
    return codes.length ? codes : DEFAULT_CONFIG.languages.map((l) => l.code);
  }

  async function loadConfig() {
    const fallback = {
      ...DEFAULT_CONFIG,
      languages: DEFAULT_CONFIG.languages.map((l) => ({ ...l }))
    };
    try {
      const res = await fetch(`${getAssetBase()}lang/config.json`);
      if (res.ok) {
        const data = await res.json();
        config = {
          ...fallback,
          ...data,
          languages: data.languages?.length ? data.languages : fallback.languages
        };
      } else {
        config = fallback;
      }
    } catch {
      config = fallback;
    }
  }

  async function loadLanguage(lang) {
    try {
      const res = await fetch(`${getAssetBase()}lang/${lang}.json`);
      if (!res.ok) throw new Error(`Locale not found: ${lang}`);
      dictionary = await res.json();
    } catch {
      dictionary = window.__I18N__?.[lang] || { content: {} };
    }
    currentLang = lang;
    const meta = config.languages.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta?.dir || 'ltr';
    try {
      localStorage.setItem(config.storageKey || 'gkb_lang', lang);
    } catch {
      /* private mode */
    }
  }

  function t(key, params) {
    const parts = key.split('.');
    let val = dictionary;
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) break;
    }
    if (typeof val !== 'string') return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return val;
  }

  function getContent() {
    return dictionary.content || {};
  }

  function applyDOM() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const attr = el.getAttribute('data-i18n-attr');
      const value = t(key);
      if (attr) el.setAttribute(attr, value);
      else el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });

    const titleKey = document.body?.getAttribute('data-i18n-title');
    if (titleKey) document.title = t(titleKey);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dictionary.meta?.siteDescription) {
      metaDesc.setAttribute('content', dictionary.meta.siteDescription);
    }

    document.querySelectorAll('select[data-i18n-default-option]').forEach((sel) => {
      const first = sel.querySelector('option[value=""]');
      if (first) first.textContent = t(sel.getAttribute('data-i18n-default-option'));
    });
  }

  function renderSwitcher(container) {
    if (!container) return;
    const codes = supportedCodes();
    container.innerHTML = codes
      .map(
        (code) =>
          `<button type="button" class="lang-btn${code === currentLang ? ' active' : ''}" data-lang="${code}" aria-pressed="${code === currentLang}">${code.toUpperCase()}</button>`
      )
      .join('');

    container.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  }

  function updateSwitcherUI() {
    document.querySelectorAll('.lang-switcher').forEach((wrap) => {
      wrap.querySelectorAll('.lang-btn').forEach((btn) => {
        const active = btn.dataset.lang === currentLang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    });
  }

  async function setLanguage(lang) {
    if (!supportedCodes().includes(lang) || lang === currentLang) return;
    await loadLanguage(lang);
    applyDOM();
    updateSwitcherUI();
    listeners.forEach((fn) => fn(lang));
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      await loadConfig();
      const key = config.storageKey || 'gkb_lang';
      let saved = null;
      try {
        saved = localStorage.getItem(key);
      } catch {
        /* ignore */
      }
      const codes = supportedCodes();
      const lang = codes.includes(saved) ? saved : config.default || 'hy';
      await loadLanguage(lang);
      applyDOM();
      return currentLang;
    })();
    return initPromise;
  }

  return {
    init,
    setLanguage,
    t,
    getLang: () => currentLang,
    getContent,
    onChange,
    renderSwitcher,
    applyDOM,
    pathPrefix,
    getAssetBase
  };
})();
