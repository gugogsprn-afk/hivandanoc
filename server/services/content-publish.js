/**
 * CMS publish pipeline — admin saves → SQLite → published JSON on disk → public API.
 * Runs automatically within a few seconds after each change (well under 1–2 min).
 */
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../db');
const { buildPublicContent, getSetting, setSetting } = require('../db/helpers');

const PUBLISH_DIR = path.join(DATA_DIR, 'published');
const LANGS = ['hy', 'ru', 'en'];

let publishTimer = null;
let publishing = false;

function getPublishStatus() {
  return getSetting('publish_status', {
    version: 0,
    published_at: null,
    pending: false
  });
}

function readPublishedContent(lang) {
  const code = LANGS.includes(lang) ? lang : 'hy';
  const file = path.join(PUBLISH_DIR, `content-${code}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function publishAll() {
  if (publishing) return getPublishStatus();
  publishing = true;

  try {
    if (!fs.existsSync(PUBLISH_DIR)) {
      fs.mkdirSync(PUBLISH_DIR, { recursive: true });
    }

    const version = Date.now();
    const published_at = new Date().toISOString();
    const manifest = { version, published_at, langs: {} };

    for (const lang of LANGS) {
      const content = buildPublicContent(lang);
      const payload = { ok: true, lang, version, published_at, ...content };
      const filename = `content-${lang}.json`;
      const filePath = path.join(PUBLISH_DIR, filename);
      const tmpPath = `${filePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload), 'utf8');
      fs.renameSync(tmpPath, filePath);
      manifest.langs[lang] = filename;
    }

    const manifestPath = path.join(PUBLISH_DIR, 'manifest.json');
    const manifestTmp = `${manifestPath}.tmp`;
    fs.writeFileSync(manifestTmp, JSON.stringify(manifest, null, 2), 'utf8');
    fs.renameSync(manifestTmp, manifestPath);

    const status = { version, published_at, pending: false };
    setSetting('publish_status', status);

    const { persistAfterChange, checkpointWal } = require('./cms-persistence');
    checkpointWal();
    persistAfterChange('publish');

    console.log(`[cms:publish] live version ${version}`);
    return status;
  } catch (err) {
    console.error('[cms:publish] failed:', err.message);
    const status = { ...getPublishStatus(), pending: false, error: err.message };
    setSetting('publish_status', status);
    throw err;
  } finally {
    publishing = false;
  }
}

function schedulePublish(delayMs = 2500) {
  const current = getPublishStatus();
  setSetting('publish_status', { ...current, pending: true });

  if (publishTimer) clearTimeout(publishTimer);
  publishTimer = setTimeout(() => {
    publishTimer = null;
    publishAll().catch((err) => console.error('[cms:publish]', err.message));
  }, delayMs);

  return { scheduled: true, pending: true, delay_ms: delayMs };
}

module.exports = {
  publishAll,
  schedulePublish,
  getPublishStatus,
  readPublishedContent,
  PUBLISH_DIR
};
