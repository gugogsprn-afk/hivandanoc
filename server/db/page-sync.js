/**
 * Sync page_fields writes into legacy CMS stores so public buildPublicContent() stays consistent.
 */
const { getDb } = require('./index');
const { getSetting, setSetting } = require('./helpers');

const EXTRA_MAP = {
  'patient-hero-image': ['patientHero', 'image'],
  'patient-hero-quote': ['patientHero', 'quote'],
  'patient-hero-cta': ['patientHero', 'ctaText'],
  'home-feature-image': ['feature', 'image'],
  'home-feature-title': ['feature', 'title'],
  'home-feature-desc': ['feature', 'description'],
  'back-in-game-image': ['backInGame', 'image'],
  'back-in-game-title': ['backInGame', 'title'],
  'back-in-game-text': ['backInGame', 'text'],
  'back-in-game-link': ['backInGame', 'linkText'],
  'expertise-image': ['expertiseOverlay', 'image'],
  'expertise-title': ['expertiseOverlay', 'title'],
  'expertise-text': ['expertiseOverlay', 'text'],
  'home-approach-image': ['approachImage'],
  'home-experts-image': ['expertsImage'],
  'home-imaging-image': ['imagingImage']
};

const PARAGRAPH_KEYS = {
  'home-intro-prose': 'introParagraphs',
  'home-approach-text': 'approachParagraphs',
  'home-experts-text': 'expertsParagraphs',
  'home-imaging-text': 'imagingParagraphs'
};

function setNested(obj, pathKeys, value) {
  let cur = obj;
  for (let i = 0; i < pathKeys.length - 1; i++) {
    const k = pathKeys[i];
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[pathKeys[pathKeys.length - 1]] = value;
}

function updatePageSectionHero(fieldKey, lang, value) {
  if (fieldKey !== 'hero-title' && fieldKey !== 'hero-subtitle') return;

  const db = getDb();
  const row = db
    .prepare('SELECT content_json FROM page_sections WHERE page_key = ? AND section_key = ?')
    .get('home', 'hero');

  let content = {};
  try {
    content = JSON.parse(row?.content_json || '{}');
  } catch {
    content = {};
  }

  const prop = fieldKey === 'hero-title' ? 'title' : 'subtitle';
  content[prop] = content[prop] || {};
  content[prop][lang] = value;

  db.prepare(
    `INSERT INTO page_sections (page_key, section_key, enabled, sort_order, content_json, updated_at)
     VALUES ('home', 'hero', 1, 0, ?, datetime('now'))
     ON CONFLICT(page_key, section_key) DO UPDATE SET
       content_json = excluded.content_json,
       updated_at = datetime('now')`
  ).run(JSON.stringify(content));
}

function syncPageFieldsToStores(pageKey, items) {
  if (!items?.length) return;

  const extra = { ...getSetting('content_extra', {}) };
  let extraChanged = false;
  let i18nChanged = false;
  const i18n = { ...getSetting('i18n_overrides', {}) };

  for (const f of items) {
    const { field_key, lang, value } = f;
    if (!field_key) continue;

    if (pageKey === 'home') {
      updatePageSectionHero(field_key, lang, value);
    }

    if (field_key.startsWith('i18n_')) {
      const key = field_key.slice(5);
      if (!i18n[lang]) i18n[lang] = {};
      i18n[lang][key] = value;
      i18nChanged = true;
      continue;
    }

    if (EXTRA_MAP[field_key]) {
      const pathKeys = EXTRA_MAP[field_key];
      if (pathKeys.length === 1) {
        extra[pathKeys[0]] = value;
      } else {
        setNested(extra, pathKeys, value);
      }
      extraChanged = true;
      continue;
    }

    if (PARAGRAPH_KEYS[field_key]) {
      extra[PARAGRAPH_KEYS[field_key]] = String(value)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      extraChanged = true;
    }
  }

  if (extraChanged) setSetting('content_extra', extra);
  if (i18nChanged) setSetting('i18n_overrides', i18n);
}

module.exports = { syncPageFieldsToStores };
