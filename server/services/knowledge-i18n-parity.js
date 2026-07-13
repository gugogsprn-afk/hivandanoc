/**
 * RU/EN knowledge title fixes and top-10 article parity overlays.
 * Merged in knowledge-pages.js getKnowledgeConfig().
 */
'use strict';

const CLINIC_RU = '«Здоровый позвоночник»';
const CLINIC_EN = 'Healthy Spine';

function titleMeta(ruH1, ruTagline, enH1, enTagline) {
  return {
    ru: {
      h1: ruH1,
      titleSuffix: ruH1,
      tagline: ruTagline,
      description: `${ruH1}. Информационная статья центра ${CLINIC_RU}.`
    },
    en: {
      h1: enH1,
      titleSuffix: enH1,
      tagline: enTagline,
      description: `${enH1}. Informational article from ${CLINIC_EN}.`
    }
  };
}

const TITLE_FIXES = {
  'back-pain-causes': titleMeta(
    'Причины боли в спине',
    'Информационное руководство о частых причинах боли в спине',
    'Causes of back pain',
    'Informational guide to common causes of back pain'
  ),
  'neck-pain-causes': titleMeta(
    'Причины боли в шее',
    'Информационное руководство о частых причинах боли в шее',
    'Causes of neck pain',
    'Informational guide to common causes of neck pain'
  ),
  'herniated-disc-symptoms': titleMeta(
    'Симптомы межпозвоночной грыжи',
    'Информационное руководство о возможных симптомах грыжи диска',
    'Herniated disc symptoms',
    'Informational guide to possible herniated disc symptoms'
  ),
  'posture-and-spine-health': titleMeta(
    'Осанка и здоровье позвоночника',
    'Информационное руководство о связи осанки и позвоночника',
    'Posture and spine health',
    'Informational guide to posture and spinal health'
  ),
  'rehabilitation-after-spine-surgery': titleMeta(
    'Восстановление после операции на позвоночнике',
    'Информационное руководство о реабилитации после операции',
    'Rehabilitation after spine surgery',
    'Informational guide to post-surgical spine rehabilitation'
  ),
  'lower-back-pain-causes': titleMeta(
    'Причины боли в пояснице',
    'Информационное руководство о частых причинах поясничной боли',
    'Causes of lower back pain',
    'Informational guide to common causes of lumbar pain'
  ),
  'sciatica-symptoms': titleMeta(
    'Симптомы ишиаса',
    'Информационное руководство о частых симптомах ишиаса',
    'Sciatica symptoms',
    'Informational guide to common sciatica symptoms'
  ),
  'neck-stiffness-causes': titleMeta(
    'Причины скованности шеи',
    'Информационное руководство о возможных причинах скованности шеи',
    'Causes of neck stiffness',
    'Informational guide to possible causes of neck stiffness'
  ),
  'leg-numbness-and-spine': titleMeta(
    'Онемение ноги и позвоночник',
    'Информационное руководство о связи онемения ноги и позвоночника',
    'Leg numbness and the spine',
    'Informational guide to leg numbness and spinal factors'
  ),
  'back-pain-when-sitting': titleMeta(
    'Боль в спине при сидении',
    'Информационное руководство о боли в спине при длительном сидении',
    'Back pain when sitting',
    'Informational guide to back pain during prolonged sitting'
  ),
  'when-back-pain-needs-evaluation': titleMeta(
    'Когда боль в спине требует оценки',
    'Информационное руководство о признаках, при которых нужна консультация',
    'When back pain needs evaluation',
    'Informational guide to when back pain may need assessment'
  ),
  'sciatica-vs-lower-back-pain': titleMeta(
    'Ишиас и боль в пояснице: в чём разница',
    'Информационное сравнение ишиаса и поясничной боли',
    'Sciatica vs lower back pain',
    'Informational comparison of sciatica and lumbar pain'
  ),
  'herniated-disc-vs-bulging-disc': titleMeta(
    'Грыжа и выпячивание диска: различия',
    'Информационное руководство о различиях грыжи и выпячивания',
    'Herniated disc vs bulging disc',
    'Informational guide to disc herniation and bulging'
  ),
  'back-pain-after-lifting': titleMeta(
    'Боль в спине после подъёма тяжестей',
    'Информационное руководство о боли после физической нагрузки',
    'Back pain after lifting',
    'Informational guide to back pain after lifting'
  ),
  'neck-pain-symptoms': titleMeta(
    'Симптомы боли в шее',
    'Информационное руководство о возможных симптомах боли в шее',
    'Neck pain symptoms',
    'Informational guide to possible neck pain symptoms'
  ),
  'back-pain-symptoms': titleMeta(
    'Симптомы боли в спине',
    'Информационное руководство о возможных симптомах боли в спине',
    'Back pain symptoms',
    'Informational guide to possible back pain symptoms'
  ),
  'shoulder-pain-causes': titleMeta(
    'Причины боли в плече',
    'Информационное руководство о частых причинах боли в плече',
    'Causes of shoulder pain',
    'Informational guide to common causes of shoulder pain'
  ),
  'exercises-for-back-pain': titleMeta(
    'Упражнения при боли в спине',
    'Информационное руководство об упражнениях после оценки специалиста',
    'Exercises for back pain',
    'Informational guide to exercise after specialist assessment'
  ),
  'spine-surgery-when-needed': titleMeta(
    'Когда может потребоваться операция на позвоночнике',
    'Информационное руководство о показаниях к хирургии позвоночника',
    'When spine surgery may be needed',
    'Informational guide to when spine surgery may be considered'
  ),
  'what-is-osteochondrosis': titleMeta(
    'Остеохондроз: симптомы и подходы к реабилитации',
    'Информационное руководство об остеохондрозе',
    'What is osteochondrosis',
    'Informational guide to osteochondrosis'
  ),
  'scoliosis-in-adults': titleMeta(
    'Сколиоз у взрослых',
    'Информационное руководство о сколиозе у взрослых',
    'Scoliosis in adults',
    'Informational guide to scoliosis in adults'
  ),
  'joint-pain-and-spine': titleMeta(
    'Боль в суставах и позвоночник',
    'Информационное руководство о связи суставной боли и позвоночника',
    'Joint pain and the spine',
    'Informational guide to joint pain and spinal factors'
  ),
  'sciatica-and-walking': titleMeta(
    'Ишиас и ходьба',
    'Информационное руководство о связи ишиаса и ходьбы',
    'Sciatica and walking',
    'Informational guide to sciatica and walking'
  ),
  'sciatica-and-sitting': titleMeta(
    'Ишиас и сидение',
    'Информационное руководство о связи ишиаса и сидения',
    'Sciatica and sitting',
    'Informational guide to sciatica and sitting'
  ),
  'sciatica-symptoms-in-leg': titleMeta(
    'Симптомы ишиаса в ноге',
    'Информационное руководство о симптомах ишиаса в ноге',
    'Sciatica symptoms in the leg',
    'Informational guide to leg symptoms that may relate to sciatica'
  ),
  'sciatica-recovery-time': titleMeta(
    'Сроки восстановления при ишиасе',
    'Информационное руководство о возможных сроках восстановления',
    'Sciatica recovery time',
    'Informational guide to recovery timelines for sciatica'
  ),
  'cervical-osteochondrosis': titleMeta(
    'Шейный остеохондроз',
    'Информационное руководство о шейном остеохондрозе',
    'Cervical osteochondrosis',
    'Informational guide to cervical osteochondrosis'
  ),
  'lumbar-osteochondrosis': titleMeta(
    'Поясничный остеохондроз',
    'Информационное руководство о поясничном остеохондрозе',
    'Lumbar osteochondrosis',
    'Informational guide to lumbar osteochondrosis'
  ),
  'osteochondrosis-symptoms': titleMeta(
    'Симптомы остеохондроза',
    'Информационное руководство о возможных симптомах остеохондроза',
    'Osteochondrosis symptoms',
    'Informational guide to possible osteochondrosis symptoms'
  ),
  'osteochondrosis-treatment-options': titleMeta(
    'Варианты лечения остеохондроза',
    'Информационное руководство о консервативных подходах',
    'Osteochondrosis treatment options',
    'Informational guide to conservative osteochondrosis options'
  ),
  'posture-and-neck-pain': titleMeta(
    'Осанка и боль в шее',
    'Информационное руководство о связи осанки и боли в шее',
    'Posture and neck pain',
    'Informational guide to posture and neck pain'
  ),
  'posture-and-back-pain': titleMeta(
    'Осанка и боль в спине',
    'Информационное руководство о связи осанки и боли в спине',
    'Posture and back pain',
    'Informational guide to posture and back pain'
  ),
  'desk-work-posture': titleMeta(
    'Осанка при работе за компьютером',
    'Информационное руководство об осанке при сидячей работе',
    'Desk work posture',
    'Informational guide to posture at a desk'
  ),
  'radiculopathy-symptoms': titleMeta(
    'Симптомы радикулопатии',
    'Информационное руководство о возможных симптомах радикулопатии',
    'Radiculopathy symptoms',
    'Informational guide to possible radiculopathy symptoms'
  ),
  'radiculopathy-vs-sciatica': titleMeta(
    'Радикулопатия и ишиас: различия',
    'Информационное сравнение радикулопатии и ишиаса',
    'Radiculopathy vs sciatica',
    'Informational comparison of radiculopathy and sciatica'
  ),
  'when-radiculopathy-needs-evaluation': titleMeta(
    'Когда радикулопатию нужно оценить',
    'Информационное руководство о признаках для консультации',
    'When radiculopathy needs evaluation',
    'Informational guide to when radiculopathy may need assessment'
  ),
  'chronic-neck-pain': titleMeta(
    'Хроническая боль в шее',
    'Информационное руководство о длительной боли в шее',
    'Chronic neck pain',
    'Informational guide to chronic neck pain'
  ),
  'neck-pain-and-sleep': titleMeta(
    'Боль в шее и сон',
    'Информационное руководство о связи боли в шее и сна',
    'Neck pain and sleep',
    'Informational guide to neck pain and sleep'
  ),
  'neck-pain-and-computer-work': titleMeta(
    'Боль в шее при работе за компьютером',
    'Информационное руководство о боли в шее при сидячей работе',
    'Neck pain and computer work',
    'Informational guide to neck pain at a computer'
  ),
  'thoracic-back-pain-causes': titleMeta(
    'Причины боли в грудном отделе спины',
    'Информационное руководство о боли в грудном отделе',
    'Causes of thoracic back pain',
    'Informational guide to thoracic back pain causes'
  ),
  'joint-pain-causes': titleMeta(
    'Причины боли в суставах',
    'Информационное руководство о частых причинах суставной боли',
    'Causes of joint pain',
    'Informational guide to common causes of joint pain'
  )
};

