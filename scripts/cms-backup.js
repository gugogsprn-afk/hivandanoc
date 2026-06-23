#!/usr/bin/env node
/**
 * Backup CMS database + JSON snapshot of all admin data.
 * Run on server daily and before each deploy.
 */
require('dotenv').config();
const { initDb } = require('../server/db');
const { runBackup } = require('../server/services/cms-persistence');

initDb();
const label = process.argv[2] || 'manual';
runBackup({ label });
