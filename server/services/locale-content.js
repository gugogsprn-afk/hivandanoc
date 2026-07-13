/**
 * Central locale content helpers — never expose HY body text on RU/EN routes.
 */
const { buildPublicContent } = require('../db/helpers');
const { normalizeLang, ui, brandName, clinicDisplayName } = require('./i18n-ssr');

const PLACEHOLDER = {
  hy: 'Տեղեկատվությունը պատրաստվում է։ Խորհրդատվության համար կապ հաստատեք կենտրոնի հետ։',
  ru: 'Информация готовится. Для консультации свяжитесь с центром.',
  en: 'Information is being prepared. Please contact the center for consultation.'
};

const CONDITIONS_HUB = {
  hy: {
    intro:
      'Այս բաժինը տեղեկատվական է և կարող է օգնել հասկանալ, թե երբ վերականգնողական խորհրդատվությունը կարող է հարմար լինել։ Էջերը չեն տալիս ախտորոշում և չեն երաշխավորում բուժման արդյունք։',
    topicsHeading: 'Հասանելի թեմաներ',
    tagline: 'Տեղեկատվական էջեր՝ ախտանիշային որոնումից ծառայությունների վերականգնողական մոտեցումներ'
  },
  ru: {
    intro:
      'Этот раздел носит информационный характер и помогает понять, когда консультация специалиста по реабилитации может быть уместной. Страницы не ставят диагноз и не гарантируют результат лечения.',
    topicsHeading: 'Доступные темы',
    tagline: 'Информационные страницы о симптомах, состояниях и восстановительных подходах'
  },
  en: {
    intro:
      'This section is informational and may help patients understand when a rehabilitation consultation may be appropriate. These pages do not provide a diagnosis and do not guarantee treatment results.',
    topicsHeading: 'Available topics',
    tagline: 'Informational pages about symptoms, conditions, and rehabilitation approaches'
  }
};

const KNOWLEDGE_HUB = {
  hy: {
    intro:
      'Այս էջը տեղեկատվական է և չի փոխարինում բժշկական խորհրդատվությանը։ Արդյունքները կարող են տարբեր լինել։',
    topicsHeading: 'Հոդվածներ',
    tagline: 'Տեղեկատվական հոդվածներ և խորհրդատվության ուղեցույցներ'
  },
  ru: {
    intro:
      'Эта страница носит информационный характер и не заменяет медицинскую консультацию. Результаты могут отличаться.',
    topicsHeading: 'Статьи',
    tagline: 'Информационные статьи и руководства для пациентов'
  },
  en: {
    intro:
      'This page is informational and does not replace medical advice. Results may vary.',
    topicsHeading: 'Articles',
    tagline: 'Informational articles and consultation guides'
  }
};

