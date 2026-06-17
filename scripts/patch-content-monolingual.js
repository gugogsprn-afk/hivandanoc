/**
 * Ensures lang/*.json content section is fully monolingual per locale.
 * Run after other patch scripts: node scripts/patch-content-monolingual.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const hospital = JSON.parse(fs.readFileSync(path.join(root, 'data/hospital.json'), 'utf8'));
const deptTr = require('./lib/dept-translations');
const blocksTr = require('./lib/content-blocks-translations');
const mbTr = require('./lib/move-better-translations');

const hyDoctors = [
  { id: 'doc-1', name: 'Ելենա Իվանովա', role: 'Մանուալ թերապևտ', experience: '22 տարի', bio: 'Մանուալ թերապիայի և պոզանոցի հիվանդությունների բուժման մասնագետ։' },
  { id: 'doc-2', name: 'Անդրեյ Պետրով', role: 'Օրթոպեդ-տրավմատոլոգ', experience: '15 տարի', bio: 'Պոզանոցի և հոդերի հիվանդությունների խորհրդատվություն և բուժում։' },
  { id: 'doc-3', name: 'Օլգա Սմիրնովա', role: 'ԼՖԿ բժիշկ', experience: '12 տարի', bio: 'Կազմում է բուժիչ ֆիզկուլտուրայի և վերականգնման անհատական ծրագրեր։' },
  { id: 'doc-4', name: 'Դմիտրի Կոզլով', role: 'Ֆիզիոթերապևտ', experience: '18 տարի', bio: 'Ապարատային ֆիզիոթերապիայի մասնագետ՝ մեջքի և հոդերի ցավի դեպքում։' },
  { id: 'doc-5', name: 'Աննա Մորոզովա', role: 'Նյարդաբան', experience: '10 տարի', bio: 'Պոզանոցի հիվանդությունների նյարդաբանական արտահայտությունների ախտորոշում և բուժում։' },
  { id: 'doc-6', name: 'Սերգեյ Վոլկով', role: 'Ուլտրաձայնային ախտորոշ', experience: '14 տարի', bio: 'Հոդերի և ներքին օրգանների ուլտրաձայնային ախտորոշում։' }
];

const enDoctors = [
  { id: 'doc-1', name: 'Elena Ivanova', role: 'Manual therapist', experience: '22 years', bio: 'Specialist in manual therapy and spinal conditions.' },
  { id: 'doc-2', name: 'Andrey Petrov', role: 'Orthopedic traumatologist', experience: '15 years', bio: 'Consultation and treatment of spine and joint disorders.' },
  { id: 'doc-3', name: 'Olga Smirnova', role: 'Kinesiotherapy physician', experience: '12 years', bio: 'Designs individual exercise and rehabilitation programs.' },
  { id: 'doc-4', name: 'Dmitry Kozlov', role: 'Physiotherapist', experience: '18 years', bio: 'Expert in device-based physiotherapy for back and joint pain.' },
  { id: 'doc-5', name: 'Anna Morozova', role: 'Neurologist', experience: '10 years', bio: 'Diagnosis and treatment of neurological symptoms in spinal disease.' },
  { id: 'doc-6', name: 'Sergey Volkov', role: 'Ultrasound specialist', experience: '14 years', bio: 'Ultrasound diagnostics of joints and soft tissues.' }
];

function mapDepartments(lang) {
  const names = lang === 'hy' ? deptTr.hyNames : lang === 'en' ? deptTr.enNames : null;
  const details = lang === 'hy' ? deptTr.hyDetails : lang === 'en' ? deptTr.enDetails : null;

  return hospital.departments.map((d) => {
    if (lang === 'ru') {
      return { id: d.id, name: d.name, description: d.description, services: d.services };
    }
    const det = details[d.id] || {};
    return {
      id: d.id,
      name: names[d.id] || d.name,
      description: det.description || d.description,
      services: det.services || d.services
    };
  });
}

function mergeById(baseList, locList) {
  if (!locList?.length) return baseList;
  return baseList.map((item) => {
    const tr = locList.find((x) => x.id === item.id);
    return tr ? { ...item, ...tr } : item;
  });
}

function buildMoveBetter(lang) {
  const base = hospital.moveBetter;
  if (!base) return null;
  if (lang === 'ru') return base;

  const tr = mbTr[lang];
  if (!tr) return base;

  const out = JSON.parse(JSON.stringify(base));
  if (tr.featured) out.featured = { ...out.featured, ...tr.featured };
  if (tr.programsBanner) out.programsBanner = { ...out.programsBanner, ...tr.programsBanner };
  if (tr.sidebar) out.sidebar = mergeById(out.sidebar, tr.sidebar);
  if (tr.textArticles) out.textArticles = mergeById(out.textArticles, tr.textArticles);
  if (tr.videos) out.videos = mergeById(out.videos, tr.videos);
  if (tr.pressNews) out.pressNews = mergeById(out.pressNews, tr.pressNews);
  if (tr.categories) out.categories = mergeById(out.categories, tr.categories);
  if (tr.topicSections) {
    out.topicSections = (out.topicSections || []).map((sec) => {
      const trSec = tr.topicSections.find((s) => s.id === sec.id);
      if (!trSec) return sec;
      return { ...sec, articles: mergeById(sec.articles, trSec.articles) };
    });
  }
  return out;
}

function mapEquipment(lang) {
  const eqTr = blocksTr.equipment[lang];
  if (!eqTr) {
    return hospital.equipment.map((e) => ({ id: e.id, name: e.name, description: e.description }));
  }
  return hospital.equipment.map((e) => {
    const tr = eqTr[e.id];
    return { id: e.id, name: tr?.[0] || e.name, description: tr?.[1] || e.description };
  });
}

function mapPrograms(lang) {
  const progTr = blocksTr.programs[lang];
  if (!progTr) {
    return hospital.programs.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      description: p.description
    }));
  }
  return hospital.programs.map((p) => {
    const tr = progTr[p.id] || {};
    return {
      id: p.id,
      name: tr.name || p.name,
      duration: tr.duration || p.duration,
      description: tr.description || p.description
    };
  });
}

function deepReplaceStrings(value, replacer) {
  if (typeof value === 'string') return replacer(value);
  if (Array.isArray(value)) return value.map((item) => deepReplaceStrings(item, replacer));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepReplaceStrings(v, replacer);
    }
    return out;
  }
  return value;
}

function applyBrandName(data, lang) {
  const brand = blocksTr.brand[lang];
  if (!brand) return data;

  data.content.hospital.name = brand.name;
  data.content.hospital.shortName = brand.shortName;

  if (lang === 'ru') {
    return deepReplaceStrings(data, (str) =>
      str
        .replace(/«Առողջ ողնաշար»/g, brand.quoted)
        .replace(/Առողջ ողնաշար/g, brand.name)
    );
  }
  return data;
}

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.content) data.content = {};

  data.meta = data.meta || {};
  if (blocksTr.meta[lang]) data.meta.siteDescription = blocksTr.meta[lang];
  if (blocksTr.siteTitle[lang]) data.meta.siteTitle = blocksTr.siteTitle[lang];

  const hosp = data.content.hospital || {};
  data.content.hospital = {
    ...hosp,
    ...(blocksTr.hospital[lang] || {})
  };

  data.content.departments = mapDepartments(lang);
  data.content.doctors =
    lang === 'hy' ? hyDoctors : lang === 'en' ? enDoctors : hospital.doctors.map((d) => ({
        id: d.id,
        name: d.name,
        role: d.role,
        experience: d.experience,
        bio: d.bio
      }));

  data.content.equipment = mapEquipment(lang);
  data.content.programs = mapPrograms(lang);

  if (lang === 'ru') {
    data.content.news = hospital.news;
    data.content.storyVideos = hospital.storyVideos;
    data.content.patientStories = hospital.patientStories;
    data.content.reviews = hospital.reviews;
    data.content.awards = hospital.awards;
    data.content.patientHero = hospital.patientHero;
    data.content.backInGame = hospital.backInGame;
    data.content.expertiseOverlay = hospital.expertiseOverlay;
    data.content.approachParagraphs = hospital.approachParagraphs;
    data.content.expertsParagraphs = hospital.expertsParagraphs;
    data.content.imagingParagraphs = hospital.imagingParagraphs;
  } else {
    data.content.news = mergeById(hospital.news, blocksTr.news[lang]);
    data.content.storyVideos = mergeById(hospital.storyVideos, blocksTr.storyVideos[lang]);
    data.content.patientStories = mergeById(hospital.patientStories, blocksTr.patientStories[lang]);
    data.content.reviews = mergeById(hospital.reviews, blocksTr.reviews[lang]);
    data.content.awards = mergeById(hospital.awards, blocksTr.awards[lang]);
    data.content.patientHero = { ...hospital.patientHero, ...blocksTr.patientHero[lang] };
    data.content.backInGame = { ...hospital.backInGame, ...blocksTr.backInGame[lang] };
    const eo = blocksTr.expertiseOverlay[lang];
    data.content.expertiseOverlay = {
      ...hospital.expertiseOverlay,
      ...eo,
      links: eo.links || hospital.expertiseOverlay.links
    };
    data.content.approachParagraphs = blocksTr.approachParagraphs[lang];
    data.content.expertsParagraphs = blocksTr.expertsParagraphs[lang];
    data.content.imagingParagraphs = blocksTr.imagingParagraphs[lang];
  }

  data.content.moveBetter = buildMoveBetter(lang);

  const patched = applyBrandName(data, lang);
  fs.writeFileSync(file, JSON.stringify(patched, null, 2) + '\n', 'utf8');
  console.log('Monolingual content OK:', lang);
});
