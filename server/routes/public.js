const express = require('express');
const { buildPublicContent } = require('../db/helpers');
const { buildServiceCatalog } = require('../services/service-catalog');
const { getDb } = require('../db');
const { getPublishStatus, readPublishedContent } = require('../services/content-publish');
const { publicFormLimiter } = require('../middleware/rateLimit');
const { validateLead, sanitizeString, sanitizeEmail } = require('../middleware/validate');
const { notifyForm } = require('../notify');
const { buildSitemapXml } = require('../services/sitemap');

const router = express.Router();

const { buildMapEmbedUrl, clinicCoords } = require('../services/clinic-map');

router.get('/maps-config', (_req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || '';
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({ ok: true, googleMapsApiKey: key, hasGoogleMapsKey: !!key });
});

router.get('/map-embed', (req, res) => {
  const lat = Number.parseFloat(req.query.lat);
  const lng = Number.parseFloat(req.query.lng);
  const zoom = Number.parseInt(req.query.zoom, 10);
  const hospital = {
    mapLat: Number.isFinite(lat) ? lat : undefined,
    mapLng: Number.isFinite(lng) ? lng : undefined,
    mapZoom: Number.isFinite(zoom) ? zoom : undefined
  };
  const key = process.env.GOOGLE_MAPS_API_KEY || '';
  const embedUrl = buildMapEmbedUrl(hospital, key);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({
    ok: true,
    embedUrl,
    hasGoogleMapsKey: !!key,
    coords: clinicCoords(hospital)
  });
});

router.get('/version', (_req, res) => {
  const status = getPublishStatus();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({
    ok: true,
    version: status.version || 0,
    published_at: status.published_at,
    pending: !!status.pending
  });
});

router.get('/content', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const status = getPublishStatus();
  const content = buildPublicContent(lang);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-CMS-Version', String(status.version || 0));
  res.json({ ok: true, lang, version: status.version || 0, published_at: status.published_at, ...content });
});

router.get('/content-snapshot', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const snapshot = readPublishedContent(lang);
  if (!snapshot) {
    const content = buildPublicContent(lang);
    const status = getPublishStatus();
    return res.json({ ok: true, lang, version: status.version || 0, ...content });
  }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('X-CMS-Version', String(snapshot.version || 0));
  res.json(snapshot);
});

router.get('/doctors', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const content = buildPublicContent(lang);
  res.json({ ok: true, doctors: content.doctors });
});

router.get('/services', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const content = buildPublicContent(lang);
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const catalog = buildServiceCatalog(content, category || null);
  res.json({
    ok: true,
    lang,
    category: category || null,
    categories: catalog.categories,
    services: catalog.services,
    groups: catalog.groups,
    total: catalog.total
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

router.post('/leads/review', publicFormLimiter, async (req, res) => {
  const rating = Math.min(5, Math.max(1, parseInt(req.body.rating, 10) || 0));
  const firstName = sanitizeString(req.body.firstName, 100);
  const lastName = sanitizeString(req.body.lastName, 100);
  const name =
    [firstName, lastName].filter(Boolean).join(' ').trim() || sanitizeString(req.body.name, 200);
  const text = sanitizeString(req.body.text || req.body.comment || req.body.description, 5000);
  const email = sanitizeEmail(req.body.email) || '';
  const lang = ['hy', 'ru', 'en'].includes(req.body.lang) ? req.body.lang : 'hy';

  if (!rating || !name || !text) {
    return res.status(400).json({ ok: false, error: 'Rating, name, and review text required' });
  }

  const db = getDb();
  const testimonial = db
    .prepare(
      `INSERT INTO testimonials (
        name_hy, name_ru, name_en, text_hy, text_ru, text_en, rating, published, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 9999)`
    )
    .run(
      lang === 'hy' ? name : '',
      lang === 'ru' ? name : '',
      lang === 'en' ? name : '',
      lang === 'hy' ? text : '',
      lang === 'ru' ? text : '',
      lang === 'en' ? text : '',
      rating
    );

  db.prepare(
    `INSERT INTO leads (type, name, email, message, status, payload_json)
     VALUES ('review', ?, ?, ?, 'new', ?)`
  ).run(name, email, `★${rating} ${text}`, JSON.stringify({ ...req.body, rating, testimonial_id: testimonial.lastInsertRowid }));

  try {
    await notifyForm({
      type: 'review',
      title: 'Новый отзыв с сайта',
      payload: { name, rating, text, email, lang }
    });
  } catch (err) {
    console.error('[cms] review notify', err.message);
  }

  res.status(201).json({ ok: true, id: testimonial.lastInsertRowid });
});

router.get('/reviews', (req, res) => {
  const lang = ['hy', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'hy';
  const nameCol = lang === 'ru' ? 'name_ru' : lang === 'en' ? 'name_en' : 'name_hy';
  const textCol = lang === 'ru' ? 'text_ru' : lang === 'en' ? 'text_en' : 'text_hy';
  const rows = getDb()
    .prepare(
      `SELECT id, rating, created_at,
        COALESCE(NULLIF(${nameCol}, ''), NULLIF(name_hy, ''), name_ru, name_en, '') AS name,
        COALESCE(NULLIF(${textCol}, ''), NULLIF(text_hy, ''), text_ru, text_en, '') AS text
       FROM testimonials
       WHERE published = 1
         AND (
           COALESCE(NULLIF(${textCol}, ''), NULLIF(text_hy, ''), text_ru, text_en, '') != ''
         )
       ORDER BY datetime(created_at) DESC, id DESC`
    )
    .all();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({ ok: true, lang, reviews: rows });
});

router.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(buildSitemapXml());
});

router.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /

Disallow: /admin-cms/
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/private/

Sitemap: https://healthyspinedoc.com/sitemap.xml
`);
});

module.exports = router;
