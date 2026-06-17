const express = require('express');
const { getDb } = require('../../db');
const { authRequired, requireRole } = require('../../middleware/auth');
const { logActivity } = require('../../db/helpers');
const { sanitizeString } = require('../../middleware/validate');

const router = express.Router();

router.get('/contacts', authRequired, (_req, res) => {
  const messages = getDb()
    .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200')
    .all();
  res.json({ ok: true, messages });
});

router.patch('/contacts/:id', authRequired, requireRole('super_admin', 'manager', 'receptionist'), (req, res) => {
  const row = getDb().prepare('SELECT id FROM contact_messages WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'Message not found' });

  getDb()
    .prepare(
      `UPDATE contact_messages SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = datetime('now')
      WHERE id = ?`
    )
    .run(
      sanitizeString(req.body.status, 20) || null,
      sanitizeString(req.body.admin_notes, 5000) || null,
      req.params.id
    );

  res.json({ ok: true });
});

module.exports = router;
