#!/usr/bin/env node
/**
 * One-time CMS locale fix: doctor RU/EN display names, roles, service title_ru, hospital.about.ru
 * Run: CMS_DATA_DIR=/var/lib/hivandanoc-cms node scripts/update-doctor-locale-names.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^CMS_DATA_DIR=(.+)$/);
    if (m) process.env.CMS_DATA_DIR = m[1].trim();
  }
}
if (!process.env.CMS_DATA_DIR && fs.existsSync('/var/lib/hivandanoc-cms/cms.db')) {
  process.env.CMS_DATA_DIR = '/var/lib/hivandanoc-cms';
}

const DB_PATH = process.env.CMS_DB_PATH || path.join(process.env.CMS_DATA_DIR || '', 'cms.db');
if (!fs.existsSync(DB_PATH)) {
  console.error('CMS database not found:', DB_PATH);
  process.exit(1);
}

const { getDb } = require('../server/db');
const { getSetting, setSetting } = require('../server/db/helpers');

const DOCTORS = {
  'doc-1': {
    name_ru: 'Иванова Елена Сергеевна',
    name_en: 'Elena Ivanova',
    role_ru: 'Врач мануальной терапии',
    role_en: 'Manual therapist'
  },
  'doc-2': {
    name_ru: 'Петров Андрей Николаевич',
    name_en: 'Andrey Petrov',
    role_ru: 'Ортопед-травматолог',
    role_en: 'Orthopedic traumatologist'
  },
  'doc-3': {
    name_ru: 'Смирнова Ольга Викторовна',
    name_en: 'Olga Smirnova',
    role_ru: 'Врач ЛФК',
    role_en: 'Kinesiotherapy physician'
  },
  'doc-4': {
    name_ru: 'Козлов Дмитрий Игоревич',
    name_en: 'Dmitry Kozlov',
    role_ru: 'Физиотерапевт',
    role_en: 'Physiotherapist'
  },
  'doc-5': {
    name_ru: 'Морозова Анна Павловна',
    name_en: 'Anna Morozova',
    role_ru: 'Невролог',
    role_en: 'Neurologist'
  },
  'doc-6': {
    name_ru: 'Волков Сергей Александрович',
    name_en: 'Sergey Volkov',
    role_ru: 'Врач УЗД',
    role_en: 'Ultrasound specialist'
  }
};

const SERVICE_TITLE_RU = {
  'consult-spine': 'Консультация ортопеда-травматолога',
  'consult-neuro': 'Консультация невролога',
  'manual-therapy': 'Мануальная терапия',
  osteopathy: 'Остеопатия',
  physiotherapy: 'Физиотерапия',
  kinesiotherapy: 'Лечебная физкультура (ЛФК)',
  massage: 'Лечебный массаж',
  acupuncture: 'Иглоукалывание',
  electrotherapy: 'Электротерапия',
  'ultrasound-therapy': 'Ультразвуковая терапия',
  magnetotherapy: 'Магнитотерапия',
  'laser-therapy': 'Лазеротерапия',
  shockwave: 'Ударно-волновая терапия',
  traction: 'Тракция позвоночника',
  taping: 'Кинезио-тейпирование',
  'hernia-treatment': 'Лечение грыжи межпозвоночного диска',
  osteochondrosis: 'Лечение остеохондроза',
  scoliosis: 'Лечение сколиоза',
  protrusion: 'Лечение протрузии диска',
  radiculitis: 'Лечение радикулита',
  arthrosis: 'Лечение артроза',
  posture: 'Коррекция осанки',
  'block-injection': 'Блокады и инъекции',
  'rehab-trauma': 'Реабилитация после травмы',
  'rehab-surgery': 'Реабилитация после операции',
  'sports-rehab': 'Спортивная реабилитация',
  'pediatric-spine': 'Детская ортопедия и сколиоз',
  'ultrasound-diag': 'УЗИ-диагностика',
  xray: 'Рентген',
  'mri-referral': 'Направление на МРТ'
};

const HOSPITAL_ABOUT_RU =
  '«Здоровый позвоночник» — реабилитационный центр в Ереване. Мы оказываем консервативную помощь при заболеваниях позвоночника, суставов и опорно-двигательной системы: мануальная терапия, физиотерапия, лечение сколиоза и реабилитация.';

const SERVICE_DESCRIPTION_RU = {
  'consult-spine': 'Первичный и повторный приём, оценка состояния позвоночника и суставов, план лечения.',
  'consult-neuro': 'Оценка неврологических проявлений при заболеваниях позвоночника.',
  'manual-therapy': 'Ручные техники для облегчения боли и восстановления подвижности позвоночника и суставов.',
  osteopathy: 'Комплексный подход к восстановлению баланса опорно-двигательной системы.',
  physiotherapy: 'Аппаратные методы лечения боли и воспаления в позвоночнике и суставах.',
  kinesiotherapy: 'Индивидуальные упражнения для укрепления мышечного корсета и восстановления подвижности.',
  massage: 'Массаж спины, шеи и суставов для снятия напряжения и улучшения кровообращения.',
  acupuncture: 'Стимуляция активных точек для облегчения боли и поддержки восстановления.',
  electrotherapy: 'Лечение токами различной частоты при боли в спине и суставах.',
  'ultrasound-therapy': 'Ультразвуковое лечение мягких тissues и суставов.',
  magnetotherapy: 'Магнитотерапия для снижения боли и ускорения восстановления тканей.',
  'laser-therapy': 'Лазер низкой интensity при воспалении и боли.',
  shockwave: 'Ударно-волновая терапия при хронической боли, пяточных шпорах и в суставах.',
  traction: 'Вытяжение позвоночника для снижения нагрузки на межпозвоночные диски.',
  taping: 'Эластичное тейпирование для поддержки мышц и суставов.',
  'hernia-treatment': 'Консервативное лечение грыжи межпозвоночного диска без операции.',
  osteochondrosis: 'Комплексное лечение дегенеративных изменений позвоночника.',
  scoliosis: 'Коррекция и лечение искривления позвоночника у взрослых и детей.',
  protrusion: 'Лечение на ранней стадии выпячивания диска.',
  radiculitis: 'Облегчение боли и воспаления при сдавлении корешков.',
  arthrosis: 'Консервативное лечение артроза коленных, тазобедренных и других суставов.',
  posture: 'Диагностика и коррекция нарушений осанки.',
  'block-injection': 'Инъекционная терапия при выраженных болевых синдромах.',
  'rehab-trauma': 'Восстановление после травм позвоночника и суставов.',
  'rehab-surgery': 'Реабилитация после операций на позвоночнике и суставах.',
  'sports-rehab': 'Возвращение к тренировкам после травм опорно-двигательной системы.',
  'pediatric-spine': 'Наблюдение и лечение нарушений осанки и сколиоза у детей.',
  'ultrasound-diag': 'УЗИ-исследование суставов и мягких тissues.',
  xray: 'Рентгенография позвоночника и суставов.',
  'mri-referral': 'Направление на МРТ и интерпретация результатов.'
};

const CATEGORY_NAME_RU = {
  consult: 'Консультации',
  therapy: 'Терапия',
  treatment: 'Лечение',
  rehab: 'Реабилитация',
  diagnostics: 'Диагностика'
};

function main() {
  console.log('Target DB:', DB_PATH);
  const db = getDb();

  console.log('\n--- Doctors (before) ---');
  const before = db.prepare('SELECT slug, name_hy, name_ru, name_en, role_ru, role_en FROM doctors ORDER BY id').all();
  console.table(before);

  const updDoc = db.prepare(
    `UPDATE doctors SET name_ru = ?, name_en = ?, role_ru = ?, role_en = ?, updated_at = datetime('now') WHERE slug = ?`
  );
  for (const [slug, row] of Object.entries(DOCTORS)) {
    updDoc.run(row.name_ru, row.name_en, row.role_ru, row.role_en, slug);
  }

  const updSvc = db.prepare(`UPDATE services SET title_ru = ?, description_ru = ?, updated_at = datetime('now') WHERE id = ?`);
  for (const [id, title_ru] of Object.entries(SERVICE_TITLE_RU)) {
    const description_ru = SERVICE_DESCRIPTION_RU[id] || null;
    updSvc.run(title_ru, description_ru, id);
  }

  const updCat = db.prepare(`UPDATE service_categories SET name_ru = ? WHERE id = ?`);
  for (const [id, name_ru] of Object.entries(CATEGORY_NAME_RU)) {
    updCat.run(name_ru, id);
  }

  const global = getSetting('global', {});
  if (global.hospital?.about) {
    global.hospital.about.ru = HOSPITAL_ABOUT_RU;
    setSetting('global', global);
    console.log('\nUpdated hospital.about.ru');
  }

  console.log('\n--- Doctors (after) ---');
  const after = db.prepare('SELECT slug, name_hy, name_ru, name_en, role_ru, role_en FROM doctors ORDER BY id').all();
  console.table(after);

  const ARM = /[\u0531-\u0587]/;
  const leaks = after.filter(
    (r) => ARM.test(r.name_ru || '') || ARM.test(r.name_en || '') || ARM.test(r.role_ru || '') || ARM.test(r.role_en || '')
  );
  if (leaks.length) {
    console.error('Doctor field leaks remain:', leaks);
    process.exit(1);
  }
  console.log('\nDoctor locale names updated. Service title_ru and hospital.about.ru synced.');
}

main();
