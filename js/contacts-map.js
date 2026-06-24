/**
 * Contacts page map — Google Maps marker + InfoWindow (JS API) or iframe fallback.
 */
const ContactMap = (function () {
  const INFO_TITLE = 'Առողջ Ողնաշար';
  const INFO_ADDRESS = 'г. Ереван, ул. Примерная, д. 1';
  const DEFAULT_ZOOM = 17;

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function coords(h) {
    return {
      lat: Number(h?.mapLat ?? 40.2074194),
      lng: Number(h?.mapLng ?? 44.4782661)
    };
  }

  function directionsUrl(h) {
    if (typeof HospitalApp !== 'undefined' && HospitalApp.mapDirectionsUrl) {
      return HospitalApp.mapDirectionsUrl(h);
    }
    const c = coords(h);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.lat},${c.lng}`)}`;
  }

  /** iframe embed centered on clinic coordinates with zoom 17 (shows Google pin). */
  function iframeEmbedUrl(h) {
    if (h?.mapsEmbed) return h.mapsEmbed;
    const c = coords(h);
    const params = new URLSearchParams({
      q: `${c.lat},${c.lng}`,
      z: String(h?.mapZoom ?? DEFAULT_ZOOM),
      hl: 'ru',
      output: 'embed'
    });
    return `https://maps.google.com/maps?${params.toString()}`;
  }

  function infoWindowHtml() {
    return (
      `<div class="hss-gmap-info">` +
      `<strong>${escHtml(INFO_TITLE)}</strong>` +
      `<span>${escHtml(INFO_ADDRESS)}</span>` +
      `</div>`
    );
  }

  function setContactLinks(h) {
    const directions = directionsUrl(h);
    const addrEl = document.getElementById('contact-map-address');
    if (addrEl) addrEl.textContent = INFO_ADDRESS;
    const dirEl = document.getElementById('contact-map-directions');
    if (dirEl) dirEl.href = directions;
  }

  function renderIframe(container, h) {
    const title =
      typeof I18n !== 'undefined' ? I18n.t('footer.mapTitle') : 'Clinic location';
    const embed = iframeEmbedUrl(h);

    container.className = 'hss-map hss-map--embed reveal';
    container.innerHTML =
      `<div class="hss-map__wrap">` +
      `<iframe class="hss-map__iframe" title="${escHtml(title)}" src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>` +
      `<button type="button" class="hss-map__marker-hit" aria-label="${escHtml(INFO_TITLE)}"></button>` +
      `<div class="hss-map__infowindow" hidden>` +
      `<div class="hss-map__infowindow-body">${infoWindowHtml()}</div>` +
      `<button type="button" class="hss-map__infowindow-close" aria-label="Close">&times;</button>` +
      `</div>` +
      `</div>`;

    const hit = container.querySelector('.hss-map__marker-hit');
    const popup = container.querySelector('.hss-map__infowindow');
    const closeBtn = container.querySelector('.hss-map__infowindow-close');
    const openPopup = () => {
      if (popup) popup.hidden = false;
    };
    const closePopup = () => {
      if (popup) popup.hidden = true;
    };
    hit?.addEventListener('click', openPopup);
    closeBtn?.addEventListener('click', closePopup);
    setContactLinks(h);
  }

  function initGoogleMap(container, h) {
    const c = coords(h);
    const zoom = Number(h?.mapZoom ?? DEFAULT_ZOOM);
    const canvas = container.querySelector('.hss-map__canvas');
    if (!canvas || !window.google?.maps) return;

    const map = new google.maps.Map(canvas, {
      center: c,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    const marker = new google.maps.Marker({
      position: c,
      map,
      title: INFO_TITLE
    });

    const infoWindow = new google.maps.InfoWindow({ content: infoWindowHtml() });
    marker.addListener('click', () => {
      infoWindow.open({ anchor: marker, map });
    });

    map.addListener('click', () => infoWindow.close());
    setContactLinks(h);
  }

  function loadGoogleMaps(callback) {
    if (window.google?.maps) {
      callback();
      return;
    }
    const key = window.GOOGLE_MAPS_API_KEY;
    if (!key) {
      callback(new Error('no-key'));
      return;
    }
    const id = 'google-maps-js';
    if (document.getElementById(id)) {
      const existing = document.getElementById(id);
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

  function renderJsApi(container, h) {
    const title =
      typeof I18n !== 'undefined' ? I18n.t('footer.mapTitle') : 'Clinic location';
    container.className = 'hss-map hss-map--embed reveal';
    container.innerHTML = `<div class="hss-map__wrap"><div class="hss-map__canvas" role="application" aria-label="${escHtml(title)}"></div></div>`;

    loadGoogleMaps((err) => {
      if (err || !window.google?.maps) {
        renderIframe(container, h);
        return;
      }
      initGoogleMap(container, h);
    });
  }

  function render(container, h) {
    if (!container) return;
    const hospital = h || (typeof HospitalApp !== 'undefined' ? HospitalApp.getData()?.hospital : {}) || {};
    if (window.GOOGLE_MAPS_API_KEY) {
      renderJsApi(container, hospital);
    } else {
      renderIframe(container, hospital);
    }
  }

  return { render, INFO_TITLE, INFO_ADDRESS, DEFAULT_ZOOM };
})();
