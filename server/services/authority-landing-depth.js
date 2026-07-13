'use strict';

/** Shared FAQ templates — safe medical wording */
function commonFaq(lang) {
  if (lang === 'ru') {
    return [
      {
        q: 'Когда стоит обратиться к специалисту?',
        a: 'Если симптомы сохраняются более нескольких дней, мешают сну или работе, или нарастают — очная консультация может помочь уточнить тактику.'
      },
      {
        q: 'Можно ли улучшить состояние без операции?',
        a: 'Во многих случаях рассматривают консервативные методы, но решение принимается только после оценки специалиста; результаты могут отличаться.'
      },
      {
        q: 'Что происходит на первичной консультации?',
        a: 'Специалист уточняет жалобы, собирает анамнез, проводит осмотр и при необходимости обсуждает дополнительные исследования.'
      },
      {
        q: 'Сколько может длиться реабилитация?',
        a: 'Сроки индивидуальны и зависят от жалоб, осмотра и выбранного плана; точные прогнозы без очной оценки не даются.'
      },
      {
        q: 'Какие обследования могут быть рекомендованы?',
        a: 'Объём исследований (например, МРТ или рентген) определяет врач после осмотра; самостоятельное назначение не рекомендуется.'
      },
      {
        q: 'Когда нужна срочная медицинская помощь?',
        a: 'При сильной нарастающей боли, быстро прогрессирующей слабости, онемении или нарушении мочеиспускания/стула — обратитесь за экстренной помощью.'
      }
    ];
  }
  return [
    {
      q: 'When should I see a specialist?',
      a: 'If symptoms last more than a few days, interfere with sleep or work, or are worsening, an in-person consultation may help clarify next steps.'
    },
    {
      q: 'Can symptoms improve without surgery?',
      a: 'Conservative care is often considered, but decisions are made only after specialist assessment; results may vary.'
    },
    {
      q: 'What happens at the first consultation?',
      a: 'A specialist reviews complaints, takes history, performs examination, and may discuss further testing when needed.'
    },
    {
      q: 'How long can rehabilitation take?',
      a: 'Timelines are individual and depend on symptoms, examination, and the chosen plan; forecasts are not given without assessment.'
    },
    {
      q: 'What examinations may be recommended?',
      a: 'Testing scope (such as MRI or X-ray) is determined after examination; self-directed testing is not recommended.'
    },
    {
      q: 'When is urgent evaluation needed?',
      a: 'Seek emergency care for rapidly worsening pain, weakness, numbness, or bladder or bowel changes.'
    }
  ];
}

