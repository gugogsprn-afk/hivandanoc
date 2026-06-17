#!/usr/bin/env bash
# Deploy hivandanoc to production server (static + Node API via PM2)
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
REMOTE_DIR="/var/www/hivandanoc"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Syncing files to $SERVER:$REMOTE_DIR"
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'node_modules/' \
  --exclude '*.bat' \
  --exclude '*.vbs' \
  --exclude 'legacy/' \
  "$ROOT/" "$SERVER:$REMOTE_DIR/"

echo "==> Installing API dependencies and restarting PM2"
ssh "$SERVER" "export PATH=/usr/bin:\$PATH; cd $REMOTE_DIR \
  && npm ci --omit=dev \
  && command -v pm2 >/dev/null || npm install -g pm2 \
  && pm2 delete hivandanoc-api 2>/dev/null || true \
  && HOST=127.0.0.1 PORT=8765 NODE_ENV=production pm2 start server/index.js --name hivandanoc-api \
  && pm2 save \
  && (pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash || true)"

echo "==> Updating nginx config"
ssh "$SERVER" "cp $REMOTE_DIR/deploy/nginx-production.conf /etc/nginx/sites-available/hivandanoc \
  && ln -sf /etc/nginx/sites-available/hivandanoc /etc/nginx/sites-enabled/hivandanoc \
  && rm -f /etc/nginx/sites-enabled/default \
  && nginx -t && systemctl reload nginx"

echo "==> Deploy complete"
echo "    Site:  http://173.212.240.38/"
echo "    API:   http://173.212.240.38/api/health"
echo "    HTTPS: ./deploy/ssl.sh (after DNS for healthyspine.am)"
