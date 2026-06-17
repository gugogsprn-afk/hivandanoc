const AdminConfig = {
  apiBase() {
    if (window.CMS_API_BASE) return window.CMS_API_BASE.replace(/\/$/, '');
    const host = window.location.hostname;
    // Use same-origin /api/v1 (nginx proxies to Node). api.healthyspinedoc.com may not exist yet.
    const sameOrigin = [
      'localhost',
      '127.0.0.1',
      '173.212.240.38',
      'healthyspinedoc.com',
      'www.healthyspinedoc.com',
      'admin.healthyspinedoc.com'
    ];
    if (sameOrigin.includes(host)) {
      return `${window.location.protocol}//${window.location.host}/api/v1`;
    }
    if (host === 'api.healthyspinedoc.com') {
      return `${window.location.protocol}//${host}/api/v1`;
    }
    return '/api/v1';
  },
  publicSite() {
    if (window.PUBLIC_SITE_URL) return window.PUBLIC_SITE_URL.replace(/\/$/, '');
    const host = window.location.hostname;
    const sameOrigin = [
      'localhost',
      '127.0.0.1',
      '173.212.240.38',
      'healthyspinedoc.com',
      'www.healthyspinedoc.com',
      'admin.healthyspinedoc.com'
    ];
    if (sameOrigin.includes(host)) {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'https://healthyspinedoc.com';
  },
  langs: [
    { code: 'hy', label: 'Հայերեն' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ]
};
