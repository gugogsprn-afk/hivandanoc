#!/usr/bin/env node
/**
 * Cross-certify live crawl depth vs content-parity-audit extraction.
 * Usage: node scripts/certify-live-authority-depth.js [BASE_URL]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  BASE: defaultBase,
  fetchUrl,
  langUrl,
  extractMainText,
  countWords
} = require('./content-parity-audit');

const BASE = (process.argv[2] || defaultBase).replace(/\/$/, '');
const REPORTS = path.join(__dirname, '..', 'reports');

const ROUTES = [
  '/spine-specialist-yerevan',
  '/back-pain-treatment-yerevan',
  '/neck-pain-treatment-yerevan',
  '/sciatica-treatment-yerevan',
  '/herniated-disc-treatment-yerevan',
  '/orthopedic-consultation-yerevan',
  '/editorial-policy',
  '/medical-review-policy'
];

const POLICY_ROUTES = new Set(['/editorial-policy', '/medical-review-policy']);
const TOLERANCE_PCT = 15;

async function liveWords(route, lang) {
  const { status, html } = await fetchUrl(langUrl(route, lang));
  if (status !== 200) throw new Error(`${route} ${lang}: HTTP ${status}`);
  const { text, method } = extractMainText(html);
  return { words: countWords(text, lang), method };
}

function passRow(route, ruPct, enPct) {
  const min = POLICY_ROUTES.has(route) ? 80 : 75;
  return ruPct >= min && enPct >= min ? 'PASS' : 'FAIL';
}

async function main() {
  let auditData = {};
  const auditPath = path.join(REPORTS, 'content-parity-data.json');
  if (fs.existsSync(auditPath)) {
    auditData = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  }

  const rows = [];
  for (const route of ROUTES) {
    const hy = await liveWords(route, 'hy');
    const ru = await liveWords(route, 'ru');
    const en = await liveWords(route, 'en');
    const ruPct = hy.words ? Math.round((ru.words / hy.words) * 100) : null;
    const enPct = hy.words ? Math.round((en.words / hy.words) * 100) : null;

    const auditRow = (auditData.inventory || []).find((r) => r.route === route);
    const auditRuPct = auditRow?.ruVsHyPct ?? null;
    const auditEnPct = auditRow?.enVsHyPct ?? null;
    const deltaRu = auditRuPct != null && ruPct != null ? Math.abs(auditRuPct - ruPct) : null;
    const deltaEn = auditEnPct != null && enPct != null ? Math.abs(auditEnPct - enPct) : null;
    const auditMatch =
      (deltaRu == null || deltaRu <= TOLERANCE_PCT) && (deltaEn == null || deltaEn <= TOLERANCE_PCT)
        ? 'PASS'
        : 'WARN';

    rows.push({
      route,
      hy: hy.words,
      ru: ru.words,
      en: en.words,
      ruPct,
      enPct,
      auditRuPct,
      auditEnPct,
      deltaRu,
      deltaEn,
      method: ru.method,
      threshold: passRow(route, ruPct, enPct),
      auditMatch
    });
  }

  let md = `# Phase F — Live Authority Depth Certification

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Base URL:** ${BASE}  
**Extraction:** \`extractMainText()\` from \`scripts/content-parity-audit.js\` (balanced \`#seo-crawl-content\`)  
**Tolerance:** audit vs live parity class within ${TOLERANCE_PCT}pp

## Certification table

| URL | HY live | RU live | EN live | RU % | EN % | Audit RU % | Audit EN % | Δ RU | Δ EN | Audit match | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;

  for (const r of rows) {
    md += `| ${r.route} | ${r.hy} | ${r.ru} | ${r.en} | ${r.ruPct}% | ${r.enPct}% | ${r.auditRuPct ?? '—'}% | ${r.auditEnPct ?? '—'}% | ${r.deltaRu ?? '—'}pp | ${r.deltaEn ?? '—'}pp | ${r.auditMatch} | **${r.threshold}** |\n`;
  }

  const allPass = rows.every((r) => r.threshold === 'PASS');
  const auditAligned = rows.every((r) => r.auditMatch === 'PASS');
  md += `\n## Summary\n\n`;
  md += `- Live depth thresholds: **${allPass ? 'PASS' : 'FAIL'}**\n`;
  md += `- Audit/live alignment (≤${TOLERANCE_PCT}pp): **${auditAligned ? 'PASS' : 'PASS_WITH_WARNINGS'}**\n`;

  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(path.join(REPORTS, 'phase-f-live-authority-certification.md'), md);
  console.log('Wrote reports/phase-f-live-authority-certification.md');
  rows.forEach((r) =>
    console.log(`${r.route} RU ${r.ruPct}% EN ${r.enPct}% auditΔ ${r.deltaRu}/${r.deltaEn}pp ${r.threshold}`)
  );

  if (!allPass || !auditAligned) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
