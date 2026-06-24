const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initDb, getDb } = require('./index');
const { setSetting, triplet } = require('./helpers');

const HOSPITAL_JSON = path.join(__dirname, '../../data/hospital.json');

function seedUsers() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return;

  const email = process.env.CMS_ADMIN_EMAIL || 'admin@healthyspinedoc.com';
  const password = process.env.CMS_ADMIN_PASSWORD || 'ChangeMe2026!';
  const hash = bcrypt.hashSync(password, 12);

  db.prepare(
    `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`
  ).run(email.trim().toLowerCase(), hash, 'Super Admin', 'super_admin');

  console.log(`[cms:seed] Default admin: ${email}`);
  console.log('[cms:seed] Change CMS_ADMIN_PASSWORD in .env immediately!');
}

/** Create or update staff accounts from .env (SMM, etc.) — safe to run on every startup. */
function ensureStaffUsers() {
  const db = getDb();
  const accounts = [
    {
      email: process.env.CMS_SMM_EMAIL,
      password: process.env.CMS_SMM_PASSWORD,
      name: process.env.CMS_SMM_NAME || 'SMM Specialist',
      role: 'manager'
    },
    {
      email: process.env.CMS_ADMIN_EMAIL,
      password: process.env.CMS_ADMIN_PASSWORD,
      name: 'Super Admin',
      role: 'super_admin'
    }
  ];

  let updated = 0;

  for (const acc of accounts) {
    if (!acc.email || !acc.password) continue;
    const email = String(acc.email).trim().toLowerCase();
    const hash = bcrypt.hashSync(acc.password, 12);
    const existing = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email);
    if (existing) {
      const passwordMatches = bcrypt.compareSync(acc.password, existing.password_hash);
      if (passwordMatches) {
        db.prepare('UPDATE users SET name = ?, role = ? WHERE email = ?').run(acc.name, acc.role, email);
      } else {
        db.prepare(
          'UPDATE users SET password_hash = ?, name = ?, role = ? WHERE email = ?'
        ).run(hash, acc.name, acc.role, email);
        console.log(`[cms] Staff password updated from .env: ${email}`);
      }
      console.log(`[cms] Staff user updated: ${email} (${acc.role})`);
    } else {
      db.prepare(
        `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`
      ).run(email, hash, acc.name, acc.role);
      console.log(`[cms] Staff user created: ${email} (${acc.role})`);
    }
    updated += 1;
  }

  if (!process.env.CMS_SMM_EMAIL || !process.env.CMS_SMM_PASSWORD) {
    console.warn('[cms] CMS_SMM_EMAIL / CMS_SMM_PASSWORD not set — SMM login will not work');
  }

  return updated;
}

