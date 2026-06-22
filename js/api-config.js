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

  // Same-origin /api on Contabo (empty = nginx → Node). External API only for GitHub Pages mirror.
  const PRODUCTION_API = '';

  const NOTIFY_EMAIL = 'gugogsprn@gmail.com';

  window.FORM_API_BASE = isLocal || isProduction ? '' : PRODUCTION_API.replace(/\/$/, '');
  window.NOTIFY_EMAIL = NOTIFY_EMAIL;
})();
