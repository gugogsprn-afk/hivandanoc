/**
 * CMS API base URL — must match admin (same-origin /api/v1 via nginx).
 */
const CmsConfig = (function () {
  const SAME_ORIGIN_HOSTS = [
    'localhost',
    '127.0.0.1',
    '173.212.240.38',
    'healthyspinedoc.com',
    'www.healthyspinedoc.com',
    'admin.healthyspinedoc.com'
  ];

  function apiBase() {
    if (window.CMS_API_BASE) return window.CMS_API_BASE.replace(/\/$/, '');
    const host = window.location.hostname;
    if (SAME_ORIGIN_HOSTS.includes(host)) {
      return `${window.location.protocol}//${window.location.host}/api/v1`;
    }
    if (host === 'api.healthyspinedoc.com') {
      return `${window.location.protocol}//${host}/api/v1`;
    }
    return '/api/v1';
  }

  return { apiBase };
})();
