#!/usr/bin/env node
/**
 * P0T.1 — soften unsupported trust claims and remove unverified news/stories.
 * Run: node scripts/p0t1-truth-cleanup.js && node scripts/build-embed.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const PATCHES = {
  hy: {
    'content.introParagraphs': [
      '«Առողջ ողնաշար» վերականգնողական կենտրոնը տրամադրում է պոզանոցի, հոդերի և շարժական համակարգի կոնսերվատիվ բուժում և վերականգնում։ Հիվանդները դիմում են կենտրոն՝ ցավի, շարժունակության և վերականգնման խնդիրների լուծման համար։',
      'Բուժման պլանները կազմվում են անհատական գնահատման և վերականգնողական նպատակների հիման վրա։'
    ],
    'content.awards': [
      { id: 'a1', label: 'Կոնսերվատիվ բուժում', desc: 'Պոզանոցի և հոդերի ոչ վիրահատական մոտեցում' },
      { id: 'a2', label: 'Ռեաբիլիտացիա', desc: 'Ֆիզիոթերապիա, մանուալ թերապիա և վերականգնողական ծրագրեր' },
      { id: 'a3', label: 'Խորհրդատվություն', desc: 'Անհատական գնահատում և բուժման պլանի կազմում' }
    ],
    'content.news': [],
    'content.storyVideos': [],
    'content.patientStories': [],
    'content.reviews': [],
    'content.patientHero': {
      quote:
        'Վերականգնողական ծրագրերը կարող են աջակցել ցավի կառավարմանը և առօրյա ակտիվության վերադարձին՝ մասնագետի գնահատման հիման վրա։',
      ctaText: 'Իմանալ ավելին բուժման մասին',
      image: 'https://images.unsplash.com/photo-1476480862128-209bfaa8dfc8?w=1400&q=85'
    },
    'content.backInGame': {
      title: 'Վերադարձ դեպի ակտիվ կյանք',
      text: 'Կոնսերվատիվ բուժումն ու վերականգնումը կարող են աջակցել ցավի նվազեցմանը և շարժունակության բարելավմանը՝ անհատական պլանի շրջանակներում։',
      linkText: 'Իմանալ ավելին ծառայությունների մասին',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80'
    },
    'content.expertiseOverlay': {
      title: 'Փորձագիտություն, որին կարող եք վստահել',
      text: 'Մեր մասնագետները՝ օրթոպեդներ, նյարդաբաններ, ֆիզիոթերապևտներ և ռեաբիլիտոլոգներ՝ միասին աշխատում են անհատական բուժման պլան կազմելու համար՝ առանց ավելորդ միջամտությունների։',
      links: [{ text: 'Իմացեք, թե ինչու ընտրել մեր կենտրոնը', href: 'about.html' }],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=85'
    },
    'content.hospital.stats': [
      { value: '', suffix: '', label: 'Կոնսերվատիվ բուժում' },
      { value: '', suffix: '', label: 'Ռեաբիլիտացիա' },
      { value: '', suffix: '', label: 'Խորհրդատվություն' },
      { value: '', suffix: '', label: 'Անհատական պլան' }
    ],
    'pages.home.reviewsTitle': 'Ինչու ընտրել մեզ',
    'pages.home.awardsDesc': 'Կենտրոնը ապահովում է վերականգնողական օգնություն՝ հիմնված ապացուցված մեթոդների վրա։',
    'pages.home.awardsTitle': 'Մեր ուղղությունները',
    'pages.home.expertsTitle': 'Մեր մասնագետները',
    'pages.about.historyBody':
      '«Առողջ ողնաշար» վերականգնողական կենտրոնը ստեղծվել է՝ մարդկանց օգնելու վերադարձնել ակտիվ կյանքը՝ առանց անհրաժեշտության վիրահատության։ Կենտրոնը մասնագիտացված է պոզանոցի և հոդերի կոնսերվատիվ բուժման և վերականգնման մեջ։',
    'nav.services': 'Ծառայություններ',
    'nav.conditions': 'Ախտորոշումներ',
    'nav.knowledge': 'Գիտելիքներ'
  },
  en: {
    'content.introParagraphs': [
      'Healthy Spine rehabilitation center provides conservative care and recovery for spine, joint, and musculoskeletal conditions. Patients contact the center for spine, joint, and rehabilitation care.',
      'Care plans are based on individual assessment and rehabilitation goals.'
    ],
    'content.awards': [
      { id: 'a1', label: 'Conservative care', desc: 'Nonsurgical approaches for spine and joint conditions' },
      { id: 'a2', label: 'Rehabilitation', desc: 'Physiotherapy, manual therapy, and recovery programs' },
      { id: 'a3', label: 'Consultation', desc: 'Individual assessment and treatment planning' }
    ],
    'content.news': [],
    'content.storyVideos': [],
    'content.patientStories': [],
    'content.reviews': [],
    'content.patientHero': {
      quote:
        'Rehabilitation programs can support pain management and return to daily activity based on specialist assessment.',
      ctaText: 'Learn more about care',
      image: 'https://images.unsplash.com/photo-1476480862128-209bfaa8dfc8?w=1400&q=85'
    },
    'content.backInGame': {
      title: 'Return to active life',
      text: 'Conservative care and rehabilitation can support pain relief and improved mobility within an individual plan.',
      linkText: 'Learn more about our services',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80'
    },
    'content.expertiseOverlay': {
      title: 'Expertise you can trust',
      text: 'Our specialists — orthopedists, neurologists, physiotherapists, and rehabilitation experts — work together to develop an individual care plan without unnecessary interventions.',
      links: [{ text: 'Learn why patients choose our center', href: 'about.html' }],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=85'
    },
    'content.hospital.stats': [
      { value: '', suffix: '', label: 'Conservative care' },
      { value: '', suffix: '', label: 'Rehabilitation' },
      { value: '', suffix: '', label: 'Consultation' },
      { value: '', suffix: '', label: 'Individual plans' }
    ],
    'pages.home.reviewsTitle': 'Why choose us',
    'pages.home.awardsDesc': 'The center provides rehabilitation care based on evidence-based methods.',
    'pages.home.awardsTitle': 'Our focus areas',
    'pages.home.expertsTitle': 'Our specialists',
    'nav.services': 'Services',
    'nav.conditions': 'Conditions',
    'nav.knowledge': 'Knowledge'
  },
  ru: {
    'content.introParagraphs': [
      'Реабилитационный центр «Здоровый позвоночник» оказывает консервативную помощь при заболеваниях позвоночника, суставов и опорно-двигательного аппарата. Пациенты обращаются в центр за помощью при боли, ограничении подвижности и реабилитации.',
      'Планы лечения составляются на основе индивидуальной оценки и реабилитационных целей.'
    ],
    'content.awards': [
      { id: 'a1', label: 'Консервативное лечение', desc: 'Безоперационные подходы при заболеваниях позвоночника и суставов' },
      { id: 'a2', label: 'Реабилитация', desc: 'Физиотерапия, мануальная терапия и восстановительные программы' },
      { id: 'a3', label: 'Консультация', desc: 'Индивидуальная оценка и составление плана лечения' }
    ],
    'content.news': [],
    'content.storyVideos': [],
    'content.patientStories': [],
    'content.reviews': [],
    'content.patientHero': {
      quote:
        'Реабилитационные программы могут поддержать контроль боли и возвращение к повседневной активности на основе оценки специалиста.',
      ctaText: 'Узнать больше о лечении',
      image: 'https://images.unsplash.com/photo-1476480862128-209bfaa8dfc8?w=1400&q=85'
    },
    'content.backInGame': {
      title: 'Возвращение к активной жизни',
      text: 'Консервативное лечение и реабилитация могут поддержать снижение боли и улучшение подвижности в рамках индивидуального плана.',
      linkText: 'Узнать больше об услугах',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80'
    },
    'content.expertiseOverlay': {
      title: 'Экспертиза, которой можно доверять',
      text: 'Наши специалисты — ортопеды, неврологи, физиотерапевты и реабилитологи — работают вместе над индивидуальным планом лечения без лишних вмешательств.',
      links: [{ text: 'Узнайте, почему выбирают наш центр', href: 'about.html' }],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=85'
    },
    'content.hospital.stats': [
      { value: '', suffix: '', label: 'Консервативное лечение' },
      { value: '', suffix: '', label: 'Реабилитация' },
      { value: '', suffix: '', label: 'Консультация' },
      { value: '', suffix: '', label: 'Индивидуальный план' }
    ],
    'pages.home.reviewsTitle': 'Почему выбирают нас',
    'pages.home.awardsDesc': 'Центр оказывает реабилитационную помощь на основе доказательных методов.',
    'pages.home.awardsTitle': 'Наши направления',
    'pages.home.expertsTitle': 'Наши специалисты',
    'nav.services': 'Услуги',
    'nav.conditions': 'Диагнозы',
    'nav.knowledge': 'База знаний'
  }
};

function setPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [lang, fields] of Object.entries(PATCHES)) {
  const file = path.join(ROOT, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [key, value] of Object.entries(fields)) {
    setPath(data, key, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Patched lang/${lang}.json`);
}
