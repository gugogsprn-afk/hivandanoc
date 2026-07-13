/**
 * When CMS saves from Armenian: copy media to all langs; translate text to RU/EN.
 */
const { inferPageFieldValueType, isSharedMediaFieldValue } = require('../db/helpers');
const { translateFromArmenian } = require('./translate');

const LANGS = ['hy', 'ru', 'en'];

const SKIP_TRANSLATE_KEYS = new Set([
  'phone',
  'email',
  'logo',
  'emergency',
  'mapsQuery',
  'mapsEmbed',
  'mapPlaceId'
]);

function isMediaField(field_key, value, value_type) {
  const type = inferPageFieldValueType(value, value_type);
  if (type === 'image' || type === 'video') return true;
  return isSharedMediaFieldValue(value, value_type);
}

function shouldTranslateField(field_key, value, value_type) {
  if (!value || !String(value).trim()) return false;
  if (field_key.startsWith('i18n_')) return true;
  if (isMediaField(field_key, value, value_type)) return false;
  if (SKIP_TRANSLATE_KEYS.has(field_key)) return false;
  if (/^https?:\/\//i.test(String(value).trim())) return false;
  if (/^[\d\s+().-]+$/.test(String(value).trim())) return false;
  return value_type === 'text' || !value_type;
}

function itemKey(page_key, field_key, lang) {
  return `${page_key}\0${field_key}\0${lang}`;
}

async function expandPageFieldItems(items) {
  const out = [];
  const seen = new Set();
  const translationCache = new Map();

  for (const raw of items) {
    const page_key = raw.page_key || raw.pageKey || 'home';
    const field_key = String(raw.field_key || raw.fieldKey || '').trim();
    const lang = LANGS.includes(raw.lang) ? raw.lang : 'hy';
    const value = raw.value != null ? String(raw.value) : '';
    const value_type = inferPageFieldValueType(value, raw.value_type || raw.valueType || 'text');

    if (!field_key) continue;

    if (isMediaField(field_key, value, value_type)) {
      for (const lng of LANGS) {
        const k = itemKey(page_key, field_key, lng);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ page_key, field_key, lang: lng, value, value_type });
      }
      continue;
    }

    if (lang === 'hy' && shouldTranslateField(field_key, value, value_type)) {
      let triplet = translationCache.get(value);
      if (!triplet) {
        triplet = await translateFromArmenian(value);
        translationCache.set(value, triplet);
      }
      for (const lng of LANGS) {
        const k = itemKey(page_key, field_key, lng);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({
          page_key,
          field_key,
          lang: lng,
          value: triplet[lng] || value,
          value_type: 'text'
        });
      }
      continue;
    }

    const k = itemKey(page_key, field_key, lang);
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ page_key, field_key, lang, value, value_type });
    }
  }

  return out;
}

async function expandI18nMerge(merge) {
  if (!merge?.hy || typeof merge.hy !== 'object') return merge;
  const next = { ...merge, hy: { ...merge.hy } };
  next.ru = { ...(merge.ru || {}) };
  next.en = { ...(merge.en || {}) };

  for (const [key, val] of Object.entries(merge.hy)) {
    if (!val || !String(val).trim()) continue;
    const triplet = await translateFromArmenian(val);
    next.hy[key] = triplet.hy;
    next.ru[key] = triplet.ru;
    next.en[key] = triplet.en;
  }
  return next;
}

async function expandHospitalPatch(hospital) {
  if (!hospital || typeof hospital !== 'object') return hospital;
  const next = { ...hospital };
  const tripletFields = ['name', 'shortName', 'tagline', 'address', 'hours', 'about', 'mission', 'heroTagline'];

  for (const field of tripletFields) {
    const patch = hospital[field];
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) continue;
    if (!patch.hy || !String(patch.hy).trim()) continue;
    const triplet = await translateFromArmenian(patch.hy);
    next[field] = {
      ...(typeof patch === 'object' ? patch : {}),
      hy: triplet.hy,
      ru: triplet.ru,
      en: triplet.en
    };
    if (field === 'name') {
      next.shortName = {
        ...(next.shortName || {}),
        hy: triplet.hy,
        ru: triplet.ru,
        en: triplet.en
      };
    }
  }
  return next;
}

module.exports = {
  expandPageFieldItems,
  expandI18nMerge,
  expandHospitalPatch,
  LANGS
};
