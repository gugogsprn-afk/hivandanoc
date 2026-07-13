#!/usr/bin/env node
/**
 * Generate RU/EN knowledge parity for articles beyond top 10.
 * Output: server/services/knowledge-i18n-parity-batch.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { KNOWLEDGE_CONFIG, LAUNCHED_KNOWLEDGE_SLUGS } = require('../server/services/knowledge-config');
const { TOP10_SLUGS, TITLE_FIXES } = require('../server/services/knowledge-i18n-parity');

const RU_SAFE =
  'Материал носит информационный характер, не является диагнозом и не заменяет очную консультацию. Результаты могут отличаться.';
const EN_SAFE =
  'This content is informational, not a diagnosis, and does not replace an in-person consultation. Results may vary.';

const WHEN_RU = [
  'Если симптомы сохраняются более нескольких дней и не уменьшаются после отдыха',
  'Если боль или дискомфорт мешают сну, работе или повседневной активности',
  'Если нарастают онемение, слабость или другие неврологические признаки',
  'Если симптомы начались после травмы, падения или резкой нагрузки',
  'При тревожных признаках (сильная боль, потеря контроля мочеиспускания или стула) — обратитесь за экстренной помощью'
];

const WHEN_EN = [
  'If symptoms last more than a few days and do not improve with rest',
  'If pain or discomfort interferes with sleep, work, or daily activity',
  'If numbness, weakness, or other neurological signs are increasing',
  'If symptoms started after injury, a fall, or sudden strain',
  'For red flags (severe pain, loss of bladder or bowel control) seek emergency care'
];

/** Slug-specific symptom/cause/FAQ overrides — unique per article topic */
const SLUG_OVERRIDES = {
  'posture-and-spine-health': {
    ruSymptoms: [
      'Сутулость или асимметрия плеч',
      'Усталость мышц спины при длительном сидении',
      'Периодическая боль в шее или пояснице',
      'Ощущение «тяжести» в верхней части спины',
      'Ограничение подвижности после статической работы'
    ],
    enSymptoms: [
      'Rounded shoulders or shoulder asymmetry',
      'Back muscle fatigue during prolonged sitting',
      'Periodic neck or lumbar discomfort',
      'Heaviness in the upper back',
      'Limited mobility after static work'
    ],
    ruCauses: [
      'Длительное сидение без перерывов',
      'Слабость мышц кора и спины',
      'Неправильная высота рабочего места',
      'Малоподвижный образ жизни',
      'Привычные позы с наклоном головы вперёд'
    ],
    enCauses: [
      'Prolonged sitting without breaks',
      'Weak core and back muscles',
      'Poor desk or chair setup',
      'Low daily activity',
      'Habitual forward-head posture'
    ],
    ruFaq: [
      { q: 'Может ли осанка влиять на боль в спине?', a: 'Неправильная осанка может увеличивать нагрузку на позвоночник; оценку проводит специалист после осмотра.' },
      { q: 'Помогают ли упражнения для осанки?', a: 'Упражнения могут быть частью плана после оценки специалиста; самостоятельные нагрузки без консультации не рекомендуются.' },
      { q: 'Нужна ли консультация при проблемах с осанкой?', a: 'При стойком дискомфорте или боли полезна очная оценка для подбора безопасного подхода.' }
    ],
    enFaq: [
      { q: 'Can posture affect back pain?', a: 'Poor posture may increase spinal load; a specialist can assess after examination.' },
      { q: 'Do posture exercises help?', a: 'Exercise may be part of a plan after specialist assessment; unsupervised programs are not recommended.' },
      { q: 'When should I seek consultation for posture concerns?', a: 'Persistent discomfort or pain warrants in-person evaluation for a safe approach.' }
    ]
  },
  'rehabilitation-after-spine-surgery': {
    ruSymptoms: [
      'Скованность и осторожность при движении в раннем периоде',
      'Мышечная слабость после периода покоя',
      'Дискомфорт при повседневных нагрузках',
      'Необходимость постепенного возвращения к активности',
      'Страх движения — обсуждается с реабилитологом'
    ],
    enSymptoms: [
      'Stiffness and caution with movement early on',
      'Muscle weakness after a rest period',
      'Discomfort with daily tasks',
      'Need for gradual return to activity',
      'Fear of movement — discussed with rehabilitation staff'
    ],
    ruCauses: [
      'Послеоперационный период восстановления',
      'Изменение привычных двигательных паттернов',
      'Временное ограничение нагрузок по назначению врача',
      'Необходимость укрепления мышечного корсета',
      'Индивидуальные особенности заживления'
    ],
    enCauses: [
      'Post-surgical recovery period',
      'Changed movement patterns',
      'Temporary load restrictions per physician',
      'Need to strengthen supporting muscles',
      'Individual healing factors'
    ],
    ruFaq: [
      { q: 'Когда начинается реабилитация после операции?', a: 'Сроки определяет оперирующий врач и реабилитолог; начало зависит от типа вмешательства и состояния пациента.' },
      { q: 'Можно ли восстановиться без реабилитации?', a: 'Структурированная программа может поддерживать безопасное возвращение к активности; тактика индивидуальна.' },
      { q: 'Гарантирует ли реабилитация полное восстановление?', a: 'Нет. Цель — поддержка функции и безопасность; результаты могут отличаться.' }
    ],
    enFaq: [
      { q: 'When does rehabilitation start after spine surgery?', a: 'Timing is set by the surgeon and rehabilitation team based on procedure type and patient status.' },
      { q: 'Can I recover without formal rehabilitation?', a: 'A structured program may support safe return to activity; approach is individual.' },
      { q: 'Does rehabilitation guarantee full recovery?', a: 'No. Goals focus on function and safety; outcomes may vary.' }
    ]
  }
};

