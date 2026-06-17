#!/usr/bin/env bash
# Deploy hivandanoc to production server
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
REMOTE_DIR="/var/www/hivandanoc"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Syncing files to $SERVER:$REMOTE_DIR"
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '*.bat' \
  --exclude '*.vbs' \
  --exclude 'scripts/' \
  --exclude 'legacy/' \
  "$ROOT/" "$SERVER:$REMOTE_DIR/"

echo "==> Updating nginx config"
ssh "$SERVER" "cp $REMOTE_DIR/deploy/nginx-production.conf /etc/nginx/sites-available/hivandanoc \
  && ln -sf /etc/nginx/sites-available/hivandanoc /etc/nginx/sites-enabled/hivandanoc \
  && rm -f /etc/nginx/sites-enabled/default \
  && nginx -t && systemctl reload nginx"

echo "==> Deploy complete"
echo "    HTTP:  http://173.212.240.38/"
echo "    HTTPS: run ./deploy/ssl.sh after DNS points to this server"
