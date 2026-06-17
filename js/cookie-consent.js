/**
 * GDPR-style cookie consent (essential vs optional).
 */
const CookieConsent = (function () {
  const STORAGE_KEY = 'gkb_cookie_consent';

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* private mode */
    }
    document.dispatchEvent(new CustomEvent('cookieconsent', { detail: { value } }));
    hideBanner();
  }

  function hideBanner() {
    const el = document.getElementById('cookie-consent-banner');
    if (el) {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 400);
    }
  }

  async function bannerCopy() {
    if (typeof LegalContent !== 'undefined') {
      await LegalContent.loadLegalData();
      return LegalContent.legalBundle().cookieBanner || {};
    }
    return {};
  }

  async function renderBanner() {
    if (getConsent() || document.getElementById('cookie-consent-banner')) return;

    const prefix = typeof HospitalApp !== 'undefined' ? HospitalApp.pathPrefix() : '';
    const c = await bannerCopy();
    const t = (k, fb) => (typeof I18n !== 'undefined' ? I18n.t(k) : fb);

    const bar = document.createElement('div');
    bar.id = 'cookie-consent-banner';
    bar.className = 'hss-cookie-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', c.title || 'Cookies');
    bar.innerHTML = `
      <div class="hss-cookie-banner__inner">
        <div>
          <p class="hss-cookie-banner__title">${c.title || ''}</p>
          <p class="hss-cookie-banner__text">
            ${c.text || ''}
            <a href="${prefix}cookies-policy.html">${c.policyLink || 'Cookies'}</a>
            · <a href="${prefix}privacy-policy.html">${t('footer.policyPrivacy', 'Privacy')}</a>
          </p>
        </div>
        <div class="hss-cookie-banner__actions">
          <button type="button" class="hss-btn hss-btn--primary" data-cookie="all">${c.accept || 'Accept'}</button>
          <button type="button" class="hss-btn hss-btn--ghost" data-cookie="essential">${c.essential || 'Essential'}</button>
        </div>
      </div>`;

    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('is-visible'));

    bar.querySelectorAll('[data-cookie]').forEach((btn) => {
      btn.addEventListener('click', () => setConsent(btn.dataset.cookie));
    });
  }

  function init() {
    if (document.body.classList.contains('admin-body')) return;
    const run = () => renderBanner();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
    if (typeof I18n !== 'undefined') {
      I18n.onChange(() => {
        if (!getConsent()) {
          hideBanner();
          renderBanner();
        }
      });
    }
  }

  init();

  return { getConsent, setConsent, STORAGE_KEY };
})();
