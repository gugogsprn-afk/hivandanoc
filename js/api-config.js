/**
 * Настройки уведомлений.
 * Локально: СМОТРЕТЬ-С-УВЕДОМЛЕНИЯМИ.bat (файл .env).
 * GitHub Pages: почта через FormSubmit (ниже), Telegram — через PRODUCTION_API (Render).
 */
(function () {
  const host = location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  // Полный API (Render / Cloudflare) — почта + Telegram. Пусто = только FormSubmit для почты.
  const PRODUCTION_API = '';

  // Куда приходят заявки с GitHub Pages (FormSubmit)
  const NOTIFY_EMAIL = 'gugogsprn@gmail.com';

  window.FORM_API_BASE = isLocal ? '' : PRODUCTION_API.replace(/\/$/, '');
  window.NOTIFY_EMAIL = NOTIFY_EMAIL;
})();
