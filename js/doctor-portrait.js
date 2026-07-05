/**
 * Doctor portrait markup — always renders a visible photo slot on doctor cards.
 */
const DoctorPortrait = (function () {
  const PLACEHOLDER = 'images/doctors/placeholder.svg';

  function pathPrefix() {
    return typeof HospitalApp !== 'undefined' && typeof HospitalApp.pathPrefix === 'function'
      ? HospitalApp.pathPrefix()
      : '';
  }

  function initials(name) {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2);
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }

  function resolveUploadedUrl(url) {
    const raw = String(url || '').trim();
    if (!raw || /placeholder\.svg(\?|#|$)/i.test(raw)) return '';
    if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
    return `${pathPrefix()}${raw}`;
  }

  function placeholderUrl() {
    return `${pathPrefix()}${PLACEHOLDER}`;
  }

  function html(doc) {
    const uploaded = resolveUploadedUrl(doc?.image || doc?.image_url);
    const src = uploaded || placeholderUrl();
    const badge = initials(doc?.name);
    const alt = doc?.name ? String(doc.name).replace(/"/g, '&quot;') : 'Doctor';
    const hasPhoto = !!uploaded;

    return `<div class="hss-doctor-item__photo-wrap">
      <div class="hss-doctor-item__photo" aria-hidden="false">
        <div class="hss-doctor-item__photo-inner">
          <img
            src="${src}"
            alt="${alt}"
            class="hss-doctor-item__photo-img${hasPhoto ? '' : ' hss-doctor-item__photo-img--placeholder'}"
            loading="lazy"
            decoding="async"
            onerror="this.classList.add('hss-doctor-item__photo-img--broken'); this.closest('.hss-doctor-item__photo-inner')?.classList.add('hss-doctor-item__photo-inner--fallback');"
          >
          <span class="hss-doctor-item__initials${hasPhoto ? ' hss-doctor-item__initials--overlay' : ''}">${badge}</span>
        </div>
      </div>
    </div>`;
  }

  return { html, initials, resolveUploadedUrl, placeholderUrl };
})();