/** Hub list copy — editorial overrides for conditions index. */
const CONDITIONS_HUB_DISPLAY = {
  ru: {
    'back-pain-treatment': {
      h1: 'Боль в спине и восстановление',
      tagline: 'Консервативный подход к оценке и восстановлению при боли в спине и пояснице в Ереване'
    },
    'neck-pain-treatment': {
      h1: 'Боль в шее и восстановление',
      tagline: 'Консервативный подход к оценке боли в шее, скованности и ограниченной подвижности'
    },
    sciatica: {
      h1: 'Ишиас и нервная боль',
      tagline: 'Консервативный подход к оценке симптомов ишиаса и восстановлению'
    },
    'herniated-disc': {
      h1: 'Грыжа межпозвонкового диска',
      tagline: 'Консервативный подход к оценке и восстановлению при грыже диска'
    },
    'lower-back-pain': {
      h1: 'Боль в пояснице',
      tagline: 'Консервативный подход к оценке боли в поясничной области'
    },
    'leg-numbness': {
      h1: 'Онемение ноги и неврологические симптомы',
      tagline: 'Консервативный подход к оценке онемения ноги и нервных симптомов'
    },
    'shoulder-pain': {
      h1: 'Боль в плече и восстановление',
      tagline: 'Консервативный подход к оценке боли в плече и ограничения подвижности сустава'
    },
    'joint-pain': {
      h1: 'Боль в суставах и восстановление',
      tagline: 'Консервативный подход к оценке боли в суставах'
    },
    'scoliosis-pain': {
      h1: 'Боль, связанная со сколиозом',
      tagline: 'Консервативный подход к оценке боли, связанной со сколиозом'
    },
    osteochondrosis: {
      h1: 'Остеохондроз и восстановление',
      tagline: 'Консервативный подход к оценке остеохондроза и восстановлению'
    },
    radiculopathy: {
      h1: 'Радикулопатия и боль нервного корешка',
      tagline: 'Консервативный подход к оценке радикулопатии и восстановлению'
    },
    'thoracic-back-pain': {
      h1: 'Боль в грудном отделе',
      tagline: 'Консервативный подход к оценке боли в грудном отделе позвоночника'
    },
    'posture-disorders': {
      h1: 'Нарушения осанки и восстановление',
      tagline: 'Консервативный подход к оценке нарушений осанки'
    }
  },
  en: {
    'back-pain-treatment': {
      h1: 'Back pain and rehabilitation',
      tagline: 'Conservative approach to assessment and rehabilitation for back and lower back pain in Yerevan'
    },
    'neck-pain-treatment': {
      h1: 'Neck pain and rehabilitation',
      tagline: 'Conservative approach to assessment of neck pain, stiffness, and mobility limitations'
    },
    sciatica: {
      h1: 'Sciatica and nerve pain',
      tagline: 'Conservative approach to assessment and rehabilitation for sciatica symptoms'
    },
    'herniated-disc': {
      h1: 'Herniated disc',
      tagline: 'Conservative approach to assessment and rehabilitation for disc herniation'
    },
    'lower-back-pain': {
      h1: 'Lower back pain',
      tagline: 'Conservative approach to assessment of lumbar pain'
    },
    'leg-numbness': {
      h1: 'Leg numbness and nerve symptoms',
      tagline: 'Conservative approach to assessment of leg numbness and nerve symptoms'
    },
    'shoulder-pain': {
      h1: 'Shoulder pain and rehabilitation',
      tagline: 'Conservative approach to assessment of shoulder pain and joint mobility limitation'
    },
    'joint-pain': {
      h1: 'Joint pain and rehabilitation',
      tagline: 'Conservative approach to assessment of joint pain'
    },
    'scoliosis-pain': {
      h1: 'Scoliosis-related pain',
      tagline: 'Conservative approach to assessment of pain related to scoliosis'
    },
    osteochondrosis: {
      h1: 'Osteochondrosis and rehabilitation',
      tagline: 'Conservative approach to assessment and rehabilitation for osteochondrosis'
    },
    radiculopathy: {
      h1: 'Radiculopathy and nerve root pain',
      tagline: 'Conservative approach to assessment and rehabilitation for radiculopathy'
    },
    'thoracic-back-pain': {
      h1: 'Thoracic spine pain',
      tagline: 'Conservative approach to assessment of thoracic spine pain'
    },
    'posture-disorders': {
      h1: 'Posture disorders and rehabilitation',
      tagline: 'Conservative approach to assessment of posture disorders'
    }
  }
};

