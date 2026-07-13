# Phase G — Maintenance & CI Hardening Plan

**Date:** 2026-07-06  
**Starting commit:** `ac8e174`  
**Prior verdict:** `HEALTHYSPINEDOC_AUTHORITY_CERTIFICATION_PASS`

## Certified baseline (input)

- Balanced `#seo-crawl-content` extraction in `content-parity-audit.js`
- Live authority depth 149–178% RU/EN vs HY (6 landings)
- Policy depth 117–155% RU/EN vs HY
- URL audit 0 critical/high/medium/low
- Authority schema audit PASS (27 checks)

## Validation baseline (G0)

| Gate | Result |
| --- | --- |
| `node --check` | PASS |
| `npm run url:audit` | PASS |
| `npm run content:audit` | PASS (corrected counts) |
| `certify-live-authority-depth.js` | PASS |
| `audit-authority-schema.js` | PASS |
| `npm run locale:guard` | **FAIL (4)** — Armenian in RU CMS surfaces |
| `audit-locale-parity.js` | **FAIL** — ARMENIAN_LEAKAGE_IN_RU |
| `npm run seo:audit` | 1615 pass / 108 fail (pre-existing) |

## Known warnings

1. **Locale guard / locale parity** — RU Armenian leakage on `/services`, `/find-a-doctor`, `/about`, `/doctors/doc-1` from CMS doctor/dept content (not modified in Phase G)
2. **SEO audit** — 108 pre-existing failures; triaged in G4, excluded from hard maintenance gate
3. **Uncommitted workspace drift** — unrelated CMS/front-end files; excluded from Phase G commit

## Intended files

| File | Purpose |
| --- | --- |
| `scripts/maintenance-certification.js` | Single post-deploy certification runner |
| `scripts/test-content-extraction.js` | Extraction regression tests |
| `server/services/authority-landing-specs.js` | RU typo fix |
| `scripts/certify-live-authority-depth.js` | Exit code on FAIL |
| `scripts/audit-authority-schema.js` | Exit code on BLOCKED |
| `package.json` | `maintenance:certify`, `test:content-extraction` |
| `reports/phase-g-*.md/json` | Plan, triage, runbook, final report |

## Explicit non-goals

- No URL / locale / sitemap architecture changes
- No CMS database or doctor bio edits
- No new public routes or content expansion
- No bulk SEO audit remediation (108 items)
- No cheerio install

## Success criteria

- `npm run test:content-extraction` PASS
- `npm run maintenance:certify` exists (may WARN on pre-existing locale CMS leakage)
- RU typo fixed in `authority-landing-specs.js`
- SEO failures triaged, not blindly fixed
