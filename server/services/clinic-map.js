const DEFAULT_LAT = 40.2074194;
const DEFAULT_LNG = 44.4782661;
const DEFAULT_ZOOM = 17;
const DEFAULT_PLACE_ID = '0x406aa2da86294267:0x3ebd491e4e41f40';
const DEFAULT_PLACE_NAME = '6+Margaryan+St,+Yerevan+0078,+Armenia';

function clinicCoords(hospital) {
  const h = hospital || {};
  return {
    lat: Number(h.mapLat ?? h.latitude ?? DEFAULT_LAT),
    lng: Number(h.mapLng ?? h.longitude ?? DEFAULT_LNG),
    zoom: Number(h.mapZoom ?? DEFAULT_ZOOM)
  };
}

/** Map centered on coordinates — no Google POI marker (custom overlay pin instead). */
function viewEmbedUrl(h) {
  const { lat, lng, zoom } = clinicCoords(h);
  return (
    'https://maps.google.com/maps' +
    `?ll=${encodeURIComponent(`${lat},${lng}`)}` +
    `&z=${zoom}&hl=ru&output=embed`
  );
}

function placePbEmbedUrl(hospital) {
  return viewEmbedUrl(hospital);
}

function buildMapEmbedUrl(hospital, apiKey) {
  const { lat, lng, zoom } = clinicCoords(hospital);
  if (apiKey) {
    return (
      'https://www.google.com/maps/embed/v1/view' +
      `?key=${encodeURIComponent(apiKey)}` +
      `&center=${encodeURIComponent(`${lat},${lng}`)}` +
      `&zoom=${zoom}&language=ru`
    );
  }
  return viewEmbedUrl(hospital);
}

function isBrokenMapsEmbed(url) {
  if (typeof url !== 'string') return false;
  if (url.includes('!1m3!2m1!1s')) return true;
  if (url.includes('/embed') && url.includes('!1s')) return true;
  try {
    const u = new URL(url);
    const q = u.searchParams.get('q');
    return !!q && !u.searchParams.has('ll') && /^-?\d/.test(q.trim());
  } catch {
    return false;
  }
}

module.exports = {
  DEFAULT_LAT,
  DEFAULT_LNG,
  DEFAULT_ZOOM,
  DEFAULT_PLACE_ID,
  clinicCoords,
  placePbEmbedUrl,
  buildMapEmbedUrl,
  isBrokenMapsEmbed
};
