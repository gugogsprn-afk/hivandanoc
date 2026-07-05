/**
 * SEO locale hints — canonical URLs stay Armenian; UI language is user-controlled (HY/RU/EN).
 */
(function (root) {
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

  root.LocalePolicy = { isCanonicalSeoPath, isCanonicalSeoPage, normalizePath };
})(typeof window !== 'undefined' ? window : global);
