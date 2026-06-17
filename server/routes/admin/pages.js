const express = require('express');
const { authRequired, requireRole } = require('../../middleware/auth');
const {
  getPageFieldsMap,
  getPageFieldsForPage,
  upsertPageFields,
  logActivity
} = require('../../db/helpers');

const router = express.Router();

const PAGE_KEYS = ['home', 'doctors', 'contacts', 'departments', 'about'];

router.get('/', authRequired, (_req, res) => {
  res.json({ ok: true, pages: PAGE_KEYS });
});

router.get('/:pageKey', authRequired, (req, res) => {
  const pageKey = req.params.pageKey;
  if (!PAGE_KEYS.includes(pageKey)) {
    return res.status(404).json({ ok: false, error: 'Unknown page' });
  }
  res.json({ ok: true, page_key: pageKey, fields: getPageFieldsForPage(pageKey) });
});

router.patch('/:pageKey/fields', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const pageKey = req.params.pageKey;
  if (!PAGE_KEYS.includes(pageKey)) {
    return res.status(404).json({ ok: false, error: 'Unknown page' });
  }

  let items = [];
  if (Array.isArray(req.body.fields)) {
    items = req.body.fields;
  } else if (req.body.field_key) {
    items = [req.body];
  } else {
    return res.status(400).json({ ok: false, error: 'fields array or field_key required' });
  }

  const normalized = items.map((f) => ({
    field_key: String(f.field_key || '').trim(),
    lang: ['hy', 'ru', 'en'].includes(f.lang) ? f.lang : 'hy',
    value: f.value != null ? String(f.value) : '',
    value_type: f.value_type === 'image' || f.value_type === 'video' ? f.value_type : 'text'
  })).filter((f) => f.field_key);

  if (!normalized.length) {
    return res.status(400).json({ ok: false, error: 'No valid fields to save' });
  }

  upsertPageFields(pageKey, normalized);
  logActivity(req.user.sub, 'update', 'page_fields', pageKey, { count: normalized.length }, req.ip);

  res.json({
    ok: true,
    page_key: pageKey,
    fields: getPageFieldsForPage(pageKey),
    saved: normalized.length
  });
});

module.exports = router;
