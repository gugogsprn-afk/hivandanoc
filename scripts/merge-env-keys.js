#!/usr/bin/env node
/**
 * Merge KEY=VALUE lines from overlay into target .env (update existing or append).
 * Used on deploy to apply CMS login credentials without replacing the whole server .env.
 */
const fs = require('fs');

function parseEnv(content) {
  const map = new Map();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  return map;
}

const target = process.argv[2] || '.env';
const overlay = process.argv[3];

if (!overlay || !fs.existsSync(overlay)) {
  console.log('[env:merge] No overlay file — skipped');
  process.exit(0);
}

const overlayMap = parseEnv(fs.readFileSync(overlay, 'utf8'));
if (!overlayMap.size) {
  console.log('[env:merge] Overlay empty — skipped');
  process.exit(0);
}

const lines = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').split('\n') : [];
const seen = new Set();
const out = lines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return line;
  const eq = trimmed.indexOf('=');
  if (eq === -1) return line;
  const key = trimmed.slice(0, eq);
  if (overlayMap.has(key)) {
    seen.add(key);
    return `${key}=${overlayMap.get(key)}`;
  }
  return line;
});

for (const [key, val] of overlayMap) {
  if (!seen.has(key)) out.push(`${key}=${val}`);
}

fs.writeFileSync(target, `${out.join('\n').replace(/\n+$/, '')}\n`);
console.log('[env:merge] Updated keys:', [...overlayMap.keys()].join(', '));
