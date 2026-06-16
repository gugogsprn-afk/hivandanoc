/**
 * URL сервера уведомлений (почта + Telegram).
 * Локально (СМОТРЕТЬ-С-УВЕДОМЛЕНИЯМИ.bat) — пустая строка, запросы на тот же хост.
 * GitHub Pages — укажите адрес после выкладки на Render (см. КАК-ВЫЛОЖИТЬ-API.txt).
 */
(function () {
  const host = location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  // После деплоя на Render вставьте сюда URL, например: https://hivandanoc-api.onrender.com
  const PRODUCTION_API = '';

  window.FORM_API_BASE = isLocal ? '' : PRODUCTION_API.replace(/\/$/, '');
})();
