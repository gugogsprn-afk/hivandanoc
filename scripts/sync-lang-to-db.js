#!/usr/bin/env node
/**
 * Sync HY/RU/EN translations from lang/*.json into CMS SQLite tables.
 * Fixes services/doctors/categories stored with Russian in all language columns.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDb, getDb } = require('../server/db');
const { getSetting, setSetting } = require('../server/db/helpers');
const { schedulePublish } = require('../server/services/content-publish');

const ROOT = path.join(__dirname, '..');
const LANGS = ['hy', 'ru', 'en'];

function loadContent(lang) {
  const file = path.join(ROOT, 'lang', `${lang}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8')).content || {};
}

function loadLang(lang) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', `${lang}.json`), 'utf8'));
}

function fromLangs(getter) {
  const out = {};
  for (const code of LANGS) {
    out[code] = getter(loadLang(code)) || '';
  }
  return out;
}

function zipServiceItems(hyList, ruList, enList) {
  const max = Math.max(hyList.length, ruList.length, enList.length, 0);
  const items = [];
  for (let i = 0; i < max; i++) {
    items.push({
      name_hy: hyList[i] || '',
      name_ru: ruList[i] || hyList[i] || '',
      name_en: enList[i] || hyList[i] || ''
    });
  }
  return items;
}

function run() {
  initDb();
  const db = getDb();
  const hy = loadContent('hy');
  const ru = loadContent('ru');
  const en = loadContent('en');

  const hyDept = new Map((hy.departments || []).map((d) => [d.id, d]));
  const ruDept = new Map((ru.departments || []).map((d) => [d.id, d]));
  const enDept = new Map((en.departments || []).map((d) => [d.id, d]));

  const svcUpd = db.prepare(
    `UPDATE services SET
      title_hy = ?, title_ru = ?, title_en = ?,
      description_hy = ?, description_ru = ?, description_en = ?,
      items_json = ?
     WHERE id = ?`
  );

  let servicesUpdated = 0;
  for (const [id, h] of hyDept) {
    const r = ruDept.get(id);
    const e = enDept.get(id);
    const items = zipServiceItems(h.services || [], r?.services || [], e?.services || []);
    const res = svcUpd.run(
      h.name || '',
      r?.name || h.name || '',
      e?.name || h.name || '',
      h.description || '',
      r?.description || '',
      e?.description || '',
      JSON.stringify(items),
      id
    );
    if (res.changes) servicesUpdated++;
  }

  const catUpd = db.prepare(
    `UPDATE service_categories SET name_hy = ?, name_ru = ?, name_en = ? WHERE id = ?`
  );
  let catsUpdated = 0;
  (hy.serviceCategories || []).forEach((c) => {
    const r = (ru.serviceCategories || []).find((x) => x.id === c.id);
    const e = (en.serviceCategories || []).find((x) => x.id === c.id);
    const res = catUpd.run(c.name || '', r?.name || c.name || '', e?.name || c.name || '', c.id);
    if (res.changes) catsUpdated++;
  });

  const hyDoc = new Map((hy.doctors || []).map((d) => [d.id, d]));
  const ruDoc = new Map((ru.doctors || []).map((d) => [d.id, d]));
  const enDoc = new Map((en.doctors || []).map((d) => [d.id, d]));

  const docUpd = db.prepare(
    `UPDATE doctors SET
      name_hy = ?, name_ru = ?, name_en = ?,
      role_hy = ?, role_ru = ?, role_en = ?,
      location_hy = ?, location_ru = ?, location_en = ?,
      bio_hy = ?, bio_ru = ?, bio_en = ?
     WHERE id = ?`
  );
  let docsUpdated = 0;
  for (const [id, h] of hyDoc) {
    const r = ruDoc.get(id);
    const e = enDoc.get(id);
    const res = docUpd.run(
      h.name || '',
      r?.name || h.name || '',
      e?.name || h.name || '',
      h.role || '',
      r?.role || '',
      e?.role || '',
      h.location || '',
      r?.location || '',
      e?.location || '',
      h.bio || '',
      r?.bio || '',
      e?.bio || '',
      id
    );
    if (res.changes) docsUpdated++;
  }

  const hospitalBase = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'hospital.json'), 'utf8')
  ).hospital || {};

  const global = getSetting('global', {});
  const h = global.hospital || {};
  global.hospital = {
    ...h,
    mapsQuery: hospitalBase.mapsQuery || h.mapsQuery || '',
    mapsEmbed: hospitalBase.mapsEmbed || h.mapsEmbed || '',
    mapLat: hospitalBase.mapLat ?? h.mapLat ?? null,
    mapLng: hospitalBase.mapLng ?? h.mapLng ?? null,
    name: fromLangs((j) => j.content?.hospital?.name),
    shortName: fromLangs((j) => j.content?.hospital?.shortName || j.content?.hospital?.name),
    tagline: fromLangs((j) => j.content?.hospital?.tagline),
    heroTagline: fromLangs(
      (j) => j.content?.hospital?.heroTagline || j.pages?.home?.heroSubtitle
    ),
    address: fromLangs((j) => j.content?.hospital?.address),
    hours: fromLangs((j) => j.content?.hospital?.hours),
    about: fromLangs((j) => j.content?.hospital?.about),
    mission: fromLangs((j) => j.content?.hospital?.mission)
  };
  setSetting('global', global);

  const heroRow = db
    .prepare('SELECT content_json FROM page_sections WHERE page_key = ? AND section_key = ?')
    .get('home', 'hero');
  let hero = {};
  try {
    hero = JSON.parse(heroRow?.content_json || '{}');
  } catch {
    hero = {};
  }
  hero.title = fromLangs((j) => j.content?.hospital?.name);
  hero.subtitle = fromLangs(
    (j) => j.pages?.home?.heroSubtitle || j.content?.hospital?.heroTagline || j.content?.hospital?.tagline
  );
  hero.ctaText = fromLangs((j) => j.common?.bookAppointment);
  if (!hero.image) {
    hero.image =
      h.heroImage ||
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=85';
  }
  if (!hero.ctaLink) hero.ctaLink = 'appointment.html';
  db.prepare(
    `INSERT INTO page_sections (page_key, section_key, enabled, sort_order, content_json, updated_at)
     VALUES ('home', 'hero', 1, 0, ?, datetime('now'))
     ON CONFLICT(page_key, section_key) DO UPDATE SET
       content_json = excluded.content_json,
       updated_at = datetime('now')`
  ).run(JSON.stringify(hero));

  schedulePublish(500);
  console.log(
    `[cms:sync-lang] Updated ${servicesUpdated} services, ${catsUpdated} categories, ${docsUpdated} doctors, global settings + hero`
  );
}

run();
