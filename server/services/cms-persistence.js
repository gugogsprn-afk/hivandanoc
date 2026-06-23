/**
 * Durable CMS storage — WAL checkpoint, JSON snapshots, file backups.
 * Keeps admin uploads, appointments, doctors, and page edits safe across deploys.
 */
const fs = require('fs');
const path = require('path');
const { getDb, DATA_DIR, DB_PATH, uploadsDir } = require('../db');

const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const SNAPSHOT_PATH = path.join(DATA_DIR, 'cms-snapshot.json');
const MAX_BACKUPS = Number(process.env.CMS_MAX_BACKUPS || 30);

function ensureDirs() {
  for (const dir of [DATA_DIR, uploadsDir(), BACKUP_DIR, path.join(DATA_DIR, 'published')]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function checkpointWal() {
  try {
    const db = getDb();
    db.pragma('wal_checkpoint(TRUNCATE)');
    return true;
  } catch (err) {
    console.warn('[cms:persist] WAL checkpoint failed:', err.message);
    return false;
  }
}

function exportAdminSnapshot() {
  const db = getDb();
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const settingsObj = {};
  for (const row of settings) {
    try {
      settingsObj[row.key] = JSON.parse(row.value);
    } catch {
      settingsObj[row.key] = row.value;
    }
  }

  return {
    exported_at: new Date().toISOString(),
    doctors: db.prepare('SELECT * FROM doctors ORDER BY sort_order, id').all(),
    services: db.prepare('SELECT * FROM services ORDER BY sort_order, id').all(),
    service_categories: db.prepare('SELECT * FROM service_categories ORDER BY sort_order, id').all(),
    media: db.prepare('SELECT * FROM media ORDER BY created_at DESC').all(),
    page_fields: db.prepare('SELECT * FROM page_fields ORDER BY page_key, field_key, lang').all(),
    page_sections: db.prepare('SELECT * FROM page_sections ORDER BY page_key, sort_order').all(),
    leads: db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all(),
    contact_messages: db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all(),
    testimonials: db.prepare('SELECT * FROM testimonials ORDER BY sort_order').all(),
    settings: settingsObj
  };
}

function writeSnapshot(snapshot) {
  ensureDirs();
  const tmp = `${SNAPSHOT_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2), 'utf8');
  fs.renameSync(tmp, SNAPSHOT_PATH);
  return SNAPSHOT_PATH;
}

function copyFileSafe(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

function pruneOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;
  const entries = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith('cms-') && name.endsWith('.json'))
    .map((name) => ({ name, mtime: fs.statSync(path.join(BACKUP_DIR, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  for (const entry of entries.slice(MAX_BACKUPS)) {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, entry.name));
    } catch {
      /* ignore */
    }
  }
}

function runBackup({ label = 'auto' } = {}) {
  ensureDirs();
  checkpointWal();

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshot = exportAdminSnapshot();
  writeSnapshot(snapshot);

  const jsonPath = path.join(BACKUP_DIR, `cms-${label}-${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2), 'utf8');

  const dbBackup = path.join(BACKUP_DIR, `cms-${label}-${stamp}.db`);
  copyFileSafe(DB_PATH, dbBackup);

  const walPath = `${DB_PATH}-wal`;
  const shmPath = `${DB_PATH}-shm`;
  copyFileSafe(walPath, `${dbBackup}-wal`);
  copyFileSafe(shmPath, `${dbBackup}-shm`);

  pruneOldBackups();

  const summary = {
    at: snapshot.exported_at,
    json: jsonPath,
    db: dbBackup,
    snapshot: SNAPSHOT_PATH,
    counts: {
      doctors: snapshot.doctors.length,
      services: snapshot.services.length,
      media: snapshot.media.length,
      page_fields: snapshot.page_fields.length,
      leads: snapshot.leads.length,
      contacts: snapshot.contact_messages.length
    }
  };
  console.log('[cms:backup]', JSON.stringify(summary.counts), '→', path.basename(jsonPath));
  return summary;
}

function persistAfterChange(reason = 'change') {
  checkpointWal();
  try {
    const snapshot = exportAdminSnapshot();
    writeSnapshot(snapshot);
  } catch (err) {
    console.warn(`[cms:persist] snapshot after ${reason}:`, err.message);
  }
}

module.exports = {
  BACKUP_DIR,
  SNAPSHOT_PATH,
  checkpointWal,
  exportAdminSnapshot,
  writeSnapshot,
  runBackup,
  persistAfterChange
};
