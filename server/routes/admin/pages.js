const express = require('express');
const { authRequired, requireRole } = require('../../middleware/auth');
const {
  getPageFieldsForPage,
  upsertPageFields,
  logActivity
} = require('../../db/helpers');
const { syncPageFieldsToStores } = require('../../db/page-sync');
const { publishAll, getPublishStatus } = require('../../services/content-publish');
const { persistAfterChange } = require('../../services/cms-persistence');

const router = express.Router();

const PAGE_KEYS = [
  'home',
  'doctors',
  'contacts',
  'departments',
  'about',
  'services',
  'service',
  'doctor',
  'appointment',
  'reviews',
  'knowledge',
  'knowledge-article',
  'conditions',
  'condition',
  'patient-information',
  'consultation-process',
  'move-better',
  'patient-story',
  'submit-story',
  'privacy-policy',
  'cookies-policy',
  'terms'
];

function normalizeFieldItems(items) {
  return items
    .map((f) => {
      const value = f.value != null ? String(f.value) : '';
      let value_type =
        f.value_type === 'image' || f.value_type === 'video' ? f.value_type : 'text';
      if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(value)) value_type = 'video';
      else if (
        value_type === 'text' &&
        /\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(value)
      ) {
        value_type = 'image';
      }
      return {
        field_key: String(f.fieldKey || f.field_key || '').trim(),
        lang: ['hy', 'ru', 'en'].includes(f.lang) ? f.lang : 'hy',
        value,
        value_type
      };
    })
    .filter((f) => f.field_key);
}

function saveFieldsForPage(pageKey, items, req) {
  upsertPageFields(pageKey, items);
  syncPageFieldsToStores(pageKey, items);
  persistAfterChange('page-fields');
  logActivity(req.user.sub, 'update', 'page_fields', pageKey, { count: items.length }, req.ip);
  for (const row of items) {
    console.log('[cms] Saved field', pageKey, row.field_key, row.lang);
  }
}

router.get('/', authRequired, (_req, res) => {
  res.json({ ok: true, pages: PAGE_KEYS });
});

/** Multi-page bulk save */
router.patch('/bulk/fields', authRequired, requireRole('super_admin', 'manager'), async (req, res) => {
  const raw = req.body.changes || req.body.fields || [];
  console.log('[cms] bulk save received', raw.length, 'change(s)');

  const byPage = {};
  for (const c of raw) {
    const pageKey = c.pageKey || c.page_key;
    if (!PAGE_KEYS.includes(pageKey)) continue;
    if (!byPage[pageKey]) byPage[pageKey] = [];
    byPage[pageKey].push(c);
  }

  let total = 0;
  const fieldsByPage = {};
  for (const [pageKey, list] of Object.entries(byPage)) {
    const normalized = normalizeFieldItems(list);
    if (!normalized.length) continue;
    saveFieldsForPage(pageKey, normalized, req);
    total += normalized.length;
    fieldsByPage[pageKey] = getPageFieldsForPage(pageKey);
  }

  if (!total) {
    return res.status(400).json({ ok: false, error: 'No valid changes to save' });
  }

  let publish;
  try {
    publish = await publishAll();
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Publish failed after save' });
  }

  res.json({
    ok: true,
    saved: total,
    fields_by_page: fieldsByPage,
    publish
  });
});

router.get('/:pageKey', authRequired, (req, res) => {
  const pageKey = req.params.pageKey;
  if (!PAGE_KEYS.includes(pageKey)) {
    return res.status(404).json({ ok: false, error: 'Unknown page' });
  }
  res.json({ ok: true, page_key: pageKey, fields: getPageFieldsForPage(pageKey) });
});

router.patch('/:pageKey/fields/bulk', authRequired, requireRole('super_admin', 'manager'), async (req, res) => {
  const pageKey = req.params.pageKey;
  if (!PAGE_KEYS.includes(pageKey)) {
    return res.status(404).json({ ok: false, error: 'Unknown page' });
  }

  const raw = req.body.changes || req.body.fields || [];
  console.log('[cms] page bulk save received', pageKey, raw.length, 'change(s)');

  const normalized = normalizeFieldItems(raw);
  if (!normalized.length) {
    return res.status(400).json({ ok: false, error: 'No valid fields to save' });
  }

  saveFieldsForPage(pageKey, normalized, req);

  let publish;
  try {
    publish = await publishAll();
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Publish failed after save' });
  }

  res.json({
    ok: true,
    page_key: pageKey,
    fields: getPageFieldsForPage(pageKey),
    saved: normalized.length,
    publish
  });
});

router.patch('/:pageKey/fields', authRequired, requireRole('super_admin', 'manager'), async (req, res) => {
  const pageKey = req.params.pageKey;
  if (!PAGE_KEYS.includes(pageKey)) {
    return res.status(404).json({ ok: false, error: 'Unknown page' });
  }

  let items = [];
  if (Array.isArray(req.body.fields)) {
    items = req.body.fields;
  } else if (req.body.field_key || req.body.fieldKey) {
    items = [req.body];
  } else {
    return res.status(400).json({ ok: false, error: 'fields array or field_key required' });
  }

  const normalized = normalizeFieldItems(items);
  if (!normalized.length) {
    return res.status(400).json({ ok: false, error: 'No valid fields to save' });
  }

  saveFieldsForPage(pageKey, normalized, req);

  let publish;
  try {
    publish = await publishAll();
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Publish failed after save' });
  }

  res.json({
    ok: true,
    page_key: pageKey,
    fields: getPageFieldsForPage(pageKey),
    saved: normalized.length,
    publish
  });
});

module.exports = router;
