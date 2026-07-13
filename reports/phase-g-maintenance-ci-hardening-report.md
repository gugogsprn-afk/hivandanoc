# Phase G — Maintenance & CI Hardening Report

**Date:** 2026-07-06  
**Starting commit:** `ac8e174`  
**Verdict:** **MAINTENANCE_CI_HARDENING_PASS_WITH_WARNINGS**

---

## A) Executive Verdict

Phase G delivers repeatable maintenance certification tooling, extraction regression protection, RU typo cleanup, and SEO failure triage. Core authority/URL/content gates pass. **`npm run maintenance:certify` fails on pre-existing RU Armenian CMS leakage** (4 locale-guard checks) — documented, not introduced by Phase G.

---

## B) Starting Baseline

- Commit `ac8e174` — authority certification PASS
- Balanced content extraction certified in Phase F
- SEO audit: 108 pre-existing failures

---

## C) Maintenance Certification Script

**New:** `scripts/maintenance-certification.js`  
**Command:** `npm run maintenance:certify`

Runs 8 hard gates in order (syntax → extraction test → locale → URL → content → authority depth → schema → locale parity). Fails fast with `MAINTENANCE_CERTIFICATION_FAIL`. Excludes `seo:audit` by design.

**Current result:** fails at gate 3 (locale guard) due to CMS Armenian doctor names on RU pages.

---

## D) Content Extraction Regression Test

**New:** `scripts/test-content-extraction.js`  
**Command:** `npm run test:content-extraction`

| Case | Result |
| --- | --- |
| Nested `<section>` inside `#seo-crawl-content` | PASS |
| Stops after balanced close (no footer bleed) | PASS |
| `<main>` fallback | PASS |
| Unicode word counting (RU/HY/EN) | PASS |

Output: `CONTENT_EXTRACTION_REGRESSION_PASS`

---

## E) RU Typo Cleanup

**File:** `server/services/authority-landing-specs.js`

| Before | After |
| --- | --- |
| Консерватив реабилитация | **Консервативная реабилитация** |

Verified: `grep` on `server/services` — **0 matches** for old forms.

---

## F) SEO Audit Triage Summary

| Severity | Count |
| --- | --- |
| P0 | 0 |
| P1 | 25 |
| P2 | 83 |
| P3 | 0 |

**No P0 blockers.** Top P1: legal H1 missing (4), placeholder email (3), services schema/links. Full triage: `reports/phase-g-seo-audit-triage.md`

---

## G) Runbook Summary

Post-deploy: `pm2 restart` → wait 5s → `npm run maintenance:certify`  
See `reports/phase-g-maintenance-runbook.md`

---

## H) Validation Table

| Check | Result |
| --- | --- |
| `node --check` | PASS |
| `npm run test:content-extraction` | PASS |
| `npm run url:audit` | PASS |
| `npm run content:audit` | PASS |
| `certify-live-authority-depth.js` | PASS (all 8 pages) |
| `audit-authority-schema.js` | PASS |
| `npm run locale:guard` | **FAIL (4)** — pre-existing CMS RU leakage |
| `audit-locale-parity.js` | **FAIL** — ARMENIAN_LEAKAGE_IN_RU |
| `npm run maintenance:certify` | **FAIL** at locale guard (expected until CMS fix) |
| `npm run seo:audit` | 1615 pass / 108 fail (triaged, excluded) |

---

## I) Files Changed

| File | Change |
| --- | --- |
| `package.json` | `maintenance:certify`, `test:content-extraction` |
| `scripts/maintenance-certification.js` | New |
| `scripts/test-content-extraction.js` | New |
| `scripts/certify-live-authority-depth.js` | Exit 1 on FAIL |
| `scripts/audit-authority-schema.js` | Exit 1 on BLOCKED |
| `server/services/authority-landing-specs.js` | RU typo |
| `reports/phase-g-*.md/json` | Plan, triage, runbook, report |

---

## J) Remaining Warnings

1. **Locale guard (4 FAIL)** — RU pages show Armenian doctor names from CMS: `/services`, `/find-a-doctor`, `/about`, `/doctors/doc-1`. Requires CMS RU doctor/dept translation (out of Phase G scope).
2. **`maintenance:certify`** — will not fully PASS until locale guard passes.
3. **SEO audit** — 108 pre-existing failures; triaged, not fixed.
4. **Transient 502** — possible for ~5s after PM2 restart; wait before certifying.

---

## K) Next Recommended Phase

**Phase H — CMS locale strings + SEO P1 batch:**
1. Translate doctor display names for RU/EN in CMS (unblocks locale guard)
2. Legal page H1 + contact email placeholders
3. Services hub `/conditions` link + MedicalWebPage schema batch

---

## Production Baseline

Authority depth, URL graph, content audit, and extraction regression are **certified**. Maintenance runner is **ready**; full green requires CMS locale string work.