const DEPTH = {
  '/spine-specialist-yerevan': {
    ru: {
      causes: {
        title: 'Возможные причины и факторы риска',
        p: 'Боль и ограничение движений в позвоночнике могут быть связаны с мышечным напряжением, длительной статической нагрузкой, возрастными изменениями, травмой или особенностями осанки. Точная картина уточняется только после очного осмотра; этот список не является диагнозом.',
        bullets: [
          'Мышечное перенапряжение и малоподвижность',
          'Длительное сидение или монотонная нагрузка',
          'Проблемы с дисками или суставами — по результатам оценки',
          'Последствия травмы или резкого движения',
          'Индивидуальные факторы, которые обсуждаются на приёме'
        ]
      },
      expectConsult: {
        title: 'Чего ожидать на консультации',
        p: 'Первичный визит обычно включает беседу о начале и характере симптомов, осмотр и базовую оценку движений. При необходимости обсуждаются имеющиеся снимки или дополнительные исследования. Специалист может предложить индивидуальный план консерватив реабилитации — без обещаний конкретного результата. Рекомендации могут корректироваться при наблюдении.'
      },
      methods: {
        title: 'Консервативные методы, которые могут рассматриваться',
        p: 'После оценки специалиста могут обсуждаться методы, подходящие для вашей ситуации. Назначение зависит от осмотра и противопоказаний.',
        bullets: [
          'Мануальная терапия — при отсутствии противопоказаний',
          'Лечебная физкультура и кинезиотерапия',
          'Физиотерапия и электролечение',
          'Тракция и разгрузочные подходы — по показаниям',
          'Иглоукалывание — если показано специалистом'
        ]
      },
      recovery: {
        title: 'Ожидания от восстановления',
        p: 'Сроки и динамика зависят от причины жалоб, давности симптомов и индивидуального плана. Некоторые пациенты отмечают улучшение в течение нескольких недель при соблюдении рекомендаций, у других процесс может быть длиннее. Мы не обещаем полное излечение; цель — безопасная поддержка функции и качества жизни.',
        bullets: [
          'Постепенное увеличение активности под контролем специалиста',
          'Домашние упражнения — только после инструктажа',
          'Коррекция плана при изменении симптомов',
          'Регулярные визиты для наблюдения — по необходимости'
        ]
      },
      prevention: {
        title: 'Профилактика и повседневные привычки',
        p: 'Поддержание подвижности, перерывы при сидячей работе и умеренная физическая активность могут поддерживать здоровье позвоночника. Конкретные рекомендации по нагрузке и упражнениям даются после оценки специалиста, а не по общим шаблонам из интернета.'
      },
      urgent: {
        title: 'Когда нужна срочная помощь',
        bullets: [
          'Сильная нарастающая боль или внезапная потеря подвижности',
          'Быстро прогрессирующая слабость или онемение',
          'Нарушение контроля мочеиспускания или стула',
          'Травма с подозрением на перелом или тяжёлый ушиб',
          'Лихорадка с острой болью в спине — требует неотложной оценки'
        ]
      },
      evaluatedConditions: {
        title: 'Какие состояния могут оцениваться',
        bullets: [
          'Боль в спине, шее и пояснице',
          'Ишиас и иррадирующая боль',
          'Грыжа межпозвонкового диска — консерватив ведение',
          'Остеохондроз и сколиоз — по жалобам',
          'Нарушения осанки и хроническая скованность'
        ]
      },
      relatedServices: {
        title: 'Связанные услуги центра',
        p: 'После оценки специалиста могут рекомендоваться следующие направления реабилитации. Связь с услугой не означает автоматического назначения.',
        links: [
          { href: '/services/manual-therapy', label: 'Мануальная терапия' },
          { href: '/services/physiotherapy', label: 'Физиотерапия' },
          { href: '/services/osteopathy', label: 'Остеопатия' },
          { href: '/services/kinesiotherapy', label: 'Кинезиотерапия' },
          { href: '/services/traction', label: 'Тракция' },
          { href: '/services/consult-spine', label: 'Консультация по позвоночнику' },
          { href: '/services/consult-neuro', label: 'Неврологическая консультация' }
        ]
      },
      relatedConditions: {
        title: 'Связанные состояния',
        p: 'Информационные страницы о состояниях, которые иногда обсуждаются при консультации по позвоночнику. Не заменяют диагноз.',
        links: [
          { href: '/conditions/back-pain-treatment', label: 'Боль в спине' },
          { href: '/conditions/neck-pain-treatment', label: 'Боль в шее' },
          { href: '/conditions/sciatica', label: 'Ишиас' },
          { href: '/conditions/herniated-disc', label: 'Грыжа диска' },
          { href: '/conditions/lower-back-pain', label: 'Боль в пояснице' },
          { href: '/conditions/osteochondrosis', label: 'Остеохондроз' },
          { href: '/conditions/posture-disorders', label: 'Нарушения осанки' }
        ]
      },
      trustContact: {
        title: 'Почему пациенты обращаются в центр',
        p: 'Пациенты выбирают «Здоровый позвоночник» в Ереване за консерватив подход, понятное объяснение следующих шагов и возможность междисциплинарной оценки. Мы уделяем внимание индивидуальному плану и обучению пациента — без рекламных обещаний.',
        bullets: [
          'Индивидуальная оценка после очного осмотра',
          'Консервативная реабилитация и план восстановления',
          'Междисциплинарный подход при необходимости',
          'Информационные материалы для пациентов',
          'Прозрачная политика медицинского контента на сайте'
        ]
      },
      footerLinks: [
        { href: '/consultation-process', label: 'Как проходит консультация' },
        { href: '/patient-consultation-guide', label: 'Руководство для пациента' },
        { href: '/about-doctor', label: 'О врачах' },
        { href: '/knowledge', label: 'База знаний' }
      ],
      faqExtra: [
        {
          q: 'Нужен ли направление от другого врача?',
          a: 'Направление может быть полезным, но не всегда обязательно; уточните при записи.'
        },
        {
          q: 'Работает ли центр только с позвоночником?',
          a: 'Основной фокус — позвоночник и смежные жалобы; суставные проблемы также могут оцениваться в рамках компетенции.'
        }
      ]
    },
    en: {
      causes: {
        title: 'Possible causes and risk factors',
        p: 'Spine pain and limited movement may relate to muscle strain, prolonged static loading, age-related changes, injury, or posture habits. The exact picture is clarified only after in-person examination; this list is not a diagnosis.',
        bullets: [
          'Muscle overuse and low daily activity',
          'Prolonged sitting or repetitive loading',
          'Disc or joint issues — per assessment findings',
          'Effects of injury or sudden movement',
          'Individual factors discussed at the visit'
        ]
      },
      expectConsult: {
        title: 'What to expect at consultation',
        p: 'A first visit typically includes discussion of symptom onset and pattern, examination, and basic movement assessment. Prior imaging or further tests may be reviewed when needed. A specialist may propose an individual conservative rehabilitation plan without promising a specific outcome. Recommendations may change during follow-up.'
      },
      methods: {
        title: 'Conservative methods that may be considered',
        p: 'After specialist assessment, methods appropriate to your situation may be discussed. Selection depends on examination and contraindications.',
        bullets: [
          'Manual therapy — when not contraindicated',
          'Therapeutic exercise and kinesiotherapy',
          'Physiotherapy and electrotherapy',
          'Traction and unloading approaches — as indicated',
          'Acupuncture — when recommended by a specialist'
        ]
      },
      recovery: {
        title: 'Recovery expectations',
        p: 'Timelines depend on complaint cause, symptom duration, and the individual plan. Some patients notice improvement within several weeks when following guidance; for others recovery may take longer. We do not promise full recovery; goals focus on safe function and quality of life.',
        bullets: [
          'Gradual activity increase under specialist guidance',
          'Home exercises — only after instruction',
          'Plan adjustment as symptoms change',
          'Follow-up visits for monitoring when needed'
        ]
      },
      prevention: {
        title: 'Prevention and daily habits',
        p: 'Maintaining mobility, breaks during desk work, and moderate activity may support spinal health. Specific load and exercise guidance is provided after specialist assessment, not from generic online templates.'
      },
      urgent: {
        title: 'When urgent care is needed',
        bullets: [
          'Severe worsening pain or sudden loss of mobility',
          'Rapidly progressing weakness or numbness',
          'Loss of bladder or bowel control',
          'Injury with suspected fracture or severe trauma',
          'Fever with acute back pain — needs urgent evaluation'
        ]
      },
      evaluatedConditions: {
        title: 'Conditions that may be assessed',
        bullets: [
          'Back, neck, and lumbar pain',
          'Sciatica and radiating pain',
          'Herniated disc — conservative management',
          'Osteochondrosis and scoliosis — by complaint profile',
          'Posture disorders and chronic stiffness'
        ]
      },
      relatedServices: {
        title: 'Related center services',
        p: 'After assessment, the following rehabilitation directions may be recommended. Listing a service does not mean automatic prescription.',
        links: [
          { href: '/services/manual-therapy', label: 'Manual therapy' },
          { href: '/services/physiotherapy', label: 'Physiotherapy' },
          { href: '/services/osteopathy', label: 'Osteopathy' },
          { href: '/services/kinesiotherapy', label: 'Kinesiotherapy' },
          { href: '/services/traction', label: 'Traction' },
          { href: '/services/consult-spine', label: 'Spine consultation' },
          { href: '/services/consult-neuro', label: 'Neurology consultation' }
        ]
      },
      relatedConditions: {
        title: 'Related conditions',
        p: 'Informational pages on conditions sometimes discussed during spine consultations. Not a substitute for diagnosis.',
        links: [
          { href: '/conditions/back-pain-treatment', label: 'Back pain' },
          { href: '/conditions/neck-pain-treatment', label: 'Neck pain' },
          { href: '/conditions/sciatica', label: 'Sciatica' },
          { href: '/conditions/herniated-disc', label: 'Herniated disc' },
          { href: '/conditions/lower-back-pain', label: 'Lower back pain' },
          { href: '/conditions/osteochondrosis', label: 'Osteochondrosis' },
          { href: '/conditions/posture-disorders', label: 'Posture disorders' }
        ]
      },
      trustContact: {
        title: 'Why patients contact the center',
        p: 'Patients choose Healthy Spine in Yerevan for conservative care, clear next-step explanations, and multidisciplinary assessment when needed. We focus on individual planning and patient education — without promotional promises.',
        bullets: [
          'Individual assessment after in-person examination',
          'Conservative rehabilitation and recovery planning',
          'Multidisciplinary approach when indicated',
          'Informational materials for patients',
          'Transparent medical content policy on the website'
        ]
      },
      footerLinks: [
        { href: '/consultation-process', label: 'Consultation process' },
        { href: '/patient-consultation-guide', label: 'Patient guide' },
        { href: '/about-doctor', label: 'About physicians' },
        { href: '/knowledge', label: 'Knowledge center' }
      ],
      faqExtra: [
        {
          q: 'Do I need a referral from another doctor?',
          a: 'A referral can be helpful but is not always required; confirm when booking.'
        },
        {
          q: 'Does the center only treat the spine?',
          a: 'The main focus is the spine and related complaints; joint issues may also be assessed within scope.'
        }
      ]
    }
  }
};

