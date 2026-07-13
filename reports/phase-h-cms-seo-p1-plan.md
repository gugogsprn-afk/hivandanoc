# Phase H — CMS Locale + SEO P1 Plan

**Date:** 2026-07-06  
**Starting commit:** `090e9fc`  
**Prior verdict:** `PHASE_G_PASS_WITH_BLOCKING_WARNING`

## Locale guard failures (baseline)

| Route | Issue |
| --- | --- |
| `/services?lang=ru` | Armenian service titles/descriptions + category names from CMS |
| `/find-a-doctor?lang=ru` | Armenian doctor names in `name_ru` |
| `/about?lang=ru` | Mixed Armenian in `hospital.about.ru` |
| `/doctors/doc-1?lang=ru` | Armenian doctor names |

**Root cause:** Production CMS at `/var/lib/hivandanoc-cms/cms.db` had Armenian copied into `name_ru`, `title_ru`, `description_ru`, `name_ru` (categories), and mixed `hospital.about.ru`.

## SEO P1 list (from Phase G triage)

1. Legal H1 missing (4 pages) — SSR hero `#legal-page-title` stayed `—`
2. Placeholder email false-positive — `info@healthyspine.am` is production email
3. MedicalWebPage schema missing (16 services)
4. Hub links — `/services` missing `/conditions`; manual-therapy missing knowledge link

## Intended CMS tables/fields

| Table | Fields |
| --- | --- |
| `doctors` | `name_ru`, `name_en`, `role_ru`, `role_en` (preserve `name_hy`) |
| `services` | `title_ru`, `description_ru` |
| `service_categories` | `name_ru` |
| `settings` (global) | `hospital.about.ru` |

## Intended files

- `scripts/update-doctor-locale-names.js` — CMS one-time locale sync
- `server/services/seo-pages.js` — legal H1 SSR
- `server/services/service-pages.js` — hub link, knowledge links, MedicalWebPage schema
- `server/services/knowledge-pages.js` — export `getKnowledgeConfig`
- `scripts/seo-audit.js` — email false-positive fix

## Explicit non-goals

- No routing/locale/sitemap architecture changes
- No authority/knowledge/condition content rewrite
- No doctor bio changes
- No P2/P3 SEO fixes (knowledge /contact, FAQPage batch)
- No CMS commit to git (DB documented only)
