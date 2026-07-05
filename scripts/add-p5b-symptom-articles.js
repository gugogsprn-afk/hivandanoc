#!/usr/bin/env node
/** Merge P5B symptom articles into knowledge-config.js */
const fs = require('fs');
const path = require('path');
const { P5B_SYMPTOM_ARTICLES } = require('../server/services/p5b-symptom-articles');

const configPath = path.join(__dirname, '../server/services/knowledge-config.js');
const { KNOWLEDGE_CONFIG, PLANNED_KNOWLEDGE_SLUGS } = require(configPath);

Object.assign(KNOWLEDGE_CONFIG, P5B_SYMPTOM_ARTICLES);

const crossLinkUpdates = {
  'back-pain-causes': ['lower-back-pain-causes', 'back-pain-when-sitting', 'sciatica-symptoms'],
  'herniated-disc-symptoms': ['sciatica-symptoms', 'leg-numbness-and-spine', 'lower-back-pain-causes'],
  'neck-pain-causes': ['neck-stiffness-causes'],
  'posture-and-spine-health': ['back-pain-when-sitting', 'lower-back-pain-causes', 'neck-stiffness-causes']
};

for (const [slug, add] of Object.entries(crossLinkUpdates)) {
  if (!KNOWLEDGE_CONFIG[slug]) continue;
  const rel = new Set(KNOWLEDGE_CONFIG[slug].relatedKnowledgeSlugs || []);
  add.forEach((s) => rel.add(s));
  KNOWLEDGE_CONFIG[slug].relatedKnowledgeSlugs = [...rel].filter((s) => KNOWLEDGE_CONFIG[s]);
}

const P5B_SLUGS = Object.keys(P5B_SYMPTOM_ARTICLES);
const LAUNCHED_KNOWLEDGE_SLUGS = [
  'back-pain-causes',
  'neck-pain-causes',
  'herniated-disc-symptoms',
  'posture-and-spine-health',
  'rehabilitation-after-spine-surgery',
  ...P5B_SLUGS
];

const out = `/** Auto-generated — P5A bootstrap + P5B symptom articles */
const LAUNCHED_KNOWLEDGE_SLUGS = ${JSON.stringify(LAUNCHED_KNOWLEDGE_SLUGS)};
const PLANNED_KNOWLEDGE_SLUGS = ${JSON.stringify(PLANNED_KNOWLEDGE_SLUGS)};
const KNOWLEDGE_CONFIG = ${JSON.stringify(KNOWLEDGE_CONFIG, null, 2)};
module.exports = { LAUNCHED_KNOWLEDGE_SLUGS, PLANNED_KNOWLEDGE_SLUGS, KNOWLEDGE_CONFIG };
`;

fs.writeFileSync(configPath, out, 'utf8');
console.log('P5B merged:', P5B_SLUGS.length, 'new articles,', LAUNCHED_KNOWLEDGE_SLUGS.length, 'total launched');
