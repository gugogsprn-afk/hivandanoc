/**
 * Clinic map — Google Maps JS API Marker (preferred) or official embed iframe.
 */
const ClinicMap = (function () {
const DEFAULT_LAT = 40.2074194;
const DEFAULT_LNG = 44.4782661;
const DEFAULT_ZOOM = 17;
const DEFAULT_PLACE_ID = '0x406aa2da86294267:0x3ebd491e4e41f40';
const DEFAULT_PLACE_NAME = '6+Margaryan+St,+Yerevan+0078,+Armenia';

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
          .then((data) => data?.embedUrl || mapEmbedUrl(h))
          .catch(() => mapEmbedUrl(h))
      };
    }
    return embedUrlPromise.promise;
  }

  /** Map centered on clinic coords — valid embed, no Google place card. */
  function viewEmbedUrl(h) {
    const c = coords(h);
    const q = `${c.lat},${c.lng}`;
    return (
      'https://maps.google.com/maps' +
      `?q=${encodeURIComponent(q)}` +
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

  function infoWindowHtml(h) {
    return (
      `<div class="hss-gmap-info">` +
      `<strong>${escHtml(clinicTitle(h))}</strong>` +
      `<span>${escHtml(clinicAddress(h))}</span>` +
      `</div>`
    );
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
    const safeEmbed = String(embed || mapEmbedUrl(h)).replace(/"/g, '&quot;');
    container.innerHTML =
      `<div class="hss-map__wrap">` +
      `<iframe class="hss-map__iframe" title="${escHtml(title)}" src="${safeEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen style="border:0;width:100%;height:100%"></iframe>` +
      `</div>`;
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

  function initGoogleMap(container, h, isFooter) {
    const c = coords(h);
    const canvas = container.querySelector('.hss-map__canvas');
    if (!canvas || !window.google?.maps) return false;

    const map = new google.maps.Map(canvas, {
      center: { lat: c.lat, lng: c.lng },
      zoom: c.zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    new google.maps.Marker({
      position: { lat: c.lat, lng: c.lng },
      map,
      title: clinicTitle(h)
    });

    return true;
  }

  function renderJsApi(container, h, key, isFooter) {
    const title = mapTitle();
    applyMapContainerClass(container, isFooter);
    container.innerHTML =
      `<div class="hss-map__wrap"><div class="hss-map__canvas" role="application" aria-label="${escHtml(title)}"></div></div>`;

    loadGoogleMaps(key, () => {
      if (!initGoogleMap(container, h, isFooter)) {
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
