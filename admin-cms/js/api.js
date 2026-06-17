/**
 * Admin CMS — API client
 */
const AdminApi = (function () {
  function token() {
    return localStorage.getItem('cms_token') || '';
  }

  function setToken(t) {
    if (t) localStorage.setItem('cms_token', t);
    else localStorage.removeItem('cms_token');
  }

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;

    const res = await fetch(`${AdminConfig.apiBase()}${path}`, {
      ...options,
      headers,
      body:
        options.body instanceof FormData || options.body == null
          ? options.body
          : JSON.stringify(options.body)
    });

    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setToken('');
      if (!path.includes('/auth/login')) {
        window.location.href = 'index.html';
      }
    }
    if (!res.ok) {
      throw new Error(json.error || `Request failed (${res.status})`);
    }
    return json;
  }

  return {
    token,
    setToken,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    del: (path) => request(path, { method: 'DELETE' }),
    upload: (path, formData) =>
      request(path, { method: 'POST', body: formData, headers: {} })
  };
})();
