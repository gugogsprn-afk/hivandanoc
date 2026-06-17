/**
 * CMS API base URL resolution.
 */
const CmsConfig = (function () {
  const host = window.location.hostname;

  function apiBase() {
    if (window.CMS_API_BASE) return window.CMS_API_BASE.replace(/\/$/, '');
    if (host === 'localhost' || host === '127.0.0.1' || host === '173.212.240.38') {
      return `${window.location.protocol}//${window.location.host}/api/v1`;
    }
    if (host === 'healthyspinedoc.com' || host === 'www.healthyspinedoc.com') {
      return 'https://api.healthyspinedoc.com/api/v1';
    }
    if (host === 'admin.healthyspinedoc.com') {
      return 'https://api.healthyspinedoc.com/api/v1';
    }
    return '/api/v1';
  }

  return { apiBase };
})();
