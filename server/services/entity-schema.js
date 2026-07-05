/**
 * Shared local entity / JSON-LD builders for SSR pages.
 * Uses CMS hospital data only — no fabricated NAP or social URLs.
 */
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');

/** P4.1 verified public profiles (Facebook + Instagram only). */
const VERIFIED_SOCIAL_URLS = [
  'https://www.facebook.com/profile.php?id=61586936099454',
  'https://www.instagram.com/healthyspine.clinic'
];

function clinicName(data) {
  return data?.hospital?.name || 'Առողջ ողնաշար';
}

function parseOpeningHoursSpecification(hoursText) {
  if (!hoursText) return [];
  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '20:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '15:00'
    }
  ];
}

function verifiedSameAs(hospital) {
  const social = hospital?.social || {};
  const fromCms = Object.values(social).filter((u) => typeof u === 'string' && u.startsWith('http') && u !== '#');
  const verified = fromCms.filter((url) =>
    VERIFIED_SOCIAL_URLS.some((v) => url === v || url.replace(/\/$/, '') === v)
  );
  return verified.length ? verified : [...VERIFIED_SOCIAL_URLS];
}

function entityGeo(hospital) {
  const lat = Number(hospital?.mapLat ?? hospital?.latitude);
  const lng = Number(hospital?.mapLng ?? hospital?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };
}

function entityLogoUrl(hospital) {
  const logoPath = hospital?.logo || 'images/brand/logo.png';
  if (String(logoPath).startsWith('http')) return logoPath;
  return `${BASE}/${String(logoPath).replace(/^\//, '')}`;
}

function baseEntityFields(data, pageUrl) {
  const h = data?.hospital || {};
  const logo = entityLogoUrl(h);
  const fields = {
    name: clinicName(data),
    url: pageUrl,
    telephone: h.phone || '',
    email: h.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: h.address || 'Yerevan',
      addressLocality: 'Yerevan',
      addressCountry: 'AM'
    },
    logo,
    image: logo
  };

  const geo = entityGeo(h);
  if (geo) fields.geo = geo;

  const sameAs = verifiedSameAs(h);
  if (sameAs.length) fields.sameAs = sameAs;

  const openingHoursSpecification = parseOpeningHoursSpecification(h.hours);
  if (openingHoursSpecification.length) {
    fields.openingHoursSpecification = openingHoursSpecification;
  }

  return fields;
}

function clinicNode(data) {
  return {
    '@type': ['MedicalClinic', 'Organization'],
    ...baseEntityFields(data, `${BASE}/`)
  };
}

function localBusinessNode(data, pageUrl) {
  return {
    '@type': ['LocalBusiness', 'MedicalClinic'],
    ...baseEntityFields(data, pageUrl)
  };
}

function medicalClinicProvider(data) {
  const h = data?.hospital || {};
  return {
    '@type': 'MedicalClinic',
    name: clinicName(data),
    url: `${BASE}/`,
    telephone: h.phone || '',
    email: h.email || ''
  };
}

module.exports = {
  BASE,
  VERIFIED_SOCIAL_URLS,
  clinicName,
  clinicNode,
  localBusinessNode,
  medicalClinicProvider,
  verifiedSameAs,
  parseOpeningHoursSpecification,
  entityGeo,
  entityLogoUrl,
  baseEntityFields
};
