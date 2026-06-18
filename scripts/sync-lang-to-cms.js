/**
 * Sync HY/RU/EN translations from lang/*.json into CMS settings + hero section.
 * Run: node scripts/sync-lang-to-cms.js
 */
const fs = require('fs');
const path = require('path');
const { initDb, getDb } = require('../server/db/index');
const { getSetting, setSetting } = require('../server/db/helpers');

const LANGS = ['hy', 'ru', 'en'];
const root = path.join(__dirname, '..');

function loadLang(code) {
  return JSON.parse(fs.readFileSync(path.join(root, 'lang', `${code}.json`), 'utf8'));
}

function fromLangs(getter) {
  const out = {};
  for (const code of LANGS) {
    out[code] = getter(loadLang(code)) || '';
  }
  return out;
}

function run() {
  initDb();
  const db = getDb();

  const global = getSetting('global', {});
  const h = global.hospital || {};

  global.hospital = {
    ...h,
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

  const row = db
    .prepare('SELECT content_json FROM page_sections WHERE page_key = ? AND section_key = ?')
    .get('home', 'hero');
  let hero = {};
  try {
    hero = JSON.parse(row?.content_json || '{}');
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

  try {
    const { publishAll } = require('../server/services/content-publish');
    publishAll();
    console.log('Published CMS snapshots for HY/RU/EN');
  } catch (err) {
    console.warn('Publish skipped:', err.message);
  }

  console.log('Synced translations:');
  LANGS.forEach((l) => {
    console.log(`  ${l} name: ${global.hospital.name[l]}`);
    console.log(`  ${l} hero: ${hero.title[l]}`);
  });
}

run();
