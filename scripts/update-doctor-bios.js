#!/usr/bin/env node
/**
 * Update bio_ru and bio_en for CMS doctors. Does not modify bio_hy.
 * Run: node scripts/update-doctor-bios.js
 */
const fs = require('fs');
const path = require('path');

// Load production CMS path (matches PM2 / .env)
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

const { getDb } = require('../server/db');

const BACKUP_DIR = '/root/backups';
const DB_PATH = process.env.CMS_DB_PATH || path.join(process.env.CMS_DATA_DIR, 'cms.db');

const BIOS = {
  'doc-1': {
    bio_ru:
      'Иванова Елена Сергеевна — врач мануальной терапии в реабилитационном центре «Здоровый позвоночник» в Ереване. Основной фокус работы — консервативная оценка и поддержка при болях в спине, шее и суставах после осмотра специалиста. Специалист может участвовать в составлении индивидуального плана реабилитации с учётом жалоб, анамнеза и результатов обследования. Часто встречающиеся запросы пациентов включают мышечное напряжение, ограничение подвижности и дискомфорт после длительного сидения или нагрузки. Мануальная терапия может применяться как часть комплексного подхода наряду с другими методами центра — по назначению врача. Рекомендации и объём процедур определяются только после консультации. Информация на сайте не заменяет медицинский совет; результаты могут отличаться.',
    bio_en:
      'Elena Ivanova is a manual therapy physician at the Healthy Spine rehabilitation center in Yerevan. Her clinical focus is conservative assessment and support for back, neck, and joint complaints after specialist evaluation. She may contribute to an individual rehabilitation plan based on symptoms, history, and examination findings. Common patient concerns include muscle tension, limited mobility, and discomfort after prolonged sitting or physical strain. Manual therapy may be used as part of a broader conservative program alongside other center services when recommended after consultation. Treatment scope and frequency are determined only following a specialist visit. Website information does not replace medical advice; results may vary.'
  },
  'doc-2': {
    bio_ru:
      'Петров Андрей Николаевич — ортопед-травматолог центра «Здоровый позвоночник» в Ереване. Специалист проводит первичную оценку пациентов с болями в позвоночнике и суставах, помогает определить возможные направления консервативной реабилитации и необходимость дополнительного обследования. В практике часто рассматриваются жалобы на боль в пояснице и шее, ограничение движений, последствия травм и перегрузок. После осмотра может быть предложен индивидуальный план наблюдения и реабилитации с участием смежных специалистов центра. Ортопедическая консультация не заменяет экстренную помощь при острых состояниях. Решения о методах лечения принимаются с учётом клинической картины; центр не гарантирует избежание операции или полное выздоровление. Для записи и уточнения показаний необходима очная консультация.',
    bio_en:
      'Andrey Petrov is an orthopedic traumatologist at Healthy Spine in Yerevan. He provides initial assessment for patients with spine and joint complaints and helps clarify conservative rehabilitation options and further evaluation when needed. Common presentations include lower back and neck pain, limited movement, and symptoms after injury or overuse. After examination, an individual follow-up and rehabilitation plan may be proposed with input from other center specialists. Orthopedic consultation does not replace emergency care for acute conditions. Treatment decisions depend on clinical findings; the center does not guarantee surgery avoidance or full recovery. An in-person visit is required to determine indications and next steps.'
  },
  'doc-3': {
    bio_ru:
      'Смирнова Ольга Викторовна — врач лечебной физкультуры (ЛФК) в центре «Здоровый позвоночник». Основная задача — подбор и сопровождение индивидуальных программ упражнений для реабилитации позвоночника и суставов после оценки специалиста. Программы могут учитывать боли в спине и шее, скованность, восстановление после травм и ограничение подвижности. Упражнения подбираются с учётом переносимости и могут корректироваться по мере наблюдения. ЛФК часто включается в комплексный план вместе с физиотерапией и другими консервативными методами центра. Самостоятельные нагрузки без консультации не рекомендуются. Информация на сайте носит справочный характер и не заменяет медицинские рекомендации; эффективность может различаться у разных пациентов.',
    bio_en:
      'Olga Smirnova is a therapeutic exercise (kinesiotherapy) physician at Healthy Spine. She develops and supervises individual exercise programs for spine and joint rehabilitation after specialist assessment. Programs may address back and neck pain, stiffness, recovery after injury, and mobility limitations. Exercises are selected for tolerability and may be adjusted during follow-up. Therapeutic exercise is often part of a broader conservative plan with physiotherapy and other center services. Unsupervised exercise without consultation is not recommended. Website content is informational and does not replace medical guidance; outcomes may vary between patients.'
  },
  'doc-4': {
    bio_ru:
      'Козлов Дмитрий Игоревич — физиотерапевт реабилитационного центра «Здоровый позвоночник» в Ереване. Специалист работает с пациентами, которым после осмотра может быть показана аппаратная физиотерапия при болях в спине, шее и суставах. Физиотерапия может поддерживать снижение дискомфорта, улучшение подвижности и участие в общем плане реабилитации — в сочетании с другими методами по назначению врача. Частые запросы связаны с хроническими болями, мышечным напряжением и восстановлением после нагрузок. Процедуры назначаются индивидуально; их объём и частота определяются только после консультации. Физиотерапия не заменяет диагностику и не гарантирует результат. При усилении симптомов или появлении тревожных признаков следует обратиться к врачу без отлагательств.',
    bio_en:
      'Dmitry Kozlov is a physiotherapist at Healthy Spine in Yerevan. He works with patients who may benefit from device-based physiotherapy for back, neck, and joint complaints after specialist evaluation. Physiotherapy may support comfort, mobility, and participation in a broader rehabilitation plan alongside other prescribed methods. Common requests involve chronic pain, muscle tension, and recovery after strain. Procedures are individualized; frequency and scope are set only after consultation. Physiotherapy does not replace diagnosis and does not guarantee outcomes. Worsening symptoms or red flags require prompt medical attention.'
  },
  'doc-5': {
    bio_ru:
      'Морозова Анна Павловна — невролог центра «Здоровый позвоночник». Специалист помогает оценить неврологические проявления, которые могут сопровождать заболевания и дисфункции позвоночника: боль с иррадиацией, онемение, слабость, нарушения чувствительности. После сбора анамнеза и осмотра может быть предложено дальнейшее обследование и участие в консервативной реабилитации совместно с ортопедом, физиотерапевтом и другими коллегами. Неврологическая консультация важна при стойких или нарастающих симптомах, но не заменяет экстренную помощь при острых состояниях. Рекомендации зависят от клинической картины каждого пациента; центр не обещает излечение или полное исчезновение симптомов. Для записи и определения тактики необходима очная консультация.',
    bio_en:
      'Anna Morozova is a neurologist at Healthy Spine. She evaluates neurological signs that may accompany spine-related conditions, including radiating pain, numbness, weakness, and sensory changes. After history and examination, further assessment and conservative rehabilitation with orthopedic, physiotherapy, and other colleagues may be recommended. Neurological consultation is important for persistent or worsening symptoms but does not replace emergency care. Recommendations depend on each patient’s presentation; the center does not promise cure or complete symptom resolution. An in-person visit is required to determine management.'
  },
  'doc-6': {
    bio_ru:
      'Волков Сергей Александрович — врач ультразвуковой диагностики (УЗД) в центре «Здоровый позвоночник». Специалист выполняет ультразвуковое исследование суставов и мягких тissues по назначению врача центра. УЗИ может дополнять клинический осмотр при оценке болей в суставах, мягких тканях и связанных с ними жалоб, помогая специалистам уточнить направление реабилитации. Исследование проводится в рамках общего плана обследования и не является самостоятельным методом лечения. Интерпретация результатов выполняется лечащим врачом с учётом всей клинической картины. Запись на диагностику — после консультации и определения показаний. Информация на сайте не заменяет медицинский совет.',
    bio_en:
      'Sergey Volkov is an ultrasound diagnostics physician at Healthy Spine. He performs joint and soft-tissue ultrasound when ordered by center physicians. Ultrasound may complement clinical assessment of joint and soft-tissue pain and related complaints, helping specialists refine rehabilitation direction. Imaging is part of a broader evaluation plan and is not a standalone treatment. Results are interpreted by the treating physician in full clinical context. Appointments follow consultation and indication review. Website information does not replace medical advice.'
  }
};

function backupDb() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dest = path.join(BACKUP_DIR, `cms-before-doctor-bios-${stamp}.db`);
  fs.copyFileSync(DB_PATH, dest);
  return dest;
}

function main() {
  const backup = backupDb();
  console.log('Backup:', backup);
  const db = getDb();
  const update = db.prepare('UPDATE doctors SET bio_ru = ?, bio_en = ?, updated_at = datetime(\'now\') WHERE slug = ?');
  for (const [slug, bios] of Object.entries(BIOS)) {
    update.run(bios.bio_ru, bios.bio_en, slug);
    const row = db.prepare('SELECT slug, length(bio_ru) ru, length(bio_en) en FROM doctors WHERE slug = ?').get(slug);
    console.log(row);
  }
  console.log('Done.');
}

main();
