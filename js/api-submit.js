/** Отправка форм: локальный сервер, Render API или FormSubmit (GitHub Pages). */
const FormApi = (function () {
  const TITLES = {
    appointment: 'Новая запись на приём',
    contact: 'Новое сообщение с сайта',
    story: 'Новая история пациента'
  };

  function isLocalHost() {
    const h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }

  function isGithubPages() {
    return location.hostname.endsWith('github.io');
  }

  function isProductionHost() {
    const h = location.hostname;
    return (
      h === '173.212.240.38' ||
      h === 'healthyspinedoc.com' ||
      h === 'www.healthyspinedoc.com'
    );
  }

  function getApiBase() {
    // Empty string = same-origin /api (production + local Node server)
    if (typeof window.FORM_API_BASE === 'string') {
      return window.FORM_API_BASE.replace(/\/$/, '');
    }
    if (isLocalHost() || isProductionHost()) return '';
    const base = (window.FORM_API_BASE || '').replace(/\/$/, '');
    if (base) return base;
    return null;
  }

  function formatPayload(data) {
    return Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n');
  }

  function apiV1Root(base) {
    if (!base) return '/api/v1';
    return `${base.replace(/\/$/, '')}/api/v1`;
  }

  async function submitToServer(base, endpoint, data) {
    const cmsEndpoints = {
      appointment: 'leads/appointment',
      contact: 'leads/contact'
    };
    const cmsPath = cmsEndpoints[endpoint];
    if (cmsPath) {
      const cmsUrl = `${apiV1Root(base)}/public/${cmsPath}`;
      try {
        const cmsRes = await fetch(cmsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const cmsJson = await cmsRes.json().catch(() => ({}));
        if (cmsRes.ok && cmsJson.ok !== false) {
          return { ok: true, status: cmsRes.status, cms: true, ...cmsJson };
        }
      } catch {
        /* fall through to legacy */
      }
    }

    const legacyBase = base || '';
    const url = `${legacyBase}/api/${endpoint}`;
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
        error: 'Сервер уведомлений не найден. Проверьте PRODUCTION_API в js/api-config.js.'
      };
    }
    return { ok: res.ok && json.ok !== false, status: res.status, ...json };
  }

  async function submitViaFormSubmit(endpoint, data) {
    const email = (window.NOTIFY_EMAIL || '').trim();
    if (!email) {
      return { ok: false, error: 'Не указан NOTIFY_EMAIL в js/api-config.js' };
    }

    const title = TITLES[endpoint] || 'Заявка с сайта';
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        _subject: `[Առողջ ողնաշար] ${title}`,
        _template: 'table',
        _captcha: 'false',
        form_type: endpoint,
        message: formatPayload(data),
        ...data
      })
    });

    const json = await res.json().catch(() => ({}));
    const ok = res.ok && json.success !== 'false' && json.success !== false;

    if (!ok && json.message) {
      return { ok: false, error: json.message, viaFormSubmit: true };
    }

    return {
      ok,
      viaFormSubmit: true,
      email: ok,
      message: ok
        ? 'Письмо отправлено на ' + email
        : 'FormSubmit: проверьте почту и подтвердите первую заявку (письмо от FormSubmit).'
    };
  }

  async function submit(endpoint, data) {
    const base = getApiBase();

    if (base !== null) {
      try {
        return await submitToServer(base, endpoint, data);
      } catch (err) {
        return { ok: false, offline: true, error: err.message };
      }
    }

    if (isGithubPages()) {
      try {
        return await submitViaFormSubmit(endpoint, data);
      } catch (err) {
        return { ok: false, offline: true, error: err.message };
      }
    }

    return {
      ok: false,
      needsApi: true,
      status: 0,
      error:
        'Сервер уведомлений недоступен. Проверьте подключение к интернету или напишите на info@healthyspine.am.'
    };
  }

  return {
    getApiBase,
    submitAppointment: (data) => submit('appointment', data),
    submitContact: (data) => submit('contact', data),
    submitStory: (data) => submit('story', data)
  };
})();