// Page-specific overrides for other 5 landings — use spine as template with customized content
function pageDepth(slug, topicRu, topicEn, services, conditions, evaluatedRu, evaluatedEn, causesRu, causesEn, methodsRu, methodsEn, recoveryRu, recoveryEn, faqExtraRu, faqExtraEn) {
  const base = DEPTH['/spine-specialist-yerevan'];
  return {
    ru: {
      ...base.ru,
      causes: { ...base.ru.causes, p: causesRu, bullets: base.ru.causes.bullets },
      methods: { ...base.ru.methods, p: methodsRu, bullets: methodsRu ? undefined : base.ru.methods.bullets },
      recovery: { ...base.ru.recovery, p: recoveryRu },
      evaluatedConditions: { title: 'Какие состояния могут оцениваться', bullets: evaluatedRu },
      relatedServices: { ...base.ru.relatedServices, links: services },
      relatedConditions: { ...base.ru.relatedConditions, links: conditions },
      trustContact: {
        ...base.ru.trustContact,
        p: `Пациенты обращаются в «Здоровый позвоночник» в Ереване при ${topicRu}. Центр предлагает консервативную оценку, индивидуальный план и обучение — без обещаний излечения.`
      },
      faqExtra: faqExtraRu
    },
    en: {
      ...base.en,
      causes: { ...base.en.causes, p: causesEn },
      evaluatedConditions: { title: 'Conditions that may be assessed', bullets: evaluatedEn },
      relatedServices: { ...base.en.relatedServices, links: services },
      relatedConditions: { ...base.en.relatedConditions, links: conditions },
      trustContact: {
        ...base.en.trustContact,
        p: `Patients contact Healthy Spine in Yerevan for ${topicEn}. The center offers conservative assessment, individual planning, and education — without cure promises.`
      },
      recovery: { ...base.en.recovery, p: recoveryEn },
      faqExtra: faqExtraEn
    }
  };
}