function seedFromHospitalJson() {
  if (!fs.existsSync(HOSPITAL_JSON)) {
    console.warn('[cms:seed] hospital.json not found, skipping content seed');
    return;
  }

  const data = JSON.parse(fs.readFileSync(HOSPITAL_JSON, 'utf8'));
  const db = getDb();
  const h = data.hospital || {};

  setSetting('global', {
    hospital: {
      name: triplet(h.name),
      shortName: triplet(h.shortName),
      tagline: triplet(h.tagline),
      heroTagline: triplet(h.heroTagline),
      logo: h.logo,
      phone: h.phone,
      emergency: h.emergency,
      email: h.email,
      address: triplet(h.address),
      mapsQuery: h.mapsQuery || '',
      mapsEmbed: h.mapsEmbed || '',
      mapLat: h.mapLat ?? null,
      mapLng: h.mapLng ?? null,
      hours: triplet(h.hours),
      social: h.social || {},
      about: triplet(h.about),
      mission: triplet(h.mission),
      heroImage: h.heroImage,
      aboutImage: h.aboutImage,
      stats: h.stats || []
    }
  });

  setSetting('seo', {
    defaultTitle: triplet(h.name),
    defaultDescription: triplet(h.tagline)
  });

  setSetting('content_extra', {
    trustPoints: data.trustPoints || [],
    conditions: data.conditions || [],
    equipment: data.equipment || [],
    programs: data.programs || [],
    advantages: data.advantages || [],
    introParagraphs: data.introParagraphs || [],
    feature: data.feature || {},
    approachParagraphs: data.approachParagraphs || [],
    expertsParagraphs: data.expertsParagraphs || [],
    imagingParagraphs: data.imagingParagraphs || [],
    news: data.news || [],
    storyVideos: data.storyVideos || [],
    patientStories: data.patientStories || [],
    patientHero: data.patientHero || {},
    backInGame: data.backInGame || {},
    expertiseOverlay: data.expertiseOverlay || {},
    awards: data.awards || [],
    reviews: data.reviews || [],
    moveBetter: data.moveBetter || {},
    timeSlots: data.timeSlots || []
  });

  const catStmt = db.prepare(
    `INSERT OR IGNORE INTO service_categories (id, name_hy, name_ru, name_en, sort_order)
     VALUES (?, ?, ?, ?, ?)`
  );
  (data.serviceCategories || []).forEach((c, i) => {
    catStmt.run(c.id, c.name, c.name, c.name, i);
  });

  const svcStmt = db.prepare(
    `INSERT OR REPLACE INTO services (
      id, category_id, title_hy, title_ru, title_en, description_hy, description_ru, description_en,
      icon, items_json, sort_order, published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  );
  (data.departments || []).forEach((d, i) => {
    svcStmt.run(
      d.id,
      d.category,
      d.name,
      d.name,
      d.name,
      d.description,
      d.description,
      d.description,
      d.icon || '🩺',
      JSON.stringify(d.services || []),
      i
    );
  });

  const docStmt = db.prepare(
    `INSERT OR REPLACE INTO doctors (
      id, slug, name_hy, name_ru, name_en, role_hy, role_ru, role_en,
      department_id, location_hy, location_ru, location_en, is_surgeon, experience,
      image_url, bio_hy, bio_ru, bio_en, sort_order, published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  );
  (data.doctors || []).forEach((d, i) => {
    docStmt.run(
      d.id,
      d.id,
      d.name,
      d.name,
      d.name,
      d.role,
      d.role,
      d.role,
      d.departmentId,
      d.location,
      d.location,
      d.location,
      d.isSurgeon ? 1 : 0,
      d.experience,
      d.image,
      d.bio,
      d.bio,
      d.bio,
      i
    );
  });

  const homeSections = [
    { key: 'hero', order: 0, content: { title: triplet(h.name), subtitle: triplet(h.heroTagline || h.tagline), image: h.heroImage, ctaText: triplet('Book appointment'), ctaLink: 'appointment.html' } },
    { key: 'search', order: 1, content: { enabled: true } },
    { key: 'info_cards', order: 2, content: { stats: h.stats || [] } },
    { key: 'about', order: 3, content: { title: triplet('About'), text: triplet(h.about), image: h.aboutImage } },
    { key: 'video', order: 4, content: { videos: data.storyVideos || [] } },
    { key: 'services_highlight', order: 5, content: { title: triplet('Services') } },
    { key: 'doctors', order: 6, content: { title: triplet('Our team'), limit: 6 } },
    { key: 'testimonials', order: 7, content: { title: triplet('Reviews') } },
    { key: 'blog_preview', order: 8, content: { title: triplet('News'), limit: 3 } },
    { key: 'cta', order: 9, content: { title: triplet('Book a consultation'), link: 'appointment.html' } },
    { key: 'footer_cta', order: 10, content: { phone: h.phone } }
  ];

  const secStmt = db.prepare(
    `INSERT OR REPLACE INTO page_sections (page_key, section_key, enabled, sort_order, content_json, updated_at)
     VALUES ('home', ?, 1, ?, ?, datetime('now'))`
  );
  homeSections.forEach((s) => {
    secStmt.run(s.key, s.order, JSON.stringify(s.content));
  });

  (data.reviews || []).slice(0, 10).forEach((r, i) => {
    db.prepare(
      `INSERT OR IGNORE INTO testimonials (name_hy, name_ru, name_en, text_hy, text_ru, text_en, rating, sort_order, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(r.name || r.author, r.name, r.name, r.text || r.quote, r.text, r.text, r.rating || 5, i);
  });

  console.log('[cms:seed] Imported hospital.json into CMS database');
}

function seed() {
  initDb();
  seedUsers();
  ensureStaffUsers();
  const svcCount = getDb().prepare('SELECT COUNT(*) AS c FROM services').get().c;
  if (svcCount === 0) {
    seedFromHospitalJson();
  } else {
    console.log('[cms:seed] Content already present, skipping hospital.json import');
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, seedFromHospitalJson, seedUsers, ensureStaffUsers };
