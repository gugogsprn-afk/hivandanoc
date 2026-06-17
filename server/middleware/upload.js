const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadsDir } = require('../db');

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm'
]);

const MAX_SIZE = Number(process.env.CMS_MAX_UPLOAD_MB || 10) * 1024 * 1024;

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const dir = uploadsDir();
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8);
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm']);
  if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
  if (allowedExt.has(ext)) return cb(null, true);
  return cb(new Error('File type not allowed. Use JPG, PNG, WebP, GIF, MP4, or WebM.'));
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter
});

function mediaPublicUrl(filename) {
  return `/api/v1/media/files/${filename}`;
}

function safeDeleteFile(filename) {
  const full = path.join(uploadsDir(), path.basename(filename));
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

module.exports = { upload, mediaPublicUrl, safeDeleteFile, ALLOWED_MIME, MAX_SIZE };