const SVC = {
  rehab: [
    { href: '/services/manual-therapy', labelRu: 'Мануальная терапия', labelEn: 'Manual therapy' },
    { href: '/services/physiotherapy', labelRu: 'Физиотерапия', labelEn: 'Physiotherapy' },
    { href: '/services/kinesiotherapy', labelRu: 'Кинезиотерапия', labelEn: 'Kinesiotherapy' }
  ],
  traction: [
    { href: '/services/traction', labelRu: 'Тракция', labelEn: 'Traction' },
    { href: '/services/hernia-treatment', labelRu: 'Лечение грыжи', labelEn: 'Hernia treatment' }
  ],
  neuro: [
    { href: '/services/consult-neuro', labelRu: 'Неврологическая консультация', labelEn: 'Neurology consultation' },
    { href: '/services/consult-spine', labelRu: 'Консультация по позвоночнику', labelEn: 'Spine consultation' }
  ]
};

function links(items, lang) {
  return items.map((i) => ({ href: i.href, label: lang === 'ru' ? i.labelRu : i.labelEn }));
}

DEPTH['/back-pain-treatment-yerevan'] = pageDepth(
  'back',
  'боли в спине',
  'back pain',
  links([...SVC.rehab, { href: '/services/osteopathy', labelRu: 'Остеопатия', labelEn: 'Osteopathy' }, ...SVC.traction, ...SVC.neuro], 'ru').map((x, i) =>
    i < 7 ? links([...SVC.rehab, { href: '/services/osteopathy', labelRu: 'Остеопатия', labelEn: 'Osteopathy' }, ...SVC.traction, ...SVC.neuro], 'ru')[i] : x
  ),
  [],
  [],
  ['Боль в спине и пояснице', 'Ишиас с отдачей в ногу', 'Грыжа диска', 'Остеохондроз', 'Нарушения осанки'],
  ['Back and lumbar pain', 'Sciatica with leg radiation', 'Herniated disc', 'Osteochondrosis', 'Posture disorders'],
  'Боль в спине может возникать из-за мышечного напряжения, длительного сидения, проблем с дисками или перегрузки. Точная причина определяется на очном приёме.',
  'Back pain may arise from muscle strain, prolonged sitting, disc issues, or overuse. The exact cause is determined at an in-person visit.',
  'После оценки при боли в спине могут обсуждаться мануальная терапия, ЛФК, физиотерапия, тракция и разгрузка — по показаниям.',
  'After assessment for back pain, manual therapy, exercise, physiotherapy, traction, and unloading may be discussed as indicated.',
  'При боли в спине улучшение может наступать постепенно в течение нескольких недель при соблюдении плана; у части пациентов сроки длиннее. Прогнозы индивидуальны.',
  'With back pain, improvement may occur gradually over several weeks when following the plan; for some patients timelines are longer. Prognosis is individual.',
  [{ q: 'Нужен ли МРТ при боли в спине?', a: 'Назначение МРТ или других исследований определяет врач после осмотра.' }],
  [{ q: 'Is MRI needed for back pain?', a: 'MRI or other testing is ordered when clinically indicated after examination.' }]
);

