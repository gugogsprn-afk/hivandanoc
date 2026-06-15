require('dotenv').config();
const path = require('path');
const express = require('express');
const { notifyForm, isEmailConfigured, isTelegramConfigured } = require('./notify');

const root = path.join(__dirname, '..');
const app = express();
const PORT = Number(process.env.PORT || 8765);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    email: isEmailConfigured(),
    telegram: isTelegramConfigured()
  });
});

async function handleForm(req, res, type, title) {
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
  handleForm(req, res, 'appointment', 'Новая запись на приём')
);
app.post('/api/contact', (req, res) =>
  handleForm(req, res, 'contact', 'Новое сообщение с сайта')
);
app.post('/api/story', (req, res) =>
  handleForm(req, res, 'story', 'Новая история пациента')
);

app.use(express.static(root, { index: 'index.html' }));

app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  Healthy Spine — сайт + уведомления');
  console.log('  http://127.0.0.1:' + PORT + '/index.html');
  console.log('  Почта:', isEmailConfigured() ? 'включена' : 'НЕ настроена (.env)');
  console.log('  Telegram:', isTelegramConfigured() ? 'включён' : 'НЕ настроен (.env)');
  console.log('');
  console.log('  Ctrl+C — остановить');
  console.log('');
});
