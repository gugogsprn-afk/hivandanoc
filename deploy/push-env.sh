#!/usr/bin/env bash
# Upload local .env to production and sync CMS staff passwords (never committed to git).
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
REMOTE_DIR="/var/www/hivandanoc"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$ROOT/.env" ]]; then
  echo "Missing $ROOT/.env — copy from .env.example first."
  exit 1
fi

echo "==> Uploading .env to $SERVER:$REMOTE_DIR/.env"
scp "$ROOT/.env" "$SERVER:$REMOTE_DIR/.env"

echo "==> Syncing staff users and restarting API"
ssh "$SERVER" "export PATH=/usr/bin:\$PATH; cd $REMOTE_DIR \
  && node scripts/sync-staff-users.js \
  && pm2 restart hivandanoc-api"

echo "==> Done. Try signing in at https://healthyspinedoc.com/admin-cms/"
