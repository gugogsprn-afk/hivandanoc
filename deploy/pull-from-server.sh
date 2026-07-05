#!/usr/bin/env bash
# Pull site files from production into the local repo (excludes .env, data, node_modules).
# After pull, review diffs and merge with local design changes before deploy.
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
REMOTE_DIR="/var/www/hivandanoc"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGING="${PULL_STAGING:-/tmp/hivandanoc-server-pull}"
BACKUP="${PULL_DESIGN_BACKUP:-/tmp/hivandanoc-design-backup}"

echo "==> Pulling from $SERVER:$REMOTE_DIR → $STAGING"
mkdir -p "$STAGING"
rsync -avz --delete \
  --exclude '.git' \
  --exclude 'node_modules/' \
  --exclude '.env' \
  --exclude 'data/' \
  --exclude 'legacy/' \
  --exclude '.contact-sync.env' \
  --exclude '.staff-sync.env' \
  "$SERVER:$REMOTE_DIR/" "$STAGING/"

echo "==> Backing up local design-critical files → $BACKUP"
mkdir -p "$BACKUP"
for f in \
  css/hss-spine.css \
  js/pages.js \
  js/doctor-portrait.js \
  js/service-catalog.js \
  js/doctor-search.js \
  admin-cms/js/app.js \
  doctors.html \
  departments.html; do
  cp "$ROOT/$f" "$BACKUP/$(basename "$f")" 2>/dev/null || true
done
cp "$ROOT/js/common.js" "$BACKUP/common.js" 2>/dev/null || true

echo "==> Merging server files into $ROOT"
rsync -av \
  --exclude '.git' \
  --exclude 'node_modules/' \
  --exclude '.env' \
  --exclude 'data/' \
  --exclude 'legacy/' \
  "$STAGING/" "$ROOT/"

echo "==> Restoring design backups (manual merge may still be needed for common.js)"
cp "$BACKUP/hss-spine.css" "$ROOT/css/hss-spine.css"
cp "$BACKUP/pages.js" "$ROOT/js/pages.js"
cp "$BACKUP/doctor-portrait.js" "$ROOT/js/doctor-portrait.js"
cp "$BACKUP/service-catalog.js" "$ROOT/js/service-catalog.js"
cp "$BACKUP/doctor-search.js" "$ROOT/js/doctor-search.js"
cp "$BACKUP/app.js" "$ROOT/admin-cms/js/app.js"
cp "$BACKUP/doctors.html" "$ROOT/doctors.html"
cp "$BACKUP/departments.html" "$ROOT/departments.html"

echo "==> Pull complete. Run: git status && git diff"
echo "    Re-merge CMS banner helpers in js/common.js if needed."
echo "    Then: bash deploy/publish.sh \"Your message\""