/** Hub list copy — editorial overrides for knowledge index (primary articles). */
const KNOWLEDGE_HUB_DISPLAY = {
  ru: {
    'back-pain-causes': {
      h1: 'Причины боли в спине',
      tagline: 'Информационное руководство о частых причинах боли в спине'
    },
    'neck-pain-causes': {
      h1: 'Причины боли в шее',
      tagline: 'Информационное руководство о частых причинах боли в шее'
    },
    'herniated-disc-symptoms': {
      h1: 'Симптомы грыжи межпозвонкового диска',
      tagline: 'Информационное руководство о симптомах, связанных с межпозвонковым диском'
    },
    'posture-and-spine-health': {
      h1: 'Осанка и здоровье позвоночника',
      tagline: 'Информационное руководство об осанке и здоровье позвоночника'
    },
    'rehabilitation-after-spine-surgery': {
      h1: 'Восстановление после операции на позвоночнике',
      tagline: 'Информационное руководство о восстановительных визитах'
    },
    'lower-back-pain-causes': {
      h1: 'Причины боли в пояснице',
      tagline: 'Информационное руководство о частых причинах поясничной боли'
    },
    'sciatica-symptoms': {
      h1: 'Симптомы ишиаса',
      tagline: 'Информационное руководство о частых симптомах ишиаса'
    },
    'neck-stiffness-causes': {
      h1: 'Причины скованности шеи',
      tagline: 'Информационное руководство о частых причинах скованности шеи'
    },
    'leg-numbness-and-spine': {
      h1: 'Онемение ноги и позвоночник',
      tagline: 'Информационное руководство о возможной связи онемения ноги и позвоночника'
    },
    'back-pain-when-sitting': {
      h1: 'Боль в положении сидя',
      tagline: 'Информационное руководство о частых причинах боли в положении сидя'
    },
    'when-back-pain-needs-evaluation': {
      h1: 'Когда боль в спине требует медицинской оценки',
      tagline: 'Информационное руководство о том, когда боль в спине может требовать оценки специалиста'
    },
    'sciatica-vs-lower-back-pain': {
      h1: 'Ишиас и боль в пояснице',
      tagline: 'Информационное руководство о различиях между ишиасом и поясничной болью'
    },
    'herniated-disc-vs-bulging-disc': {
      h1: 'Грыжа и протрузия диска',
      tagline: 'Информационное руководство о различиях между грыжей и протрузией диска'
    },
    'back-pain-after-lifting': {
      h1: 'Боль в спине после подъёма тяжестей',
      tagline: 'Информационное руководство о боли в спине после подъёма тяжестей'
    },
    'neck-pain-symptoms': {
      h1: 'Симптомы боли в шее',
      tagline: 'Информационное руководство о симптомах боли в шее'
    },
    'back-pain-symptoms': {
      h1: 'Симптомы боли в спине',
      tagline: 'Информационное руководство о симптомах боли в спине'
    },
    'shoulder-pain-causes': {
      h1: 'Причины боли в плече',
      tagline: 'Информационное руководство о частых причинах боли в плече'
    },
    'exercises-for-back-pain': {
      h1: 'Физическая активность при боли в спине',
      tagline: 'Информационное руководство о физической активности и боли в спине'
    },
    'spine-surgery-when-needed': {
      h1: 'Когда может рассматриваться операция на позвоночнике',
      tagline: 'Информационное руководство о ситуациях, когда может обсуждаться операция'
    },
    'what-is-osteochondrosis': {
      h1: 'Что такое остеохондроз',
      tagline: 'Информационное руководство об остеохондрозе'
    },
    'scoliosis-in-adults': {
      h1: 'Сколиоз у взрослых',
      tagline: 'Информационное руководство о сколиозе у взрослых'
    },
    'joint-pain-and-spine': {
      h1: 'Боль в суставах и позвоночник',
      tagline: 'Информационное руководство о связи боли в суставах и позвоночника'
    }
  },
  en: {
    'back-pain-causes': {
      h1: 'Causes of back pain',
      tagline: 'Informational guide to common causes of back pain'
    },
    'neck-pain-causes': {
      h1: 'Causes of neck pain',
      tagline: 'Informational guide to common causes of neck pain'
    },
    'herniated-disc-symptoms': {
      h1: 'Herniated disc symptoms',
      tagline: 'Informational guide to symptoms related to spinal discs'
    },
    'posture-and-spine-health': {
      h1: 'Posture and spine health',
      tagline: 'Informational guide to posture and spine health'
    },
    'rehabilitation-after-spine-surgery': {
      h1: 'Recovery after spine surgery',
      tagline: 'Informational guide to rehabilitation visits'
    },
    'lower-back-pain-causes': {
      h1: 'Causes of lower back pain',
      tagline: 'Informational guide to common causes of lumbar pain'
    },
    'sciatica-symptoms': {
      h1: 'Sciatica symptoms',
      tagline: 'Informational guide to common symptoms of sciatica'
    },
    'neck-stiffness-causes': {
      h1: 'Causes of neck stiffness',
      tagline: 'Informational guide to common causes of neck stiffness'
    },
    'leg-numbness-and-spine': {
      h1: 'Leg numbness and the spine',
      tagline: 'Informational guide to the possible connection between leg numbness and the spine'
    },
    'back-pain-when-sitting': {
      h1: 'Pain while sitting',
      tagline: 'Informational guide to common causes of pain while sitting'
    },
    'when-back-pain-needs-evaluation': {
      h1: 'When back pain needs medical assessment',
      tagline: 'Informational guide to when back pain may require specialist evaluation'
    },
    'sciatica-vs-lower-back-pain': {
      h1: 'Sciatica vs lower back pain',
      tagline: 'Informational guide to differences between sciatica and lower back pain'
    },
    'herniated-disc-vs-bulging-disc': {
      h1: 'Herniated vs bulging disc',
      tagline: 'Informational guide to differences between herniated and bulging discs'
    },
    'back-pain-after-lifting': {
      h1: 'Back pain after heavy lifting',
      tagline: 'Informational guide to back pain after lifting heavy objects'
    },
    'neck-pain-symptoms': {
      h1: 'Neck pain symptoms',
      tagline: 'Informational guide to symptoms of neck pain'
    },
    'back-pain-symptoms': {
      h1: 'Back pain symptoms',
      tagline: 'Informational guide to symptoms of back pain'
    },
    'shoulder-pain-causes': {
      h1: 'Causes of shoulder pain',
      tagline: 'Informational guide to common causes of shoulder pain'
    },
    'exercises-for-back-pain': {
      h1: 'Physical activity with back pain',
      tagline: 'Informational guide to physical activity and back pain'
    },
    'spine-surgery-when-needed': {
      h1: 'When spine surgery may be considered',
      tagline: 'Informational guide to when surgery may be discussed'
    },
    'what-is-osteochondrosis': {
      h1: 'What is osteochondrosis',
      tagline: 'Informational guide to osteochondrosis'
    },
    'scoliosis-in-adults': {
      h1: 'Scoliosis in adults',
      tagline: 'Informational guide to scoliosis in adults'
    },
    'joint-pain-and-spine': {
      h1: 'Joint pain and the spine',
      tagline: 'Informational guide to the relationship between joint pain and the spine'
    }
  }
};

