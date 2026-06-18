const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.CMS_DATA_DIR || path.join(__dirname, '../../data/cms');
const DB_PATH = process.env.CMS_DB_PATH || path.join(DATA_DIR, 'cms.db');

let db = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const uploads = path.join(DATA_DIR, 'uploads');
  if (!fs.existsSync(uploads)) {
    fs.mkdirSync(uploads, { recursive: true });
  }
}

function getDb() {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'manager',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER DEFAULT 0,
      url TEXT NOT NULL,
      folder TEXT DEFAULT 'general',
      alt_hy TEXT,
      alt_ru TEXT,
      alt_en TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      name_hy TEXT,
      name_ru TEXT,
      name_en TEXT,
      sort_order INTEGER DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES service_categories(id),
      title_hy TEXT,
      title_ru TEXT,
      title_en TEXT,
      description_hy TEXT,
      description_ru TEXT,
      description_en TEXT,
      icon TEXT,
      image_url TEXT,
      price TEXT,
      duration TEXT,
      doctor_id TEXT,
      items_json TEXT,
      sort_order INTEGER DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      seo_title_hy TEXT,
      seo_title_ru TEXT,
      seo_title_en TEXT,
      seo_desc_hy TEXT,
      seo_desc_ru TEXT,
      seo_desc_en TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE,
      name_hy TEXT,
      name_ru TEXT,
      name_en TEXT,
      role_hy TEXT,
      role_ru TEXT,
      role_en TEXT,
      department_id TEXT,
      location_hy TEXT,
      location_ru TEXT,
      location_en TEXT,
      is_surgeon INTEGER NOT NULL DEFAULT 0,
      experience TEXT,
      image_url TEXT,
      bio_hy TEXT,
      bio_ru TEXT,
      bio_en TEXT,
      education_hy TEXT,
      education_ru TEXT,
      education_en TEXT,
      languages_hy TEXT,
      languages_ru TEXT,
      languages_en TEXT,
      sort_order INTEGER DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      seo_title_hy TEXT,
      seo_title_ru TEXT,
      seo_title_en TEXT,
      seo_desc_hy TEXT,
      seo_desc_ru TEXT,
      seo_desc_en TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS page_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_key TEXT NOT NULL,
      section_key TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      content_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(page_key, section_key)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      email TEXT,
      doctor_id TEXT,
      service_id TEXT,
      department_id TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title_hy TEXT,
      title_ru TEXT,
      title_en TEXT,
      excerpt_hy TEXT,
      excerpt_ru TEXT,
      excerpt_en TEXT,
      content_hy TEXT,
      content_ru TEXT,
      content_en TEXT,
      cover_url TEXT,
      category TEXT,
      author TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      seo_title_hy TEXT,
      seo_title_ru TEXT,
      seo_title_en TEXT,
      seo_desc_hy TEXT,
      seo_desc_ru TEXT,
      seo_desc_en TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_hy TEXT,
      name_ru TEXT,
      name_en TEXT,
      text_hy TEXT,
      text_ru TEXT,
      text_en TEXT,
      image_url TEXT,
      rating INTEGER DEFAULT 5,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      meta_json TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
    CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_key);

    CREATE TABLE IF NOT EXISTS page_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_key TEXT NOT NULL,
      field_key TEXT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'hy',
      value TEXT NOT NULL DEFAULT '',
      value_type TEXT NOT NULL DEFAULT 'text',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(page_key, field_key, lang)
    );

    CREATE INDEX IF NOT EXISTS idx_page_fields_page ON page_fields(page_key);
  `);

  return database;
}

function uploadsDir() {
  ensureDataDir();
  return path.join(DATA_DIR, 'uploads');
}

module.exports = {
  getDb,
  initDb,
  uploadsDir,
  DATA_DIR,
  DB_PATH
};
