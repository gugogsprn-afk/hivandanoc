#!/usr/bin/env node
/** P0T.2 — remove unverified move-better press items; keep educational articles. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

for (const lang of ['hy', 'en', 'ru']) {
  const file = path.join(ROOT, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.content?.moveBetter) data.content.moveBetter.pressNews = [];
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Cleared moveBetter.pressNews in lang/${lang}.json`);
}

const hospitalPath = path.join(ROOT, 'data/hospital.json');
const hospital = JSON.parse(fs.readFileSync(hospitalPath, 'utf8'));
if (hospital.moveBetter) hospital.moveBetter.pressNews = [];
fs.writeFileSync(hospitalPath, `${JSON.stringify(hospital, null, 2)}\n`);
console.log('Cleared moveBetter.pressNews in data/hospital.json');
