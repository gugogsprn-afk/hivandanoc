#!/usr/bin/env node
/**
 * Restore page_fields + media rows from cms-snapshot.json or latest backup.
 * Use when DB lost references but files still exist on disk.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDb, getDb, DATA_DIR } = require('../server/db');
const { SNAPSHOT_PATH, BACKUP_DIR } = require('../server/services/cms-persistence');
const { schedulePublish } = require('../server/services/content-publish');

function findSnapshotFile() {
  if (fs.existsSync(SNAPSHOT_PATH)) return SNAPSHOT_PATH;
  if (!fs.existsSync(BACKUP_DIR)) return null;
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((n) => n.startsWith('cms-') && n.endsWith('.json'))
    .map((n) => ({ n, m: fs.statSync(path.join(BACKUP_DIR, n)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  return files.length ? path.join(BACKUP_DIR, files[0].n) : null;
}

function run() {
  initDb();
  const file = process.argv[2] || findSnapshotFile();
  if (!file || !fs.existsSync(file)) {
    console.error('[cms:restore] No snapshot found at', SNAPSHOT_PATH);
    process.exit(1);
  }

  const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  const db = getDb();

  const mediaCount = db.prepare('SELECT COUNT(*) AS c FROM media').get().c;
  if (mediaCount === 0 && snapshot.media?.length) {
    const ins = db.prepare(
      `INSERT OR IGNORE INTO media (id, filename, original_name, mime_type, size, url, folder, alt_hy, alt_ru, alt_en, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const m of snapshot.media) {
      ins.run(
        m.id,
        m.filename,
        m.original_name,
        m.mime_type,
        m.size,
        m.url,
        m.folder,
        m.alt_hy,
        m.alt_ru,
        m.alt_en,
        m.created_by,
        m.created_at
      );
    }
    console.log('[cms:restore] Restored', snapshot.media.length, 'media row(s)');
  }

  const pfCount = db.prepare('SELECT COUNT(*) AS c FROM page_fields').get().c;
  if (pfCount === 0 && snapshot.page_fields?.length) {
    const ins = db.prepare(
      `INSERT OR REPLACE INTO page_fields (page_key, field_key, lang, value, value_type, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const f of snapshot.page_fields) {
      ins.run(f.page_key, f.field_key, f.lang, f.value, f.value_type || 'text', f.updated_at);
    }
    console.log('[cms:restore] Restored', snapshot.page_fields.length, 'page field(s)');
  }

  schedulePublish(500);
  console.log('[cms:restore] Done from', file);
}

run();
