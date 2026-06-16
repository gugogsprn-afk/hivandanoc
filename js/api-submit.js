/** Отправка форм на сервер (email + Telegram). */
const FormApi = (function () {
  function isLocalHost() {
    const h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }

  function isGithubPages() {
    return location.hostname.endsWith('github.io');
  }

  function getApiBase() {
    const base = (window.FORM_API_BASE || '').replace(/\/$/, '');
    if (base) return base;
    if (isLocalHost()) return '';
    return null;
  }

  async function submit(endpoint, data) {
    const base = getApiBase();
    if (base === null) {
      return {
        ok: false,
        needsApi: true,
        status: 0,
        error:
          'Уведомления на GitHub Pages не работают без сервера. ' +
          'Выложите API на Render (см. КАК-ВЫЛОЖИТЬ-API.txt) или запускайте СМОТРЕТЬ-С-УВЕДОМЛЕНИЯМИ.bat.'
      };
    }

    const url = `${base}/api/${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 404 && isGithubPages()) {
        return {
          ok: false,
          needsApi: true,
          status: 404,
          error:
            'Сервер уведомлений не найден. Проверьте URL в js/api-config.js (PRODUCTION_API).'
        };
      }
      return { ok: res.ok && json.ok !== false, status: res.status, ...json };
    } catch (err) {
      return { ok: false, offline: true, error: err.message };
    }
  }

  return {
    getApiBase,
    submitAppointment: (data) => submit('appointment', data),
    submitContact: (data) => submit('contact', data),
    submitStory: (data) => submit('story', data)
  };
})();
