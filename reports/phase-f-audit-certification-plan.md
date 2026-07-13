# Phase F — Audit Certification Plan

**Date:** 2026-07-06  
**Starting commit:** `55d9d63`  
**Prior verdict:** `HEALTHYSPINEDOC_CONTENT_AUTHORITY_PHASE_E_CERTIFIED_PASS`

## Known issues (input)

| Issue | Severity | Action |
| --- | --- | --- |
| `content-parity-audit.js` closes extraction at first nested `</section>` | **Blocker for reporting** | F1 — balanced tag extractor |
| RU heading typo: «Консерватив методы» | Cosmetic | F3 — fix to «Консервативные методы» |
| Audit JSON showed ~35% RU depth while live was 154–183% | Reporting only | F1 + F2 cross-certification |

## Validation baseline (pre-fix)

| Gate | Result |
| --- | --- |
| `node --check` (all JS) | PASS |
| `npm run locale:guard` | PASS |
| `npm run url:audit` | PASS (0 issues) |
| `npm run content:audit` | PASS (but authority undercount) |
| `audit-locale-parity.js` | FULL_LOCALE_PARITY_PASS |
| `npm run seo:audit` | 1615 passed, 108 failed (pre-existing) |

## Scope

- Fix content audit extraction for nested SSR sections
- Cross-certify live vs audit authority depth
- Fix known RU typo(s) in Phase E content
- JSON-LD / metadata QA on authority & policy pages
- Regenerate audit reports
- Production authority certification baseline

## Explicit non-goals

- No URL / locale / sitemap architecture changes
- No CMS or doctor database edits
- No new public routes
- No content expansion (Phase E complete)
- No cheerio install (not in package.json)
- No broad SEO audit remediation (108 pre-existing failures)

## Deliverables

1. `scripts/content-parity-audit.js` — robust extraction
2. `scripts/certify-live-authority-depth.js`
3. `scripts/audit-authority-schema.js`
4. `reports/phase-f-live-authority-certification.md`
5. `reports/phase-f-schema-authority-audit.md`
6. `reports/phase-f-authority-certification.md`
7. Commit: `chore: certify multilingual authority audit baseline`
