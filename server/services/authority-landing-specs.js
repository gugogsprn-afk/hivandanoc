'use strict';

/**
 * RU/EN landing page content specs for authority-i18n-pages builder.
 */
const CLINIC_RU = '«Здоровый позвоночник»';
const CLINIC_EN = 'Healthy Spine';

function treatmentSpec(topicRu, topicEn, descRu, descEn, whenHelpRu, whenHelpEn, assessRu, assessEn, rehabRu, rehabEn, rehabBulletsRu, rehabBulletsEn, trustRu, trustEn, bookRu, bookEn, faqRu, faqEn, extras = {}) {
  const yerevanRu =
    'Центр расположен в Ереване и принимает пациентов с болями в позвоночнике и суставах. Запись возможна через сайт или по телефону. Мы рекомендуем принести имеющиеся исследования и список препаратов, если они есть.';
  const yerevanEn =
    'The center is located in Yerevan and sees patients with spine and joint complaints. Booking is available via the website or phone. We recommend bringing prior imaging and a medication list when available.';
  return {
    ru: {
      tagline: descRu.split('.')[0],
      description: descRu,
      intro3: extras.intro3Ru || yerevanRu,
      symptomsTitle: extras.symptomsTitleRu || 'Частые жалобы',
      symptoms: extras.symptomsRu,
      extraSections: extras.extraSectionsRu,
      whenHelpTitle: 'Когда консультация может помочь',
      whenHelp: whenHelpRu,
      assessmentTitle: 'Подход к оценке',
      assessment: assessRu,
      rehabTitle: 'Подход к реабилитации',
      rehab: rehabRu,
      rehabBullets: rehabBulletsRu,
      trustTitle: 'Почему пациенты обращаются в центр',
      trustBullets: trustRu,
      bookTitle: 'Когда записаться на приём',
      bookBullets: bookRu,
      faq: faqRu,
      intro1: `Реабилитационный центр ${CLINIC_RU} в Ереване оказывает консервативную помощь при ${topicRu}. Страница носит информационный характер и не заменяет очную консультацию.`,
      intro2:
        'Консультация специалиста помогает понять возможные причины жалоб, оценить ограничения движения и подобрать безопасный план восстановления. Рекомендации зависят от осмотра, жалоб пациента и данных предыдущих исследований. Результаты могут отличаться.'
    },
    en: {
      tagline: descEn.split('.')[0],
      description: descEn,
      intro3: extras.intro3En || yerevanEn,
      symptomsTitle: extras.symptomsTitleEn || 'Common complaints',
      symptoms: extras.symptomsEn,
      extraSections: extras.extraSectionsEn,
      whenHelpTitle: 'When consultation may help',
      whenHelp: whenHelpEn,
      assessmentTitle: 'Assessment approach',
      assessment: assessEn,
      rehabTitle: 'Rehabilitation approach',
      rehab: rehabEn,
      rehabBullets: rehabBulletsEn,
      trustTitle: 'Why patients choose the center',
      trustBullets: trustEn,
      bookTitle: 'When to book an appointment',
      bookBullets: bookEn,
      faq: faqEn,
      intro1: `${CLINIC_EN} rehabilitation center in Yerevan provides conservative care for ${topicEn}. This page is informational and does not replace an in-person consultation.`,
      intro2:
        'A specialist consultation can help clarify possible causes of pain, assess movement limitations, and plan a safe rehabilitation approach. Recommendations depend on symptoms, examination findings, and available medical records. Results may vary.'
    }
  };
}

