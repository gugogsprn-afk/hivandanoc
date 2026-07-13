# Phase G — Maintenance Runbook

## After deploy

```bash
cd /var/www/hivandanoc
pm2 restart hivandanoc-api
sleep 5
npm run maintenance:certify
```

## What `maintenance:certify` checks (hard gates)

| Step | Command | Purpose |
| --- | --- | --- |
| 1 | JS syntax check | All `server/`, `js/`, `scripts/` parse |
| 2 | `npm run test:content-extraction` | Balanced `#seo-crawl-content` regression |
| 3 | `npm run locale:guard` | Post-deploy locale smoke |
| 4 | `npm run url:audit` | Route graph / broken links |
| 5 | `npm run content:audit` | HY/RU/EN parity + word counts |
| 6 | `certify-live-authority-depth.js` | Live authority depth ≥75%/80% |
| 7 | `audit-authority-schema.js` | JSON-LD parse + FAQ/Breadcrumb |
| 8 | `audit-locale-parity.js` | Full locale parity certification |

**Pass output:** `MAINTENANCE_CERTIFICATION_PASS`  
**Fail output:** `MAINTENANCE_CERTIFICATION_FAIL` (first failed gate stops the run)

## Intentionally excluded

- `npm run seo:audit` — 108 pre-existing failures (see `reports/phase-g-seo-audit-triage.md`)

Run SEO audit separately for hygiene tracking:

```bash
npm run seo:audit || true
```

## If certification fails

1. Read the first `FAIL` gate in console output
2. Re-run that gate alone for full logs
3. For transient 502 after PM2 restart, wait 5–10s and retry
4. For locale Armenian leakage on doctor listings — CMS translation task (out of deploy script scope)

## Rollback

- Use `git log` / `git reset` **only with explicit approval**
- After rollback: `pm2 restart hivandanoc-api`, wait, then `npm run maintenance:certify`
- Do **not** mutate CMS unless the rollback phase explicitly requires it

## Record baseline

After PASS, note commit hash and certification date in deploy notes.
