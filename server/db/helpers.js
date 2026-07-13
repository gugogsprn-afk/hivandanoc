const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getDb } = require('./index');
const { normalizeCategoryId } = require('../services/service-catalog');

const LANGS = ['hy', 'ru', 'en'];
const HOSPITAL_JSON = path.join(__dirname, '../../data/hospital.json');

function pick(row, field, lang) {
  if (!row) return '';
  const direct = row[`${field}_${lang}`];
  if (direct) return direct;
  if (lang !== 'ru') {
    const en = row[`${field}_en`];
    if (en) return en;
  }
  return '';
}

const ARMENIAN_SCRIPT = /[\u0531-\u0556\u0561-\u0587]/;

function isUsableForLang(text, lang) {
  if (!text || typeof text !== 'string') return false;
  if (lang === 'hy') return true;
  // RU/EN slots must not serve Armenian copy left over from bad syncs
  return !ARMENIAN_SCRIPT.test(text);
}

/** Triplet object { hy, ru, en } — same language only, then English (never HY for RU/EN). */
function pickTriplet(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  const primary = obj[lang];
  if (isUsableForLang(primary, lang)) return primary;
  if (lang === 'hy') return obj.en || obj.ru || '';
  if (isUsableForLang(obj.en, 'en')) return obj.en;
  if (lang === 'ru' && isUsableForLang(obj.ru, 'ru')) return obj.ru;
  return '';
}

function triplet(value) {
  const v = value || '';
  return { hy: v, ru: v, en: v };
}

function logActivity(userId, action, entityType, entityId, meta, ip) {
  getDb()
    .prepare(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, meta_json, ip)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, action, entityType, entityId, meta ? JSON.stringify(meta) : null, ip || null);
}

function getSetting(key, fallback = null) {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

function setSetting(key, value) {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
    .run(key, JSON.stringify(value));
}

function upsertPageFields(pageKey, items) {
  const stmt = getDb().prepare(
    `INSERT INTO page_fields (page_key, field_key, lang, value, value_type, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(page_key, field_key, lang) DO UPDATE SET
       value = excluded.value,
       value_type = excluded.value_type,
       updated_at = datetime('now')`
  );
  const run = getDb().transaction((list) => {
    for (const f of list) {
      stmt.run(pageKey, f.field_key, f.lang, f.value, f.value_type || 'text');
    }
  });
  run(items);
}

function getPageFieldsForPage(pageKey) {
  const rows = getDb()
    .prepare('SELECT field_key, lang, value, value_type FROM page_fields WHERE page_key = ?')
    .all(pageKey);
  const out = {};
  for (const r of rows) {
    if (!out[r.field_key]) out[r.field_key] = { _type: r.value_type };
    out[r.field_key][r.lang] = r.value;
    out[r.field_key]._type = r.value_type;
  }
  return out;
}

function inferPageFieldValueType(value, valueType = 'text') {
  let type = valueType === 'image' || valueType === 'video' ? valueType : 'text';
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(value || '')) return 'video';
  if (type === 'text' && /\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(value || '')) return 'image';
  return type;
}

function isSharedMediaFieldValue(value, valueType) {
  const type = inferPageFieldValueType(value, valueType);
  if (type === 'video' || type === 'image') return true;
  return /^(\/api\/v1\/media\/|https?:\/\/|images\/)/i.test(value || '');
}

function getPageFieldsMap(lang = 'hy') {
  const rows = getDb()
    .prepare('SELECT page_key, field_key, lang, value, value_type FROM page_fields')
    .all();
  const grouped = {};
  for (const r of rows) {
    const k = `${r.page_key}\0${r.field_key}`;
    if (!grouped[k]) {
      grouped[k] = { page_key: r.page_key, field_key: r.field_key, langs: {}, types: {} };
    }
    grouped[k].langs[r.lang] = r.value;
    grouped[k].types[r.lang] = r.value_type;
  }

  const out = {};

  for (const entry of Object.values(grouped)) {
    const { page_key, field_key, langs, types } = entry;
    let value = Object.prototype.hasOwnProperty.call(langs, lang) ? langs[lang] : undefined;
    let valueType = types[lang] || 'text';
    const sharedMedia = Object.keys(langs).some((code) =>
      isSharedMediaFieldValue(langs[code], types[code])
    );

    // Text: never fall back across languages (prevents Russian on HY / Armenian on RU).
    // Media URLs may be shared across locales when the active lang has no override.
    if (value === undefined || value === null || value === '') {
      if (sharedMedia) {
        for (const code of [lang, 'hy', 'ru', 'en']) {
          if (langs[code] && isSharedMediaFieldValue(langs[code], types[code])) {
            value = langs[code];
            valueType = types[code] || valueType;
            break;
          }
        }
      } else if (value === '') {
        // Explicit empty string for this lang — keep it so CMS clear works
        value = '';
      } else {
        continue;
      }
    }

    if (!out[page_key]) out[page_key] = {};
    out[page_key][field_key] = value;
    valueType = inferPageFieldValueType(value, valueType);
    if (sharedMedia || valueType !== 'text') {
      out[page_key][`${field_key}__type`] = valueType;
    }
  }
  return out;
}