const SPECS = {
  '/spine-specialist-yerevan': treatmentSpec(
    'болях в позвоночнике, шее и суставах',
    'spine, neck, and joint complaints',
    'Специалист по позвоночнику в Ереване — центр «Здоровый позвоночник». Консервативная оценка, реабилитация и индивидуальный план после консультации.',
    'Spine specialist in Yerevan at Healthy Spine — conservative assessment, rehabilitation, and individual planning after consultation.',
    [
      'Боль или скованность в спине, шее или пояснице',
      'Онемение или слабость в конечностях после оценки невролога',
      'Дискомфорт после длительного сидения или физической нагрузки',
      'Восстановление после травмы или операции — по назначению врача',
      'Хронические жалобы, которые мешают работе или сну'
    ],
    [
      'Back, neck, or lumbar pain and stiffness',
      'Numbness or weakness in limbs after neurological evaluation',
      'Discomfort after prolonged sitting or physical strain',
      'Recovery after injury or surgery — as directed by a physician',
      'Chronic complaints that interfere with work or sleep'
    ],
    'На первичном приёме специалист собирает анамнез, уточняет характер боли и проводит осмотр. При необходимости обсуждаются дополнительные исследования. План формируется только после очной оценки и может включать консервативные методы в рамках компетенции центра.',
    'At the first visit, the specialist takes history, clarifies pain patterns, and performs examination. Further tests may be discussed when needed. Planning occurs only after in-person assessment and may include conservative methods within the center\'s scope.',
    'После оценки могут рассматриваться мануальная терапия, лечебная физкультура, физиотерапия, тракция и другие консервативные методы — по показаниям. Центр не обещает избежать операции; тактика определяется индивидуально.',
    'After assessment, manual therapy, therapeutic exercise, physiotherapy, traction, and other conservative options may be considered as indicated. The center does not promise to avoid surgery; tactics are individual.',
    [
      'Индивидуальный план после осмотра специалиста',
      'Координация ортопедии, неврологии и реабилитации',
      'Коррекция программы при изменении симптомов',
      'Акцент на безопасность и постепенное увеличение активности'
    ],
    [
      'Individual plan after specialist examination',
      'Coordination of orthopedics, neurology, and rehabilitation',
      'Program adjustment as symptoms change',
      'Focus on safety and gradual activity increase'
    ],
    [
      'Междисциплинарная команда: ортопед, невролог, ЛФК, физиотерапия',
      'Консервативный фокус без рекламных обещаний',
      'Индивидуальный подход после очной консультации',
      'Информационные материалы и прозрачная политика контента'
    ],
    [
      'Multidisciplinary team: orthopedics, neurology, exercise therapy, physiotherapy',
      'Conservative focus without promotional promises',
      'Individual approach after in-person consultation',
      'Informational materials and transparent content policy'
    ],
    [
      'Если симптомы сохраняются более нескольких дней',
      'Если боль мешает сну, работе или повседневной активности',
      'Если нарастают неврологические признаки',
      'Если нужна оценка после травмы или операции'
    ],
    [
      'If symptoms last more than a few days',
      'If pain interferes with sleep, work, or daily activity',
      'If neurological signs are increasing',
      'If assessment is needed after injury or surgery'
    ],
    [
      { q: 'Кто такой специалист по позвоночнику?', a: 'Это врач или реабилитолог, который оценивает боли и нарушения функции позвоночника и может предложить консервативный план после осмотра.' },
      { q: 'Нужна ли запись заранее?', a: 'Да, рекомендуется записаться по телефону или через форму на сайте.' },
      { q: 'Гарантирует ли центр излечение?', a: 'Нет. Информация на сайте не заменяет медицинский совет; результаты могут отличаться.' },
      { q: 'Какие исследования могут понадобиться?', a: 'Объём обследования определяет специалист после осмотра; самостоятельное назначение не рекомендуется.' }
    ],
    [
      { q: 'What does a spine specialist do?', a: 'They assess spine-related pain and function and may propose conservative rehabilitation after examination.' },
      { q: 'Is an appointment required?', a: 'Yes — book by phone or through the website form.' },
      { q: 'Does the center guarantee recovery?', a: 'No. Website information does not replace medical advice; results may vary.' },
      { q: 'What tests might be needed?', a: 'Testing scope is determined after examination; self-directed testing is not recommended.' }
    ]
  ),
  '/back-pain-treatment-yerevan': treatmentSpec(
    'боли в спине',
    'back pain',
    'Лечение боли в спине в Ереване — консервативная оценка и реабилитация в центре «Здоровый позвоночник» после осмотра специалиста.',
    'Back pain treatment in Yerevan — conservative assessment and rehabilitation at Healthy Spine after specialist evaluation.',
    [
      'Локальная или иррадирующая боль в спине или пояснице',
      'Мышечное напряжение и скованность',
      'Усиление боли при сидении, наклонах или нагрузке',
      'Ограничение повседневной активности',
      'Боль после травмы или подъёма тяжести — требует оценки'
    ],
    [
      'Local or radiating back or lumbar pain',
      'Muscle tension and stiffness',
      'Pain worsened by sitting, bending, or loading',
      'Limited daily activity',
      'Pain after injury or lifting — warrants assessment'
    ],
    'Специалист уточняет, когда началась боль, что её усиливает или облегчает, и проводит осмотр. При необходимости обсуждаются снимки или другие исследования. Диагноз не ставится по телефону.',
    'The specialist clarifies onset, aggravating and relieving factors, and performs examination. Imaging or other tests may be discussed when needed. Diagnosis is not made by phone.',
    'Консервативные методы могут включать мануальную терапию, ЛФК, физиотерапию и разгрузочные подходы — по показаниям. Самолечение без консультации не рекомендуется.',
    'Conservative options may include manual therapy, exercise therapy, physiotherapy, and unloading approaches as indicated. Self-treatment without assessment is not recommended.',
    [
      'Постепенное увеличение активности под контролем специалиста',
      'Упражнения для укрепления мышечного корсета — после оценки',
      'Коррекция рабочей нагрузки и привычек движения',
      'Наблюдение при изменении симптомов'
    ],
    [
      'Gradual activity increase under specialist guidance',
      'Core-strengthening exercises — after assessment',
      'Workload and movement habit adjustments',
      'Monitoring as symptoms change'
    ],
    [
      'Опыт консервативной реабилитации в Ереване',
      'Индивидуальный план без обещаний «полного излечения»',
      'Команда профилей для комплексной оценки',
      'Удобная запись через сайт или телефон'
    ],
    [
      'Experience in conservative rehabilitation in Yerevan',
      'Individual planning without «full cure» promises',
      'Multiprofile team for comprehensive assessment',
      'Convenient booking via website or phone'
    ],
    [
      'Если боль не проходит несколько дней',
      'Если боль мешает работе или сну',
      'Если появилось онемение или слабость',
      'При сильной боли или травме — не откладывайте визит'
    ],
    [
      'If pain persists for several days',
      'If pain interferes with work or sleep',
      'If numbness or weakness appears',
      'For severe pain or injury — do not delay a visit'
    ],
    [
      { q: 'Можно ли обойтись без операции?', a: 'Во многих случаях применяют консервативные методы, но тактика определяется только после оценки специалиста.' },
      { q: 'Сколько длятся визиты?', a: 'Длительность и частота зависят от индивидуального плана после консультации.' },
      { q: 'Когда нужна срочная помощь?', a: 'При сильной боли, потере контроля мочеиспускания или нарастающей слабости обратитесь за экстренной помощью.' },
      { q: 'Нужен ли МРТ?', a: 'Назначение исследований определяет врач после осмотра.' }
    ],
    [
      { q: 'Can back pain be managed without surgery?', a: 'Often yes with conservative care, but tactics depend on specialist assessment.' },
      { q: 'How long is a course of visits?', a: 'Duration and frequency depend on the individual plan after consultation.' },
      { q: 'When is urgent care needed?', a: 'Seek emergency care for severe pain, bladder or bowel changes, or rapidly worsening weakness.' },
      { q: 'Is MRI required?', a: 'Imaging is ordered when clinically indicated after examination.' }
    ]
  )
};

