# Phase G — SEO Audit Triage

**Date:** 2026-07-06  
**Baseline commit:** `ac8e174`  
**Source:** `npm run seo:audit` → **1615 passed, 108 failed**  
**Introduced by Phase G:** 0

## Summary by severity

| Severity | Count | Description |
| --- | --- | --- |
| **P0** — production blockers | **0** | No 5xx, broken canonicals, sitemap errors, or noindex on authority pages |
| **P1** — high SEO priority | **25** | Legal H1, placeholder email, hub links, service schema |
| **P2** — medium | **83** | Knowledge /contact links + FAQPage schema expectations |
| **P3** — low/noise | **0** | — |

## P0 — Production blockers

None identified. No Phase G content or routing changes introduced blockers.

## P1 — High priority (25)

1. **Legal pages missing H1** (4): `/privacy-policy`, `/terms`, `/cookies-policy`, `/patient-information`
2. **Placeholder email** `info@healthyspine.am` (3): `/`, `/contact`, `/locations`
3. **Services hub** missing link to `/conditions` (1)
4. **Manual therapy** missing knowledge article link (1)
5. **MedicalWebPage schema** missing on 16 launched service pages

## P2 — Medium (83)

1. **Knowledge articles missing `/contact` link** — 42 articles
2. **Knowledge articles missing FAQPage schema** — 41 articles (audit rule; many pages may not expose FAQ in SSR)

## Top 10 actionable issues

1. Add visible H1 to legal SSR pages
2. Replace placeholder `info@healthyspine.am` on contact surfaces
3. Link `/services` hub to `/conditions`
4. Add knowledge cross-link on `/services/manual-therapy`
5. Batch MedicalWebPage schema on service SSR template
6. Standardize `/contact` link in knowledge article footer
7. FAQPage schema emission for knowledge pages with FAQ blocks
8. (Deferred) Heading hierarchy review on hub pages
9. (Deferred) Image alt text audit on CMS-driven heroes
10. (Deferred) Content freshness dates on knowledge batch

## Recommended next phase

**Phase H — SEO hygiene batch:** fix P1 items in template/SSR layers without URL or locale changes. Schedule P2 schema/link batch separately.

## Maintenance gate policy

`npm run seo:audit` is **intentionally excluded** from `npm run maintenance:certify` until P1 backlog is reduced.

JSON triage: `reports/phase-g-seo-audit-triage.json`
