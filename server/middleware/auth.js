const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-change-me-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '30d';

const ROLES = {
  super_admin: 3,
  manager: 2,
  receptionist: 1
};

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Insufficient permissions' });
    }
    next();
  };
}

function canManageContent(role) {
  return (ROLES[role] || 0) >= ROLES.manager;
}

function canManageLeads(role) {
  return (ROLES[role] || 0) >= ROLES.receptionist;
}

module.exports = {
  JWT_SECRET,
  signToken,
  authRequired,
  requireRole,
  canManageContent,
  canManageLeads,
  ROLES
};
