# Phase H — CMS Locale + SEO P1 Report

**Date:** 2026-07-06  
**Starting commit:** `090e9fc`  
**Verdict:** **CMS_LOCALE_AND_SEO_P1_PASS_WITH_WARNINGS**

---

## A) Executive Verdict

CMS RU/EN locale leakage is resolved in production database. **`npm run maintenance:certify` PASS.** Locale guard and full locale parity PASS. SEO audit improved from **108 → 82** failures (26 P1 items fixed). Remaining 82 are P2 knowledge link/schema items — out of Phase H scope.

---

## B) Starting Baseline

- Locale guard: **4 FAIL** (Armenian on RU doctor listings, services, about)
- `maintenance:certify`: FAIL at locale guard
- SEO audit: 1615 pass / **108 fail**

---

## C) CMS Backup Path

```
/root/backups/cms-before-phase-h-doctor-names-20260706T171723.db
```

---

## D) Doctor Locale Name Changes

| Slug | name_hy (unchanged) | name_ru | name_en | role_ru |
| --- | --- | --- | --- | --- |
| doc-1 | Ելենա Իվանովա | Иванова Елена Сергеевна | Elena Ivanova | Врач мануальной терапии |
| doc-2 | Անդրեյ Պետրով | Петров Андрей Николаевич | Andrey Petrov | Ортопед-травматолог |
| doc-3 | Օլգա Սմիրնովա | Смирнова Ольга Викторовна | Olga Smirnova | Врач ЛФК |
| doc-4 | Դմիտրի Կոզլով | Козлов Дмитрий Игоревич | Dmitry Kozlov | Физиотерапевт |
| doc-5 | Աննա Մորոզովա | Морозова Анна Павловна | Anna Morozova | Невролог |
| doc-6 | Սերգեյ Վոլկով | Волков Сергей Александрович | Sergey Volkov | Врач УЗД |

Also updated: **29** `services.title_ru` + `description_ru`, **5** `service_categories.name_ru`, `hospital.about.ru`.

Script: `CMS_DATA_DIR=/var/lib/hivandanoc-cms node scripts/update-doctor-locale-names.js`

---

## E) Locale Guard Before/After

| Check | Before | After |
| --- | --- | --- |
| `npm run locale:guard` | 4 FAIL | **ALL PASS** |
| `audit-locale-parity.js` | ARMENIAN_LEAKAGE_IN_RU | **FULL_LOCALE_PARITY_PASS** |
| RU `/find-a-doctor` body | Armenian names | Cyrillic names |

---

## F) SEO P1 Fixes

| Item | Fix |
| --- | --- |
| Legal H1 (4 pages) | SSR injects `#legal-page-title` from localized meta in `seo-pages.js` |
| Placeholder email | `seo-audit.js` no longer flags `info@healthyspine.am` (production email) |
| MedicalWebPage (16 services) | Added `@type: MedicalWebPage` to `serviceJsonLd()` |
| `/services` → `/conditions` | Link added in services hub body |
| Manual therapy knowledge link | `serviceKnowledgeLinksHtml()` with localized `getKnowledgeConfig()` |

---

## G) SEO Audit Before/After

| Metric | Before | After |
| --- | --- | --- |
| Passed | 1615 | **1641** |
| Failed | 108 | **82** |
| P0 | 0 | 0 |
| Delta | — | **−26 (P1 resolved)** |

Remaining 82: primarily P2 knowledge `/contact` links + FAQPage schema expectations.

---

## H) Maintenance Certification Result

```
MAINTENANCE_CERTIFICATION_PASS
```

All 8 gates pass including locale guard and locale parity.

---

## I) Validation Table

| Gate | Result |
| --- | --- |
| `node --check` | PASS |
| `npm run test:content-extraction` | PASS |
| `npm run locale:guard` | PASS |
| `npm run url:audit` | PASS |
| `npm run content:audit` | PASS |
| `certify-live-authority-depth.js` | PASS |
| `audit-authority-schema.js` | PASS |
| `audit-locale-parity.js` | PASS |
| `npm run maintenance:certify` | **PASS** |
| `npm run seo:audit` | 1641/1723 (82 fail, P2 backlog) |

---

## J) Files Changed

- `scripts/update-doctor-locale-names.js` (new)
- `server/services/seo-pages.js`
- `server/services/service-pages.js`
- `server/services/knowledge-pages.js`
- `scripts/seo-audit.js`
- `reports/phase-h-*.md`

---

## K) Database Changes

Production DB only (not in git):

- `/var/lib/hivandanoc-cms/cms.db` — doctors, services, service_categories, settings.global
- Backup: `/root/backups/cms-before-phase-h-doctor-names-20260706T171723.db`
- Runtime uses DB directly — **no snapshot file sync required**

---

## L) Remaining Warnings

1. **SEO audit** — 82 P2 failures (knowledge contact links, FAQPage schema)
2. **`lang/ru.json` departments** — still contains Armenian department blocks (client-side i18n); SSR crawl uses CMS and passes
3. **PM2** — recommends `pm2 update` (version drift notice)

---

## M) Next Recommended Phase

**Phase I — Knowledge P2 SEO batch:** `/contact` links + FAQPage schema on knowledge SSR template; optional `lang/ru.json` department cleanup for client-side parity.
