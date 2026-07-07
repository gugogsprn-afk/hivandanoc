/**
 * Clinic map — Google Maps JS API Marker (preferred) or official embed iframe.
 */
const ClinicMap = (function () {
  const DEFAULT_LAT = 40.2074194;
  const DEFAULT_LNG = 44.4782661;
  const DEFAULT_ZOOM = 17;
  const DEFAULT_PLACE_NAME = '6+Margaryan+St,+Yerevan+0078,+Armenia';

  const PIN_SVG =
    '<svg viewBox="0 0 27 43" width="27" height="43" aria-hidden="true">' +
    '<path fill="#EA4335" d="M13.5 0C6.04 0 0 6.04 0 13.5 0 23.63 13.5 43 13.5 43S27 23.63 27 13.5C27 6.04 20.96 0 13.5 0zm0 18.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>' +
    '</svg>';

  let mapsKeyPromise = null;
  let embedUrlPromise = null;

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function coords(h) {
    return {
      lat: Number(h?.mapLat ?? DEFAULT_LAT),
      lng: Number(h?.mapLng ?? DEFAULT_LNG),
      zoom: Number(h?.mapZoom ?? DEFAULT_ZOOM)
    };
  }

  function clinicTitle(h) {
    if (typeof HospitalApp !== 'undefined' && HospitalApp.brandName) {
      return HospitalApp.brandName();
    }
    return h?.shortName || h?.name || 'Առողջ ողնաշար';
  }

  function clinicAddress(h) {
    const loc =
      typeof I18n !== 'undefined' && I18n.getContent?.()?.hospital?.address
        ? I18n.getContent().hospital.address
        : '';
    return loc || h?.address || h?.mapsQuery || DEFAULT_PLACE_NAME.replace(/\+/g, ' ');
  }

  function directionsUrl(h) {
    if (h?.mapsDirections) return h.mapsDirections;
    const c = coords(h);
    return `https://yandex.ru/navi/?rtext=~${c.lat},${c.lng}`;
  }

  function navigatorLabel() {
    return typeof I18n !== 'undefined' ? I18n.t('footer.yandexNavigator') : 'Yandex Navigator';
  }

  function apiBase() {
    if (typeof CmsConfig !== 'undefined' && CmsConfig.apiBase) {
      return CmsConfig.apiBase();
    }
    return '';
  }

  function resolveMapsKey() {
    if (window.GOOGLE_MAPS_API_KEY) {
      return Promise.resolve(window.GOOGLE_MAPS_API_KEY);
    }
    if (!mapsKeyPromise) {
      mapsKeyPromise = fetch(`${apiBase()}/public/maps-config`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      })
        .then((res) => (res.ok ? res.json() : { googleMapsApiKey: '' }))
        .then((data) => {
          const key = data.googleMapsApiKey || '';
          if (key) window.GOOGLE_MAPS_API_KEY = key;
          return key;
        })
        .catch(() => '');
    }
    return mapsKeyPromise;
  }

  function resolveEmbedUrl(h) {
    const c = coords(h);
    const cacheKey = `${c.lat},${c.lng},${c.zoom}`;
    if (!embedUrlPromise || embedUrlPromise.key !== cacheKey) {
      embedUrlPromise = {
        key: cacheKey,
        promise: fetch(
          `${apiBase()}/public/map-embed?lat=${encodeURIComponent(c.lat)}&lng=${encodeURIComponent(c.lng)}&zoom=${encodeURIComponent(c.zoom)}`,
          { headers: { Accept: 'application/json' }, cache: 'no-store' }
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => normalizeEmbedUrl(data?.embedUrl, h) || mapEmbedUrl(h))
          .catch(() => mapEmbedUrl(h))
      };
    }
    return embedUrlPromise.promise;
  }

  /** Rewrite legacy ?q=lat,lng embeds that trigger Google's place-card error. */
  function normalizeEmbedUrl(url, h) {
    if (!url || typeof url !== 'string') return url;
    try {
      const u = new URL(url);
      if (!u.hostname.includes('google.com')) return url;
      if (u.pathname.includes('/embed') && u.search.includes('!1s')) return mapEmbedUrl(h);
      const q = u.searchParams.get('q');
      if (q && !u.searchParams.has('ll') && /^-?\d/.test(q.trim())) {
        u.searchParams.delete('q');
        u.searchParams.set('ll', q.trim());
        return u.toString();
      }
    } catch (_err) {
      /* ignore */
    }
    return url;
  }

  /** Center map on coords without Google's clickable POI marker. */
  function viewEmbedUrl(h) {
    const c = coords(h || {});
    return (
      'https://maps.google.com/maps' +
      `?ll=${encodeURIComponent(`${c.lat},${c.lng}`)}` +
      `&z=${c.zoom}&hl=ru&output=embed`
    );
  }

  function mapEmbedUrl(h) {
    const c = coords(h);
    const key = window.GOOGLE_MAPS_API_KEY;

    if (key) {
      return (
        'https://www.google.com/maps/embed/v1/view' +
        `?key=${encodeURIComponent(key)}` +
        `&center=${encodeURIComponent(`${c.lat},${c.lng}`)}` +
        `&zoom=${c.zoom}&language=ru`
      );
    }

    return viewEmbedUrl(h);
  }

  function mapTitle() {
    return typeof I18n !== 'undefined' ? I18n.t('footer.mapTitle') : 'Clinic location';
  }

  function closeLabel() {
    return typeof I18n !== 'undefined' ? I18n.t('common.close') || 'Close' : 'Close';
  }

  function infoWindowHtml(h) {
    const navUrl = directionsUrl(h);
    const label = navigatorLabel();
    return (
      `<div class="hss-gmap-info">` +
      `<strong>${escHtml(clinicTitle(h))}</strong>` +
      `<span>${escHtml(clinicAddress(h))}</span>` +
      `<a class="hss-gmap-info__nav" href="${escHtml(navUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:0.55rem;padding:0.45rem 0.85rem;background:#1a4f4f;color:#fff;border-radius:6px;font-size:0.8125rem;font-weight:600;text-decoration:none;">${escHtml(label)}</a>` +
      `</div>`
    );
  }

  function overlayHtml(h) {
    const address = clinicAddress(h);
    return (
      `<button type="button" class="hss-map__marker-hit" aria-label="${escHtml(address)}">` +
      `<span class="hss-map__marker-pin">${PIN_SVG}</span>` +
      `</button>` +
      `<div class="hss-map__infowindow" hidden>` +
      `<button type="button" class="hss-map__infowindow-close" aria-label="${escHtml(closeLabel())}">×</button>` +
      infoWindowHtml(h) +
      `</div>`
    );
  }

  function bindIframeOverlays(wrap) {
    const hit = wrap.querySelector('.hss-map__marker-hit');
    const popup = wrap.querySelector('.hss-map__infowindow');
    const closeBtn = wrap.querySelector('.hss-map__infowindow-close');
    if (!hit || !popup) return;

    hit.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      popup.hidden = false;
    });

    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      popup.hidden = true;
    });
  }

  function applyMapContainerClass(container, isFooter) {
    container.classList.add('hss-map', 'hss-map--embed');
    if (isFooter) {
      container.classList.add('hss-map--footer');
    } else if (!container.classList.contains('reveal')) {
      container.classList.add('reveal');
    }
  }

  function renderIframe(container, h, embed, isFooter) {
    const title = mapTitle();
    applyMapContainerClass(container, isFooter);
    const safeEmbed = String(normalizeEmbedUrl(embed, h) || mapEmbedUrl(h)).replace(/"/g, '&quot;');
    container.innerHTML =
      `<div class="hss-map__wrap">` +
      overlayHtml(h) +
      `<iframe class="hss-map__iframe" title="${escHtml(title)}" src="${safeEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen style="border:0;width:100%;height:100%"></iframe>` +
      `</div>`;
    bindIframeOverlays(container.querySelector('.hss-map__wrap'));
  }

  function loadGoogleMaps(key, callback) {
    if (window.google?.maps) {
      callback();
      return;
    }
    const id = 'google-maps-js';
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener('load', () => callback());
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=ru`;
    script.onload = () => callback();
    script.onerror = () => callback(new Error('load-failed'));
    document.head.appendChild(script);
  }

  function initGoogleMap(container, h) {
    const c = coords(h);
    const canvas = container.querySelector('.hss-map__canvas');
    if (!canvas || !window.google?.maps) return false;

    new google.maps.Map(canvas, {
      center: { lat: c.lat, lng: c.lng },
      zoom: c.zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    return true;
  }

  function renderJsApi(container, h, key, isFooter) {
    const title = mapTitle();
    applyMapContainerClass(container, isFooter);
    container.innerHTML =
      `<div class="hss-map__wrap">` +
      overlayHtml(h) +
      `<div class="hss-map__canvas" role="application" aria-label="${escHtml(title)}"></div>` +
      `</div>`;
    const wrap = container.querySelector('.hss-map__wrap');
    bindIframeOverlays(wrap);

    loadGoogleMaps(key, () => {
      if (!initGoogleMap(container, h)) {
        resolveEmbedUrl(h).then((embed) => renderIframe(container, h, embed, isFooter));
      }
    });
  }

  async function render(container, h, options) {
    if (!container) return;
    const hospital = h || (typeof HospitalApp !== 'undefined' ? HospitalApp.getData()?.hospital : {}) || {};
    const isFooter = options?.footer ?? container.id === 'footer-map';
    const fallbackEmbed = mapEmbedUrl(hospital);

    try {
      const key = await resolveMapsKey();
      if (key) {
        renderJsApi(container, hospital, key, isFooter);
        return;
      }
      const embed = await resolveEmbedUrl(hospital);
      renderIframe(container, hospital, embed || fallbackEmbed, isFooter);
    } catch (_err) {
      renderIframe(container, hospital, fallbackEmbed, isFooter);
    }
  }

  return {
    render,
    mapEmbedUrl,
    coords,
    clinicAddress,
    clinicTitle,
    DEFAULT_LAT,
    DEFAULT_LNG,
    DEFAULT_ZOOM
  };
})();
