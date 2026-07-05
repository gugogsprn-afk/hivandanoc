#!/usr/bin/env node
/** P0T.3 — rebuild knowledge-config and patch Armenian copy site-wide */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P5A = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'server/services/p5a-articles.json'), 'utf8')
);
const { P5B_SYMPTOM_ARTICLES } = require('../server/services/p5b-symptom-articles');

const REPLACEMENTS = [
  ['Պոզանոցի ցավ', 'Մեջքի ցավ'],
  ['Պոզանոցի հերնիայի', 'Միջողային սկավառակի ճողվածքի'],
  ['Պոզանոցի հերնիա', 'Միջողային սկավառակի ճողվածք'],
  ['Կեցվաթք', 'Կեցվածք'],
  ['արողջությանբ', 'առողջության'],
  ['արողջության', 'առողջության'],
  ['Արողջ', 'Առողջ'],
  ['ուրահատության', 'վիրահատության'],
  ['ուրահատություն', 'վիրահատություն'],
  ['Ոտքի խմբավորումը', 'Ոտքի թմրածությունը'],
  ['Ոտքի խմբավորում', 'Ոտքի թմրածություն'],
  ['կոկորկոտման', 'կարկամության'],
  ['կոկորկոտում', 'կարկամություն'],
  ['կոկորկոտ', 'կարկամություն'],
  ['մասաժ', 'մերսում'],
  ['Տեղեկատվակ', 'Տեղեկատվական'],
  ['խմբավորվածություն', 'թմրածություն'],
  ['խմբավորումը', 'թմրածությունը'],
  ['խմբավորումով', 'թմրածությամբ'],
  ['խմբավորում', 'թմրածություն'],
  ['Պոզանոցի և պարանոցի ցավի', 'Մեջքի և պարանոցի ցավի'],
  ['影响', 'ազդել'],
  ['Իշiաս', 'Իշիաս']
];

function applyReplacements(text) {
  let s = text;
  for (const [from, to] of REPLACEMENTS) {
    if (s.includes(from)) s = s.split(from).join(to);
  }
  // Remove corrupted "օղ " fragments from legacy copy
  s = s.replace(/ օղ /g, ' ');
  s = s.replace(/օղ /g, '');
  s = s.replace(/ օղ/g, '');
  return s;
}

function deepFix(obj) {
  if (typeof obj === 'string') return applyReplacements(obj);
  if (Array.isArray(obj)) return obj.map(deepFix);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = deepFix(obj[k]);
    return out;
  }
  return obj;
}

const P5B_FIXED = deepFix(P5B_SYMPTOM_ARTICLES);

// P5B title overrides per P0T.3 spec
P5B_FIXED['neck-stiffness-causes'].h1 = 'Պարանոցի կարկամության պատճառներ';
P5B_FIXED['neck-stiffness-causes'].titleSuffix = P5B_FIXED['neck-stiffness-causes'].h1;
P5B_FIXED['neck-stiffness-causes'].tagline =
  'Տեղեկատվական ուղեցույց պարանոցի կարկամության հաճախ հանդիպող պատճառների մասին';
P5B_FIXED['neck-stiffness-causes'].description =
  'Պարանոցի կարկամության պատճառներ։ Տեղեկատվական հոդված «Առողջ ողնաշար» կենտրոնից։';

P5B_FIXED['leg-numbness-and-spine'].h1 = 'Ոտքի թմրածությունը և ողնաշարը';
P5B_FIXED['leg-numbness-and-spine'].titleSuffix = P5B_FIXED['leg-numbness-and-spine'].h1;
P5B_FIXED['leg-numbness-and-spine'].tagline =
  'Տեղեկատվական ուղեցույց ոտքի թմրածության և ողնաշարի հնարավոր կապի մասին';
P5B_FIXED['leg-numbness-and-spine'].description =
  'Ոտքի թմրածություն և ողնաշար։ Տեղեկատվական հոդված «Առողջ ողնաշար» կենտրոնից։';

const KNOWLEDGE_CONFIG = { ...P5A, ...P5B_FIXED };

const crossLinkUpdates = {
  'back-pain-causes': ['lower-back-pain-causes', 'back-pain-when-sitting', 'sciatica-symptoms'],
  'herniated-disc-symptoms': ['sciatica-symptoms', 'leg-numbness-and-spine', 'lower-back-pain-causes'],
  'neck-pain-causes': ['neck-stiffness-causes'],
  'posture-and-spine-health': ['back-pain-when-sitting', 'lower-back-pain-causes', 'neck-stiffness-causes']
};
for (const [slug, add] of Object.entries(crossLinkUpdates)) {
  const rel = new Set(KNOWLEDGE_CONFIG[slug].relatedKnowledgeSlugs || []);
  add.forEach((s) => rel.add(s));
  KNOWLEDGE_CONFIG[slug].relatedKnowledgeSlugs = [...rel].filter((s) => KNOWLEDGE_CONFIG[s]);
}

const LAUNCHED_KNOWLEDGE_SLUGS = [
  'back-pain-causes',
  'neck-pain-causes',
  'herniated-disc-symptoms',
  'posture-and-spine-health',
  'rehabilitation-after-spine-surgery',
  ...Object.keys(P5B_FIXED)
];
const PLANNED_KNOWLEDGE_SLUGS = ['back-pain-symptoms', 'neck-pain-symptoms', 'scoliosis-in-adults'];

const configOut = `/** Auto-generated — P5A + P5B knowledge articles (P0T.3 Armenian copy QA) */
const LAUNCHED_KNOWLEDGE_SLUGS = ${JSON.stringify(LAUNCHED_KNOWLEDGE_SLUGS)};
const PLANNED_KNOWLEDGE_SLUGS = ${JSON.stringify(PLANNED_KNOWLEDGE_SLUGS)};
const KNOWLEDGE_CONFIG = ${JSON.stringify(KNOWLEDGE_CONFIG, null, 2)};
module.exports = { LAUNCHED_KNOWLEDGE_SLUGS, PLANNED_KNOWLEDGE_SLUGS, KNOWLEDGE_CONFIG };
`;
fs.writeFileSync(path.join(ROOT, 'server/services/knowledge-config.js'), configOut, 'utf8');

// Patch p5b source for consistency
fs.writeFileSync(
  path.join(ROOT, 'server/services/p5b-symptom-articles.js'),
  applyReplacements(fs.readFileSync(path.join(ROOT, 'server/services/p5b-symptom-articles.js'), 'utf8')),
  'utf8'
);

const PATCH_FILES = [
  'server/services/condition-pages.js',
  'server/services/seo-pages.js',
  'server/services/service-pages.js',
  'server/services/knowledge-pages.js',
  'scripts/lib/dept-translations.js',
  'lang/hy.json',
  'data/hospital.json'
];
const patched = [];
for (const rel of PATCH_FILES) {
  const fp = path.join(ROOT, rel);
  const before = fs.readFileSync(fp, 'utf8');
  const after = applyReplacements(before);
  if (after !== before) {
    fs.writeFileSync(fp, after, 'utf8');
    patched.push(rel);
  }
}

console.log('P0T.3 copy fix complete');
console.log('knowledge articles:', LAUNCHED_KNOWLEDGE_SLUGS.length);
console.log('patched:', patched.join(', '));
