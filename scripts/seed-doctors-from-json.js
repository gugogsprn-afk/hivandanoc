#!/usr/bin/env node
/** Import doctors from data/hospital.json into CMS SQLite and publish. */
require('dotenv').config();
const data = require('../data/hospital.json');
const { initDb, getDb } = require('../server/db');
const { schedulePublish } = require('../server/services/content-publish');
const fs = require('fs');
const path = require('path');

const LANGS = ['hy', 'ru', 'en'];
function loadLang(code) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', `${code}.json`), 'utf8')).content || {};
}
const hy = loadLang('hy');
const ru = loadLang('ru');
const en = loadLang('en');
const hyDoc = new Map((hy.doctors || []).map((d) => [d.id, d]));
const ruDoc = new Map((ru.doctors || []).map((d) => [d.id, d]));
const enDoc = new Map((en.doctors || []).map((d) => [d.id, d]));

initDb();
const db = getDb();
const ids = (data.doctors || []).map((d) => d.id);
if (ids.length) {
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM doctors WHERE id NOT IN (${placeholders})`).run(...ids);
} else {
  db.prepare('DELETE FROM doctors').run();
}

const docStmt = db.prepare(
  `INSERT OR REPLACE INTO doctors (
    id, slug, name_hy, name_ru, name_en, role_hy, role_ru, role_en,
    department_id, location_hy, location_ru, location_en, is_surgeon, experience,
    image_url, bio_hy, bio_ru, bio_en, sort_order, published
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
);

(data.doctors || []).forEach((d, i) => {
  const h = hyDoc.get(d.id) || d;
  const r = ruDoc.get(d.id) || h;
  const e = enDoc.get(d.id) || h;
  docStmt.run(
    d.id,
    d.id,
    h.name || d.name,
    r.name || h.name || d.name,
    e.name || h.name || d.name,
    h.role || d.role,
    r.role || h.role || d.role,
    e.role || h.role || d.role,
    d.departmentId,
    d.location || '',
    d.location || '',
    d.location || '',
    d.isSurgeon ? 1 : 0,
    d.experience || '',
    d.image || '',
    h.bio || d.bio || '',
    r.bio || h.bio || d.bio || '',
    e.bio || h.bio || d.bio || '',
    i
  );
});

schedulePublish();
console.log(`[cms:seed-doctors] Imported ${data.doctors.length} doctors and published.`);
