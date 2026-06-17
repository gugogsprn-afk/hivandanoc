require('dotenv').config();
const path = require('path');
const express = require('express');
const { notifyForm, isEmailConfigured, isTelegramConfigured } = require('./notify');
const { createCmsApp, isAllowedOrigin } = require('./cms');

const root = path.join(__dirname, '..');
const app = createCmsApp();
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || (process.env.RENDER || process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    cms: true,
    email: isEmailConfigured(),
    telegram: isTelegramConfigured()
  });
});

async function handleLegacyForm(req, res, type, title) {
  try {
    const payload = { type, ...req.body, ip: req.ip };
    const result = await notifyForm({ type, title, payload });

    if (!result.configured) {
      return res.status(503).json({
        ok: false,
        error: 'Notifications not configured. Create .env from .env.example'
      });
    }

    const sent = result.results.email?.ok || result.results.telegram?.ok;
    if (!sent) {
      return res.status(502).json({
        ok: false,
        error: 'Failed to send notification',
        details: result.results
      });
    }

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error(`[api/${type}]`, err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

app.post('/api/appointment', (req, res) =>
  handleLegacyForm(req, res, 'appointment', 'Новая запись на приём')
);
app.post('/api/contact', (req, res) =>
  handleLegacyForm(req, res, 'contact', 'Новое сообщение с сайта')
);
app.post('/api/story', (req, res) =>
  handleLegacyForm(req, res, 'story', 'Новая история пациента')
);

app.use(express.static(root, { index: 'index.html' }));

app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('  Healthy Spine — site + CMS API');
  console.log('  http://127.0.0.1:' + PORT + '/index.html');
  console.log('  Admin CMS: http://127.0.0.1:' + PORT + '/admin-cms/');
  console.log('  API:       http://127.0.0.1:' + PORT + '/api/v1/public/content');
  console.log('  Почта:', isEmailConfigured() ? 'включена' : 'НЕ настроена (.env)');
  console.log('  Telegram:', isTelegramConfigured() ? 'включён' : 'НЕ настроен (.env)');
  console.log('');
});
