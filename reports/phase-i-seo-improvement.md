# Phase I — SEO Improvement Summary

**Date:** 2026-07-06  
**Baseline commit:** `ec8b4dc`

## Before / After

| Category | Before (fail) | After (fail) | Delta |
| --- | --- | --- | --- |
| Knowledge `/contact` links | 41 | 0 | **−41** |
| Knowledge FAQPage schema | 41 | 0 | **−41** |
| **Total SEO audit** | **82 fail / 1641 pass** | **0 fail / 1723 pass** | **−82** |

## Category detail

| Check | Before | After |
| --- | --- | --- |
| Total passed | 1641 | **1723** |
| Total failed | 82 | **0** |
| P0 failures | 0 | 0 |

## Knowledge schema audit

`node scripts/audit-knowledge-schema.js` → **41/41 PASS**

- All articles with visible FAQ emit matching FAQPage JSON-LD
- All articles include SSR-visible `/contact` link

## Notes

- Brief condition-page 500 regression during development (circular require) — fixed via lazy `getConditionConfig` require; no lasting impact.
- `lang/ru.json` `content.departments` Armenian strings remain (client-side fallback only; SSR uses CMS).
