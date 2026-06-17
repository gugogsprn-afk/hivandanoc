const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDb, uploadsDir } = require('../../db');
const { authRequired, requireRole } = require('../../middleware/auth');
const { upload, mediaPublicUrl, safeDeleteFile } = require('../../middleware/upload');
const { logActivity } = require('../../db/helpers');
const { sanitizeString } = require('../../middleware/validate');

const router = express.Router();

router.get('/', authRequired, (req, res) => {
  const folder = sanitizeString(req.query.folder, 40);
  const db = getDb();
  const rows = folder
    ? db.prepare('SELECT * FROM media WHERE folder = ? ORDER BY created_at DESC').all(folder)
    : db.prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT 200').all();
  res.json({ ok: true, media: rows });
});

router.post(
  '/upload',
  authRequired,
  requireRole('super_admin', 'manager'),
  (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        const msg =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File too large (max 10 MB)'
            : err.message || 'Upload failed';
        return res.status(400).json({ ok: false, error: msg });
      }
      if (!req.file) {
        return res.status(400).json({ ok: false, error: 'No file uploaded' });
      }

      const folder = sanitizeString(req.body.folder, 40) || 'general';
      const url = mediaPublicUrl(req.file.filename);
      const result = getDb()
        .prepare(
          `INSERT INTO media (filename, original_name, mime_type, size, url, folder, alt_hy, alt_ru, alt_en, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          url,
          folder,
          sanitizeString(req.body.alt_hy, 300),
          sanitizeString(req.body.alt_ru, 300),
          sanitizeString(req.body.alt_en, 300),
          req.user.sub
        );

      logActivity(req.user.sub, 'upload', 'media', String(result.lastInsertRowid), { url }, req.ip);
      const { schedulePublish, getPublishStatus } = require('../../services/content-publish');
      const publish = schedulePublish(2500);
      res.status(201).json({
        ok: true,
        media: {
          id: result.lastInsertRowid,
          filename: req.file.filename,
          url,
          mime_type: req.file.mimetype,
          size: req.file.size,
          folder
        },
        publish: { ...getPublishStatus(), ...publish }
      });
    });
  }
);

router.delete('/:id', authRequired, requireRole('super_admin', 'manager'), (req, res) => {
  const row = getDb().prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'Media not found' });
  safeDeleteFile(row.filename);
  getDb().prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  logActivity(req.user.sub, 'delete', 'media', String(req.params.id), null, req.ip);
  res.json({ ok: true });
});

module.exports = router;

// Public file serving — exported separately
function mediaFilesRouter() {
  const filesRouter = express.Router();
  filesRouter.get('/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const full = path.join(uploadsDir(), filename);
    if (!fs.existsSync(full)) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.sendFile(full);
  });
  return filesRouter;
}

module.exports.mediaFilesRouter = mediaFilesRouter;
