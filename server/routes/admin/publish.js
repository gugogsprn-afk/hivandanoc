const express = require('express');
const { authRequired, requireRole } = require('../../middleware/auth');
const { logActivity } = require('../../db/helpers');
const { publishAll, schedulePublish, getPublishStatus } = require('../../services/content-publish');

const router = express.Router();

router.get('/status', authRequired, (_req, res) => {
  const status = getPublishStatus();
  res.json({ ok: true, publish: status });
});

router.post('/', authRequired, requireRole('super_admin', 'manager'), async (req, res) => {
  try {
    const status = await publishAll();
    logActivity(req.user.sub, 'publish', 'site_content', String(status.version), null, req.ip);
    res.json({ ok: true, publish: status });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Publish failed' });
  }
});

router.post('/schedule', authRequired, requireRole('super_admin', 'manager'), (_req, res) => {
  const scheduled = schedulePublish(0);
  res.json({ ok: true, publish: { ...getPublishStatus(), ...scheduled } });
});

module.exports = router;
