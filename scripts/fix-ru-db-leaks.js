#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getDb } = require('../server/db');
const ARM = /[\u0531-\u0556\u0561-\u0587]/;
const db = getDb();

const global = JSON.parse(db.prepare("SELECT value FROM settings WHERE key='global'").get().value);
const h = global.hospital || {};
const RU = {
  heroTagline: 'Реабилитационный центр заболеваний позвоночника, суставов и опорно-двигательного аппарата',
  tagline: 'Консервативное лечение позвоночника и суставов',
  about: '«Здоровый позвоночник» — реабилитационный центр консервативного лечения позвоночника, суставов и опорно-двигательного аппарата: мануальная терапия, физиотерапия, ЛФК и индивидуальные программы восстановления.',
  mission: 'Восстанавливать подвижность и качество жизни с помощью доказательных методов реабилитации и мультидисциплинарного подхода.'
};
for (const [k, v] of Object.entries(RU)) {
  if (!h[k] || typeof h[k] !== 'object') h[k] = { hy: '', ru: v, en: '' };
  if (!h[k].ru || ARM.test(h[k].ru)) h[k].ru = v;
}
if (h.name && typeof h.name === 'object') h.name.ru = h.name.ru && !ARM.test(h.name.ru) ? h.name.ru : 'Здоровый позвоночник';
if (h.shortName && typeof h.shortName === 'object') h.shortName.ru = h.shortName.ru && !ARM.test(h.shortName.ru) ? h.shortName.ru : 'Здоровый позвоночник';
global.hospital = h;
db.prepare("UPDATE settings SET value=?, updated_at=datetime('now') WHERE key='global'").run(JSON.stringify(global));

const seo = JSON.parse(db.prepare("SELECT value FROM settings WHERE key='seo'").get().value);
if (seo.defaultTitle) {
  if (ARM.test(seo.defaultTitle.ru || '')) seo.defaultTitle.ru = 'Здоровый позвоночник';
  if (ARM.test(seo.defaultTitle.en || '')) seo.defaultTitle.en = 'Healthy Spine';
}
db.prepare("UPDATE settings SET value=?, updated_at=datetime('now') WHERE key='seo'").run(JSON.stringify(seo));

const ce = JSON.parse(db.prepare("SELECT value FROM settings WHERE key='content_extra'").get().value);
ce.introParagraphs = [
  'Реабилитационный центр «Здоровый позвоночник» оказывает консервативную помощь при заболеваниях позвоночника, суставов и опорно-двигательного аппарата. Пациенты обращаются в центр за помощью при боли, ограничении подвижности и реабилитации.',
  'Планы лечения составляются на основе индивидуальной оценки и реабилитационных целей.'
];
if (ce.patientHero && ARM.test(JSON.stringify(ce.patientHero))) {
  ce.patientHero.quote = (ce.patientHero.quote || '').replace(/«Առողջ ողնաշար»/g, '«Здоровый позвоночник»').replace(/Առողջ ողնաշար/g, 'Здоровый позвоночник');
  if (ARM.test(ce.patientHero.quote || '')) {
    ce.patientHero.quote = 'Реабилитационные программы могут поддержать контроль боли и возвращение к повседневной активности на основе оценки специалиста.';
  }
  if (ARM.test(ce.patientHero.ctaText || '')) ce.patientHero.ctaText = 'Узнать больше о лечении';
}
if (Array.isArray(ce.expertsParagraphs)) {
  ce.expertsParagraphs = ce.expertsParagraphs.map((p) =>
    String(p).replace(/«Առողջ ողնաշար»/g, '«Здоровый позвоночник»').replace(/Առողջ ողնաշար/g, 'Здоровый позвоночник')
  );
}
db.prepare("UPDATE settings SET value=?, updated_at=datetime('now') WHERE key='content_extra'").run(JSON.stringify(ce));

console.log('DB RU leaks fixed');
console.log('heroTagline.ru', h.heroTagline.ru);
console.log('seo.title.ru', seo.defaultTitle.ru);
console.log('intro0', ce.introParagraphs[0].slice(0, 80));