// Fix back-pain related services/conditions properly
DEPTH['/back-pain-treatment-yerevan'].ru.relatedServices = {
  title: 'Связанные услуги центра',
  p: 'После оценки при боли в спине могут рекомендоваться следующие направления. Назначение зависит от осмотра.',
  links: links(
    [
      ...SVC.rehab,
      { href: '/services/osteopathy', labelRu: 'Остеопатия', labelEn: 'Osteopathy' },
      ...SVC.traction,
      ...SVC.neuro
    ],
    'ru'
  )
};
DEPTH['/back-pain-treatment-yerevan'].en.relatedServices = {
  title: 'Related center services',
  p: 'After assessment for back pain, the following directions may be recommended. Prescription depends on examination.',
  links: links(
    [
      ...SVC.rehab,
      { href: '/services/osteopathy', labelRu: 'Остеопатия', labelEn: 'Osteopathy' },
      ...SVC.traction,
      ...SVC.neuro
    ],
    'en'
  )
};
DEPTH['/back-pain-treatment-yerevan'].ru.relatedConditions = {
  title: 'Связанные состояния',
  p: 'Информация о состояниях, которые часто обсуждаются при боли в спине.',
  links: [
    { href: '/conditions/back-pain-treatment', label: 'Боль в спине' },
    { href: '/conditions/sciatica', label: 'Ишиас' },
    { href: '/conditions/herniated-disc', label: 'Грыжа диска' },
    { href: '/conditions/lower-back-pain', label: 'Боль в пояснице' },
    { href: '/conditions/osteochondrosis', label: 'Остеохондроз' },
    { href: '/conditions/posture-disorders', label: 'Нарушения осанки' }
  ]
};
DEPTH['/back-pain-treatment-yerevan'].en.relatedConditions = {
  title: 'Related conditions',
  p: 'Information on conditions often discussed with back pain.',
  links: [
    { href: '/conditions/back-pain-treatment', label: 'Back pain' },
    { href: '/conditions/sciatica', label: 'Sciatica' },
    { href: '/conditions/herniated-disc', label: 'Herniated disc' },
    { href: '/conditions/lower-back-pain', label: 'Lower back pain' },
    { href: '/conditions/osteochondrosis', label: 'Osteochondrosis' },
    { href: '/conditions/posture-disorders', label: 'Posture disorders' }
  ]
};
DEPTH['/back-pain-treatment-yerevan'].ru.footerLinks = [
  { href: '/knowledge/back-pain-causes', label: 'Причины боли в спине' },
  { href: '/consultation-process', label: 'Как проходит консультация' },
  { href: '/patient-consultation-guide', label: 'Руководство для пациента' }
];
DEPTH['/back-pain-treatment-yerevan'].en.footerLinks = [
  { href: '/knowledge/back-pain-causes', label: 'Causes of back pain' },
  { href: '/consultation-process', label: 'Consultation process' },
  { href: '/patient-consultation-guide', label: 'Patient guide' }
];

// neck-pain
DEPTH['/neck-pain-treatment-yerevan'] = JSON.parse(JSON.stringify(DEPTH['/back-pain-treatment-yerevan']));
Object.assign(DEPTH['/neck-pain-treatment-yerevan'].ru, {
  causes: {
    title: 'Возможные причины и факторы риска',
    p: 'Боль в шее часто связана с мышечным напряжением, длительной работой за компьютером, осанкой или проблемами шейного отдела. Причина уточняется на очном осмотре; материал не заменяет диагноз.',
    bullets: ['Мышечное напряжение и статическая нагрузка', 'Работа за компьютером и «текстовая шея»', 'Осанка и положение головы', 'Травма или резкое движение', 'Возрастные изменения — по оценке']
  },
  recovery: {
    title: 'Ожидания от восстановления',
    p: 'При боли в шее многие пациенты отмечают постепенное улучшение при соблюдении рекомендаций, но сроки индивидуальны. Цель — безопасное восстановление подвижности без обещания полного излечения.',
    bullets: ['Мягкое увеличение активности', 'Коррекция рабочего места — по рекомендации', 'Наблюдение при изменении симптомов']
  },
  evaluatedConditions: {
    title: 'Какие состояния могут оцениваться',
    bullets: ['Боль и скованность шеи', 'Шейный остеохондроз', 'Сколиоз с шейными жалобами', 'Иррадиация в руку — требует оценки']
  },
  trustContact: {
    title: 'Почему пациенты обращаются в центр',
    p: 'При боли в шее пациенты выбирают центр за консерватив подход, индивидуальную оценку и понятные рекомендации по нагрузке и упражнениям.',
    bullets: ['Оценка шеи и осанки', 'Консервативная реабилитация', 'Междисциплинарная поддержка', 'Информационные материалы']
  },
  footerLinks: [
    { href: '/knowledge/neck-pain-causes', label: 'Причины боли в шее' },
    { href: '/spine-specialist-yerevan', label: 'Специалист по позвоночнику' },
    { href: '/consultation-process', label: 'Как проходит консультация' }
  ]
});
DEPTH['/neck-pain-treatment-yerevan'].ru.relatedConditions = {
  title: 'Связанные состояния',
  p: 'Состояния, которые могут обсуждаться при боли в шее.',
  links: [
    { href: '/conditions/neck-pain-treatment', label: 'Боль в шее' },
    { href: '/conditions/osteochondrosis', label: 'Остеохондроз' },
    { href: '/conditions/radiculopathy', label: 'Радикулопатия' },
    { href: '/conditions/posture-disorders', label: 'Нарушения осанки' },
    { href: '/conditions/scoliosis-pain', label: 'Сколиоз и боль' }
  ]
};
DEPTH['/neck-pain-treatment-yerevan'].en = JSON.parse(JSON.stringify(DEPTH['/neck-pain-treatment-yerevan'].ru));
// Fix EN neck - need proper EN content
DEPTH['/neck-pain-treatment-yerevan'].en = {
  ...DEPTH['/spine-specialist-yerevan'].en,
  causes: {
    title: 'Possible causes and risk factors',
    p: 'Neck pain often relates to muscle tension, prolonged computer work, posture, or cervical spine issues. Cause is clarified at in-person examination; this is not a diagnosis.',
    bullets: ['Muscle tension and static loading', 'Computer work and forward-head posture', 'Posture and head position', 'Injury or sudden movement', 'Age-related changes — per assessment']
  },
  recovery: {
    title: 'Recovery expectations',
    p: 'Many patients notice gradual improvement with neck pain when following guidance, but timelines vary. Goals focus on safe mobility without promising full recovery.',
    bullets: ['Gentle activity progression', 'Workstation adjustments — when recommended', 'Monitoring as symptoms change']
  },
  evaluatedConditions: {
    title: 'Conditions that may be assessed',
    bullets: ['Neck pain and stiffness', 'Cervical osteochondrosis', 'Scoliosis with neck complaints', 'Arm radiation — warrants assessment']
  },
  relatedConditions: {
    title: 'Related conditions',
    p: 'Conditions that may be discussed with neck pain.',
    links: [
      { href: '/conditions/neck-pain-treatment', label: 'Neck pain' },
      { href: '/conditions/osteochondrosis', label: 'Osteochondrosis' },
      { href: '/conditions/radiculopathy', label: 'Radiculopathy' },
      { href: '/conditions/posture-disorders', label: 'Posture disorders' },
      { href: '/conditions/scoliosis-pain', label: 'Scoliosis-related pain' }
    ]
  },
  relatedServices: DEPTH['/back-pain-treatment-yerevan'].en.relatedServices,
  trustContact: {
    title: 'Why patients contact the center',
    p: 'For neck pain, patients choose the center for conservative assessment, individual planning, and clear load and exercise guidance.',
    bullets: ['Neck and posture assessment', 'Conservative rehabilitation', 'Multidisciplinary support', 'Patient information materials']
  },
  footerLinks: [
    { href: '/knowledge/neck-pain-causes', label: 'Causes of neck pain' },
    { href: '/spine-specialist-yerevan', label: 'Spine specialist' },
    { href: '/consultation-process', label: 'Consultation process' }
  ],
  faqExtra: [{ q: 'Is neck pain always from the spine?', a: 'Often related, but causes vary; examination clarifies the picture.' }]
};

