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
CONTACT_SYNC=""
if grep -E '^(CONTACT_|SOCIAL_|DEVELOPER_)' "$ROOT/.env" | grep -v '^[[:space:]]*#' > /tmp/hivandanoc-contact-sync.env 2>/dev/null && [[ -s /tmp/hivandanoc-contact-sync.env ]]; then
  scp -q /tmp/hivandanoc-contact-sync.env "$SERVER:$REMOTE_DIR/.contact-sync.env"
  CONTACT_SYNC="CONTACT_ENV_FILE=$REMOTE_DIR/.contact-sync.env"
fi

ssh "$SERVER" "export PATH=/usr/bin:\$PATH; cd $REMOTE_DIR \
  && chmod 600 .env \
  && node scripts/sync-staff-users.js \
  && $CONTACT_SYNC node scripts/sync-contact-from-env.js \
  && pm2 restart hivandanoc-api \
  && sleep 2 && curl -s http://127.0.0.1:8765/api/health"

echo ""
echo "==> Done. Try https://healthyspinedoc.com/admin-cms/ — email/telegram should be true in health above."
