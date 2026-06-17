const express = require('express');
const { dashboardStats } = require('../../db/helpers');
const { authRequired } = require('../../middleware/auth');

const router = express.Router();

router.get('/stats', authRequired, (_req, res) => {
  res.json({ ok: true, ...dashboardStats() });
});

module.exports = router;
