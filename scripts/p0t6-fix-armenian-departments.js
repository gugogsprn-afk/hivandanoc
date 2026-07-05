#!/usr/bin/env node
/** P0T.6 — Armenian department names in hospital.json from dept-translations + lang/hy.json */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const hospitalPath = path.join(ROOT, 'data/hospital.json');
const { hyNames, hyDetails } = require('./lib/dept-translations');
const hyLang = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/hy.json'), 'utf8'));
const hyDepts = new Map((hyLang.content?.departments || []).map((d) => [d.id, d]));

const hospital = JSON.parse(fs.readFileSync(hospitalPath, 'utf8'));
let patched = 0;

for (const dept of hospital.departments || []) {
  const hy = hyDepts.get(dept.id);
  const details = hyDetails[dept.id];
  const name = hy?.name || hyNames[dept.id];
  if (name) {
    dept.name = name;
    patched++;
  }
  const desc = hy?.description || details?.description;
  if (desc) dept.description = desc;
  const services = hy?.services || details?.services;
  if (services?.length) dept.services = services;
}

const hyCats = hyLang.content?.serviceCategories;
if (Array.isArray(hyCats) && hospital.serviceCategories) {
  const catMap = new Map(hyCats.map((c) => [c.id, c.name]));
  for (const cat of hospital.serviceCategories) {
    if (catMap.has(cat.id)) cat.name = catMap.get(cat.id);
  }
}

fs.writeFileSync(hospitalPath, JSON.stringify(hospital, null, 2) + '\n', 'utf8');
console.log('P0T.6 hospital.json departments patched:', patched);
