#!/usr/bin/env node
/**
 * Sync CMS staff accounts from .env (CMS_SMM_* / CMS_ADMIN_*).
 * Safe to run on every deploy: updates password hashes when env values change.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
if (process.env.STAFF_ENV_FILE) {
  require('dotenv').config({ path: process.env.STAFF_ENV_FILE, override: true });
}

const { initDb } = require('../server/db');
const { ensureStaffUsers } = require('../server/db/seed');

initDb();
const n = ensureStaffUsers();
console.log(`[cms:staff-sync] Updated ${n} staff account(s).`);
