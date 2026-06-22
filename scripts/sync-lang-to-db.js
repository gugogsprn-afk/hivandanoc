#!/usr/bin/env node
/**
 * Sync HY/RU/EN translations from lang/*.json into CMS SQLite tables.
 * Fixes services/doctors/categories stored with Russian in all language columns.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDb, getDb } = require('../server/db');
const { schedulePublish } = require('../server/services/content-publish');

const ROOT = path.join(__dirname, '..');

function loadContent(lang) {
  const file = path.join(ROOT, 'lang', `${lang}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8')).content || {};
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

  schedulePublish(500);
  console.log(
    `[cms:sync-lang] Updated ${servicesUpdated} services, ${catsUpdated} categories, ${docsUpdated} doctors`
  );
}

run();
