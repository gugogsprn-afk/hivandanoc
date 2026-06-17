const AdminConfig = {
  apiBase() {
    if (window.CMS_API_BASE) return window.CMS_API_BASE.replace(/\/$/, '');
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '173.212.240.38') {
      return `${window.location.protocol}//${window.location.host}/api/v1`;
    }
    return 'https://api.healthyspinedoc.com/api/v1';
  },
  publicSite() {
    return window.PUBLIC_SITE_URL || 'https://healthyspinedoc.com';
  },
  langs: [
    { code: 'hy', label: 'Հայերեն' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ]
};