// Add remaining treatment pages with similar structure - neck, sciatica, herniated, orthopedic
const extraPages = {
  '/neck-pain-treatment-yerevan': ['боли в шее', 'neck pain', 'Лечение боли в шее в Ереване — оценка и реабилитация в «Здоровый позвоночник» после консультации специалиста.', 'Neck pain treatment in Yerevan — assessment and rehabilitation at Healthy Spine after specialist consultation.'],
  '/sciatica-treatment-yerevan': ['ишиасе', 'sciatica', 'Лечение ишиаса в Ереване — консервативная оценка и реабилитация в центре «Здоровый позвоночник».', 'Sciatica treatment in Yerevan — conservative assessment and rehabilitation at Healthy Spine.'],
  '/herniated-disc-treatment-yerevan': ['грыже диска', 'herniated disc', 'Лечение грыжи диска в Ереване — консервативная оценка и реабилитация после консультации в «Здоровый позвоночник».', 'Herniated disc treatment in Yerevan — conservative assessment and rehabilitation at Healthy Spine after consultation.'],
  '/orthopedic-consultation-yerevan': ['болях в позвоночнике и суставах', 'spine and joint complaints', 'Ортопедическая консультация в Ереване — первичная оценка в центре «Здоровый позвоночник».', 'Orthopedic consultation in Yerevan — initial assessment at Healthy Spine.']
};