// sciatica
DEPTH['/sciatica-treatment-yerevan'] = JSON.parse(JSON.stringify(DEPTH['/back-pain-treatment-yerevan']));
Object.assign(DEPTH['/sciatica-treatment-yerevan'].ru, {
  causes: {
    title: 'Возможные причины и факторы риска',
    p: 'Ишиас часто связан с раздражением или сдавлением нерва в поясничном отделе, но причины могут различаться. Оценка проводится на очном приёме; материал информационный.',
    bullets: ['Проблемы с межпозвонковым диском', 'Сужение позвоночного канала — по оценке', 'Мышечное напряжение', 'Длительное сидение', 'Травма или перегрузка']
  },
  methods: {
    title: 'Консервативные методы, которые могут рассматриваться',
    p: 'При ишиасе после оценки могут обсуждаться тракция, ЛФК, физиотерапия и разгрузочные техники — по показаниям.',
    bullets: ['Тракция и разгрузка', 'Лечебная физкультура', 'Физиотерапия', 'Мануальная терапия — при отсутствии противопоказаний', 'Иглоукалывание — если показано']
  },
  evaluatedConditions: { title: 'Какие состояния могут оцениваться', bullets: ['Ишиас и иррадирующая боль', 'Грыжа диска', 'Радикулопатия', 'Боль в пояснице'] },
  footerLinks: [
    { href: '/knowledge/sciatica-symptoms', label: 'Симптомы ишиаса' },
    { href: '/knowledge/sciatica-recovery-time', label: 'Сроки восстановления' },
    { href: '/herniated-disc-treatment-yerevan', label: 'Лечение грыжи диска' }
  ]
});
DEPTH['/sciatica-treatment-yerevan'].ru.relatedServices = {
  title: 'Связанные услуги центра',
  p: 'При ишиасе могут рекомендоваться следующие направления после оценки.',
  links: links([...SVC.rehab, ...SVC.traction, { href: '/services/acupuncture', labelRu: 'Иглоукалывание', labelEn: 'Acupuncture' }], 'ru')
};
DEPTH['/sciatica-treatment-yerevan'].ru.relatedConditions = {
  title: 'Связанные состояния',
  p: 'Состояния, связанные с ишиасом и неврологической болью.',
  links: [
    { href: '/conditions/sciatica', label: 'Ишиас' },
    { href: '/conditions/herniated-disc', label: 'Грыжа диска' },
    { href: '/conditions/lower-back-pain', label: 'Боль в пояснице' },
    { href: '/conditions/radiculopathy', label: 'Радикулопатия' },
    { href: '/conditions/leg-numbness', label: 'Онемение ноги' }
  ]
};
DEPTH['/sciatica-treatment-yerevan'].en = {
  ...DEPTH['/spine-specialist-yerevan'].en,
  causes: DEPTH['/sciatica-treatment-yerevan'].ru.causes,
  methods: {
    title: 'Conservative methods that may be considered',
    p: 'For sciatica, traction, exercise therapy, physiotherapy, and unloading techniques may be discussed after assessment.',
    bullets: ['Traction and unloading', 'Therapeutic exercise', 'Physiotherapy', 'Manual therapy — when not contraindicated', 'Acupuncture — when indicated']
  },
  evaluatedConditions: { title: 'Conditions that may be assessed', bullets: ['Sciatica and radiating pain', 'Herniated disc', 'Radiculopathy', 'Lower back pain'] },
  relatedServices: {
    title: 'Related center services',
    p: 'For sciatica, the following directions may be recommended after assessment.',
    links: links([...SVC.rehab, ...SVC.traction, { href: '/services/acupuncture', labelRu: 'Иглоукалывание', labelEn: 'Acupuncture' }], 'en')
  },
  relatedConditions: {
    title: 'Related conditions',
    p: 'Conditions linked to sciatica and nerve-related pain.',
    links: [
      { href: '/conditions/sciatica', label: 'Sciatica' },
      { href: '/conditions/herniated-disc', label: 'Herniated disc' },
      { href: '/conditions/lower-back-pain', label: 'Lower back pain' },
      { href: '/conditions/radiculopathy', label: 'Radiculopathy' },
      { href: '/conditions/leg-numbness', label: 'Leg numbness' }
    ]
  },
  footerLinks: [
    { href: '/knowledge/sciatica-symptoms', label: 'Sciatica symptoms' },
    { href: '/knowledge/sciatica-recovery-time', label: 'Recovery timelines' },
    { href: '/herniated-disc-treatment-yerevan', label: 'Herniated disc care' }
  ]
};

