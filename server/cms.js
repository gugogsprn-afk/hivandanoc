const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const { initDb } = require('./db');
const { seed, ensureStaffUsers } = require('./db/seed');
const { apiLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const dashboardRoutes = require('./routes/admin/dashboard');
const doctorsRoutes = require('./routes/admin/doctors');
const servicesRoutes = require('./routes/admin/services');
const mediaRoutes = require('./routes/admin/media');
const leadsRoutes = require('./routes/admin/leads');
const contactsRoutes = require('./routes/admin/contacts');
const homepageRoutes = require('./routes/admin/homepage');
const settingsRoutes = require('./routes/admin/settings');

function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname === '173.212.240.38') return true;
    if (hostname === 'healthyspinedoc.com' || hostname === 'www.healthyspinedoc.com') return true;
    if (hostname === 'admin.healthyspinedoc.com') return true;
    if (hostname === 'api.healthyspinedoc.com') return true;
    if (hostname.endsWith('.github.io')) return true;
    return false;
  } catch {
    return false;
  }
}

function createCmsApp() {
  initDb();
  if (process.env.CMS_AUTO_SEED !== 'false') {
    try {
      seed();
    } catch (err) {
      console.error('[cms] seed error:', err.message);
    }
  } else {
    try {
      ensureStaffUsers();
    } catch (err) {
      console.error('[cms] staff users error:', err.message);
    }
  }

  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false
    })
  );

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use('/api/v1', apiLimiter);

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/public', publicRoutes);
  app.use('/api/v1/admin/dashboard', dashboardRoutes);
  app.use('/api/v1/admin/doctors', doctorsRoutes);
  app.use('/api/v1/admin/services', servicesRoutes);
  app.use('/api/v1/admin/media', mediaRoutes);
  app.use('/api/v1/admin/leads', leadsRoutes);
  app.use('/api/v1/admin/contacts', contactsRoutes);
  app.use('/api/v1/admin/homepage', homepageRoutes);
  app.use('/api/v1/admin/settings', settingsRoutes);
  app.use('/api/v1/media/files', mediaRoutes.mediaFilesRouter());

  const adminCmsPath = path.join(__dirname, '../admin-cms');
  if (fs.existsSync(adminCmsPath)) {
    app.use('/admin-cms', express.static(adminCmsPath, { index: 'index.html' }));
  }

  return app;
}

module.exports = { createCmsApp, isAllowedOrigin };
