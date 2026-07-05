#!/usr/bin/env node
/** Smoke-test all admin CMS API routes. */
require('dotenv').config();

const API = process.env.CMS_TEST_API || 'http://127.0.0.1:8765/api/v1';
const EMAIL = process.env.CMS_SMM_EMAIL || process.env.CMS_ADMIN_EMAIL || 'admin@healthyspinedoc.com';
const PASSWORD = process.env.CMS_SMM_PASSWORD || process.env.CMS_ADMIN_PASSWORD || 'ChangeMe2026!';

async function request(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  if (!login.ok || !login.json.token) {
    console.error('FAIL login', login.status, login.json.error);
    process.exit(1);
  }
  const headers = { Authorization: `Bearer ${login.json.token}` };
  const routes = [
    ['GET', '/auth/me'],
    ['GET', '/admin/dashboard/stats'],
    ['GET', '/admin/leads'],
    ['GET', '/admin/contacts/contacts'],
    ['GET', '/admin/doctors'],
    ['GET', '/admin/services'],
    ['GET', '/admin/media'],
    ['GET', '/admin/pages'],
    ['GET', '/admin/settings'],
    ['GET', '/admin/homepage']
  ];
  let failed = 0;
  for (const [method, path] of routes) {
    const r = await request(path, { method, headers });
    const mark = r.ok ? '✓' : '✗';
    console.log(`${mark} ${method} ${path} → ${r.status}`);
    if (!r.ok) {
      failed++;
      console.error('  ', r.json.error || r.json);
    }
  }
  if (failed) process.exit(1);
  console.log(`\n${routes.length} admin routes OK`);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
