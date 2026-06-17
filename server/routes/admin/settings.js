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

router.get('/i18n-overrides', authRequired, (_req, res) => {
  res.json({ ok: true, i18n_overrides: getSetting('i18n_overrides', {}) });
});

router.put('/i18n-overrides', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const current = getSetting('i18n_overrides', {});
  const merge = req.body.merge || req.body;
  const deepMerge = (a, b) => {
    const out = { ...a };
    for (const k of Object.keys(b)) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') {
        out[k] = deepMerge(a[k], b[k]);
      } else {
        out[k] = b[k];
      }
    }
    return out;
  };
  const next = req.body.merge ? deepMerge(current, merge) : merge;
  setSetting('i18n_overrides', next);
  logActivity(req.user.sub, 'update', 'settings', 'i18n_overrides', null, req.ip);
  res.json({ ok: true, i18n_overrides: next });
});

router.get('/content-extra', authRequired, (_req, res) => {
  res.json({ ok: true, content_extra: getSetting('content_extra', {}) });
});

router.put('/content-extra', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const current = getSetting('content_extra', {});
  const merge = req.body.merge || req.body;
  const deepMerge = (a, b) => {
    const out = { ...a };
    for (const k of Object.keys(b)) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') {
        out[k] = deepMerge(a[k], b[k]);
      } else {
        out[k] = b[k];
      }
    }
    return out;
  };
  const next = req.body.merge ? deepMerge(current, merge) : merge;
  setSetting('content_extra', next);
  logActivity(req.user.sub, 'update', 'settings', 'content_extra', null, req.ip);
  res.json({ ok: true, content_extra: next });
});

router.put('/footer', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  setSetting('footer', req.body);
  logActivity(req.user.sub, 'update', 'settings', 'footer', null, req.ip);
  res.json({ ok: true });
});

module.exports = router;