for (const [path, [topicRu, topicEn, descRu, descEn]] of Object.entries(extraPages)) {
  SPECS[path] = treatmentSpec(
    topicRu,
    topicEn,
    descRu,
    descEn,
    [
      'Боль или скованность, мешающая повседневной активности',
      'Симптомы сохраняются более нескольких дней',
      'Усиление боли при нагрузке или смене положения',
      'Неврологические признаки — требуют очной оценки',
      'Симптомы после травмы или резкой нагрузки'
    ],
    [
      'Pain or stiffness interfering with daily activity',
      'Symptoms lasting more than a few days',
      'Pain worsened by strain or position changes',
      'Neurological signs — warrant in-person assessment',
      'Symptoms after injury or sudden strain'
    ],
    'Специалист собирает анамнез, проводит осмотр и при необходимости назначает дополнительные исследования. Рекомендации формируются индивидуально и не заменяют экстренную помощь при тревожных симптомах.',
    'The specialist takes history, performs examination, and orders further tests when needed. Recommendations are individual and do not replace emergency care for red flags.',
    'После оценки могут применяться консервативные методы — упражнения, мануальная терапия, физиотерапия — в составе индивидуального плана. Результаты могут отличаться.',
    'After assessment, conservative methods — exercise, manual therapy, physiotherapy — may be used in an individual plan. Results may vary.',
    ['Безопасное увеличение активности', 'Контроль симптомов при нагрузке', 'Домашние рекомендации после оценки', 'Коррекция плана при необходимости'],
    ['Safe activity progression', 'Symptom monitoring with loading', 'Home guidance after assessment', 'Plan adjustment when needed'],
    ['Консервативный подход в Ереване', 'Команда специалистов', 'Индивидуальный план', 'Прозрачная информация для пациентов'],
    ['Conservative approach in Yerevan', 'Specialist team', 'Individual planning', 'Transparent patient information'],
    ['При сохранении симптомов', 'При усилении боли', 'При неврологических признаках', 'После травмы — без отлагательств'],
    ['When symptoms persist', 'When pain worsens', 'When neurological signs appear', 'After injury — without delay'],
    [
      { q: 'Нужна ли запись?', a: 'Да, рекомендуется записаться заранее через сайт или телефон.' },
      { q: 'Ставится ли диагноз на сайте?', a: 'Нет. Оценка проводится только на очном приёме.' },
      { q: 'Гарантируется ли результат?', a: 'Нет. Результаты могут отличаться; лечение индивидуально.' },
      { q: 'Когда обращаться экстренно?', a: 'При сильной боли, онемении, слабости или нарушении мочеиспускания — за экстренной помощью.' }
    ],
    [
      { q: 'Is booking required?', a: 'Yes — book in advance via the website or phone.' },
      { q: 'Is diagnosis made on the website?', a: 'No. Assessment occurs only at an in-person visit.' },
      { q: 'Are outcomes guaranteed?', a: 'No. Results may vary; care is individual.' },
      { q: 'When to seek emergency care?', a: 'For severe pain, numbness, weakness, or bladder or bowel changes — seek emergency care.' }
    ]
  );
}

