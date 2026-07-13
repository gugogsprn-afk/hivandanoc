#!/usr/bin/env node
/**
 * Scrub Armenian brand name from home about section RU/EN triplets.
 * Run on server: node scripts/fix-about-section.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getDb } = require('../server/db');

const db = getDb();
const about = db
  .prepare("SELECT content_json FROM page_sections WHERE page_key='home' AND section_key='about'")
  .get();
if (!about) {
  console.log('no about section');
  process.exit(0);
}

const j = JSON.parse(about.content_json);
const ARM = /«Առողջ ողնաշար»|Առողջ ողնաշար/g;

function scrubTriplet(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if (typeof out.ru === 'string') {
    out.ru = out.ru.replace(ARM, (m) =>
      m.startsWith('«') ? '«Здоровый позвоночник»' : 'Здоровый позвоночник'
    );
  }
  if (typeof out.en === 'string') {
    out.en = out.en.replace(ARM, (m) => (m.startsWith('«') ? '«Healthy Spine»' : 'Healthy Spine'));
  }
  return out;
}

if (j.text) j.text = scrubTriplet(j.text);
db.prepare(
  "UPDATE page_sections SET content_json=? WHERE page_key='home' AND section_key='about'"
).run(JSON.stringify(j));
console.log('fixed about.text', j.text);

require('../server/services/content-publish')
  .publishAll()
  .then(() => console.log('published'));
