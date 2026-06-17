/**
 * Rebuild all i18n lang files and offline embeds.
 * Run: node scripts/rebuild-i18n.js
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const patches = [
  'patch-hss-i18n.js',
  'patch-hss-full-i18n.js',
  'patch-hss-phase1-i18n.js',
  'patch-hss-phase2-i18n.js',
  'patch-hss-visual-i18n.js',
  'patch-services-i18n.js',
  'patch-footer-i18n.js',
  'patch-share-i18n.js',
  'patch-story-i18n.js',
  'patch-story-consent.js',
  'patch-move-better.js',
  'patch-about-article.js',
  'patch-content-monolingual.js'
];

for (const p of patches) {
  console.log('\n---', p, '---');
  execSync(`node scripts/${p}`, { cwd: root, stdio: 'inherit' });
}

console.log('\n--- build-embed.js ---');
execSync('node scripts/build-embed.js', { cwd: root, stdio: 'inherit' });
console.log('\nDone.');
