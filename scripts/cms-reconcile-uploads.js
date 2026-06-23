#!/usr/bin/env node
/**
 * Re-register uploaded files that exist on disk but are missing from the media table.
 * Restores orphaned videos/images after DB issues.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDb, getDb, uploadsDir } = require('../server/db');
const { mediaPublicUrl } = require('../server/middleware/upload');
const { persistAfterChange } = require('../server/services/cms-persistence');
const { schedulePublish } = require('../server/services/content-publish');

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function inferMime(filename) {
  return MIME[path.extname(filename).toLowerCase()] || 'application/octet-stream';
}

function run() {
  initDb();
  const db = getDb();
  const dir = uploadsDir();
  if (!fs.existsSync(dir)) {
    console.log('[cms:reconcile] No uploads directory');
    return;
  }

  const known = new Set(
    db.prepare('SELECT filename FROM media').all().map((r) => r.filename)
  );
  const insert = db.prepare(
    `INSERT INTO media (filename, original_name, mime_type, size, url, folder, created_by)
     VALUES (?, ?, ?, ?, ?, ?, NULL)`
  );

  let added = 0;
  for (const name of fs.readdirSync(dir)) {
    if (known.has(name)) continue;
    const full = path.join(dir, name);
    if (!fs.statSync(full).isFile()) continue;
    const mime = inferMime(name);
    if (!mime.startsWith('image/') && !mime.startsWith('video/')) continue;
    const url = mediaPublicUrl(name);
    insert.run(name, name, mime, fs.statSync(full).size, url, 'recovered');
    added += 1;
    console.log('[cms:reconcile] Registered', name);
  }

  persistAfterChange('reconcile');
  if (added) schedulePublish(500);
  console.log(`[cms:reconcile] Added ${added} file(s) to media library`);
}

run();
