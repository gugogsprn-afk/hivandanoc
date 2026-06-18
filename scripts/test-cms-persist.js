#!/usr/bin/env node
/**
 * Test CMS field persistence via admin API + public API verification.
 * Usage: CMS_ADMIN_EMAIL=... CMS_ADMIN_PASSWORD=... node scripts/test-cms-persist.js
 */
require('dotenv').config();

const API = process.env.CMS_TEST_API || 'http://127.0.0.1:8765/api/v1';
const EMAIL = process.env.CMS_ADMIN_EMAIL || 'admin@healthyspinedoc.com';
const PASSWORD = process.env.CMS_ADMIN_PASSWORD || 'ChangeMe2026!';
const TEST_VALUE = `CMS_TEST_${Date.now()}`;

async function request(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${path} failed (${res.status})`);
  return json;
}

async function main() {
  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const token = login.token;
  if (!token) throw new Error('No token from login');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const save = await request('/admin/pages/bulk/fields', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      changes: [
        {
          pageKey: 'home',
          sectionKey: 'hero',
          fieldKey: 'hero-title',
          lang: 'hy',
          value: TEST_VALUE,
          value_type: 'text'
        }
      ]
    })
  });

  console.log('Bulk save:', save.saved, 'field(s)');

  const pub = await fetch(`${API}/public/content?lang=hy&_t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const content = await pub.json();
  const got = content.pageFields?.home?.['hero-title'];

  if (got !== TEST_VALUE) {
    console.error('FAIL: expected', TEST_VALUE, 'got', got);
    process.exit(1);
  }

  console.log('PASS: public API returns saved hero-title');
  console.log('Value:', got);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