SPECS['/patient-consultation-guide'] = {
  ru: {
    tagline: 'Практическое руководство для пациента перед и после консультации',
    description: 'Руководство для пациента центра «Здоровый позвоночник» в Ереване — как подготовиться к визиту, что взять с собой и чего ожидать. Информационный материал, не заменяющий медицинский совет.',
    intro1: `Это руководство описывает первичный визит в реабилитационный центр ${CLINIC_RU} в Ереване. Материал носит информационный характер: мы не ставим диагноз по телефону и не обещаем конкретный результат лечения.`,
    intro2: 'Первичная консультация обычно длится 20–40 минут в зависимости от сложности случая. Врач уточняет жалобы, проводит осмотр и при необходимости обсуждает дополнительные исследования. Индивидуальный план формируется только после очной оценки.',
    whenHelpTitle: 'Что взять на приём',
    whenHelp: [
      'Имеющиеся снимки и заключения (МРТ, рентген, УЗИ) — если есть',
      'Список принимаемых препаратов и аллергий',
      'Краткое описание начала и характера боли',
      'Контакты направившего врача — если есть направление',
      'Удобная одежда для осмотра и простых движений'
    ],
    assessmentTitle: 'Как проходит первичная консультация',
    assessment: 'Специалист собирает анамнез: когда началась боль, что усиливает или облегчает симптомы, были ли травмы или операции. Затем проводится осмотр и базовая оценка движений. Объём обследования определяется индивидуально.',
    rehabTitle: 'Чего ожидать после визита',
    rehab: 'После оценки может быть предложен индивидуальный план реабилитации: упражнения, физиотерапия, мануальные техники или наблюдение — по показаниям. План может корректироваться по мере изменения симптомов.',
    rehabBullets: [
      'Письменные или устные рекомендации по нагрузке',
      'Назначение следующих визитов — при необходимости',
      'Обсуждение домашних упражнений — только после оценки',
      'Направление к другому специалисту — если показано'
    ],
    trustTitle: 'Принципы центра',
    trustBullets: [
      'Консерватив реабилитация без гарантий результата',
      'Индивидуальный подход после осмотра',
      'Междисциплинарная команда при необходимости',
      'Прозрачная редакционная и медицинская политика сайта'
    ],
    bookTitle: 'Когда записаться',
    bookBullets: [
      'Если симптомы сохраняются и мешают активности',
      'Если нужна оценка после травмы или операции',
      'Если предыдущее лечение не дало ожидаемого эффекта — обсудите с врачом',
      'При тревожных симптомах — сначала экстренная помощь, не откладывайте'
    ],
    faq: [
      { q: 'Что взять на первый визит?', a: 'Снимки и заключения (если есть), список лекарств, описание жалоб и удобная одежда.' },
      { q: 'Сколько длится консультация?', a: 'Обычно 20–40 минут в зависимости от случая.' },
      { q: 'Выписывают ли лекарства?', a: 'Назначения зависят от клинической картины и компетенции врача.' },
      { q: 'Можно ли лечиться только по этому руководству?', a: 'Нет. Материал информационный и не заменяет очную консультацию.' },
      { q: 'Когда нужна экстренная помощь?', a: 'При сильной боли, нарастающей слабости, онемении или нарушении мочеиспускания — обратитесь за неотложной помощью.' }
    ]
  },
  en: {
    tagline: 'Practical guide for patients before and after consultation',
    description: 'Patient guide for Healthy Spine in Yerevan — how to prepare for a visit, what to bring, and what to expect. Informational content that does not replace medical advice.',
    intro1: `This guide describes a first visit to ${CLINIC_EN} rehabilitation center in Yerevan. It is informational: we do not diagnose by phone or promise specific treatment outcomes.`,
    intro2: 'An initial consultation typically lasts 20–40 minutes depending on case complexity. The physician reviews complaints, performs examination, and may discuss further testing. An individual plan is formed only after in-person assessment.',
    whenHelpTitle: 'What to bring',
    whenHelp: [
      'Prior imaging and reports (MRI, X-ray, ultrasound) — if available',
      'List of medications and allergies',
      'Brief description of pain onset and pattern',
      'Referring physician contact — if applicable',
      'Comfortable clothing for examination and simple movements'
    ],
    assessmentTitle: 'How the first consultation works',
    assessment: 'The specialist takes history: when pain started, what worsens or relieves symptoms, prior injuries or surgeries. Examination and basic movement assessment follow. Testing scope is individual.',
    rehabTitle: 'What to expect after the visit',
    rehab: 'After assessment, an individual rehabilitation plan may be proposed: exercise, physiotherapy, manual techniques, or follow-up — as indicated. The plan may be adjusted as symptoms change.',
    rehabBullets: [
      'Written or verbal load guidance',
      'Scheduling follow-up visits when needed',
      'Home exercises — only after assessment',
      'Referral to another specialist when indicated'
    ],
    trustTitle: 'Center principles',
    trustBullets: [
      'Conservative rehabilitation without outcome guarantees',
      'Individual approach after examination',
      'Multidisciplinary team when needed',
      'Transparent editorial and medical review policy'
    ],
    bookTitle: 'When to book',
    bookBullets: [
      'When symptoms persist and interfere with activity',
      'When assessment is needed after injury or surgery',
      'When prior care did not help as expected — discuss with a physician',
      'For red-flag symptoms — seek emergency care first, do not delay'
    ],
    faq: [
      { q: 'What should I bring to the first visit?', a: 'Imaging and reports (if available), medication list, description of complaints, and comfortable clothing.' },
      { q: 'How long is the consultation?', a: 'Typically 20–40 minutes depending on the case.' },
      { q: 'Are medications prescribed?', a: 'Prescriptions depend on clinical findings and physician scope.' },
      { q: 'Can I treat myself using this guide alone?', a: 'No. This material is informational and does not replace in-person consultation.' },
      { q: 'When is emergency care needed?', a: 'For severe pain, worsening weakness, numbness, or bladder or bowel changes — seek urgent care.' }
    ]
  }
};

