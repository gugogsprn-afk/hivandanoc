# Content Authority Phase D — Plan

**Date:** 2026-07-06  
**Starting commit:** `2b5d225` — content: improve RU and EN medical content parity  
**Locale baseline:** LOCALE_STABLE_20260706  
**URL baseline:** `134b330`

## Current parity (from content audit at 2b5d225)

| Section | RU vs HY avg | EN vs HY avg |
|---------|--------------|--------------|
| trust/authority | 78% | 76% |
| knowledge | 137% | 143% |
| conditions | 69% | 73% |
| doctors | 260% | 269% |

### Known problems

- Authority Yerevan landings: **18–26%** vs HY word count (individual pages)
- `/patient-consultation-guide`: **Armenian leakage** in RU/EN SSR (HY body rendered)
- **31 knowledge articles**: titles fixed; symptoms/causes/FAQ empty in source (runtime parity only for top 10)
- **13 condition pages**: generic repeated symptom bullets (~57–67% vs HY)
- `seo:audit`: pre-existing failures (out of scope unless regressed)

## Target parity

| Area | Target |
|------|--------|
| trust/authority section avg | ≥85% RU/EN |
| Priority authority pages | ≥75% vs HY each |
| All 41 knowledge articles | FAQ ≥3, relevant arrays filled, source parity ≥75% |
| Conditions section avg | ≥85% RU/EN |
| patient-consultation-guide | Zero Armenian in RU/EN crawl |

## Files expected to change

- `server/services/authority-i18n-pages.js` — expanded landing + patient guide
- `server/services/authority-landing-builder.js` — shared landing page builder (new)
- `server/services/knowledge-i18n-parity.js` — merge batch overlay hook
- `server/services/knowledge-i18n-parity-batch.js` — remaining 31 articles (generated)
- `scripts/generate-knowledge-parity-batch.js` — generator (new)
- `server/services/condition-i18n-expanded.js` — condition-specific RU/EN (new)
- `server/services/condition-pages.js` — merge expanded condition overlay
- `server/services/seo-pages.js` — consultation-process depth if needed
- `reports/content-authority-phase-d-report.md`
- `reports/content-parity-*.md/json` — regenerated

## Explicit non-goals

- No routing, slug, sitemap, or locale architecture changes
- No HY content edits (except obvious typos)
- No invented doctor credentials or guarantees
- No fix of all 108 pre-existing `seo:audit` failures
- No CMS schema changes
