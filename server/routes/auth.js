const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { signToken, authRequired } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const { logActivity } = require('../db/helpers');
const { sanitizeEmail, sanitizeString } = require('../middleware/validate');

const router = express.Router();

router.post('/login', loginLimiter, (req, res) => {
  const email = sanitizeEmail(req.body.email);
  const password = sanitizeString(req.body.password, 200);
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password required' });
  }

  const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  getDb().prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
  logActivity(user.id, 'login', 'user', String(user.id), null, req.ip);

  const token = signToken(user);
  res.json({
    ok: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

router.get('/me', authRequired, (req, res) => {
  const user = getDb().prepare('SELECT id, email, name, role, last_login FROM users WHERE id = ?').get(req.user.sub);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, user });
});

module.exports = router;
