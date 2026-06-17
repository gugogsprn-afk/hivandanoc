const express = require('express');
const { getDb } = require('../../db');
const { authRequired, requireRole } = require('../../middleware/auth');
const { logActivity } = require('../../db/helpers');
const { sanitizeString } = require('../../middleware/validate');

const router = express.Router();
const VALID_STATUS = new Set(['new', 'contacted', 'booked', 'cancelled']);

router.get('/', authRequired, (req, res) => {
  const status = sanitizeString(req.query.status, 20);
  const type = sanitizeString(req.query.type, 20);
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const params = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  sql += ' ORDER BY created_at DESC LIMIT 200';
  const leads = getDb().prepare(sql).all(...params);
  res.json({ ok: true, leads });
});

router.get('/:id', authRequired, (req, res) => {
  const lead = getDb().prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ ok: false, error: 'Lead not found' });
  res.json({ ok: true, lead });
});

router.patch('/:id', authRequired, requireRole('super_admin', 'manager', 'receptionist'), (req, res) => {
  const lead = getDb().prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ ok: false, error: 'Lead not found' });

  const status = sanitizeString(req.body.status, 20);
  const adminNotes = sanitizeString(req.body.admin_notes, 5000);

  if (status && !VALID_STATUS.has(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid status' });
  }

  getDb()
    .prepare(
      `UPDATE leads SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = datetime('now')
      WHERE id = ?`
    )
    .run(status || null, adminNotes || null, req.params.id);

  logActivity(req.user.sub, 'update', 'lead', String(req.params.id), { status }, req.ip);
  res.json({ ok: true });
});

router.delete('/:id', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const r = getDb().prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ ok: false, error: 'Lead not found' });
  logActivity(req.user.sub, 'delete', 'lead', String(req.params.id), null, req.ip);
  res.json({ ok: true });
});

module.exports = router;
