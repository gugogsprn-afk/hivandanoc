# Phase I — Knowledge P2 SEO Plan

**Date:** 2026-07-06  
**Starting commit:** `ec8b4dc`  
**Prior verdict:** `HEALTHYSPINEDOC_PRODUCTION_CERTIFIED_BASELINE`

## Current SEO counts (baseline)

| Metric | Value |
| --- | --- |
| Passed | 1641 |
| Failed | 82 |
| P0 | 0 |
| Total checks | 1723 |

## Remaining P2 classes (verified from audit)

| Failure Type | Count | Affected Pages | Root Cause |
| --- | --- | --- | --- |
| Knowledge `/contact` link missing | 41 | All `/knowledge/*` articles | Localized `articleBodyHtml` had no `href="/contact"` |
| FAQPage schema missing | 41 | All `/knowledge/*` articles with FAQ | Localized `articleJsonLd` omitted FAQPage (dead HY-only version had it) |

**Total:** 82 failures — exclusively knowledge P2.

## Intended files

| File | Purpose |
| --- | --- |
| `server/services/knowledge-pages.js` | FAQPage in JSON-LD; wire related links + consultation path |
| `server/services/knowledge-related-links.js` | Localized condition/service/article links + consultation section |
| `scripts/audit-knowledge-schema.js` | FAQPage + contact link validation |

## Explicit non-goals

- No URL/routing/locale/sitemap changes
- No CMS or doctor database edits
- No authority/policy page changes
- No FAQ content invention
- No aggressive CTAs
- No content expansion

## Implementation plan

1. Add FAQPage to localized `articleJsonLd` when `config.faq.length > 0`
2. Add modest consultation path section with `/contact`, `/find-a-doctor`, `/appointment`
3. Restore internal linking (conditions, services, related articles) from `KNOWLEDGE_CONFIG` slugs
4. Validate with `audit-knowledge-schema.js` and full certification suite
