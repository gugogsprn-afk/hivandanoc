#!/usr/bin/env node
/**
 * Regression tests for balanced #seo-crawl-content extraction.
 * Usage: npm run test:content-extraction
 */
'use strict';

const { extractMainText, countWords } = require('./content-parity-audit');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function testNestedSections() {
  const html = `<!DOCTYPE html><html><body>
<section id="seo-crawl-content">
  <h1>Main</h1>
  <section><h2>Nested A</h2><p>Alpha beta gamma.</p></section>
  <section><h2>Nested B</h2><p>Delta epsilon zeta.</p></section>
</section>
</body></html>`;
  const { text, method } = extractMainText(html);
  assert(method === '#seo-crawl-content', `expected #seo-crawl-content, got ${method}`);
  for (const needle of ['Main', 'Nested A', 'Alpha beta gamma', 'Nested B', 'Delta epsilon zeta']) {
    assert(text.includes(needle), `missing "${needle}" in: ${text}`);
  }
}

function testStopsAfterBalancedClose() {
  const html = `<!DOCTYPE html><html><body>
<section id="seo-crawl-content">
  <h1>Authority</h1>
  <section><p>Inside content here.</p></section>
</section>
<section id="footer-extra"><p>Footer noise must not appear.</p></section>
</body></html>`;
  const { text } = extractMainText(html);
  assert(text.includes('Inside content here'), 'missing inner content');
  assert(!text.includes('Footer noise'), 'included footer section after balanced close');
}

function testMainFallback() {
  const html = `<!DOCTYPE html><html><body>
<main><h1>Fallback Main</h1><p>Primary body text.</p></main>
</body></html>`;
  const { text, method } = extractMainText(html);
  assert(method === 'main', `expected main fallback, got ${method}`);
  assert(text.includes('Fallback Main') && text.includes('Primary body text'), text);
}

function testUnicodeWordCount() {
  const ru = 'Индивидуальный план может поддерживать восстановление после оценки.';
  const hy = 'Առողջ ողնաշար վերականգնողական կենտրոն';
  const en = 'Conservative care may support recovery after assessment.';
  assert(countWords(ru, 'ru') >= 6, `RU word count too low: ${countWords(ru, 'ru')}`);
  assert(countWords(hy, 'hy') >= 4, `HY word count too low: ${countWords(hy, 'hy')}`);
  assert(countWords(en, 'en') === 7, `EN word count expected 7, got ${countWords(en, 'en')}`);
}

function main() {
  testNestedSections();
  testStopsAfterBalancedClose();
  testMainFallback();
  testUnicodeWordCount();
  console.log('CONTENT_EXTRACTION_REGRESSION_PASS');
}

try {
  main();
} catch (err) {
  console.error('CONTENT_EXTRACTION_REGRESSION_FAIL:', err.message);
  process.exit(1);
}
