const express = require('express');
const { getDb } = require('../../db');
const { authRequired, requireRole } = require('../../middleware/auth');
const { logActivity } = require('../../db/helpers');
const { parseLangFields, sanitizeString } = require('../../middleware/validate');
const { v4: uuidv4 } = require('uuid');
const { schedulePublish, getPublishStatus } = require('../../services/content-publish');
const { persistAfterChange } = require('../../services/cms-persistence');

const router = express.Router();
const LANG_FIELDS = ['title', 'description', 'seo_title', 'seo_desc'];

function afterServiceWrite() {
  persistAfterChange('service');
  return schedulePublish(1500);
}

router.get('/categories', authRequired, (_req, res) => {
  const categories = getDb()
    .prepare('SELECT * FROM service_categories ORDER BY sort_order, id')
    .all();
  res.json({ ok: true, categories });
});

router.post('/categories', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const id = sanitizeString(req.body.id, 80) || `cat-${uuidv4().slice(0, 8)}`;
  const fields = parseLangFields(req.body, ['name']);
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO service_categories (id, name_hy, name_ru, name_en, sort_order, published)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      fields.name_hy || '',
      fields.name_ru || '',
      fields.name_en || '',
      Number(req.body.sort_order) || 0,
      req.body.published === false ? 0 : 1
    );
  logActivity(req.user.sub, 'upsert', 'service_category', id, null, req.ip);
  res.json({ ok: true, id });
});

router.get('/', authRequired, (_req, res) => {
  const services = getDb().prepare('SELECT * FROM services ORDER BY sort_order, id').all();
  res.json({ ok: true, services });
});

router.get('/:id', authRequired, (req, res) => {
  const service = getDb().prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ ok: false, error: 'Service not found' });
  res.json({ ok: true, service });
});

router.post('/', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const id = sanitizeString(req.body.id, 80) || `svc-${uuidv4().slice(0, 8)}`;
  const fields = parseLangFields(req.body, LANG_FIELDS);
  const items = Array.isArray(req.body.items) ? req.body.items : req.body.services || [];

  getDb()
    .prepare(
      `INSERT INTO services (
        id, category_id, title_hy, title_ru, title_en, description_hy, description_ru, description_en,
        icon, image_url, price, duration, doctor_id, items_json, sort_order, published,
        seo_title_hy, seo_title_ru, seo_title_en, seo_desc_hy, seo_desc_ru, seo_desc_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      sanitizeString(req.body.category_id, 80),
      fields.title_hy || '',
      fields.title_ru || '',
      fields.title_en || '',
      fields.description_hy || '',
      fields.description_ru || '',
      fields.description_en || '',
      sanitizeString(req.body.icon, 20),
      sanitizeString(req.body.image_url, 500),
      sanitizeString(req.body.price, 40),
      sanitizeString(req.body.duration, 40),
      sanitizeString(req.body.doctor_id, 80),
      JSON.stringify(items),
      Number(req.body.sort_order) || 0,
      req.body.published === false ? 0 : 1,
      fields.seo_title_hy || '',
      fields.seo_title_ru || '',
      fields.seo_title_en || '',
      fields.seo_desc_hy || '',
      fields.seo_desc_ru || '',
      fields.seo_desc_en || ''
    );

  logActivity(req.user.sub, 'create', 'service', id, null, req.ip);
  const publish = afterServiceWrite();
  res.status(201).json({ ok: true, id, publish: { ...getPublishStatus(), ...publish } });
});

router.put('/:id', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const existing = getDb().prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, error: 'Service not found' });

  const fields = parseLangFields(req.body, LANG_FIELDS);
  const items = Array.isArray(req.body.items) ? req.body.items : req.body.services;

  getDb()
    .prepare(
      `UPDATE services SET
        category_id = ?, title_hy = ?, title_ru = ?, title_en = ?,
        description_hy = ?, description_ru = ?, description_en = ?,
        icon = ?, image_url = ?, price = ?, duration = ?, doctor_id = ?,
        items_json = COALESCE(?, items_json), sort_order = ?, published = ?,
        seo_title_hy = ?, seo_title_ru = ?, seo_title_en = ?,
        seo_desc_hy = ?, seo_desc_ru = ?, seo_desc_en = ?,
        updated_at = datetime('now')
      WHERE id = ?`
    )
    .run(
      sanitizeString(req.body.category_id, 80),
      fields.title_hy ?? '',
      fields.title_ru ?? '',
      fields.title_en ?? '',
      fields.description_hy ?? '',
      fields.description_ru ?? '',
      fields.description_en ?? '',
      sanitizeString(req.body.icon, 20),
      sanitizeString(req.body.image_url, 500),
      sanitizeString(req.body.price, 40),
      sanitizeString(req.body.duration, 40),
      sanitizeString(req.body.doctor_id, 80),
      items ? JSON.stringify(items) : null,
      Number(req.body.sort_order) || 0,
      req.body.published === false ? 0 : 1,
      fields.seo_title_hy ?? '',
      fields.seo_title_ru ?? '',
      fields.seo_title_en ?? '',
      fields.seo_desc_hy ?? '',
      fields.seo_desc_ru ?? '',
      fields.seo_desc_en ?? '',
      req.params.id
    );

  logActivity(req.user.sub, 'update', 'service', req.params.id, null, req.ip);
  const publish = afterServiceWrite();
  res.json({ ok: true, publish: { ...getPublishStatus(), ...publish } });
});

router.delete('/:id', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const r = getDb().prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ ok: false, error: 'Service not found' });
  logActivity(req.user.sub, 'delete', 'service', req.params.id, null, req.ip);
  const publish = afterServiceWrite();
  res.json({ ok: true, publish: { ...getPublishStatus(), ...publish } });
});

module.exports = router;
