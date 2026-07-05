# WIP Freeze Classification — Zero Drift Audit

**Date:** 2026-07-05  
**Baseline:** `76dea26` → **`5678a61`** (after freeze commits)  
**Backup:** `/root/backups/hivandanoc-wip-freeze-20260705-210743/`

## Summary

| Action | Count |
|--------|-------|
| Committed | 38 production files across 4 commits |
| Restored from HEAD | 8 critical drift files (contact, deploy, nginx, seo) |
| Archived + removed | 6 duplicate/dead untracked files |
| Intentionally local (.gitignore) | `README.md`, `docs/technical-seo-audit.md` |

## Commits

```
5678a61 chore: add deployment ops scripts and CMS maintenance tools
ff72f5e fix: align production CSS cache-busted assets
762d1e0 fix: stabilize doctor search and portrait runtime
```

## File classification table

| File | Git status | Runtime used? | Route/page | Risk | Decision | Reason |
|------|------------|-----------------|------------|------|----------|--------|
| `.contact-sync.env` | drift | Yes | all NAP | CRITICAL | DISCARD_RESTORE_HEAD | Canonical email must match git |
| `deploy/*.sh` + nginx | drift | Yes | deploy | CRITICAL | DISCARD_RESTORE_HEAD | Contact guards + admin 403 |
| `js/pages.js` | modified | Yes | doctors, depts, hubs | Medium | COMMIT | Doctor cards + filters |
| `js/doctor-search.js` | modified | Yes | `/`, `/find-a-doctor` | Medium | COMMIT | Category search band |
| `js/doctor-portrait.js` | untracked | Yes | `/find-a-doctor` | Low | COMMIT | Photo slots on cards |
| `js/service-catalog.js` | untracked | Yes | doctors, depts | Low | COMMIT | Category grouping |
| `js/common.js`, `home.js` | modified | Yes | all pages | Medium | COMMIT | Logo mark, layout helpers |
| `css/hss-spine.css` | modified | Yes | all public pages | Medium | COMMIT | Production styles |
| `css/hospital-theme.css` | modified | Yes | all pages | Low | COMMIT | Theme tokens |
| `*.html` cache-bust | modified | Yes | all | Low | COMMIT | Asset version sync |
| `admin-cms/*` | modified | Yes | `/admin-cms/` | Low | COMMIT | Bundled in CSS commit |
| `admin/index.html` | modified | No (403) | `/admin/` blocked | Low | DISCARD_RESTORE_HEAD | Not publicly served |
| `images/doctors/placeholder.svg` | untracked | Yes | doctor cards | Low | COMMIT | Portrait fallback |
| `images/brand/logo-mark.png` | untracked | Yes | CMS + common.js | Low | COMMIT | Brand asset |
| `package.json` + scripts | modified/new | Ops | n/a | Low | COMMIT | Maintenance tooling |
| `deploy/pull-from-server.sh` | untracked | Ops | n/a | Low | COMMIT | Documented in runbook |
| `admin-cms/js/*` duplicates | untracked | No | n/a | Low | ARCHIVE_ONLY | Copies of public js/ |
| `cms-field-expand.js`, `translate.js` | untracked | No imports | n/a | Low | ARCHIVE_ONLY | Dead code |
| `README.md` | untracked | No | n/a | None | KEEP_LOCAL (.gitignore) | Generic local notes |
| `docs/technical-seo-audit.md` | untracked | No | n/a | None | KEEP_LOCAL (.gitignore) | External audit artifact |

## Archived files

`/root/backups/hivandanoc-wip-freeze-20260705-210743/archived-files/`

## Deploy safety

Friend **can** use `rsync --delete` from commit **`5678a61`** after:

```bash
bash scripts/validate-production-preservation.sh https://healthyspinedoc.com
node scripts/cms-backup.js pre-deploy
```

Forbidden: deploying with stale `CONTACT_EMAIL`.
