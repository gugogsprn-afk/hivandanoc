#!/usr/bin/env node
/**
 * Re-attach the newest uploaded MP4 to the homepage patient hero (all languages).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDb, uploadsDir } = require('../server/db');
const { upsertPageFields } = require('../server/db/helpers');
const { mediaPublicUrl } = require('../server/middleware/upload');
const { persistAfterChange } = require('../server/services/cms-persistence');
const { schedulePublish } = require('../server/services/content-publish');

function latestMp4() {
  const dir = uploadsDir();
  if (!fs.existsSync(dir)) return null;
  return fs
    .readdirSync(dir)
    .filter((n) => /\.mp4$/i.test(n))
    .map((n) => ({ n, m: fs.statSync(path.join(dir, n)).mtimeMs }))
    .sort((a, b) => b.m - a.m)[0]?.n || null;
}

function run() {
  initDb();
  const db = require('../server/db').getDb();
  const existing = db
    .prepare("SELECT COUNT(*) AS c FROM page_fields WHERE field_key = 'patient-hero-image' AND value != ''")
    .get().c;
  if (existing > 0 && !process.argv.includes('--force')) {
    console.log('[cms:hero-video] Patient hero already set — skip (use --force to override)');
    return;
  }

  const file = process.argv.find((a) => a.endsWith('.mp4')) || latestMp4();
  if (!file) {
    console.error('[cms:hero-video] No MP4 found in uploads');
    process.exit(1);
  }
  const url = mediaPublicUrl(file);
  const items = ['hy', 'ru', 'en'].map((lang) => ({
    field_key: 'patient-hero-image',
    lang,
    value: url,
    value_type: 'video'
  }));
  upsertPageFields('home', items);
  persistAfterChange('hero-video');
  schedulePublish(500);
  console.log('[cms:hero-video] Set patient hero video to', url);
}

run();