SPECS['/about-doctor'] = {
  ru: {
    tagline: 'Команда специалистов и экспертиза центра',
    description: 'О врачах центра «Здоровый позвоночник» в Ереване — профили специалистов и консервативный подход к реабилитации.',
    intro1: `${CLINIC_RU} — реабилитационный центр в Ереване с командой ортопедов, неврологов, специалистов ЛФК, физиотерапии и мануальной терапии.`,
    intro2: 'Каждый специалист работает в рамках своей компетенции после очной консультации. Биографии на сайте носят информационный характер и не заменяют личного знакомства на приёме. Мы не публикуем необоснованные заявления о «лучшем враче» или гарантиях излечения.',
    sections: [
      { title: 'Принципы работы', bullets: ['Консерватив реабилитация без гарантий результата', 'Индивидуальный план после оценки', 'Междисциплинарное взаимодействие специалистов', 'Прозрачная информация для пациентов'] },
      { title: 'Как выбрать специалиста', p: 'На странице «Найти врача» можно ознакомиться с профилями. Окончательный выбор часто делается при записи или после первичной консультации, когда уточняется профиль жалоб.' },
      { title: 'Запись на приём', bullets: ['Запись через форму на сайте или по телефону', 'Уточнение адреса и графика при записи', 'Рекомендуется принести имеющиеся исследования'] }
    ],
    faq: [
      { q: 'Как выбрать специалиста?', a: 'Ознакомьтесь с профилями на странице «Найти врача»; при записи можно уточнить, кто принимает по вашему профилю жалоб.' },
      { q: 'Все ли врачи принимают по одному адресу?', a: 'Актуальный график и адрес уточняйте при записи.' },
      { q: 'Публикуется ли информация об образовании?', a: 'На сайте размещаются подтверждённые данные; подробности можно уточнить на приёме.' },
      { q: 'Гарантирует ли центр результат?', a: 'Нет. Результаты могут отличаться; план формируется индивидуально после осмотра.' }
    ]
  },
  en: {
    tagline: 'Specialist team and center expertise',
    description: 'About Healthy Spine physicians in Yerevan — specialist profiles and conservative rehabilitation focus.',
    intro1: `${CLINIC_EN} is a rehabilitation center in Yerevan with orthopedists, neurologists, exercise therapy, physiotherapy, and manual therapy specialists.`,
    intro2: 'Each professional works within their scope after in-person consultation. Online bios are informational and do not replace meeting the physician. We do not publish unfounded «best doctor» claims or cure guarantees.',
    sections: [
      { title: 'Care principles', bullets: ['Conservative rehabilitation without outcome guarantees', 'Individual plans after assessment', 'Multidisciplinary collaboration', 'Transparent patient information'] },
      { title: 'Choosing a specialist', p: 'Review profiles on Find a Doctor. Final selection often happens when booking or after the first visit, when the complaint profile is clarified.' },
      { title: 'Booking', bullets: ['Book via the website form or phone', 'Confirm address and schedule when booking', 'Bring prior imaging when available'] }
    ],
    faq: [
      { q: 'How do I choose a specialist?', a: 'Review profiles on Find a Doctor; when booking, ask who sees patients with your complaint profile.' },
      { q: 'Do all doctors share one location?', a: 'Confirm schedule and address when booking.' },
      { q: 'Is training information published?', a: 'Only verified details appear on the site; ask at your visit for specifics.' },
      { q: 'Does the center guarantee outcomes?', a: 'No. Results may vary; plans are individual after examination.' }
    ]
  }
};

