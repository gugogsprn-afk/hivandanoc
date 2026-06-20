#!/usr/bin/env bash
# Upload local .env to production (NOT in git). Enables Gmail + Telegram on server.
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
REMOTE_DIR="/var/www/hivandanoc"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$ROOT/.env" ]; then
  echo "ERROR: $ROOT/.env not found. Copy from .env.example and fill SMTP + Telegram."
  exit 1
fi

echo "==> Uploading .env to $SERVER:$REMOTE_DIR/.env"
scp "$ROOT/.env" "$SERVER:$REMOTE_DIR/.env"
ssh "$SERVER" "chmod 600 $REMOTE_DIR/.env && cd $REMOTE_DIR && pm2 restart hivandanoc-api && sleep 2 && curl -s http://127.0.0.1:8765/api/health"
echo ""
echo "==> Done. email/telegram should be true in health response above."
