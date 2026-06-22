/**
 * Collect image/video URLs used on the public website (DB, static files, uploads).
 */
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db');
const { getSetting } = require('../db/helpers');

const PROJECT_ROOT = path.join(__dirname, '../..');
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|mp4|webm)(\?|$)/i;

function isMediaUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const s = value.trim();
  if (!s || s.length > 2000) return false;
  if (/^(https?:\/\/|\/api\/|images\/|\.\.\/images\/)/i.test(s)) return true;
  return IMAGE_EXT.test(s);
}

function normalizeUrl(url) {
  return String(url || '').trim();
}

function walkStaticImages(dir, base = 'images') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = `${base}/${entry.name}`.replace(/\\/g, '/');
    if (entry.isDirectory()) {
      out.push(...walkStaticImages(full, rel));
    } else if (IMAGE_EXT.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

function setByPath(obj, pathStr, value) {
  const parts = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const nextIsIndex = /^\d+$/.test(parts[i + 1]);
    if (cur[k] === undefined || cur[k] === null) cur[k] = nextIsIndex ? [] : {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function collectSiteMedia() {
  const db = getDb();
  const seen = new Set();
  const assets = [];

  function add(url, meta) {
    const u = normalizeUrl(url);
    if (!isMediaUrl(u) || seen.has(u)) return;
    seen.add(u);
    assets.push({
      url: u,
      kind: 'site',
      editable: true,
      ...meta
    });
  }

  const global = getSetting('global', {});
  const hospital = global.hospital || {};
  [
    ['logo', 'Clinic logo'],
    ['heroImage', 'Homepage hero'],
    ['aboutImage', 'About page image']
  ].forEach(([field, label]) => {
    add(hospital[field], { source: 'settings', field, label, page: 'Global settings' });
  });

  const extra = getSetting('content_extra', {});
  const extraPaths = [
    ['patientHero', 'image', 'Patient hero', 'Home'],
    ['feature', 'image', 'Feature block', 'Home'],
    ['backInGame', 'image', 'Back in game', 'Home'],
    ['expertiseOverlay', 'image', 'Expertise overlay', 'Home'],
    ['approachImage', null, 'Approach section', 'Home'],
    ['expertsImage', null, 'Experts section', 'Home'],
    ['imagingImage', null, 'Imaging section', 'Home'],
    ['moveBetter', 'image', 'Move better', 'Home']
  ];
  for (const [a, b, label, page] of extraPaths) {
    const val = b ? extra[a]?.[b] : extra[a];
    if (val) add(val, { source: 'content_extra', path: b ? `${a}.${b}` : a, label, page });
  }

  const arrayImageKeys = [
    ['equipment', 'image', 'Equipment', 'Home'],
    ['programs', 'image', 'Program', 'Home'],
    ['news', 'image', 'News', 'Home'],
    ['patientStories', 'image', 'Patient story', 'Home'],
    ['storyVideos', 'image', 'Story video', 'Home'],
    ['awards', 'image', 'Award', 'Home'],
    ['reviews', 'image', 'Review', 'Home']
  ];
  for (const [arrKey, imgKey, labelPrefix, page] of arrayImageKeys) {
    (extra[arrKey] || []).forEach((item, i) => {
      if (item?.[imgKey]) {
        add(item[imgKey], {
          source: 'content_extra',
          path: `${arrKey}[${i}].${imgKey}`,
          label: `${labelPrefix} ${i + 1}`,
          page
        });
      }
    });
  }

  const sections = db.prepare('SELECT page_key, section_key, content_json FROM page_sections').all();
  for (const sec of sections) {
    let content = {};
    try {
      content = JSON.parse(sec.content_json || '{}');
    } catch {
      content = {};
    }
    if (content.image) {
      add(content.image, {
        source: 'page_section',
        page_key: sec.page_key,
        section_key: sec.section_key,
        field: 'image',
        label: `${sec.page_key} / ${sec.section_key}`,
        page: sec.page_key
      });
    }
  }

  const doctors = db
    .prepare("SELECT id, name_hy, image_url FROM doctors WHERE image_url IS NOT NULL AND image_url != ''")
    .all();
  for (const d of doctors) {
    add(d.image_url, {
      source: 'doctor',
      id: d.id,
      field: 'image_url',
      label: d.name_hy || d.id,
      page: 'Doctors'
    });
  }

  const services = db
    .prepare("SELECT id, title_hy, image_url FROM services WHERE image_url IS NOT NULL AND image_url != ''")
    .all();
  for (const s of services) {
    add(s.image_url, {
      source: 'service',
      id: s.id,
      field: 'image_url',
      label: s.title_hy || s.id,
      page: 'Services'
    });
  }

  const testimonials = db
    .prepare("SELECT id, name_hy, image_url FROM testimonials WHERE image_url IS NOT NULL AND image_url != ''")
    .all();
  for (const t of testimonials) {
    add(t.image_url, {
      source: 'testimonial',
      id: t.id,
      field: 'image_url',
      label: t.name_hy || `Testimonial ${t.id}`,
      page: 'Home'
    });
  }

  const pageFields = db
    .prepare(
      `SELECT page_key, field_key, value FROM page_fields
       WHERE value_type = 'image' OR value LIKE '%images/%' OR value LIKE 'http%'`
    )
    .all();
  for (const f of pageFields) {
    if (isMediaUrl(f.value)) {
      add(f.value, {
        source: 'page_field',
        page_key: f.page_key,
        field_key: f.field_key,
        label: f.field_key,
        page: f.page_key
      });
    }
  }

  for (const rel of walkStaticImages(path.join(PROJECT_ROOT, 'images'))) {
    add(rel, {
      source: 'static',
      path: rel,
      label: path.basename(rel),
      page: 'Static files',
      editable: false
    });
  }

  const uploads = db.prepare('SELECT url, original_name, folder FROM media ORDER BY created_at DESC').all();
  for (const m of uploads) {
    add(m.url, {
      source: 'upload',
      label: m.original_name || m.url,
      page: m.folder || 'Uploads',
      editable: false
    });
  }

  assets.sort((a, b) => {
    const pg = (a.page || '').localeCompare(b.page || '');
    if (pg !== 0) return pg;
    return (a.label || '').localeCompare(b.label || '');
  });

  return assets;
}

function updateSiteAsset(ref, url) {
  const nextUrl = sanitizeAssetUrl(url);
  if (!nextUrl) throw new Error('Invalid media URL');

  const db = getDb();
  const { getSetting, setSetting } = require('../db/helpers');

  switch (ref.source) {
    case 'settings': {
      const global = getSetting('global', {});
      if (!global.hospital) global.hospital = {};
      global.hospital[ref.field] = nextUrl;
      setSetting('global', global);
      break;
    }
    case 'doctor':
      db.prepare('UPDATE doctors SET image_url = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
        nextUrl,
        ref.id
      );
      break;
    case 'service':
      db.prepare('UPDATE services SET image_url = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
        nextUrl,
        ref.id
      );
      break;
    case 'testimonial':
      db.prepare('UPDATE testimonials SET image_url = ? WHERE id = ?').run(nextUrl, ref.id);
      break;
    case 'content_extra': {
      const extra = { ...getSetting('content_extra', {}) };
      setByPath(extra, ref.path, nextUrl);
      setSetting('content_extra', extra);
      break;
    }
    case 'page_section': {
      const row = db
        .prepare('SELECT content_json FROM page_sections WHERE page_key = ? AND section_key = ?')
        .get(ref.page_key, ref.section_key);
      let content = {};
      try {
        content = JSON.parse(row?.content_json || '{}');
      } catch {
        content = {};
      }
      content[ref.field || 'image'] = nextUrl;
      db.prepare(
        `INSERT INTO page_sections (page_key, section_key, enabled, sort_order, content_json, updated_at)
         VALUES (?, ?, 1, 0, ?, datetime('now'))
         ON CONFLICT(page_key, section_key) DO UPDATE SET
           content_json = excluded.content_json,
           updated_at = datetime('now')`
      ).run(ref.page_key, ref.section_key, JSON.stringify(content));
      break;
    }
    case 'page_field':
      db.prepare(
        `INSERT INTO page_fields (page_key, field_key, lang, value, value_type, updated_at)
         VALUES (?, ?, 'hy', ?, 'image', datetime('now'))
         ON CONFLICT(page_key, field_key, lang) DO UPDATE SET
           value = excluded.value,
           value_type = excluded.value_type,
           updated_at = datetime('now')`
      ).run(ref.page_key, ref.field_key, nextUrl);
      break;
    default:
      throw new Error('This asset cannot be edited from the media library');
  }
}

function sanitizeAssetUrl(url) {
  const s = String(url || '').trim();
  if (!isMediaUrl(s)) return '';
  return s.slice(0, 2000);
}

module.exports = { collectSiteMedia, updateSiteAsset, isMediaUrl };