// herniated disc
DEPTH['/herniated-disc-treatment-yerevan'] = JSON.parse(JSON.stringify(DEPTH['/sciatica-treatment-yerevan']));
Object.assign(DEPTH['/herniated-disc-treatment-yerevan'].ru, {
  causes: {
    title: 'Возможные причины и факторы риска',
    p: 'Грыжа диска может развиваться на фоне возрастных изменений, перегрузки, травмы или длительной статической нагрузки. Размер и клиническое значение оцениваются на приёме; не каждая грыжа требует операции.',
    bullets: ['Возрастные изменения диска', 'Подъём тяжестей и перегрузка', 'Травма или резкое движение', 'Длительное сидение', 'Индивидуальные факторы']
  },
  methods: {
    title: 'Консервативные методы, которые могут рассматриваться',
    p: 'Центр фокусируется на консерватив реабилитации. Мы не обещаем «растворить» грыжу без операции; план может включать разгрузку, упражнения и наблюдение.',
    bullets: ['Тракция и разгрузка', 'Лечение грыжи — консерватив программа', 'ЛФК и физиотерапия', 'Мануальная терапия — по показаниям']
  },
  footerLinks: [
    { href: '/knowledge/herniated-disc-symptoms', label: 'Симптомы грыжи' },
    { href: '/sciatica-treatment-yerevan', label: 'Лечение ишиаса' },
    { href: '/consultation-process', label: 'Как проходит консультация' }
  ]
});
DEPTH['/herniated-disc-treatment-yerevan'].ru.relatedServices = {
  title: 'Связанные услуги центра',
  p: 'При грыже диска могут рекомендоваться следующие направления.',
  links: links([{ href: '/services/hernia-treatment', labelRu: 'Лечение грыжи', labelEn: 'Hernia treatment' }, ...SVC.rehab, ...SVC.traction], 'ru')
};
DEPTH['/herniated-disc-treatment-yerevan'].ru.relatedConditions = {
  title: 'Связанные состояния',
  p: 'Состояния, которые часто обсуждаются при грыже диска.',
  links: [
    { href: '/conditions/herniated-disc', label: 'Грыжа диска' },
    { href: '/conditions/sciatica', label: 'Ишиас' },
    { href: '/conditions/radiculopathy', label: 'Радикулопатия' },
    { href: '/conditions/lower-back-pain', label: 'Боль в пояснице' }
  ]
};
DEPTH['/herniated-disc-treatment-yerevan'].en = {
  ...DEPTH['/sciatica-treatment-yerevan'].en,
  causes: {
    title: 'Possible causes and risk factors',
    p: 'A herniated disc may develop with age-related changes, overuse, injury, or prolonged sitting. Size and clinical significance are assessed at visit; not every herniation requires surgery.',
    bullets: ['Age-related disc changes', 'Lifting and overuse', 'Injury or sudden movement', 'Prolonged sitting', 'Individual factors']
  },
  methods: {
    title: 'Conservative methods that may be considered',
    p: 'The center focuses on conservative rehabilitation. We do not promise to resolve a herniation without surgery; plans may include unloading, exercise, and monitoring.',
    bullets: ['Traction and unloading', 'Hernia treatment — conservative program', 'Exercise and physiotherapy', 'Manual therapy — as indicated']
  },
  relatedServices: {
    title: 'Related center services',
    p: 'For herniated disc, the following directions may be recommended.',
    links: links([{ href: '/services/hernia-treatment', labelRu: 'Лечение грыжи', labelEn: 'Hernia treatment' }, ...SVC.rehab, ...SVC.traction], 'en')
  },
  relatedConditions: {
    title: 'Related conditions',
    p: 'Conditions often discussed with herniated disc.',
    links: [
      { href: '/conditions/herniated-disc', label: 'Herniated disc' },
      { href: '/conditions/sciatica', label: 'Sciatica' },
      { href: '/conditions/radiculopathy', label: 'Radiculopathy' },
      { href: '/conditions/lower-back-pain', label: 'Lower back pain' }
    ]
  },
  footerLinks: [
    { href: '/knowledge/herniated-disc-symptoms', label: 'Herniated disc symptoms' },
    { href: '/sciatica-treatment-yerevan', label: 'Sciatica care' },
    { href: '/consultation-process', label: 'Consultation process' }
  ]
};