function topicLabel(slug, lang) {
  const t = TITLE_FIXES[slug]?.[lang]?.h1;
  if (t) return t.toLowerCase();
  return slug.replace(/-/g, ' ');
}

function defaultSymptoms(slug, lang) {
  const o = SLUG_OVERRIDES[slug];
  if (lang === 'ru' && o?.ruSymptoms) return o.ruSymptoms;
  if (lang === 'en' && o?.enSymptoms) return o.enSymptoms;
  const topic = topicLabel(slug, lang);
  if (lang === 'ru') {
    return [
      `Дискомфорт или боль, связанные с темой «${topic}»`,
      'Ограничение подвижности или скованность',
      'Усиление симптомов при нагрузке или смене положения',
      'Мышечное напряжение в поражённой области',
      'Симптомы, требующие очной оценки специалиста'
    ];
  }
  return [
    `Discomfort or pain related to ${topic}`,
    'Limited mobility or stiffness',
    'Symptoms worsened by strain or position changes',
    'Muscle tension in the affected area',
    'Symptoms that warrant in-person specialist assessment'
  ];
}

function defaultCauses(slug, lang, hy) {
  const o = SLUG_OVERRIDES[slug];
  if (lang === 'ru' && o?.ruCauses) return o.ruCauses;
  if (lang === 'en' && o?.enCauses) return o.enCauses;
  const base =
    lang === 'ru'
      ? [
          'Мышечное напряжение или перегрузка',
          'Длительная статическая нагрузка',
          'Возрастные изменения опорно-двигательного аппарата',
          'Травмы или резкие движения',
          'Индивидуальные факторы, оцениваемые на приёме'
        ]
      : [
          'Muscle strain or overuse',
          'Prolonged static loading',
          'Age-related musculoskeletal changes',
          'Injury or sudden movement',
          'Individual factors assessed at consultation'
        ];
  if (hy?.causes?.length >= 5) return base;
  return base.slice(0, Math.max(4, hy?.causes?.length || 4));
}

function defaultFaq(slug, lang) {
  const o = SLUG_OVERRIDES[slug];
  if (lang === 'ru' && o?.ruFaq) return o.ruFaq;
  if (lang === 'en' && o?.enFaq) return o.enFaq;
  const topic = topicLabel(slug, lang);
  const clinicRu = '«Здоровый позвоночник»';
  const clinicEn = 'Healthy Spine';
  if (lang === 'ru') {
    return [
      {
        q: `Когда стоит обратиться к специалисту по теме «${topic}»?`,
        a: 'Если симптомы сохраняются, усиливаются или мешают повседневной активности — полезна очная консультация.'
      },
      {
        q: `Что может предложить центр ${clinicRu}?`,
        a: 'После осмотра может быть предложена консервативная оценка и индивидуальный план реабилитации; результаты могут отличаться.'
      },
      {
        q: 'Можно ли заниматься самолечением?',
        a: 'Самостоятельные методы без оценки могут быть небезопасны; рекомендуется консультация специалиста.'
      }
    ];
  }
  return [
    {
      q: `When should I see a specialist about ${topic}?`,
      a: 'If symptoms persist, worsen, or interfere with daily activity, an in-person consultation may help.'
    },
    {
      q: `What can ${clinicEn} offer?`,
      a: 'After examination, conservative assessment and an individual rehabilitation plan may be proposed; results may vary.'
    },
    {
      q: 'Is self-treatment safe?',
      a: 'Unsupervised approaches may be unsafe; specialist assessment is recommended.'
    }
  ];
}

function buildIntro(slug, lang, hy) {
  const topic = topicLabel(slug, lang);
  if (lang === 'ru') {
    return `Это информационный материал о теме «${topic}». ${RU_SAFE} Центр «Здоровый позвоночник» в Ереване может предложить консервативную оценку после осмотра специалиста.`;
  }
  return `This is an informational article about ${topic}. ${EN_SAFE} Healthy Spine in Yerevan may offer conservative assessment after specialist evaluation.`;
}

function buildArticle(slug, hy, lang) {
  return {
    intro: buildIntro(slug, lang, hy),
    symptoms: defaultSymptoms(slug, lang),
    causes: defaultCauses(slug, lang, hy),
    whenToSeek: lang === 'ru' ? WHEN_RU : WHEN_EN,
    faq: defaultFaq(slug, lang)
  };
}

const batch = { ru: {}, en: {} };
const remaining = LAUNCHED_KNOWLEDGE_SLUGS.filter((s) => !TOP10_SLUGS.includes(s));

for (const slug of remaining) {
  const hy = KNOWLEDGE_CONFIG[slug];
  if (!hy) continue;
  batch.ru[slug] = buildArticle(slug, hy, 'ru');
  batch.en[slug] = buildArticle(slug, hy, 'en');
}

// Enrich high-traffic slugs with unique overrides
for (const slug of Object.keys(SLUG_OVERRIDES)) {
  if (!remaining.includes(slug)) continue;
  const hy = KNOWLEDGE_CONFIG[slug];
  batch.ru[slug] = buildArticle(slug, hy, 'ru');
  batch.en[slug] = buildArticle(slug, hy, 'en');
}

const outPath = path.join(__dirname, '../server/services/knowledge-i18n-parity-batch.js');
const out =
  `'use strict';\n/** Auto-generated — node scripts/generate-knowledge-parity-batch.js */\nmodule.exports = ${JSON.stringify(batch, null, 2)};\n`;
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', remaining.length, 'articles to', outPath);