SPECS['/editorial-policy'] = {
  ru: {
    tagline: 'Стандарты медицинского контента на сайте',
    description: 'Редакционная политика «Здоровый позвоночник» — как мы готовим и проверяем медицинскую информацию.',
    intro1: 'Сайт healthyspinedoc.com публикует информационные материалы о здоровье позвоночника, реабилитации и консервативном подходе. Контент не заменяет очную консультацию.',
    intro2: 'Мы стремимся использовать понятный язык, избегать необоснованных обещаний и указывать, когда необходима оценка специалиста. Результаты лечения могут отличаться.',
    sections: [
      { title: 'Стандарты материалов', bullets: ['Информационный характер без диагноза «по сайту»', 'Осторожные формулировки: «может помочь», «после оценки»', 'Указание, что результаты могут отличаться', 'Ссылки на очную консультацию при симптомах'] },
      { title: 'Обновления', p: 'Статьи периодически пересматриваются. Дата актуализации может указываться на странице материала.' },
      { title: 'Обратная связь', p: 'Если вы заметили ошибку в материале, используйте контактную форму или телефон клиники.' }
    ],
    faq: [
      { q: 'Кто пишет статьи?', a: 'Материалы готовятся с участием специалистов центра и редактуры; детали — в политике медицинской экспертизы.' },
      { q: 'Можно ли лечиться только по сайту?', a: 'Нет. Сайт информационный; лечение начинается после очной консультации.' },
      { q: 'Как сообщить об ошибке?', a: 'Используйте контактную форму или телефон клиники.' },
      { q: 'Используются ли рекламные обещания?', a: 'Нет. Мы не публикуем гарантии излечения или заявления о «лучшем враче».' }
    ]
  },
  en: {
    tagline: 'Medical content standards on our website',
    description: 'Healthy Spine editorial policy — how we prepare and review medical information.',
    intro1: 'healthyspinedoc.com publishes informational content on spine health and conservative rehabilitation. Content does not replace in-person care.',
    intro2: 'We use clear language, avoid unfounded promises, and note when specialist assessment is required. Treatment results may vary.',
    sections: [
      { title: 'Content standards', bullets: ['Informational only — no diagnosis via website', 'Cautious wording: «may help», «after assessment»', 'Results may vary', 'Encouragement to seek care for symptoms'] },
      { title: 'Updates', p: 'Articles are periodically reviewed. Update dates may appear on individual pages.' },
      { title: 'Feedback', p: 'If you notice an error, use the contact form or clinic phone number.' }
    ],
    faq: [
      { q: 'Who writes articles?', a: 'Content is prepared with clinical and editorial input; see the medical review policy.' },
      { q: 'Can I treat myself using the site?', a: 'No. Care begins after in-person consultation.' },
      { q: 'How do I report an error?', a: 'Use the contact form or clinic phone number.' },
      { q: 'Are promotional promises used?', a: 'No. We do not publish cure guarantees or «best doctor» claims.' }
    ]
  }
};

SPECS['/medical-review-policy'] = {
  ru: {
    tagline: 'Как мы проверяем медицинскую информацию',
    description: 'Политика медицинской экспертизы «Здоровый позвоночник» — процесс проверки контента специалистами.',
    intro1: 'Медицинские материалы на сайте проходят внутреннюю проверку на соответствие принципам доказательной и консервативной медицины в рамках профиля центра.',
    intro2: 'Мы не публикуем гарантии излечения, обещания «лучшего врача» или рекламные заявления о 100% результате. Даже проверенный текст не заменяет персонализированную консультацию.',
    sections: [
      { title: 'Процесс экспертизы', bullets: ['Проверка фактов профильным специалистом', 'Редактура языка и медицинских формулировок', 'Исключение необоснованных рекомендаций', 'Периодический пересмотр материалов'] },
      { title: 'Ограничения', p: 'Контент носит общий информационный характер и не является назначением лечения для конкретного пациента.' },
      { title: 'Связанные страницы', bullets: ['Редакционная политика', 'О врачах', 'Процесс консультации'] }
    ],
    faq: [
      { q: 'Заменяет ли проверенный текст консультацию?', a: 'Нет. Даже проверенный контент не персонализирован и не является назначением.' },
      { q: 'Указывается ли автор?', a: 'На ключевых страницах может указываться профиль ответственного специалиста или центра.' },
      { q: 'Как часто обновляется политика?', a: 'По мере изменения процессов; актуальная версия размещена на этой странице.' },
      { q: 'Проверяются ли все языки?', a: 'Да, материалы на армянском, русском и английском проходят согласованную проверку.' }
    ]
  },
  en: {
    tagline: 'How we review medical information',
    description: 'Healthy Spine medical review policy — specialist review of website content.',
    intro1: 'Medical pages undergo internal review for alignment with conservative, evidence-informed practice within the center\'s scope.',
    intro2: 'We do not publish cure guarantees, «best doctor» claims, or 100% success advertising. Even reviewed text does not replace personalized consultation.',
    sections: [
      { title: 'Review process', bullets: ['Clinical fact check by a relevant specialist', 'Language and medical wording edit', 'Removal of unsupported recommendations', 'Periodic content refresh'] },
      { title: 'Limitations', p: 'Content is general information and is not a treatment prescription for a specific patient.' },
      { title: 'Related pages', bullets: ['Editorial policy', 'About physicians', 'Consultation process'] }
    ],
    faq: [
      { q: 'Does reviewed content replace consultation?', a: 'No. Even reviewed text is not personalized medical advice.' },
      { q: 'Is authorship shown?', a: 'Key pages may name responsible clinicians or the center.' },
      { q: 'How often is this policy updated?', a: 'As processes change; the current version is on this page.' },
      { q: 'Are all languages reviewed?', a: 'Yes — Armenian, Russian, and English materials follow aligned review.' }
    ]
  }
};

