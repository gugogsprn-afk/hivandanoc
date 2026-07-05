#!/usr/bin/env node
/** Remove CMS test overrides from homepage hero (page_fields + page_sections). */
require('dotenv').config();
const { initDb, getDb } = require('../server/db');
const { getSetting } = require('../server/db/helpers');
const { publishAll } = require('../server/services/content-publish');

function tripletFromHospital(h, key, fallback) {
  const val = h[key];
  if (val && typeof val === 'object') {
    return {
      hy: val.hy || fallback,
      ru: val.ru || val.hy || fallback,
      en: val.en || val.hy || fallback
    };
  }
  const text = val || fallback;
  return { hy: text, ru: text, en: text };
}

initDb();
const db = getDb();
const h = getSetting('global', {}).hospital || {};

const removedFields = db
  .prepare(
    `DELETE FROM page_fields
     WHERE page_key = 'home'
       AND field_key IN ('hero-title', 'hero-subtitle')
       AND (value LIKE 'CMS_TEST_%' OR value LIKE 'CMS_test_%' OR value = '')`
  )
  .run();

const heroRow = db
  .prepare("SELECT content_json FROM page_sections WHERE page_key = 'home' AND section_key = 'hero'")
  .get();

let hero = {};
try {
  hero = JSON.parse(heroRow?.content_json || '{}');
} catch {
  hero = {};
}

const titleHy = hero.title?.hy || '';
const isTestTitle = /^CMS_test_/i.test(titleHy);
if (isTestTitle || !titleHy) {
  hero.title = tripletFromHospital(h, 'name', 'Առողջ ողնաշար');
  if (!hero.subtitle?.hy) {
    hero.subtitle = tripletFromHospital(h, 'heroTagline', tripletFromHospital(h, 'tagline', '').hy);
  }
  db.prepare(
    `INSERT INTO page_sections (page_key, section_key, enabled, sort_order, content_json, updated_at)
     VALUES ('home', 'hero', 1, 0, ?, datetime('now'))
     ON CONFLICT(page_key, section_key) DO UPDATE SET
       content_json = excluded.content_json,
       updated_at = datetime('now')`
  ).run(JSON.stringify(hero));
}

publishAll()
  .then(() => {
    console.log(`[restore-home-hero] Removed ${removedFields.changes} page_field override(s).`);
    if (isTestTitle || !titleHy) {
      console.log('[restore-home-hero] Restored homepage hero title:', hero.title.hy);
    }
    console.log('[restore-home-hero] Published. Live site: https://healthyspinedoc.com/');
  })
  .catch((err) => {
    console.error('[restore-home-hero] publish failed:', err.message);
    process.exit(1);
  });