const TOP10_SLUGS = [
  'back-pain-causes',
  'neck-pain-causes',
  'herniated-disc-symptoms',
  'sciatica-symptoms',
  'what-is-osteochondrosis',
  'radiculopathy-symptoms',
  'scoliosis-in-adults',
  'lower-back-pain-causes',
  'shoulder-pain-causes',
  'joint-pain-and-spine'
];

const TOP10_CONTENT = {
  ru: {
    'back-pain-causes': {
      intro:
        'Боль в спине — частая жалоба, которая может возникать по разным причинам: от мышечного напряжения до проблем с межпозвоночным диском или длительной сидячей работы. Реабилитационный центр «Здоровый позвоночник» в Ереване может предложить консервативную оценку после осмотра специалиста. Эта статья носит информационный характер, не является диагнозом и не гарантирует результат лечения.',
      symptoms: [
        'Боль в спине или поясничной области, с одной или обеих сторон',
        'Усиление боли при движении или смене положения',
        'Мышечное напряжение',
        'Ограничение подвижности',
        'Боль, которая может отдавать в ногу или область таза (по результатам оценки)'
      ],
      causes: [
        'Мышечное напряжение или перегрузка',
        'Длительная сидячая работа или слабая осанка',
        'Проблемы, связанные с межпозвоночным диском',
        'Возрастные изменения суставов',
        'Длительный стресс',
        'Травмы'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней и не уменьшается после отдыха',
        'Если боль мешает повседневной активности, сну или работе',
        'Если нарастают неврологические симптомы (онемение, слабость)',
        'Если боль началась после травмы, падения или подъёма тяжестей',
        'При тревожных признаках (сильная боль, потеря контроля мочеиспускания или стула) — обратитесь за экстренной помощью'
      ],
      faq: [
        {
          q: 'Означает ли боль в спине всегда серьёзную причину?',
          a: 'Не всегда. Во многих случаях боль связана с мышечным напряжением или осанкой. При длительных симптомах может потребоваться оценка специалиста.'
        },
        {
          q: 'Что может предложить центр «Здоровый позвоночник»?',
          a: 'После консультации центр может предложить консервативную оценку и реабилитационные визиты по назначению врача. Результаты могут отличаться.'
        },
        {
          q: 'Можно ли заниматься самолечением при боли в спине?',
          a: 'Самостоятельные методы без оценки могут быть небезопасны. Рекомендуется консультация специалиста, особенно при стойких или нарастающих симптомах.'
        }
      ]
    },
    'neck-pain-causes': {
      intro:
        'Боль в шее может быть связана с мышечным напряжением, осанкой, длительной работой за компьютером или другими факторами опорно-двигательного аппарата. Центр «Здоровый позвоночник» в Ереване может предложить консервативную оценку после осмотра специалиста. Материал информационный и не заменяет медицинскую консультацию.',
      symptoms: [
        'Скованность или боль в шее при движении',
        'Дискомфорт при повороте головы или смене положения',
        'Напряжение в плечах или верхней части спины',
        'Ощущение «тяжести» в голове',
        'Головные боли, если они сопровождают боль в шее (требуют оценки)'
      ],
      causes: [
        'Мышечное напряжение',
        'Длительная работа за компьютером',
        'Слабая осанка',
        'Травмы',
        'Возрастные изменения суставов',
        'Длительный стресс'
      ],
      whenToSeek: [
        'Если боль в шее не уменьшается в течение нескольких дней',
        'Если боль сопровождается онемением или слабостью в руках',
        'Если боль началась после травмы или ДТП',
        'Если боль мешает сну, работе или вождению',
        'При тревожных симптомах (сильная головная боль, нарушение зрения) — обратитесь за экстренной помощью'
      ],
      faq: [
        {
          q: 'Что может предложить центр «Здоровый позвоночник»?',
          a: 'После консультации может быть предложена консервативная оценка и индивидуальный план реабилитации. Результаты могут отличаться.'
        },
        {
          q: 'Связана ли боль в шее всегда с позвоночником?',
          a: 'Не всегда. Причины могут быть разными; специалист может помочь уточнить картину после осмотра.'
        },
        {
          q: 'Помогает ли смена подушки при боли в шее?',
          a: 'Иногда комфорт сна может улучшиться, но устойчивые симптомы требуют оценки специалиста, а не только смены аксессуаров.'
        }
      ]
    },
    'herniated-disc-symptoms': {
      intro:
        'Межпозвоночная грыжа может сопровождаться болью в спине, неврологическими симптомами или ограничением движений. Центр «Здоровый позвоночник» в Ереване может предложить консервативную оценку после осмотра специалиста. Статья информационная и не заменяет диагноз.',
      symptoms: [
        'Боль в спине или пояснице',
        'Боль, которая может отдавать в ногу или область таза',
        'Онемение или «ползание мурашек»',
        'Мышечная слабость',
        'Ограничение подвижности'
      ],
      causes: [
        'Возрастные изменения межпозвоночного диска',
        'Подъём тяжестей или нагрузка',
        'Травмы',
        'Длительная сидячая работа',
        'Индивидуальные факторы, оцениваемые специалистом'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней и не уменьшается после отдыха',
        'Если боль мешает повседневной активности',
        'Если нарастают онемение или слабость',
        'Если симптомы начались после травмы',
        'При нарушении мочеиспускания или стула — обратитесь за экстренной помощью'
      ],
      faq: [
        {
          q: 'Всегда ли грыжа диска требует операции?',
          a: 'Не во всех случаях. Консервативные методы могут рассматриваться после оценки специалиста; тактика зависит от клинической картины.'
        },
        {
          q: 'Может ли центр помочь при симптомах грыжи?',
          a: 'После консультации может быть предложена консервативная реабилитация. Результаты могут отличаться.'
        },
        {
          q: 'Как отличить грыжу от обычной боли в спине?',
          a: 'Только специалист после осмотра и при необходимости обследования может уточнить причину симптомов.'
        }
      ]
    },
    'sciatica-symptoms': {
      intro:
        'Ишиас часто описывают как боль, которая может иррадировать в ногу или область таза и может быть связана с раздражением нерва. Эта статья информационная и не означает, что любая боль в ноге — ишиас. Центр «Здоровый позвоночник» может предложить консервативную оценку после осмотра специалиста.',
      symptoms: [
        'Боль в пояснице, которая может отдавать в ногу или область таза',
        'Онемение или слабость в ноге',
        'Жжение или «прострел» в задней поверхности ноги',
        'Усиление боли в сидячем положении',
        'Усиление боли при движении или кашле'
      ],
      causes: [
        'Давление на нерв со стороны диска',
        'Мышечное напряжение в поясничной области',
        'Длительная сидячая работа',
        'Возрастные изменения суставов',
        'Перегрузки'
      ],
      whenToSeek: [
        'Если боль не уменьшается в течение нескольких дней',
        'Если нарастают онемение или слабость',
        'Если боль мешает сну или повседневной активности',
        'Если появились проблемы с мочеиспусканием или стулом',
        'При острых или нарастающих симптомах — обратитесь за медицинской помощью'
      ],
      faq: [
        {
          q: 'Всегда ли ишиас требует операции?',
          a: 'Нет. Во многих случаях могут рассматриваться консервативные методы после оценки специалиста.'
        },
        {
          q: 'Какие симптомы чаще ассоциируют с ишиасом?',
          a: 'Часто это боль или онемение в ноге, усиливающиеся при сидении. Подтвердить связь может только специалист.'
        },
        {
          q: 'Сколько длится восстановление при ишиасе?',
          a: 'Сроки индивидуальны и зависят от причины и тактики лечения после консультации.'
        }
      ]
    },
    'what-is-osteochondrosis': {
      intro:
        'Остеохондроз — термин, описывающий возрастные изменения межпозвоночных дисков. Эта статья информационная и не заменяет медицинский диагноз. После оценки специалиста могут рассматриваться консервативные подходы к реабилитации.',
      symptoms: [
        'Боль в спине или шее',
        'Скованность',
        'Ограничение подвижности',
        'Мышечное напряжение',
        'Иррадиация боли в конечности'
      ],
      causes: [
        'Возрастные изменения',
        'Длительная сидячая работа',
        'Проблемы с осанкой',
        'Травмы',
        'Индивидуальные факторы'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней',
        'Если ограничивается подвижность',
        'Если нарастают неврологические симптомы',
        'Если симптомы мешают повседневной активности',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      faq: [
        {
          q: 'Что такое остеохондроз и как с ним работают?',
          a: 'Остеохондроз может управляться консервативными методами после оценки специалиста. Результаты могут отличаться.'
        },
        {
          q: 'Можно ли полностью излечить остеохондроз?',
          a: 'Цель консервативной помощи — облегчение симптомов и поддержка функции; полное «излечение» не гарантируется.'
        },
        {
          q: 'Нужна ли операция при остеохондрозе?',
          a: 'Решение принимается индивидуально после консультации; многие пациенты получают консервативную помощь.'
        }
      ]
    },
    'radiculopathy-symptoms': {
      intro:
        'Радикулопатия может проявляться разными симптомами, связанными с раздражением корешка спинномозгового нерва. Материал информационный; диагноз может поставить только специалист после осмотра.',
      symptoms: [
        'Боль, отдающая в руку или ногу',
        'Онемение',
        'Слабость',
        'Жжение или «прострел»',
        'Мышечная слабость'
      ],
      causes: [
        'Давление на корешок нерва',
        'Проблемы межпозвоночного диска',
        'Возрастные изменения',
        'Травмы'
      ],
      whenToSeek: [
        'Если боль иррадирует в конечность',
        'Если нарастает онемение',
        'Если симптомы мешают повседневной активности',
        'При быстром нарастании слабости — обратитесь за медицинской помощью'
      ],
      faq: [
        {
          q: 'Какие симптомы характерны для радикулопатии?',
          a: 'Могут быть боль, онемение и слабость в зоне иннервации нерва. Специалист может провести оценку.'
        },
        {
          q: 'Чем радикулопатия отличается от ишиаса?',
          a: 'Ишиас — частный случай поражения поясничных корешков; точное различие определяет врач.'
        },
        {
          q: 'Может ли центр помочь при радикулопатии?',
          a: 'После консультации может быть предложена консервативная реабилитация; результаты индивидуальны.'
        }
      ]
    },
    'scoliosis-in-adults': {
      intro:
        'Сколиоз у взрослых может сопровождаться болью, мышечным напряжением или проблемами с осанкой. Статья информационная и не заменяет медицинский диагноз. После оценки специалиста может быть предложен индивидуальный план наблюдения и реабилитации.',
      symptoms: [
        'Боль в спине, связанная с искривлением',
        'Мышечное напряжение',
        'Асимметрия осанки',
        'Ограничение подвижности',
        'Усиление боли при длительном стоянии'
      ],
      causes: [
        'Перенесённый в детстве сколиоз',
        'Возрастные изменения',
        'Травмы',
        'Проблемы с осанкой',
        'Индивидуальные факторы'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких недель',
        'Если проблемы с осанкой прогрессируют',
        'Если симптомы мешают повседневной активности',
        'Если появляются затруднения дыхания',
        'При нарастающих симптомах — обратитесь к специалисту'
      ],
      faq: [
        {
          q: 'Как управляют сколиозом у взрослых?',
          a: 'Могут применяться реабилитационные упражнения, наблюдение и периодический контроль после оценки специалиста.'
        },
        {
          q: 'Можно ли исправить сколиоз у взрослого?',
          a: 'Цель часто — поддержка функции и облегчение симптомов; полная коррекция не всегда достижима.'
        },
        {
          q: 'Нужна ли операция при сколиозе у взрослых?',
          a: 'Решение принимается индивидуально; многие случаи ведутся консервативно.'
        }
      ]
    },
    'lower-back-pain-causes': {
      intro:
        'Боль в пояснице — частая жалоба, которая может возникать из-за мышечного напряжения, проблем с диском или длительного сидения. Центр «Здоровый позвоночник» может предложить консервативную оценку после осмотра специалиста. Материал не заменяет диагноз и не гарантирует результат.',
      symptoms: [
        'Боль в пояснице с одной или обеих сторон',
        'Усиление боли при сидении или стоянии',
        'Мышечное напряжение или скованность в пояснице',
        'Ограничение подвижности',
        'Боль, которая может отдавать в ногу (по результатам оценки)'
      ],
      causes: [
        'Мышечное напряжение или перегрузка',
        'Длительная сидячая работа или слабая осанка',
        'Проблемы с межпозвоночным диском',
        'Возрастные изменения суставов',
        'Перегрузки',
        'Длительный стресс'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней',
        'Если боль мешает сну, работе или активности',
        'Если нарастают онемение или слабость',
        'Если боль началась после травмы или подъёма тяжестей',
        'При тревожных признаках — обратитесь за экстренной помощью'
      ],
      faq: [
        {
          q: 'Означает ли поясничная боль всегда серьёзную причину?',
          a: 'Не всегда. Часто боль связана с мышцами или осанкой; при длительных симптомах нужна оценка специалиста.'
        },
        {
          q: 'Что может предложить центр?',
          a: 'Консервативную оценку и реабилитационные визиты по назначению врача. Результаты могут отличаться.'
        },
        {
          q: 'Помогает ли отдых при поясничной боли?',
          a: 'Краткий покой может временно облегчить симптомы, но стойкая боль требует консультации.'
        }
      ]
    },
    'shoulder-pain-causes': {
      intro:
        'Боль в плече может быть связана с мышечным напряжением, повреждением сустава или проблемами осанки. Статья информационная и не заменяет медицинский диагноз. После оценки специалиста может быть предложен индивидуальный план реабилитации.',
      symptoms: [
        'Боль в плечевом суставе',
        'Ограничение поднятия руки',
        'Напряжение в области плеча',
        'Боль при подъёме руки ночью',
        'Жжение или «прострел»'
      ],
      causes: [
        'Мышечное напряжение',
        'Повреждение сустава',
        'Проблемы с осанкой',
        'Травмы',
        'Проблемы в области шеи'
      ],
      whenToSeek: [
        'Если боль не уменьшается в течение нескольких дней',
        'Если ограничивается подвижность',
        'Если боль мешает повседневной активности',
        'Если боль началась после травмы',
        'При нарастающих симптомах — обратитесь к специалисту'
      ],
      faq: [
        {
          q: 'Что может вызывать боль в плече?',
          a: 'Причины могут быть мышечными, суставными или связанными с осанкой. Оценку проводит специалист.'
        },
        {
          q: 'Связана ли боль в плече с шеей?',
          a: 'Иногда симптомы могут исходить из шейного отдела; это уточняется при осмотре.'
        },
        {
          q: 'Может ли центр помочь при боли в плече?',
          a: 'После консультации могут быть предложены консервативные методы реабилитации.'
        }
      ]
    },
    'joint-pain-and-spine': {
      intro:
        'Боль в суставах может быть связана с проблемами позвоночника, раздражением нерва или изменениями осанки. Материал информационный и не заменяет медицинский диагноз. После оценки специалиста может быть предложен индивидуальный план.',
      symptoms: [
        'Боль в суставе',
        'Боль в спине или шее',
        'Ограничение подвижности',
        'Скованность в суставе',
        'Мышечное напряжение'
      ],
      causes: [
        'Возрастные изменения',
        'Травмы',
        'Раздражение нерва',
        'Проблемы с осанкой',
        'Индивидуальные факторы'
      ],
      whenToSeek: [
        'Если боль в суставе не уменьшается',
        'Если боль сопровождается болью в спине',
        'Если ограничивается подвижность',
        'Если есть неврологические симптомы',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      faq: [
        {
          q: 'Как связаны боль в суставах и позвоночник?',
          a: 'Суставная боль может быть связана с раздражением нерва, осанкой или изменениями позвоночника. Оценку проводит специалист.'
        },
        {
          q: 'Нужно ли обследовать и сустав, и позвоночник?',
          a: 'Объём обследования определяет врач после сбора анамнеза и осмотра.'
        },
        {
          q: 'Может ли реабилитация помочь при такой боли?',
          a: 'Консервативные методы могут поддерживать функцию после индивидуальной оценки; результаты различаются.'
        }
      ]
    }
  },
  en: {
    'back-pain-causes': {
      intro:
        'Back pain is a common complaint that may arise from muscle strain, disc-related issues, prolonged sitting, or other factors. Healthy Spine rehabilitation center in Yerevan may offer conservative assessment after specialist evaluation. This article is informational, not a diagnosis, and does not guarantee treatment outcomes.',
      symptoms: [
        'Pain in the back or lumbar region, on one or both sides',
        'Pain worsening with movement or position changes',
        'Muscle tension',
        'Limited mobility',
        'Pain that may radiate to the leg or pelvic area (depending on assessment)'
      ],
      causes: [
        'Muscle strain or overuse',
        'Prolonged sitting or poor posture',
        'Disc-related problems',
        'Age-related joint changes',
        'Prolonged stress',
        'Injury'
      ],
      whenToSeek: [
        'If pain lasts more than a few days and does not improve with rest',
        'If pain interferes with daily activity, sleep, or work',
        'If neurological symptoms (numbness, weakness) are increasing',
        'If pain started after injury, a fall, or heavy lifting',
        'For red flags (severe pain, loss of bladder or bowel control) seek emergency care'
      ],
      faq: [
        {
          q: 'Does back pain always mean a serious cause?',
          a: 'Not always. Many cases relate to muscle strain or posture. Persistent pain may need specialist assessment.'
        },
        {
          q: 'What can Healthy Spine offer?',
          a: 'After consultation, the center may offer conservative assessment and rehabilitation visits as recommended. Results may vary.'
        },
        {
          q: 'Is self-treatment safe for back pain?',
          a: 'Unsupervised approaches may be unsafe. Specialist evaluation is advised, especially for persistent or worsening symptoms.'
        }
      ]
    },
    'neck-pain-causes': {
      intro:
        'Neck pain may relate to muscle tension, posture, prolonged computer work, or other musculoskeletal factors. Healthy Spine in Yerevan may offer conservative assessment after specialist evaluation. This content is informational and does not replace medical advice.',
      symptoms: [
        'Neck stiffness or pain with movement',
        'Discomfort when turning the head or changing position',
        'Tension in the shoulders or upper back',
        'A feeling of head heaviness',
        'Headaches when they accompany neck pain (needs assessment)'
      ],
      causes: [
        'Muscle tension',
        'Prolonged computer work',
        'Poor posture',
        'Injury',
        'Age-related joint changes',
        'Prolonged stress'
      ],
      whenToSeek: [
        'If neck pain does not improve within several days',
        'If pain is accompanied by arm numbness or weakness',
        'If pain started after injury or a traffic accident',
        'If pain interferes with sleep, work, or driving',
        'For red flags (severe headache, vision changes) seek emergency care'
      ],
      faq: [
        {
          q: 'What can Healthy Spine offer?',
          a: 'After consultation, conservative assessment and an individual rehabilitation plan may be proposed. Results may vary.'
        },
        {
          q: 'Is neck pain always spine-related?',
          a: 'Not always. Causes vary; a specialist can clarify after examination.'
        },
        {
          q: 'Will changing pillows fix neck pain?',
          a: 'Sleep comfort may help sometimes, but persistent symptoms need specialist assessment, not accessories alone.'
        }
      ]
    },
    'herniated-disc-symptoms': {
      intro:
        'A herniated disc may be accompanied by back pain, neurological symptoms, or limited movement. Healthy Spine in Yerevan may offer conservative assessment after specialist evaluation. This article is informational and not a diagnosis.',
      symptoms: [
        'Back or lumbar pain',
        'Pain that may radiate to the leg or pelvic area',
        'Numbness or tingling',
        'Muscle weakness',
        'Limited mobility'
      ],
      causes: [
        'Age-related disc changes',
        'Heavy lifting or strain',
        'Injury',
        'Prolonged sitting',
        'Individual factors assessed by a specialist'
      ],
      whenToSeek: [
        'If pain lasts more than a few days without improvement with rest',
        'If pain interferes with daily activity',
        'If numbness or weakness is increasing',
        'If symptoms started after injury',
        'For bladder or bowel changes seek emergency care'
      ],
      faq: [
        {
          q: 'Does a herniated disc always require surgery?',
          a: 'Not in every case. Conservative options may be considered after specialist assessment.'
        },
        {
          q: 'Can the center help with disc symptoms?',
          a: 'Conservative rehabilitation may be offered after consultation. Results may vary.'
        },
        {
          q: 'How is a herniated disc different from ordinary back pain?',
          a: 'Only a specialist, after examination and tests if needed, can clarify the cause.'
        }
      ]
    },
    'sciatica-symptoms': {
      intro:
        'Sciatica is often described as pain that may radiate to the leg or pelvic area and may relate to nerve irritation. This article is informational and does not mean every leg pain is sciatica. Healthy Spine may offer conservative assessment after specialist evaluation.',
      symptoms: [
        'Low back pain that may radiate to the leg or pelvic area',
        'Numbness or weakness in the leg',
        'Burning or shooting pain along the back of the leg',
        'Pain worsening when sitting',
        'Pain worsening with movement or coughing'
      ],
      causes: [
        'Nerve pressure from a disc',
        'Muscle tension in the lumbar area',
        'Prolonged sitting',
        'Age-related joint changes',
        'Overuse'
      ],
      whenToSeek: [
        'If pain does not improve within several days',
        'If numbness or weakness is increasing',
        'If pain interferes with sleep or daily activity',
        'If bladder or bowel function is affected',
        'For acute or worsening symptoms seek medical care'
      ],
      faq: [
        {
          q: 'Does sciatica always require surgery?',
          a: 'No. Many cases may be managed conservatively after specialist assessment.'
        },
        {
          q: 'What symptoms are often associated with sciatica?',
          a: 'Leg pain or numbness worsened by sitting is common, but only a specialist can confirm the link.'
        },
        {
          q: 'How long does sciatica recovery take?',
          a: 'Timelines vary and depend on cause and management after consultation.'
        }
      ]
    },
    'what-is-osteochondrosis': {
      intro:
        'Osteochondrosis is a term describing age-related changes in intervertebral discs. This article is informational and does not replace medical diagnosis. Conservative rehabilitation may be considered after specialist assessment.',
      symptoms: [
        'Back or neck pain',
        'Stiffness',
        'Limited mobility',
        'Muscle tension',
        'Pain radiating to the limbs'
      ],
      causes: [
        'Age-related changes',
        'Prolonged sitting',
        'Posture problems',
        'Injury',
        'Individual factors'
      ],
      whenToSeek: [
        'If pain lasts more than a few days',
        'If mobility is limited',
        'If neurological symptoms are increasing',
        'If symptoms interfere with daily activity',
        'For red flags seek medical care'
      ],
      faq: [
        {
          q: 'What is osteochondrosis and how is it managed?',
          a: 'It may be managed conservatively after specialist assessment. Results may vary.'
        },
        {
          q: 'Can osteochondrosis be fully cured?',
          a: 'Conservative care often aims to support function and comfort; full cure is not guaranteed.'
        },
        {
          q: 'Is surgery needed for osteochondrosis?',
          a: 'Decisions are individual; many patients receive conservative care.'
        }
      ]
    },
    'radiculopathy-symptoms': {
      intro:
        'Radiculopathy may present with symptoms related to irritation of a spinal nerve root. This content is informational; diagnosis requires specialist evaluation.',
      symptoms: [
        'Pain radiating to the arm or leg',
        'Numbness',
        'Weakness',
        'Burning or shooting pain',
        'Muscle weakness'
      ],
      causes: [
        'Pressure on a nerve root',
        'Disc-related problems',
        'Age-related changes',
        'Injury'
      ],
      whenToSeek: [
        'If pain radiates to a limb',
        'If numbness is increasing',
        'If symptoms interfere with daily activity',
        'For rapidly worsening weakness seek medical care'
      ],
      faq: [
        {
          q: 'What symptoms may occur with radiculopathy?',
          a: 'Pain, numbness, and weakness in the nerve distribution may occur. A specialist can assess.'
        },
        {
          q: 'How is radiculopathy different from sciatica?',
          a: 'Sciatica is a lumbar nerve-root pattern; exact distinction is made by a physician.'
        },
        {
          q: 'Can the center help with radiculopathy?',
          a: 'Conservative rehabilitation may be offered after consultation; outcomes vary.'
        }
      ]
    },
    'scoliosis-in-adults': {
      intro:
        'Scoliosis in adults may be accompanied by pain, muscle tension, or posture concerns. This article is informational and does not replace medical diagnosis. An individual monitoring and rehabilitation plan may be proposed after assessment.',
      symptoms: [
        'Back pain related to curvature',
        'Muscle tension',
        'Postural asymmetry',
        'Limited mobility',
        'Pain worsening with prolonged standing'
      ],
      causes: [
        'Scoliosis from childhood',
        'Age-related changes',
        'Injury',
        'Posture problems',
        'Individual factors'
      ],
      whenToSeek: [
        'If pain lasts more than several weeks',
        'If posture problems are progressing',
        'If symptoms interfere with daily activity',
        'If breathing becomes difficult',
        'For worsening symptoms consult a specialist'
      ],
      faq: [
        {
          q: 'How is scoliosis managed in adults?',
          a: 'Rehabilitation exercises, monitoring, and periodic follow-up may be used after specialist assessment.'
        },
        {
          q: 'Can adult scoliosis be fully corrected?',
          a: 'Goals often focus on function and comfort; full correction is not always achievable.'
        },
        {
          q: 'Is surgery needed for adult scoliosis?',
          a: 'Decisions are individual; many cases are managed conservatively.'
        }
      ]
    },
    'lower-back-pain-causes': {
      intro:
        'Lower back pain is common and may arise from muscle strain, disc issues, or prolonged sitting. Healthy Spine may offer conservative assessment after specialist evaluation. This content is not a diagnosis and does not guarantee outcomes.',
      symptoms: [
        'Pain in the lumbar area on one or both sides',
        'Pain worsening when sitting or standing',
        'Muscle tension or stiffness in the lumbar region',
        'Limited mobility',
        'Pain that may radiate to the leg (depending on assessment)'
      ],
      causes: [
        'Muscle strain or overuse',
        'Prolonged sitting or poor posture',
        'Disc-related problems',
        'Age-related joint changes',
        'Overuse',
        'Prolonged stress'
      ],
      whenToSeek: [
        'If pain lasts more than a few days',
        'If pain interferes with sleep, work, or activity',
        'If numbness or weakness is increasing',
        'If pain started after injury or lifting',
        'For red flags seek emergency care'
      ],
      faq: [
        {
          q: 'Does lower back pain always mean a serious cause?',
          a: 'Not always. It is often muscle- or posture-related; persistent pain needs assessment.'
        },
        {
          q: 'What can the center offer?',
          a: 'Conservative assessment and rehabilitation visits as recommended. Results may vary.'
        },
        {
          q: 'Does rest help lower back pain?',
          a: 'Brief rest may help temporarily, but persistent pain needs consultation.'
        }
      ]
    },
    'shoulder-pain-causes': {
      intro:
        'Shoulder pain may relate to muscle strain, joint injury, or posture. This article is informational and does not replace medical diagnosis. An individual rehabilitation plan may be proposed after assessment.',
      symptoms: [
        'Pain in the shoulder joint',
        'Limited ability to raise the arm',
        'Tension around the shoulder',
        'Pain when raising the arm at night',
        'Burning or shooting pain'
      ],
      causes: [
        'Muscle strain',
        'Joint injury',
        'Posture problems',
        'Trauma',
        'Neck-area problems'
      ],
      whenToSeek: [
        'If pain does not improve within several days',
        'If mobility is limited',
        'If pain interferes with daily activity',
        'If pain started after injury',
        'For worsening symptoms consult a specialist'
      ],
      faq: [
        {
          q: 'What can cause shoulder pain?',
          a: 'Causes may be muscular, joint-related, or postural. A specialist can assess.'
        },
        {
          q: 'Is shoulder pain linked to the neck?',
          a: 'Sometimes symptoms originate from the cervical spine; this is clarified on examination.'
        },
        {
          q: 'Can the center help with shoulder pain?',
          a: 'Conservative rehabilitation may be offered after consultation.'
        }
      ]
    },
    'joint-pain-and-spine': {
      intro:
        'Joint pain may relate to spinal problems, nerve irritation, or posture changes. This content is informational and does not replace medical diagnosis. An individual plan may be proposed after assessment.',
      symptoms: [
        'Joint pain',
        'Back or neck pain',
        'Limited mobility',
        'Joint stiffness',
        'Muscle tension'
      ],
      causes: [
        'Age-related changes',
        'Injury',
        'Nerve irritation',
        'Posture problems',
        'Individual factors'
      ],
      whenToSeek: [
        'If joint pain does not improve',
        'If joint pain is accompanied by back pain',
        'If mobility is limited',
        'If neurological symptoms are present',
        'For red flags seek medical care'
      ],
      faq: [
        {
          q: 'How are joint pain and the spine connected?',
          a: 'Joint pain may relate to nerve irritation, posture, or spinal changes. A specialist can assess.'
        },
        {
          q: 'Should both joint and spine be evaluated?',
          a: 'Evaluation scope is determined by the physician after history and examination.'
        },
        {
          q: 'Can rehabilitation help?',
          a: 'Conservative methods may support function after individual assessment; results vary.'
        }
      ]
    }
  }
};

const BATCH_CONTENT = require('./knowledge-i18n-parity-batch');

function getKnowledgeParityOverlay(slug, lang) {
  const parts = {};
  const titles = TITLE_FIXES[slug];
  if (titles && titles[lang]) Object.assign(parts, titles[lang]);
  if (TOP10_SLUGS.includes(slug) && TOP10_CONTENT[lang]?.[slug]) {
    Object.assign(parts, TOP10_CONTENT[lang][slug]);
  } else if (BATCH_CONTENT[lang]?.[slug]) {
    Object.assign(parts, BATCH_CONTENT[lang][slug]);
  }
  return Object.keys(parts).length ? parts : null;
}

module.exports = {
  TITLE_FIXES,
  TOP10_SLUGS,
  TOP10_CONTENT,
  getKnowledgeParityOverlay
};