// orthopedic
DEPTH['/orthopedic-consultation-yerevan'] = JSON.parse(JSON.stringify(DEPTH['/spine-specialist-yerevan']));
Object.assign(DEPTH['/orthopedic-consultation-yerevan'].ru, {
  expectConsult: {
    title: 'Чего ожидать на ортопедической консультации',
    p: 'Ортопед-травматолог проводит первичную оценку жалоб опорно-двигательного аппарата: сбор анамнеза, осмотр, обсуждение имеющихся снимков. Может быть предложено консерватив ведение, дополнительное обследование или направление к смежному специалисту. Консультация не заменяет экстренную помощь.'
  },
  evaluatedConditions: {
    title: 'Какие состояния могут оцениваться',
    bullets: [
      'Боль в спине, шее и суставах',
      'Грыжа диска и ишиас',
      'Сколиоз и остеохондроз',
      'Боль в плече и суставах',
      'Последствия травм — по жалобам'
    ]
  },
  relatedServices: {
    title: 'Связанные услуги',
    p: 'После ортопедической консультации могут рекомендоваться реабилитационные услуги центра.',
    links: links([...SVC.rehab, ...SVC.neuro, { href: '/services/arthrosis', labelRu: 'Артроз', labelEn: 'Arthrosis' }], 'ru')
  },
  relatedConditions: {
    title: 'Связанные состояния',
    p: 'Состояния, которые часто обсуждаются на ортопедической консультации.',
    links: [
      { href: '/conditions/back-pain-treatment', label: 'Боль в спине' },
      { href: '/conditions/neck-pain-treatment', label: 'Боль в шее' },
      { href: '/conditions/sciatica', label: 'Ишиас' },
      { href: '/conditions/herniated-disc', label: 'Грыжа диска' },
      { href: '/conditions/shoulder-pain', label: 'Боль в плече' },
      { href: '/conditions/joint-pain', label: 'Боль в суставах' }
    ]
  },
  footerLinks: [
    { href: '/about-doctor', label: 'О врачах' },
    { href: '/spine-health-resources', label: 'Ресурсы о здоровье позвоночника' },
    { href: '/patient-consultation-guide', label: 'Руководство для пациента' }
  ]
});
DEPTH['/orthopedic-consultation-yerevan'].en = {
  ...DEPTH['/spine-specialist-yerevan'].en,
  expectConsult: {
    title: 'What to expect at orthopedic consultation',
    p: 'An orthopedist provides initial assessment of musculoskeletal complaints: history, examination, review of prior imaging. Conservative management, further testing, or referral may be proposed. Consultation does not replace emergency care.'
  },
  evaluatedConditions: {
    title: 'Conditions that may be assessed',
    bullets: ['Back, neck, and joint pain', 'Herniated disc and sciatica', 'Scoliosis and osteochondrosis', 'Shoulder and joint pain', 'Post-injury complaints']
  },
  relatedServices: {
    title: 'Related services',
    p: 'After orthopedic consultation, center rehabilitation services may be recommended.',
    links: links([...SVC.rehab, ...SVC.neuro, { href: '/services/arthrosis', labelRu: 'Артроз', labelEn: 'Arthrosis' }], 'en')
  },
  relatedConditions: {
    title: 'Related conditions',
    p: 'Conditions often discussed at orthopedic consultation.',
    links: [
      { href: '/conditions/back-pain-treatment', label: 'Back pain' },
      { href: '/conditions/neck-pain-treatment', label: 'Neck pain' },
      { href: '/conditions/sciatica', label: 'Sciatica' },
      { href: '/conditions/herniated-disc', label: 'Herniated disc' },
      { href: '/conditions/shoulder-pain', label: 'Shoulder pain' },
      { href: '/conditions/joint-pain', label: 'Joint pain' }
    ]
  },
  footerLinks: [
    { href: '/about-doctor', label: 'About physicians' },
    { href: '/spine-health-resources', label: 'Spine health resources' },
    { href: '/patient-consultation-guide', label: 'Patient guide' }
  ]
};

function mergeDepth(baseSpec, depth, lang) {
  if (!depth) return baseSpec;
  const faq = [...(baseSpec.faq || []), ...(depth.faqExtra || [])];
  const common = commonFaq(lang);
  const seen = new Set();
  const mergedFaq = [];
  for (const f of [...faq, ...common]) {
    if (seen.has(f.q)) continue;
    seen.add(f.q);
    mergedFaq.push(f);
    if (mergedFaq.length >= 8) break;
  }
  return { ...baseSpec, ...depth, faq: mergedFaq };
}

module.exports = { DEPTH, commonFaq, mergeDepth, links };
