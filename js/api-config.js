/**
 * Настройки уведомлений.
 * Локально: СМОТРЕТЬ-С-УВЕДОМЛЕНИЯМИ.bat (файл .env).
 * GitHub Pages: почта через FormSubmit (ниже), Telegram — через PRODUCTION_API (Render).
 */
(function () {
  const host = location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const isProduction =
    host === '173.212.240.38' ||
    host === 'healthyspinedoc.com' ||
    host === 'www.healthyspinedoc.com';

  // Полный API (Render / Contabo). Пусто = same-origin /api через nginx.
  const PRODUCTION_API = '';

  // Куда приходят заявки с GitHub Pages (FormSubmit)
  const NOTIFY_EMAIL = 'gugogsprn@gmail.com';

  window.FORM_API_BASE = isLocal || isProduction ? '' : PRODUCTION_API.replace(/\/$/, '');
  window.NOTIFY_EMAIL = NOTIFY_EMAIL;
})();