const YEREVAN_LANDING_PATHS = [
  '/spine-specialist-yerevan',
  '/back-pain-treatment-yerevan',
  '/neck-pain-treatment-yerevan',
  '/sciatica-treatment-yerevan',
  '/herniated-disc-treatment-yerevan',
  '/orthopedic-consultation-yerevan'
];

const PAGE_SYMPTOMS = {
  '/spine-specialist-yerevan': {
    ru: ['Боль или скованность в спине, шее или пояснице', 'Онемение или слабость в руках или ногах', 'Дискомфорт после сидения или нагрузки', 'Ограничение повседневной активности', 'Жалобы после травмы — требуют оценки'],
    en: ['Back, neck, or lumbar pain and stiffness', 'Arm or leg numbness or weakness', 'Discomfort after sitting or strain', 'Limited daily activity', 'Post-injury complaints — warrant assessment']
  },
  '/back-pain-treatment-yerevan': {
    ru: ['Локальная или иррадирующая боль в спине', 'Мышечное напряжение и скованность', 'Усиление при сидении или наклонах', 'Ограничение движений', 'Боль после подъёма тяжести'],
    en: ['Local or radiating back pain', 'Muscle tension and stiffness', 'Pain worsened by sitting or bending', 'Limited movement', 'Pain after lifting']
  },
  '/neck-pain-treatment-yerevan': {
    ru: ['Скованность при повороте головы', 'Напряжение в плечах', 'Головные боли на фоне боли в шее', 'Онемение в руках — требует оценки', 'Дискомфорт при работе за компьютером'],
    en: ['Stiffness when turning the head', 'Shoulder tension', 'Headaches with neck pain', 'Arm numbness — needs assessment', 'Discomfort during computer work']
  },
  '/sciatica-treatment-yerevan': {
    ru: ['Боль в пояснице с отдачей в ногу', 'Онемение или слабость в ноге', 'Усиление боли при сидении', 'Жжение по задней поверхности ноги', 'Обострение при кашле или движении'],
    en: ['Low back pain radiating to the leg', 'Leg numbness or weakness', 'Pain worsened by sitting', 'Burning along the back of the leg', 'Aggravation with cough or movement']
  },
  '/herniated-disc-treatment-yerevan': {
    ru: ['Боль в спине или пояснице', 'Иррадиация в ногу или руку', 'Онемение или слабость', 'Ограничение подвижности', 'Усиление симптомов при нагрузке'],
    en: ['Back or lumbar pain', 'Radiation to leg or arm', 'Numbness or weakness', 'Limited mobility', 'Symptoms worsened by loading']
  },
  '/orthopedic-consultation-yerevan': {
    ru: ['Боль в суставах или позвоночнике', 'Ограничение движений после травмы', 'Хронический дискомфорт при ходьбе или сидении', 'Скованность по утрам', 'Необходимость оценки перед реабилитацией'],
    en: ['Joint or spine pain', 'Limited movement after injury', 'Chronic discomfort when walking or sitting', 'Morning stiffness', 'Need for assessment before rehabilitation']
  }
};

for (const path of YEREVAN_LANDING_PATHS) {
  const sym = PAGE_SYMPTOMS[path];
  if (!sym || !SPECS[path]) continue;
  SPECS[path].ru.symptoms = sym.ru;
  SPECS[path].en.symptoms = sym.en;
  SPECS[path].ru.extraSections = [
    {
      title: 'Полезные материалы',
      p: 'На сайте доступны информационные статьи о причинах боли, процессе консультации и консервативной реабилитации. Они не заменяют очный осмотр.',
      bullets: ['База знаний о здоровье позвоночника', 'Страница «Как проходит консультация»', 'Руководство для пациента']
    }
  ];
  SPECS[path].en.extraSections = [
    {
      title: 'Helpful resources',
      p: 'The website offers informational articles on pain causes, consultation process, and conservative rehabilitation. They do not replace in-person examination.',
      bullets: ['Spine health knowledge base', 'Consultation process page', 'Patient consultation guide']
    }
  ];
}

module.exports = { SPECS };
