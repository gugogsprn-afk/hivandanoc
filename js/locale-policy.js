/**
 * SEO locale hints — canonical URLs stay Armenian; UI language is user-controlled (HY/RU/EN).
 */
(function (root) {
  const LANG_CODES = ['hy', 'ru', 'en'];
  const STORAGE_KEY = 'gkb_lang';

  const CANONICAL_PREFIXES = [
    '/patient-care',
    '/services',
    '/conditions',
    '/knowledge',
    '/about',
    '/contact',
    '/locations',
    '/find-a-doctor'
  ];

  function normalizePath(pathname) {
    const p = (pathname || '/').replace(/\/$/, '') || '/';
    return p;
  }

  function isCanonicalSeoPath(pathname) {
    const p = normalizePath(pathname);
    if (p === '/') return true;
    return CANONICAL_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
  }

  /** Used for SEO/hreflang only — does not block language switcher. */
  function isCanonicalSeoPage() {
    if (typeof location !== 'undefined') return isCanonicalSeoPath(location.pathname);
    return false;
  }

  /** First valid hy|ru|en from a raw value or duplicate query array. */
  function parseLangParam(raw) {
    if (raw == null || raw === '') return null;
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const parsed = parseLangParam(item);
        if (parsed) return parsed;
      }
      return null;
    }
    const code = String(raw).trim().toLowerCase();
    return LANG_CODES.includes(code) ? code : null;
  }

  /** Resolve locale from ?lang= query only (supports duplicate params). */
  function resolveLangFromSearch(search) {
    try {
      const qs = search != null ? search : typeof location !== 'undefined' ? location.search : '';
      const params = new URLSearchParams(qs);
      for (const code of params.getAll('lang')) {
        const parsed = parseLangParam(code);
        if (parsed) return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  /** URL ?lang= wins; else localStorage; default HY. */
  function resolvePreferredLang(storageKey) {
    const fromUrl = resolveLangFromSearch();
    if (fromUrl) return fromUrl;
    try {
      const saved =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(storageKey || STORAGE_KEY)
          : null;
      const parsed = parseLangParam(saved);
      if (parsed) return parsed;
    } catch {
      /* private mode */
    }
    return 'hy';
  }

  /** Active UI lang for link patching and switcher state. */
  function getActiveLang() {
    return resolvePreferredLang(STORAGE_KEY);
  }

  function withLang(path, lang) {
    lang = parseLangParam(lang) || 'hy';
    if (lang === 'hy') return path;
    const separator = path.includes('?') ? '&' : '?';
    const base = path.split('#')[0];
    const hash = path.includes('#') ? path.slice(path.indexOf('#')) : '';
    const qIdx = base.indexOf('?');
    const pathname = qIdx >= 0 ? base.slice(0, qIdx) : base;
    const params = new URLSearchParams(qIdx >= 0 ? base.slice(qIdx + 1) : '');
    params.delete('lang');
    params.set('lang', lang);
    const qs = params.toString();
    return `${pathname}?${qs}${hash}`;
  }

  /** Build same-page URL for language switcher navigation. */
  function langUrl(lang) {
    if (typeof location === 'undefined') return '/';
    lang = parseLangParam(lang) || 'hy';
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    if (lang !== 'hy') {
      url.searchParams.set('lang', lang);
    }
    return url.pathname + url.search + url.hash;
  }

  /** Patch internal anchor hrefs under root (nav/footer/shell). Skips assets. */
  function patchDocumentLinks(root, lang) {
    lang = parseLangParam(lang) || getActiveLang();
    const scope = root && root.querySelectorAll ? root : typeof document !== 'undefined' ? document : null;
    if (!scope) return;
    scope.querySelectorAll('a[href^="/"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      const hashIdx = href.indexOf('#');
      const hash = hashIdx >= 0 ? href.slice(hashIdx) : '';
      const path = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
      a.setAttribute('href', withLang(path, lang) + hash);
    });
  }

  root.LocalePolicy = {
    LANG_CODES,
    STORAGE_KEY,
    isCanonicalSeoPath,
    isCanonicalSeoPage,
    normalizePath,
    parseLangParam,
    resolveLangFromSearch,
    resolvePreferredLang,
    getActiveLang,
    withLang,
    langUrl,
    patchDocumentLinks
  };
})(typeof window !== 'undefined' ? window : global);
