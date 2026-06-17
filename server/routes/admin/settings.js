const express = require('express');
const { authRequired, requireRole } = require('../../middleware/auth');
const { getSetting, setSetting, logActivity } = require('../../db/helpers');

const router = express.Router();

router.get('/', authRequired, (_req, res) => {
  res.json({
    ok: true,
    global: getSetting('global', {}),
    seo: getSetting('seo', {}),
    nav: getSetting('nav', {}),
    footer: getSetting('footer', {})
  });
});

router.put('/global', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  setSetting('global', req.body);
  logActivity(req.user.sub, 'update', 'settings', 'global', null, req.ip);
  res.json({ ok: true });
});

router.put('/seo', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  setSetting('seo', req.body);
  logActivity(req.user.sub, 'update', 'settings', 'seo', null, req.ip);
  res.json({ ok: true });
});

router.put('/nav', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  setSetting('nav', req.body);
  logActivity(req.user.sub, 'update', 'settings', 'nav', null, req.ip);
  res.json({ ok: true });
});

router.put('/footer', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  setSetting('footer', req.body);
  logActivity(req.user.sub, 'update', 'settings', 'footer', null, req.ip);
  res.json({ ok: true });
});

module.exports = router;
