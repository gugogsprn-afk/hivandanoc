#!/usr/bin/env node
/**
 * One-time migration: move CMS data to a persistent directory outside deploy sync.
 * Usage: CMS_DATA_DIR=/var/lib/hivandanoc-cms node scripts/cms-migrate-data-dir.js
 */
const fs = require('fs');
const path = require('path');

const target = process.env.CMS_DATA_DIR || '/var/lib/hivandanoc-cms';
const source = path.join(__dirname, '../data/cms');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
}

if (!fs.existsSync(source)) {
  console.log('[cms:migrate] No source data at', source);
  process.exit(0);
}

if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

for (const name of fs.readdirSync(source)) {
  const from = path.join(source, name);
  const to = path.join(target, name);
  if (fs.existsSync(to)) {
    console.log('[cms:migrate] Skip existing', name);
    continue;
  }
  copyRecursive(from, to);
  console.log('[cms:migrate] Copied', name, '→', target);
}

console.log('[cms:migrate] Done. Set CMS_DATA_DIR=' + target + ' in .env and restart API.');
