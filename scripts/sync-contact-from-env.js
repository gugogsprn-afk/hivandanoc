#!/usr/bin/env node
/**
 * Sync clinic contact + social links from .env into CMS global settings.
 * Run after editing .env: npm run cms:sync-contact
 * Also runs automatically on deploy and push-env.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
if (process.env.CONTACT_ENV_FILE) {
  require('dotenv').config({ path: process.env.CONTACT_ENV_FILE, override: true });
}

const { initDb } = require('../server/db');
const { getSetting, setSetting, triplet } = require('../server/db/helpers');
const { schedulePublish } = require('../server/services/content-publish');
const { persistAfterChange } = require('../server/services/cms-persistence');

function env(key) {
  const v = process.env[key];
  return v != null ? String(v).trim() : '';
}

function pickSocial() {
  const social = {};
  const map = {
    facebook: 'SOCIAL_FACEBOOK',
    instagram: 'SOCIAL_INSTAGRAM',
    tiktok: 'SOCIAL_TIKTOK'
  };
  for (const [key, envKey] of Object.entries(map)) {
    const url = env(envKey);
    if (url) social[key] = url;
  }
  return social;
}

function run() {
  initDb();

  const phone = env('CONTACT_PHONE');
  const email = env('CONTACT_EMAIL');
  const address = env('CONTACT_ADDRESS');
  const emergency = env('CONTACT_EMERGENCY');
  const developerName = env('DEVELOPER_NAME');
  const developerUrl = env('DEVELOPER_URL');
  const socialFromEnv = pickSocial();

  if (
    !phone &&
    !email &&
    !address &&
    !developerName &&
    !developerUrl &&
    !Object.keys(socialFromEnv).length
  ) {
    console.log('[cms:sync-contact] No CONTACT_*, SOCIAL_*, or DEVELOPER_* values in .env — skipped');
    return;
  }

  const global = getSetting('global', {});
  const h = { ...(global.hospital || {}) };

  if (phone) h.phone = phone;
  if (email) h.email = email;
  if (emergency) h.emergency = emergency;

  if (address) {
    const hy = env('CONTACT_ADDRESS_HY') || address;
    const ru = env('CONTACT_ADDRESS_RU') || address;
    const en = env('CONTACT_ADDRESS_EN') || address;
    h.address = { hy, ru, en };
  }

  if (Object.keys(socialFromEnv).length) {
    h.social = { ...(h.social || {}), ...socialFromEnv };
  }

  global.hospital = h;
  setSetting('global', global);

  if (developerName || developerUrl) {
    const site = {
      ...getSetting('site', {}),
      ...(developerName ? { developerName } : {}),
      ...(developerUrl ? { developerUrl } : {})
    };
    setSetting('site', site);
  }
  persistAfterChange('sync-contact');
  schedulePublish(500);

  console.log('[cms:sync-contact] Updated public site contact:');
  if (phone) console.log('  phone:', phone);
  if (email) console.log('  email:', email);
  if (address) console.log('  address:', address);
  if (Object.keys(socialFromEnv).length) {
    console.log('  social:', Object.keys(socialFromEnv).join(', '));
  }
  if (developerName || developerUrl) {
    console.log('  developer:', developerName || '(name)', developerUrl || '(url)');
  }
}

run();
