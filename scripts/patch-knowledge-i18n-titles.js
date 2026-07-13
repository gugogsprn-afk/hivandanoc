#!/usr/bin/env node
/**
 * Patch knowledge-i18n.js with natural RU/EN titles from knowledge-i18n-parity.js
 */
const fs = require('fs');
const path = require('path');
const { TITLE_FIXES } = require('../server/services/knowledge-i18n-parity');

const FILE = path.join(__dirname, '../server/services/knowledge-i18n.js');
const data = require(FILE);

for (const slug of Object.keys(TITLE_FIXES)) {
  const fix = TITLE_FIXES[slug];
  for (const lang of ['ru', 'en']) {
    if (!data[lang]?.[slug] || !fix[lang]) continue;
    Object.assign(data[lang][slug], fix[lang]);
  }
}

const out =
  '/** Knowledge SSR i18n overlays — titles patched for natural RU/EN */\nmodule.exports = ' +
  JSON.stringify(data, null, 2) +
  ';\n';
fs.writeFileSync(FILE, out, 'utf8');
console.log('Patched', Object.keys(TITLE_FIXES).length, 'slugs in', FILE);
