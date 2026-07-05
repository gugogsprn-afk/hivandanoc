#!/usr/bin/env bash
# Deploy hivandanoc to production server (static + Node API via PM2)
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
REMOTE_DIR="/var/www/hivandanoc"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

load_contact_env_file() {
  local dest="$1"
  if [[ ! -f "$ROOT/.env" ]]; then
    return 1
  fi
  grep -E '^(CONTACT_|SOCIAL_|DEVELOPER_)' "$ROOT/.env" | grep -v '^[[:space:]]*#' > "$dest"
  [[ -s "$dest" ]]
}

load_staff_env_file() {
  local dest="$1"
  if [[ ! -f "$ROOT/.env" ]]; then
    return 1
  fi
  grep -E '^(CMS_ADMIN_|CMS_SMM_|JWT_SECRET|JWT_EXPIRES)' "$ROOT/.env" | grep -v '^[[:space:]]*#' > "$dest"
  [[ -s "$dest" ]]
}

assert_canonical_contact_env() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "ABORT: missing contact env file: $file"
    exit 1
  fi
  if ! grep -q '^CONTACT_EMAIL=info@healthyspine.am$' "$file"; then
    echo "ABORT: CONTACT_EMAIL must be info@healthyspine.am (stale or missing)"
    grep '^CONTACT_EMAIL=' "$file" || echo "(CONTACT_EMAIL not set)"
    exit 1
  fi
  if grep -q 'spinemedicalclinic@gmail.com' "$file"; then
    echo "ABORT: forbidden stale email spinemedicalclinic@gmail.com in $file"
    exit 1
  fi
}

echo "==> SEO audit gate (must pass before deploy)"
(cd "$ROOT" && npm run seo:audit)

echo "==> Syncing files to $SERVER:$REMOTE_DIR"
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'node_modules/' \
  --exclude '*.bat' \
  --exclude '*.vbs' \
  --exclude 'legacy/' \
  --exclude 'data/' \
  "$ROOT/" "$SERVER:$REMOTE_DIR/"

echo "==> Backup CMS data and reconcile uploads on server"
ssh "$SERVER" "export PATH=/usr/bin:\$PATH; cd $REMOTE_DIR \
  && bash deploy/setup-persistent-cms.sh 2>/dev/null || true \
  && node scripts/cms-backup.js pre-deploy \
  && node scripts/cms-reconcile-uploads.js \
  && node scripts/cms-restore-hero-video.js 2>/dev/null || true"

echo "==> Installing API dependencies and restarting PM2"
CONTACT_SYNC_FILE=""
STAFF_SYNC_FILE=""
if load_contact_env_file "/tmp/hivandanoc-contact-sync.env"; then
  assert_canonical_contact_env "/tmp/hivandanoc-contact-sync.env"
  scp -q "/tmp/hivandanoc-contact-sync.env" "$SERVER:$REMOTE_DIR/.contact-sync.env"
  CONTACT_SYNC_FILE="$REMOTE_DIR/.contact-sync.env"
  echo "==> Will sync contact/social from local .env"
fi
if load_staff_env_file "/tmp/hivandanoc-staff-sync.env"; then
  scp -q "/tmp/hivandanoc-staff-sync.env" "$SERVER:$REMOTE_DIR/.staff-sync.env"
  STAFF_SYNC_FILE="$REMOTE_DIR/.staff-sync.env"
  echo "==> Will sync admin/SMM login from local .env"
fi

ssh "$SERVER" "export PATH=/usr/bin:\$PATH; cd $REMOTE_DIR \
  && npm ci --omit=dev \
  && npm run seo:audit \
  && command -v pm2 >/dev/null || npm install -g pm2 \
  && pm2 delete hivandanoc-api 2>/dev/null || true \
  && if [[ -f .staff-sync.env ]]; then node scripts/merge-env-keys.js .env .staff-sync.env && chmod 600 .env; fi \
  && HOST=127.0.0.1 PORT=8765 NODE_ENV=production pm2 start server/index.js --name hivandanoc-api \
  && pm2 save \
  && if [[ -f .contact-sync.env ]]; then grep -q '^CONTACT_EMAIL=info@healthyspine.am$' .contact-sync.env || { echo 'ABORT: server .contact-sync.env stale'; exit 1; }; fi \
  && STAFF_ENV_FILE=${STAFF_SYNC_FILE:-} node scripts/sync-staff-users.js \
  && if [[ -n \"${CONTACT_SYNC_FILE}\" ]]; then CONTACT_ENV_FILE=${CONTACT_SYNC_FILE} node scripts/sync-contact-from-env.js; fi \
  && node scripts/cms-backup.js post-deploy \
  && node scripts/cms-reconcile-uploads.js \
  && node scripts/sync-lang-to-db.js \
  && (pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash || true)"

echo "==> Updating nginx config"
ssh "$SERVER" "cp $REMOTE_DIR/deploy/nginx-production.conf /etc/nginx/sites-available/hivandanoc \
  && ln -sf /etc/nginx/sites-available/hivandanoc /etc/nginx/sites-enabled/hivandanoc \
  && rm -f /etc/nginx/sites-enabled/default \
  && nginx -t && systemctl reload nginx"

echo "==> Deploy complete"
echo "    Site:  http://173.212.240.38/"
echo "    API:   http://173.212.240.38/api/health"
echo "    HTTPS: ./deploy/ssl.sh (after DNS for healthyspinedoc.com)"
