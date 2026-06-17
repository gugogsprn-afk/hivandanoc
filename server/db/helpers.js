const bcrypt = require('bcryptjs');
const { getDb } = require('./index');

const LANGS = ['hy', 'ru', 'en'];

function pick(row, field, lang) {
  if (!row) return '';
  const v = row[`${field}_${lang}`];
  if (v) return v;
  for (const l of LANGS) {
    if (row[`${field}_${l}`]) return row[`${field}_${l}`];
  }
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

function getPageFieldsMap(lang = 'hy') {
  const rows = getDb()
    .prepare('SELECT page_key, field_key, value, value_type FROM page_fields WHERE lang = ?')
    .all(lang);
  const out = {};
  for (const r of rows) {
    if (!out[r.page_key]) out[r.page_key] = {};
    out[r.page_key][r.field_key] = r.value;
    if (r.value_type && r.value_type !== 'text') out[r.page_key][`${r.field_key}__type`] = r.value_type;
  }
  return out;
}

function buildPublicContent(lang = 'hy') {
  const db = getDb();
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
        category: s.category_id,
        name: pick(s, 'title', lang),
        icon: s.icon || '🩺',
        description: pick(s, 'description', lang),
        services: items.map((item) =>
          typeof item === 'string' ? item : pick(item, 'name', lang) || item.name_ru || item.name
        ),
        price: s.price,
        duration: s.duration,
        doctorId: s.doctor_id,
        image: s.image_url
      };
    });

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
      experience: d.experience,
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
      name: hospital.name?.[lang] || hospital.name?.hy || '',
      shortName: hospital.shortName?.[lang] || hospital.shortName?.hy || '',
      tagline: hospital.tagline?.[lang] || hospital.tagline?.hy || '',
      heroTagline: hospital.heroTagline?.[lang] || hospital.heroTagline?.hy || '',
      logo: hospital.logo || 'images/brand/logo.png',
      phone: hospital.phone || '',
      emergency: hospital.emergency || '103',
      email: hospital.email || '',
      address: hospital.address?.[lang] || hospital.address?.hy || '',
      hours: hospital.hours?.[lang] || hospital.hours?.hy || '',
      social: hospital.social || {},
      about: hospital.about?.[lang] || hospital.about?.hy || '',
      mission: hospital.mission?.[lang] || hospital.mission?.hy || '',
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
    nav: getSetting('nav', null),
    footer: getSetting('footer', null),
    i18nOverrides: getSetting('i18n_overrides', {}),
    pageFields,
    ...extra
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