function applyHubDisplay(config, slug, lang, displayMap) {
  if (!config) return config;
  lang = normalizeLang(lang);
  if (lang === 'hy') return config;
  const display = displayMap[lang]?.[slug];
  if (!display) return config;
  return { ...config, h1: display.h1, tagline: display.tagline };
}

/** Shared shallow hospital name localization for SSR page handlers. */
function localizeData(data, lang) {
  lang = normalizeLang(lang);
  const d = { ...data, hospital: { ...(data.hospital || {}) } };
  d.hospital.name = clinicDisplayName(data, lang);
  return d;
}

/** Documented allowlist for audit script (proper names without localized form). */
const AUDIT_NAME_ALLOWLIST = [
  'ISICO',
  'SOSORT',
  'Healthy Spine',
  'Здоровый позвоночник',
  'DEWEBAM.COM'
];

function getLocaleContent(lang = 'hy') {
  lang = normalizeLang(lang);
  const data = buildPublicContent(lang);
  const hospital = { ...(data.hospital || {}), name: clinicDisplayName(data, lang) };
  return {
    lang,
    ui: ui(lang),
    brand: brandName(lang),
    hospital,
    data: { ...data, hospital },
    placeholder: PLACEHOLDER[lang],
    conditionsHub: CONDITIONS_HUB[lang],
    knowledgeHub: KNOWLEDGE_HUB[lang]
  };
}

function humanizeSlug(slug) {
  return String(slug || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function missingConditionConfig(slug, lang) {
  lang = normalizeLang(lang);
  const label = humanizeSlug(slug);
  if (lang === 'ru') {
    return {
      h1: label,
      tagline: PLACEHOLDER.ru,
      titleSuffix: label,
      description: PLACEHOLDER.ru,
      intro: PLACEHOLDER.ru,
      symptoms: [],
      whenToSeek: [],
      servicesIntro: PLACEHOLDER.ru,
      serviceSlugs: []
    };
  }
  return {
    h1: label,
    tagline: PLACEHOLDER.en,
    titleSuffix: label,
    description: PLACEHOLDER.en,
    intro: PLACEHOLDER.en,
    symptoms: [],
    whenToSeek: [],
    servicesIntro: PLACEHOLDER.en,
    serviceSlugs: []
  };
}

function missingKnowledgeConfig(slug, lang) {
  lang = normalizeLang(lang);
  const label = humanizeSlug(slug);
  const intro = PLACEHOLDER[lang] || PLACEHOLDER.en;
  return {
    h1: label,
    tagline: intro,
    titleSuffix: label,
    description: intro,
    intro,
    symptoms: [],
    causes: [],
    whenToSeek: [],
    conditionSlugs: [],
    serviceSlugs: [],
    relatedKnowledgeSlugs: [],
    faq: []
  };
}

function logMissingTranslation(kind, slug, lang) {
  if (process.env.NODE_ENV === 'production') return;
  console.warn(`[locale-content] missing ${kind} translation: ${slug} (${lang})`);
}

module.exports = {
  PLACEHOLDER,
  CONDITIONS_HUB,
  KNOWLEDGE_HUB,
  CONDITIONS_HUB_DISPLAY,
  KNOWLEDGE_HUB_DISPLAY,
  AUDIT_NAME_ALLOWLIST,
  getLocaleContent,
  missingConditionConfig,
  missingKnowledgeConfig,
  applyHubDisplay,
  localizeData,
  logMissingTranslation,
  humanizeSlug
};
