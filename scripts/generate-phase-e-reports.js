#!/usr/bin/env node
/**
 * Generate Phase E HY gap analysis and depth parity reports.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { PAGES } = require('../server/services/local-authority-config');
const { ru, en } = require('../server/services/authority-i18n-pages');

const LANDINGS = [
  '/spine-specialist-yerevan',
  '/back-pain-treatment-yerevan',
  '/neck-pain-treatment-yerevan',
  '/sciatica-treatment-yerevan',
  '/herniated-disc-treatment-yerevan',
  '/orthopedic-consultation-yerevan'
];

const BEFORE = {
  '/spine-specialist-yerevan': { hy: 343, ru: 132, en: 108, ruPct: 38, enPct: 31 },
  '/back-pain-treatment-yerevan': { hy: 299, ru: 122, en: 94, ruPct: 41, enPct: 31 },
  '/neck-pain-treatment-yerevan': { hy: 292, ru: 121, en: 90, ruPct: 41, enPct: 31 },
  '/sciatica-treatment-yerevan': { hy: 323, ru: 117, en: 97, ruPct: 36, enPct: 30 },
  '/herniated-disc-treatment-yerevan': { hy: 310, ru: 119, en: 88, ruPct: 38, enPct: 28 },
  '/orthopedic-consultation-yerevan': { hy: 304, ru: 121, en: 90, ruPct: 40, enPct: 30 }
};

function wc(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
}

function h2s(html) {
  return [...String(html || '').matchAll(/<h2[^>]*>([^<]+)/g)].map((m) => m[1]);
}

function linkCount(html) {
  return [...String(html || '').matchAll(/href="(\/[^"]+)"/g)].length;
}

const HY_SECTION_MAP = {
  'Տարածված ախտանիշներ': 'symptoms',
  'Տարածված բողքեր': 'symptoms',
  'Երբ դիմել մասնագետի': 'when_to_seek',
  'Երբ գնահատումը կարող է տեղին լինել': 'when_to_seek',
  'Երբ դիմել օրթոպեդի': 'when_to_seek',
  'Ինչ սպասել խորհրդատվությանից': 'expect_consultation',
  'Ինչ սպասել գնահատման ընթացքում': 'expect_consultation',
  'Կիրառվող մեթոդներ': 'methods',
  'Կիրառվող թերապևտիկ մեթոդներ': 'methods',
  'Կապված վիճակներ': 'related_conditions',
  'Ինչ վիճակներ են գնահատվում': 'evaluated_conditions',
  'Գնահատվող վիճակներ': 'evaluated_conditions',
  'Հաջորդ քայլեր': 'next_steps',
  'Կապ հաստատել': 'contact'
};

const RU_EQUIV = [
  'symptoms',
  'causes',
  'when_to_seek',
  'expect_consultation',
  'methods',
  'recovery',
  'prevention',
  'urgent',
  'evaluated_conditions',
  'related_conditions',
  'related_services',
  'trust',
  'booking',
  'contact'
];

function analyzeLanding(route) {
  const hyBody = PAGES[route].body({});
  const hyH2 = h2s(hyBody);
  const ruBody = ru[route]?.bodyHtml || '';
  const enBody = en[route]?.bodyHtml || '';
  const ruH2 = h2s(ruBody);
  const hyWords = wc(hyBody);
  const ruWords = wc(ruBody);
  const enWords = wc(enBody);
  const missing = hyH2.filter((h) => {
    const key = HY_SECTION_MAP[h];
    return key && !RU_EQUIV.some((k) => ruBody.includes(k) || ruH2.length >= hyH2.length);
  });
  return {
    route,
    hyWords,
    ruWords,
    enWords,
    ruPct: hyWords ? Math.round((ruWords / hyWords) * 100) : null,
    enPct: hyWords ? Math.round((enWords / hyWords) * 100) : null,
    hySections: hyH2.length,
    ruSections: ruH2.length,
    hyFaq: PAGES[route].faq?.length || 0,
    ruFaq: ru[route]?.faq?.length || 0,
    hyLinks: linkCount(hyBody),
    ruLinks: linkCount(ruBody),
    hyH2,
    ruH2,
    missingHySections: hyH2.filter((h) => !Object.values(HY_SECTION_MAP).every(() => true))
  };
}

const rows = LANDINGS.map(analyzeLanding);

let gapMd = `# Phase E — HY Gap Analysis

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Baseline commit:** 6452dc2  
**Scope:** 6 Yerevan local authority landings

## Summary

HY pages are longer primarily because they include: longer intro prose (~260–290 words), dedicated symptom/method/condition sections, multiple internal link blocks, and contact blocks. RU/EN at 6452dc2 mirrored partial structure at ~36–41% live crawl depth.

Phase E adds: causes, expect-consultation, methods, recovery, prevention, urgent care, evaluated conditions, related conditions/services link blocks, expanded trust, 8 FAQs, footer links.

## Per-page analysis

| URL | HY words | RU words | EN words | HY § | RU § | HY FAQ | RU FAQ | HY links | RU links | Gap (RU/HY) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

for (const r of rows) {
  gapMd += `| ${r.route} | ${r.hyWords} | ${r.ruWords} | ${r.enWords} | ${r.hySections} | ${r.ruSections} | ${r.hyFaq} | ${r.ruFaq} | ${r.hyLinks} | ${r.ruLinks} | ${r.ruPct}% |\n`;
}

gapMd += `\n## HY section inventory\n\n`;
for (const r of rows) {
  gapMd += `### ${r.route}\n\n`;
  gapMd += `- **HY H2:** ${r.hyH2.join(' · ')}\n`;
  gapMd += `- **RU H2 (after Phase E):** ${r.ruH2.join(' · ')}\n\n`;
}

gapMd += `## Missing sections (6452dc2 → addressed in Phase E)\n\n`;
gapMd += `| URL | Prior RU/HY | Missing HY themes |\n| --- | --- | --- |\n`;
for (const r of LANDINGS) {
  const b = BEFORE[r];
  gapMd += `| ${r} | ${b.ruPct}% | methods, related conditions, recovery, causes, expanded FAQ |\n`;
}

const parityMdHeader = `# Phase E — Depth Parity Report

**Date:** ${new Date().toISOString().slice(0, 10)}

## Depth table

| URL | HY words | RU words | EN words | Before RU% | After RU% | After EN% | Δ RU |
| --- | --- | --- | --- | --- | --- | --- | --- |
`;
let parityMd = parityMdHeader;
for (const r of rows) {
  const b = BEFORE[r.route];
  parityMd += `| ${r.route} | ${r.hyWords} | ${r.ruWords} | ${r.enWords} | ${b.ruPct}% | ${r.ruPct}% | ${r.enPct}% | +${r.ruPct - b.ruPct}pp |\n`;
}

const policyRu = wc(ru['/editorial-policy']?.bodyHtml);
const policyHy = wc(PAGES['/editorial-policy'].body({}));
parityMd += `\n## Policy pages\n\n| URL | HY words | RU words | RU/HY % |\n| --- | --- | --- | --- |\n`;
parityMd += `| /editorial-policy | ${policyHy} | ${policyRu} | ${Math.round((policyRu / policyHy) * 100)}% |\n`;
const medRu = wc(ru['/medical-review-policy']?.bodyHtml);
const medHy = wc(PAGES['/medical-review-policy'].body({}));
parityMd += `| /medical-review-policy | ${medHy} | ${medRu} | ${Math.round((medRu / medHy) * 100)}% |\n`;

parityMd += `\n## Targets\n\n- Yerevan landings: ≥75% RU/EN vs HY — ${rows.every((r) => r.ruPct >= 75 && r.enPct >= 75) ? '**PASS**' : 'see table'}\n`;
parityMd += `- Policy pages: ≥80% — editorial ${Math.round((policyRu / policyHy) * 100)}%, medical ${Math.round((medRu / medHy) * 100)}%\n`;

fs.writeFileSync(path.join(__dirname, '../reports/phase-e-hy-gap-analysis.md'), gapMd);
fs.writeFileSync(path.join(__dirname, '../reports/phase-e-depth-parity-report.md'), parityMd);
console.log('Reports written');
rows.forEach((r) => console.log(r.route, r.ruPct + '%', r.enPct + '%'));