function buildPublicContent(lang = 'hy') {
  const db = getDb();
  try {
    db.pragma('wal_checkpoint(PASSIVE)');
  } catch {
    /* ignore */
  }
  const settings = getSetting('global', {});
  const hospital = settings.hospital || {};

  const categories = db
    .prepare('SELECT * FROM service_categories WHERE published = 1 ORDER BY sort_order, id')
    .all()
    .map((c) => ({ id: c.id, name: pick(c, 'name', lang) }));

  const services = db
    .prepare('SELECT * FROM services WHERE published = 1 ORDER BY sort_order, id')
    .all()
    .map((s) => {
      let items = [];
      try {
        items = JSON.parse(s.items_json || '[]');
      } catch {
        items = [];
      }
      return {
        id: s.id,
        category: normalizeCategoryId(s.category_id),
        category_id: s.category_id,
        name: pick(s, 'title', lang),
        icon: s.icon || '🩺',
        description: pick(s, 'description', lang),
        services: items.map((item) => {
          if (typeof item === 'string') return item;
          const localized = pick(item, 'name', lang);
          if (localized) return localized;
          return lang === 'ru' ? item.name || '' : '';
        }),
        price: s.price,
        duration: s.duration,
        doctorId: s.doctor_id,
        image: s.image_url
      };
    });

  if (lang === 'hy' && fs.existsSync(HOSPITAL_JSON)) {
    try {
      const hospitalFile = JSON.parse(fs.readFileSync(HOSPITAL_JSON, 'utf8'));
      const byId = new Map((hospitalFile.departments || []).map((d) => [d.id, d]));
      for (let i = 0; i < services.length; i++) {
        const src = byId.get(services[i].id);
        if (!src) continue;
        if (src.name) services[i].name = src.name;
        if (src.description) services[i].description = src.description;
        if (Array.isArray(src.services) && src.services.length) services[i].services = src.services;
      }
    } catch {
      /* keep CMS values */
    }
  }

  if (lang === 'hy') {
    try {
      const { hyNames, hyDetails } = require('../../scripts/lib/dept-translations');
      for (let i = 0; i < services.length; i++) {
        const id = services[i].id;
        if (hyNames[id]) services[i].name = hyNames[id];
        const det = hyDetails[id];
        if (det?.description) services[i].description = det.description;
        if (det?.services?.length) services[i].services = det.services;
      }
    } catch {
      /* ignore */
    }
  }

  const doctors = db
    .prepare('SELECT * FROM doctors WHERE published = 1 ORDER BY sort_order, id')
    .all()
    .map((d) => ({
      id: d.id,
      slug: d.slug,
      name: pick(d, 'name', lang),
      role: pick(d, 'role', lang),
      departmentId: d.department_id,
      location: pick(d, 'location', lang),
      isSurgeon: !!d.is_surgeon,
      experience: pick(d, 'experience', lang) || d.experience,
      image: d.image_url,
      bio: pick(d, 'bio', lang),
      education: pick(d, 'education', lang),
      languages: pick(d, 'languages', lang)
    }));

  const sections = db
    .prepare('SELECT * FROM page_sections WHERE page_key = ? AND enabled = 1 ORDER BY sort_order')
    .all('home');

  const homeSections = {};
  for (const sec of sections) {
    try {
      homeSections[sec.section_key] = JSON.parse(sec.content_json || '{}');
    } catch {
      homeSections[sec.section_key] = {};
    }
  }

  const testimonials = db
    .prepare('SELECT * FROM testimonials WHERE published = 1 ORDER BY sort_order')
    .all()
    .map((t) => ({
      name: pick(t, 'name', lang),
      text: pick(t, 'text', lang),
      image: t.image_url,
      rating: t.rating
    }));

  const extra = getSetting('content_extra', {});
  const pageFields = getPageFieldsMap(lang);

  return {
    hospital: {
      name: pickTriplet(hospital.name, lang),
      shortName: pickTriplet(hospital.shortName, lang),
      tagline: pickTriplet(hospital.tagline, lang),
      heroTagline: pickTriplet(hospital.heroTagline, lang),
      logo: hospital.logo || 'images/brand/logo.png',
      phone: hospital.phone || '',
      emergency: hospital.emergency || '103',
      email: hospital.email || '',
      address: pickTriplet(hospital.address, lang),
      mapsQuery: hospital.mapsQuery || '',
      mapsEmbed: hospital.mapsEmbed || '',
      mapPlaceId: hospital.mapPlaceId || '',
      mapLat: hospital.mapLat ?? null,
      mapLng: hospital.mapLng ?? null,
      hours: pickTriplet(hospital.hours, lang),
      social: hospital.social || {},
      about: pickTriplet(hospital.about, lang),
      mission: pickTriplet(hospital.mission, lang),
      heroImage: hospital.heroImage || '',
      aboutImage: hospital.aboutImage || '',
      stats: hospital.stats || []
    },
    serviceCategories: categories,
    departments: services,
    doctors,
    testimonials,
    homeSections,
    seo: getSetting('seo', {}),
    site: getSetting('site', {}),
    nav: getSetting('nav', null),
    footer: getSetting('footer', null),
    i18nOverrides: getSetting('i18n_overrides', {}),
    ...extra,
    pageFields
  };
}

function dashboardStats() {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const totalLeads = db.prepare('SELECT COUNT(*) AS c FROM leads').get().c;
  const newAppointments = db
    .prepare("SELECT COUNT(*) AS c FROM leads WHERE type = 'appointment' AND status = 'new'")
    .get().c;
  const todayAppointments = db
    .prepare("SELECT COUNT(*) AS c FROM leads WHERE type = 'appointment' AND preferred_date = ?")
    .get(today).c;
  const newContacts = db
    .prepare("SELECT COUNT(*) AS c FROM contact_messages WHERE status = 'new'")
    .get().c;

  const recentLeads = db
    .prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 8')
    .all();
  const recentContacts = db
    .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5')
    .all();

  return {
    totalLeads,
    newAppointments,
    todayAppointments,
    newContacts,
    recentLeads,
    recentContacts
  };
}

module.exports = {
  LANGS,
  pick,
  triplet,
  logActivity,
  getSetting,
  setSetting,
  buildPublicContent,
  dashboardStats,
  getPageFieldsForPage,
  getPageFieldsMap,
  upsertPageFields
};
