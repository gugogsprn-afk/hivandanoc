const express = require('express');
const { buildPublicContent } = require('../db/helpers');
const { getDb } = require('../db');
const { publicFormLimiter } = require('../middleware/rateLimit');
const { validateLead, sanitizeString, sanitizeEmail } = require('../middleware/validate');
const { notifyForm } = require('../notify');

const router = express.Router();

router.get('/content', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const content = buildPublicContent(lang);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.json({ ok: true, lang, ...content });
});

router.get('/doctors', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const content = buildPublicContent(lang);
  res.json({ ok: true, doctors: content.doctors });
});

router.get('/services', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const content = buildPublicContent(lang);
  res.json({
    ok: true,
    categories: content.serviceCategories,
    services: content.departments
  });
});

router.post('/leads/appointment', publicFormLimiter, async (req, res) => {
  const parsed = validateLead(req.body);
  if (!parsed.ok) return res.status(400).json(parsed);

  const result = getDb()
    .prepare(
      `INSERT INTO leads (
        type, name, phone, email, doctor_id, service_id, department_id,
        preferred_date, preferred_time, message, status, payload_json
      ) VALUES ('appointment', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
    )
    .run(
      parsed.data.name,
      parsed.data.phone,
      parsed.data.email,
      parsed.data.doctor_id,
      parsed.data.service_id,
      parsed.data.department_id,
      parsed.data.preferred_date,
      parsed.data.preferred_time,
      parsed.data.message,
      JSON.stringify(req.body)
    );

  try {
    await notifyForm({
      type: 'appointment',
      title: 'New appointment request',
      payload: { id: result.lastInsertRowid, ...parsed.data }
    });
  } catch (err) {
    console.error('[cms] appointment notify', err.message);
  }

  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

router.post('/leads/contact', publicFormLimiter, async (req, res) => {
  const name = sanitizeString(req.body.name, 200);
  const email = sanitizeEmail(req.body.email);
  const message = sanitizeString(req.body.message, 5000);
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email, and message required' });
  }

  const result = getDb()
    .prepare(
      `INSERT INTO contact_messages (name, email, message, status) VALUES (?, ?, ?, 'new')`
    )
    .run(name, email, message);

  getDb()
    .prepare(
      `INSERT INTO leads (type, name, phone, email, message, status, payload_json)
       VALUES ('contact', ?, '', ?, ?, 'new', ?)`
    )
    .run(name, email, message, JSON.stringify(req.body));

  try {
    await notifyForm({
      type: 'contact',
      title: 'New contact message',
      payload: { id: result.lastInsertRowid, name, email, message }
    });
  } catch (err) {
    console.error('[cms] contact notify', err.message);
  }

  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

router.get('/sitemap.xml', (_req, res) => {
  const base = process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com';
  const pages = [
    '/index.html',
    '/about.html',
    '/doctors.html',
    '/departments.html',
    '/appointment.html',
    '/contacts.html',
    '/move-better.html',
    '/privacy-policy.html',
    '/cookies-policy.html',
    '/terms.html',
    '/patient-information.html'
  ];
  const urls = pages
    .map(
      (p) =>
        `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  res.type('application/xml').send(xml);
});

module.exports = router;
