/**
 * Generates offline embed scripts so the site opens without a local server.
 * Run: node scripts/build-embed.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function writeEmbed(srcRelative, destRelative, globalName, nestedKey) {
  const src = path.join(root, srcRelative);
  const dest = path.join(root, destRelative);
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));
  let js;
  if (nestedKey) {
    js = `window.${globalName} = window.${globalName} || {};\nwindow.${globalName}.${nestedKey} = ${JSON.stringify(data)};\n`;
  } else {
    js = `window.${globalName} = ${JSON.stringify(data)};\n`;
  }
  fs.writeFileSync(dest, js, 'utf8');
  console.log('Wrote', destRelative);
}

writeEmbed('data/hospital.json', 'data/hospital.embed.js', '__HOSPITAL_BASE__');
writeEmbed('data/about-article.json', 'data/about-article.embed.js', '__ABOUT_ARTICLE__');
['hy', 'ru', 'en'].forEach((code) => {
  writeEmbed(`lang/${code}.json`, `lang/${code}.embed.js`, '__I18N__', code);
});

console.log('Done. Site works via file:// and http://');
