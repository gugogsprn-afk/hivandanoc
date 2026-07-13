#!/usr/bin/env node
require('dotenv').config();
const { getDb } = require('../server/db');
const db = getDb();

function hasArm(s) {
  return /[\u0531-\u0556\u0561-\u0587]/.test(String(s || ''));
}

console.log('=== page_fields home ===');
const pfs = db
  .prepare(
    "SELECT field_key, lang, value FROM page_fields WHERE page_key='home' ORDER BY field_key, lang"
  )
  .all();
for (const r of pfs) {
  console.log({
    k: r.field_key,
    lang: r.lang,
    arm: hasArm(r.value),
    v: String(r.value || '').slice(0, 140)
  });
}

console.log('\n=== i18n_overrides ru with Armenian ===');
try {
  const rows = db.prepare('SELECT lang, key, value FROM i18n_overrides').all();
  console.log(
    'total',
    rows.length,
    'ru arm',
    rows.filter((r) => r.lang === 'ru' && hasArm(r.value)).map((r) => ({ key: r.key, v: r.value.slice(0, 100) }))
  );
  console.log(
    'pages.home.introTitle overrides',
    rows.filter((r) => r.key && r.key.includes('introTitle'))
  );
} catch (e) {
  console.log(e.message);
}

console.log('\n=== hospital setting ===');
const settings = db.prepare('SELECT key, value_json FROM settings').all();
for (const s of settings) {
  if (!/hospital|content|global/i.test(s.key)) continue;
  let j;
  try {
    j = JSON.parse(s.value_json);
  } catch {
    continue;
  }
  console.log('KEY', s.key);
  if (s.key === 'hospital' || (j && (j.name || j.hy || j.ru))) {
    console.log(JSON.stringify(j, null, 2).slice(0, 2500));
  } else if (j && typeof j === 'object') {
    const armKeys = [];
    const walk = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const [k, v] of Object.entries(obj)) {
        const p = path ? `${path}.${k}` : k;
        if (typeof v === 'string' && hasArm(v)) armKeys.push({ p, v: v.slice(0, 80) });
        else if (Array.isArray(v)) v.forEach((item, i) => {
          if (typeof item === 'string' && hasArm(item)) armKeys.push({ p: `${p}[${i}]`, v: item.slice(0, 80) });
          else if (item && typeof item === 'object') walk(item, `${p}[${i}]`);
        });
        else if (v && typeof v === 'object') walk(v, p);
      }
    };
    walk(j);
    console.log('armenian paths', armKeys.slice(0, 40));
  }
}
