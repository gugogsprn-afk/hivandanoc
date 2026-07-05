/**
 * Locale query passthrough — ?lang=hy|ru|en is honored by SSR (seo-pages) and client i18n.
 * Previously stripped via 301; removed so RU/EN homepage SEO blocks render in the correct language.
 */
const LANG_CODES = new Set(['hy', 'ru', 'en']);

function stripLangQuery(req) {
  const lang = req.query.lang;
  if (!lang || !LANG_CODES.has(String(lang).toLowerCase())) return null;

  const q = { ...req.query };
  delete q.lang;
  const keys = Object.keys(q);
  if (!keys.length) return req.path || '/';

  const params = new URLSearchParams();
  for (const key of keys) {
    const val = q[key];
    if (Array.isArray(val)) val.forEach((v) => params.append(key, v));
    else if (val != null) params.append(key, String(val));
  }
  const qs = params.toString();
  return qs ? `${req.path}?${qs}` : req.path || '/';
}

function localeRedirectMiddleware(_req, _res, next) {
  return next();
}

module.exports = { localeRedirectMiddleware, stripLangQuery };
