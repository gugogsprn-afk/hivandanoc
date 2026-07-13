#!/usr/bin/env node
/**
 * FAQPage JSON-LD QA for knowledge articles.
 * Usage: node scripts/audit-knowledge-schema.js [BASE_URL]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { fetchUrl } = require('./content-parity-audit');
const { getLaunchedKnowledgeSlugs } = require('../server/services/knowledge-pages');

const BASE = (process.argv[2] || 'https://healthyspinedoc.com').replace(/\/$/, '');
const REPORTS = path.join(__dirname, '..', 'reports');
const SLUGS = getLaunchedKnowledgeSlugs();

function extractJsonLd(html) {
  const blocks = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function countVisibleFaq(html) {
  const dl = (html.match(/<dl class="hss-faq">[\s\S]*?<\/dl>/i) || [''])[0];
  const dtCount = (dl.match(/<dt>/gi) || []).length;
  if (dtCount) return dtCount;
  const details = (html.match(/<details class="seo-faq-item"/gi) || []).length;
  return details;
}

function findFaqPageEntity(graph) {
  const found = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node['@type'] === 'FAQPage' || (Array.isArray(node['@type']) && node['@type'].includes('FAQPage'))) {
      found.push(node);
    }
    if (Array.isArray(node)) node.forEach(walk);
    else if (node['@graph']) walk(node['@graph']);
    else Object.values(node).forEach((v) => { if (v && typeof v === 'object') walk(v); });
  };
  walk(graph);
  return found;
}

async function auditSlug(slug) {
  const route = `/knowledge/${slug}`;
  const url = `${BASE}${route}`;
  const { status, html } = await fetchUrl(url);
  const issues = [];
  if (status !== 200) issues.push(`HTTP ${status}`);

  const visibleFaq = countVisibleFaq(html);
  const blocks = extractJsonLd(html);
  let faqSchemaCount = 0;
  let schemaQuestions = 0;

  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw);
      const faqPages = findFaqPageEntity(parsed);
      faqSchemaCount += faqPages.length;
      for (const fp of faqPages) {
        schemaQuestions += (fp.mainEntity || []).length;
      }
    } catch {
      issues.push('JSON-LD parse error');
    }
  }

  const hasMedicalWebPage = /"@type"\s*:\s*"MedicalWebPage"/i.test(html);
  if (!hasMedicalWebPage) issues.push('missing MedicalWebPage schema');

  if (visibleFaq > 0) {
    if (faqSchemaCount === 0) issues.push('visible FAQ but no FAQPage schema');
    else if (faqSchemaCount > 1) issues.push(`duplicate FAQPage blocks (${faqSchemaCount})`);
    if (schemaQuestions !== visibleFaq) {
      issues.push(`FAQ count mismatch: visible=${visibleFaq} schema=${schemaQuestions}`);
    }
  } else if (faqSchemaCount > 0) {
    issues.push('FAQPage schema without visible FAQ');
  }

  const hasContact = html.includes('href="/contact"');
  if (!hasContact) issues.push('missing /contact link');

  return { slug, route, url, visibleFaq, faqSchemaCount, schemaQuestions, hasContact, issues };
}

async function main() {
  const rows = [];
  for (const slug of SLUGS) {
    rows.push(await auditSlug(slug));
  }

  const failed = rows.filter((r) => r.issues.length);
  const lines = [
    '# Phase I — Knowledge Schema Audit',
    '',
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**Base URL:** ${BASE}`,
    `**Articles:** ${SLUGS.length}`,
    '',
    '## Summary',
    '',
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Passed | ${rows.length - failed.length} |`,
    `| Failed | ${failed.length} |`,
    `| With visible FAQ | ${rows.filter((r) => r.visibleFaq > 0).length} |`,
    `| With FAQPage schema | ${rows.filter((r) => r.faqSchemaCount > 0).length} |`,
    `| With /contact link | ${rows.filter((r) => r.hasContact).length} |`,
    '',
    '## Per-article',
    '',
    '| Slug | Visible FAQ | Schema Q | Contact | Status |',
    '| --- | --- | --- | --- | --- |'
  ];

  for (const r of rows) {
    const status = r.issues.length ? `FAIL: ${r.issues.join('; ')}` : 'PASS';
    lines.push(`| ${r.slug} | ${r.visibleFaq} | ${r.schemaQuestions} | ${r.hasContact ? 'yes' : 'no'} | ${status} |`);
  }

  fs.mkdirSync(REPORTS, { recursive: true });
  const out = path.join(REPORTS, 'phase-i-knowledge-schema-audit.md');
  fs.writeFileSync(out, lines.join('\n') + '\n');

  console.log(`Knowledge schema audit: ${rows.length - failed.length}/${rows.length} passed`);
  if (failed.length) {
    for (const r of failed) console.log(`  FAIL ${r.route}: ${r.issues.join('; ')}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
