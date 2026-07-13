#!/usr/bin/env node
/**
 * JSON-LD / metadata QA for authority and policy pages.
 * Usage: node scripts/audit-authority-schema.js [BASE_URL]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { fetchUrl, langUrl, extractMainText } = require('./content-parity-audit');

const BASE = (process.argv[2] || 'https://healthyspinedoc.com').replace(/\/$/, '');
const REPORTS = path.join(__dirname, '..', 'reports');

const ROUTES = [
  '/spine-specialist-yerevan',
  '/back-pain-treatment-yerevan',
  '/neck-pain-treatment-yerevan',
  '/sciatica-treatment-yerevan',
  '/herniated-disc-treatment-yerevan',
  '/orthopedic-consultation-yerevan',
  '/editorial-policy',
  '/medical-review-policy',
  '/patient-consultation-guide'
];

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractLang(html) {
  const m = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractHreflang(html) {
  return [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi)].map((m) => m[1]);
}

function extractJsonLd(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function graphTypes(graph) {
  const types = new Set();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node['@type']) {
      const t = node['@type'];
      if (Array.isArray(t)) t.forEach((x) => types.add(x));
      else types.add(t);
    }
    if (Array.isArray(node)) node.forEach(walk);
    else Object.values(node).forEach((v) => { if (v && typeof v === 'object') walk(v); });
  };
  walk(graph);
  return [...types];
}

async function auditPage(route, lang) {
  const url = langUrl(route, lang);
  const { status, html } = await fetchUrl(url);
  const issues = [];
  if (status !== 200) issues.push(`HTTP ${status}`);

  const canonical = extractCanonical(html);
  const expectedCanonical = `${BASE}${route}`;
  if (!canonical.includes(route)) issues.push(`canonical mismatch: ${canonical || '(missing)'}`);

  const htmlLang = extractLang(html);
  if (htmlLang !== lang) issues.push(`html lang=${htmlLang} expected ${lang}`);

  const hreflang = extractHreflang(html);
  if (hreflang.length && !hreflang.includes(lang)) issues.push(`hreflang missing ${lang}`);

  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const hasHyInTitle = /[\u0531-\u0587]/.test(title);
  const hasHyInH1 = /[\u0531-\u0587]/.test(h1.replace(/<[^>]+>/g, ''));
  if (lang !== 'hy' && (hasHyInTitle || hasHyInH1)) issues.push('Armenian in visible title/H1');

  const { text } = extractMainText(html);
  const hasFaqVisible = /faq|Часто задаваемые|Frequently asked/i.test(html);
  const ldBlocks = extractJsonLd(html);
  const parsed = [];
  for (let i = 0; i < ldBlocks.length; i++) {
    try {
      parsed.push(JSON.parse(ldBlocks[i]));
    } catch (e) {
      issues.push(`JSON-LD block ${i + 1} parse error: ${e.message}`);
    }
  }
  const allTypes = parsed.flatMap((g) => graphTypes(g));
  const hasFaqSchema = allTypes.includes('FAQPage');
  const hasBreadcrumb = allTypes.includes('BreadcrumbList');
  if (hasFaqVisible && !hasFaqSchema) issues.push('FAQ visible but no FAQPage schema');
  if (!hasBreadcrumb) issues.push('BreadcrumbList missing');

  return {
    route,
    lang,
    status,
    canonical,
    htmlLang,
    title: title.slice(0, 80),
    jsonLdBlocks: ldBlocks.length,
    types: [...new Set(allTypes)],
    hasFaqVisible,
    hasFaqSchema,
    hasBreadcrumb,
    wordCount: (text.match(/[\p{L}\p{N}]+/gu) || []).length,
    issues,
    pass: issues.length === 0
  };
}

async function main() {
  const results = [];
  for (const route of ROUTES) {
    for (const lang of ['hy', 'ru', 'en']) {
      results.push(await auditPage(route, lang));
    }
  }

  let md = `# Phase F — Schema / JSON-LD Authority Audit

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Base URL:** ${BASE}

## Results

| URL | Lang | Status | Canonical | FAQ schema | Breadcrumb | JSON-LD types | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
`;

  for (const r of results) {
    md += `| ${r.route} | ${r.lang} | ${r.status} | ${r.canonical ? 'OK' : '—'} | ${r.hasFaqSchema ? 'yes' : r.hasFaqVisible ? 'MISSING' : 'n/a'} | ${r.hasBreadcrumb ? 'yes' : 'no'} | ${r.types.join(', ') || '—'} | ${r.pass ? '**PASS**' : 'WARN'} |\n`;
  }

  const failed = results.filter((r) => !r.pass);
  md += `\n## Issues (${failed.length})\n\n`;
  if (!failed.length) md += `None — all checks passed.\n`;
  else {
    for (const r of failed) {
      md += `- **${r.route} (${r.lang})**: ${r.issues.join('; ')}\n`;
    }
  }

  const overall = failed.length === 0 ? 'PASS' : failed.every((r) => r.issues.every((i) => !i.includes('parse error'))) ? 'PASS_WITH_WARNINGS' : 'BLOCKED';
  md += `\n## Overall: **${overall}**\n`;

  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(path.join(REPORTS, 'phase-f-schema-authority-audit.md'), md);
  console.log(`Wrote reports/phase-f-schema-authority-audit.md (${overall}, ${failed.length} issue rows)`);
  if (overall === 'BLOCKED') process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
