const express = require('express');
const { getDb } = require('../../db');
const { authRequired, requireRole } = require('../../middleware/auth');
const { logActivity, pick } = require('../../db/helpers');
const { parseLangFields, sanitizeString } = require('../../middleware/validate');
const { v4: uuidv4 } = require('uuid');
const { schedulePublish, getPublishStatus } = require('../../services/content-publish');
const { persistAfterChange } = require('../../services/cms-persistence');

const router = express.Router();
const LANG_FIELDS = ['name', 'role', 'location', 'bio', 'education', 'languages', 'seo_title', 'seo_desc'];

function rowToDoctor(row) {
  if (!row) return null;
  return { ...row, is_surgeon: !!row.is_surgeon };
}

function afterDoctorWrite() {
  persistAfterChange('doctor');
  return schedulePublish(1500);
}

router.get('/', authRequired, (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM doctors ORDER BY sort_order, id').all();
  res.json({ ok: true, doctors: rows.map(rowToDoctor) });
});

router.get('/:id', authRequired, (req, res) => {
  const row = getDb().prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'Doctor not found' });
  res.json({ ok: true, doctor: rowToDoctor(row) });
});

router.post('/', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const id = sanitizeString(req.body.id, 80) || `doc-${uuidv4().slice(0, 8)}`;
  const slug = sanitizeString(req.body.slug, 120) || id;
  const fields = parseLangFields(req.body, LANG_FIELDS);

  getDb()
    .prepare(
      `INSERT INTO doctors (
        id, slug, name_hy, name_ru, name_en, role_hy, role_ru, role_en,
        department_id, location_hy, location_ru, location_en, is_surgeon, experience,
        image_url, bio_hy, bio_ru, bio_en, education_hy, education_ru, education_en,
        languages_hy, languages_ru, languages_en, sort_order, published,
        seo_title_hy, seo_title_ru, seo_title_en, seo_desc_hy, seo_desc_ru, seo_desc_en
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`
    )
    .run(
      id,
      slug,
      fields.name_hy || '',
      fields.name_ru || '',
      fields.name_en || '',
      fields.role_hy || '',
      fields.role_ru || '',
      fields.role_en || '',
      sanitizeString(req.body.department_id, 80),
      fields.location_hy || '',
      fields.location_ru || '',
      fields.location_en || '',
      req.body.is_surgeon ? 1 : 0,
      sanitizeString(req.body.experience, 40),
      sanitizeString(req.body.image_url, 500),
      fields.bio_hy || '',
      fields.bio_ru || '',
      fields.bio_en || '',
      fields.education_hy || '',
      fields.education_ru || '',
      fields.education_en || '',
      fields.languages_hy || '',
      fields.languages_ru || '',
      fields.languages_en || '',
      Number(req.body.sort_order) || 0,
      req.body.published === false ? 0 : 1,
      fields.seo_title_hy || '',
      fields.seo_title_ru || '',
      fields.seo_title_en || '',
      fields.seo_desc_hy || '',
      fields.seo_desc_ru || '',
      fields.seo_desc_en || ''
    );

  logActivity(req.user.sub, 'create', 'doctor', id, null, req.ip);
  const publish = afterDoctorWrite();
  res.status(201).json({ ok: true, id, publish: { ...getPublishStatus(), ...publish } });
});

router.put('/:id', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const existing = getDb().prepare('SELECT id FROM doctors WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, error: 'Doctor not found' });

  const fields = parseLangFields(req.body, LANG_FIELDS);
  getDb()
    .prepare(
      `UPDATE doctors SET
        slug = ?, name_hy = ?, name_ru = ?, name_en = ?, role_hy = ?, role_ru = ?, role_en = ?,
        department_id = ?, location_hy = ?, location_ru = ?, location_en = ?, is_surgeon = ?,
        experience = ?, image_url = ?, bio_hy = ?, bio_ru = ?, bio_en = ?,
        education_hy = ?, education_ru = ?, education_en = ?,
        languages_hy = ?, languages_ru = ?, languages_en = ?, sort_order = ?, published = ?,
        seo_title_hy = ?, seo_title_ru = ?, seo_title_en = ?,
        seo_desc_hy = ?, seo_desc_ru = ?, seo_desc_en = ?,
        updated_at = datetime('now')
      WHERE id = ?`
    )
    .run(
      sanitizeString(req.body.slug, 120) || req.params.id,
      fields.name_hy ?? '',
      fields.name_ru ?? '',
      fields.name_en ?? '',
      fields.role_hy ?? '',
      fields.role_ru ?? '',
      fields.role_en ?? '',
      sanitizeString(req.body.department_id, 80),
      fields.location_hy ?? '',
      fields.location_ru ?? '',
      fields.location_en ?? '',
      req.body.is_surgeon ? 1 : 0,
      sanitizeString(req.body.experience, 40),
      sanitizeString(req.body.image_url, 500),
      fields.bio_hy ?? '',
      fields.bio_ru ?? '',
      fields.bio_en ?? '',
      fields.education_hy ?? '',
      fields.education_ru ?? '',
      fields.education_en ?? '',
      fields.languages_hy ?? '',
      fields.languages_ru ?? '',
      fields.languages_en ?? '',
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

  logActivity(req.user.sub, 'update', 'doctor', req.params.id, null, req.ip);
  const publish = afterDoctorWrite();
  res.json({ ok: true, publish: { ...getPublishStatus(), ...publish } });
});

router.delete('/:id', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const r = getDb().prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ ok: false, error: 'Doctor not found' });
  logActivity(req.user.sub, 'delete', 'doctor', req.params.id, null, req.ip);
  const publish = afterDoctorWrite();
  res.json({ ok: true, publish: { ...getPublishStatus(), ...publish } });
});

module.exports = router;
