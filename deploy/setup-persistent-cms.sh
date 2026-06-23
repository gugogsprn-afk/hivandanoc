#!/usr/bin/env bash
# One-time: persistent CMS storage outside deploy directory + daily backup cron.
set -euo pipefail

DATA_DIR="${CMS_DATA_DIR:-/var/lib/hivandanoc-cms}"
APP_DIR="${APP_DIR:-/var/www/hivandanoc}"

echo "==> Creating persistent CMS directory: $DATA_DIR"
mkdir -p "$DATA_DIR"/{uploads,published,backups}
chmod 750 "$DATA_DIR"
chmod 770 "$DATA_DIR/uploads"

if [[ -d "$APP_DIR/data/cms" ]] && [[ "$(ls -A "$APP_DIR/data/cms" 2>/dev/null)" ]]; then
  echo "==> Migrating existing CMS data from $APP_DIR/data/cms"
  CMS_DATA_DIR="$DATA_DIR" node "$APP_DIR/scripts/cms-migrate-data-dir.js" || true
  for f in cms.db cms.db-wal cms.db-shm; do
    [[ -f "$APP_DIR/data/cms/$f" && ! -f "$DATA_DIR/$f" ]] && cp -a "$APP_DIR/data/cms/$f" "$DATA_DIR/$f"
  done
  [[ -d "$APP_DIR/data/cms/uploads" ]] && cp -an "$APP_DIR/data/cms/uploads/." "$DATA_DIR/uploads/" 2>/dev/null || true
  [[ -d "$APP_DIR/data/cms/published" ]] && cp -an "$APP_DIR/data/cms/published/." "$DATA_DIR/published/" 2>/dev/null || true
fi

ENV_FILE="$APP_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  if grep -q '^CMS_DATA_DIR=' "$ENV_FILE"; then
    sed -i "s|^CMS_DATA_DIR=.*|CMS_DATA_DIR=$DATA_DIR|" "$ENV_FILE"
  else
    echo "CMS_DATA_DIR=$DATA_DIR" >> "$ENV_FILE"
  fi
  echo "==> Updated $ENV_FILE with CMS_DATA_DIR"
fi

CRON_LINE="15 3 * * * cd $APP_DIR && /usr/bin/node scripts/cms-backup.js nightly >> $DATA_DIR/backups/backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'scripts/cms-backup.js' ; echo "$CRON_LINE" ) | crontab -
echo "==> Installed daily backup cron (03:15)"

echo "==> Done. Restart API: pm2 restart hivandanoc-api"
