# HealthySpineDoc — Production Deployment Runbook

**Site:** https://healthyspinedoc.com  
**Server path:** `/var/www/hivandanoc`  
**Git branch:** `master`  
**Git remote:** `origin` → `git@github.com:armcoincrypto/Hivandanoc.git`  
**Safe baseline commit:** `ce5a81a` (minimum); use latest `master` after cleanup commits.

---

## Active production stack

| Component | Location / command |
|-----------|-------------------|
| Nginx config (live) | `/etc/nginx/sites-enabled/hivandanoc` → `/etc/nginx/sites-available/hivandanoc` |
| Nginx source in repo | `deploy/nginx-production.conf` |
| Node API (PM2) | `hivandanoc-api` → `server/index.js` on `127.0.0.1:8765` |
| CMS database | `/var/lib/hivandanoc-cms/cms.db` (outside git) |
| Contact sync source | `/var/www/hivandanoc/.contact-sync.env` |
| Secrets | `/var/www/hivandanoc/.env` (never commit) |

---

## Canonical NAP (non-negotiable)

```text
CONTACT_EMAIL=info@healthyspine.am
CONTACT_PHONE=+374 (93) 27-48-88
Phone compact: +37493274888
```

**Never deploy with:** `spinemedicalclinic@gmail.com` in `CONTACT_EMAIL`.

---

## Pre-deploy checklist

```bash
cd /var/www/hivandanoc   # or local clone

# 1. Canonical contact guard (local)
grep -q '^CONTACT_EMAIL=info@healthyspine.am$' .contact-sync.env 2>/dev/null \
  || grep -q '^CONTACT_EMAIL=info@healthyspine.am$' .env \
  || { echo "Fix CONTACT_EMAIL before deploy"; exit 1; }

# 2. CMS backup (on server)
node scripts/cms-backup.js pre-deploy

# 3. Preservation validation
bash scripts/validate-production-preservation.sh https://healthyspinedoc.com
# Required: 26 passed, 0 failed

# 4. SEO audit gate (deploy script runs this too)
npm run seo:audit
```

---

## Deploy commands

**From local machine (recommended):**

```bash
bash deploy/publish.sh
```

**Direct rsync deploy (server-side or CI):**

```bash
bash deploy/deploy.sh
```

Deploy behavior:
- `rsync --delete` to server (excludes `.env`, `data/`, `node_modules/`)
- CMS backup pre/post deploy
- PM2 restart on port 8765
- Nginx reload from `deploy/nginx-production.conf`
- Contact sync **only if** local `.env` has `CONTACT_*` keys **and** email is canonical

---

## Post-deploy validation

```bash
bash scripts/validate-production-preservation.sh https://healthyspinedoc.com
curl -sL https://healthyspinedoc.com/ | grep -c spinemedicalclinic@gmail.com   # must be 0
curl -sI https://healthyspinedoc.com/admin/ | head -1                           # HTTP/1.1 403
pm2 status hivandanoc-api
curl -s https://healthyspinedoc.com/api/health
```

Required: **26 passed, 0 failed**

---

## Rollback

```bash
BACKUP=/root/backups/hivandanoc-prod-cleanup-YYYYMMDD-HHMMSS
cd /var/www/hivandanoc

git checkout <known-good-commit> -- deploy/nginx-production.conf .contact-sync.env js/seo.js
cp deploy/nginx-production.conf /etc/nginx/sites-available/hivandanoc && nginx -t && systemctl reload nginx

# Restore CMS if contact was corrupted
cp "$BACKUP"/cms-pre-*.json  # use latest cms-backup from /var/lib/hivandanoc-cms/backups/
# manual restore via cms restore script or copy cms.db from backup

CONTACT_ENV_FILE=.contact-sync.env node scripts/sync-contact-from-env.js
pm2 restart hivandanoc-api
bash scripts/validate-production-preservation.sh https://healthyspinedoc.com
```

---

## Forbidden actions

- Do **not** set `CONTACT_EMAIL=spinemedicalclinic@gmail.com`
- Do **not** run `rsync --delete` before classifying server-only WIP
- Do **not** expose `/admin/` (must stay HTTP 403)
- Do **not** delete or overwrite `/var/lib/hivandanoc-cms` without backup
- Do **not** commit `.env` or CMS database to git
- Do **not** deploy from branch `main` — use **`master`**

---

## Server-only drift (not in git)

These may exist only on production until committed or archived:

- Doctor portrait/search WIP (`js/doctor-portrait.js`, `js/pages.js`, `css/hss-spine.css`)
- Untested helpers (`server/services/cms-field-expand.js`, `translate.js`)
- `admin-cms/js/*` duplicate copies

Backup before deploy:

```bash
tar -czf /root/backups/hivandanoc-wip-$(date +%F).tgz \
  $(git ls-files --others --exclude-standard) 2>/dev/null || true
```

---

## Language policy

- Default public SEO locale: **Armenian (`lang="hy"`)** on canonical URLs
- UI language switcher: HY / RU / EN via client i18n
- Brand name `Առողջ ողնաշար` may appear in all locales

---

## Support scripts

| Script | Purpose |
|--------|---------|
| `scripts/validate-production-preservation.sh` | 26-check live validation |
| `scripts/cms-backup.js` | CMS JSON backup |
| `scripts/sync-contact-from-env.js` | Push `.contact-sync.env` → CMS |
| `scripts/sync-lang-to-db.js` | Push `lang/*.json` → CMS |
