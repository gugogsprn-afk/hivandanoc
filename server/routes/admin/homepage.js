const express = require('express');
const { getDb } = require('../../db');
const { authRequired, requireRole } = require('../../middleware/auth');
const { logActivity } = require('../../db/helpers');

const router = express.Router();

router.get('/', authRequired, (req, res) => {
  const pageKey = req.query.page || 'home';
  const sections = getDb()
    .prepare('SELECT * FROM page_sections WHERE page_key = ? ORDER BY sort_order')
    .all(pageKey)
    .map((s) => ({
      ...s,
      content: JSON.parse(s.content_json || '{}')
    }));
  res.json({ ok: true, sections });
});

router.put('/reorder', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const { page_key: pageKey = 'home', order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ ok: false, error: 'order array required' });
  }
  const stmt = getDb().prepare(
    'UPDATE page_sections SET sort_order = ?, updated_at = datetime(\'now\') WHERE page_key = ? AND section_key = ?'
  );
  order.forEach((sectionKey, index) => {
    stmt.run(index, pageKey, sectionKey);
  });
  logActivity(req.user.sub, 'reorder', 'page_sections', pageKey, { order }, req.ip);
  res.json({ ok: true });
});

router.put('/:sectionKey', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const pageKey = req.body.page_key || 'home';
  const sectionKey = req.params.sectionKey;
  const enabled = req.body.enabled === false ? 0 : 1;
  const content = req.body.content || {};
  const sortOrder = Number(req.body.sort_order) || 0;

  getDb()
    .prepare(
      `INSERT INTO page_sections (page_key, section_key, enabled, sort_order, content_json, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(page_key, section_key) DO UPDATE SET
         enabled = excluded.enabled,
         sort_order = excluded.sort_order,
         content_json = excluded.content_json,
         updated_at = datetime('now')`
    )
    .run(pageKey, sectionKey, enabled, sortOrder, JSON.stringify(content));

  logActivity(req.user.sub, 'update', 'page_section', `${pageKey}/${sectionKey}`, null, req.ip);
  res.json({ ok: true });
});

module.exports = router;
