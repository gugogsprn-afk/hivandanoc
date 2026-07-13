# Content Parity Audit — HY / RU / EN

**Date:** 2026-07-06  
**Baseline:** Armenian (HY) as source of truth  
**Site:** https://healthyspinedoc.com  
**Scope:** Content quality, completeness, parity, SEO depth (no code changes)

---

## A. Content inventory summary

- **Pages audited (live):** 109
- **Condition configs:** 13 (source parity avg RU ~92%)
- **Knowledge articles:** 41 (major FAQ/symptom gaps in RU/EN overlays)
- **Authority pages:** 13 (RU/EN intentionally thin vs HY full body)
- **CMS issues flagged:** 6
- **Lang JSON content gaps:** 0

### Inventory table (live crawl block word counts)

| URL | Template | HY words | RU words | EN words | HY § | RU § | EN § | RU/HY | EN/HY |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | home / index.html + CMS | 125 | 108 | 105 | 2 | 2 | 2 | 86% | 84% |
| /services | services hub | 512 | 526 | 549 | 6 | 6 | 6 | 103% | 107% |
| /conditions | conditions hub | 197 | 207 | 208 | 1 | 1 | 1 | 105% | 106% |
| /knowledge | knowledge hub | 455 | 488 | 478 | 1 | 1 | 1 | 107% | 105% |
| /find-a-doctor | seo-pages → doctors.html | 24 | 31 | 24 | 1 | 1 | 1 | 129% | 100% |
| /locations | seo-pages → contacts.html | 41 | 42 | 42 | 0 | 0 | 0 | 102% | 102% |
| /about | seo-pages → about.html | 15 | 25 | 20 | 0 | 0 | 0 | 167% | 133% |
| /contact | seo-pages → contacts.html | 28 | 29 | 28 | 0 | 0 | 0 | 104% | 100% |
| /appointment | seo-pages → appointment.html | 5 | 7 | 10 | 0 | 0 | 0 | 140% | 200% |
| /reviews | seo-pages → reviews.html | 9 | 8 | 11 | 0 | 0 | 0 | 89% | 122% |
| /move-better | seo-pages → move-better.html | 12 | 16 | 15 | 0 | 0 | 0 | 133% | 125% |
| /submit-story | seo-pages → submit-story.html | 20 | 20 | 23 | 0 | 0 | 0 | 100% | 115% |
| /patient-care | seo-pages → departments.html | 300 | 306 | 325 | 1 | 1 | 1 | 102% | 108% |
| /consultation-process | seo-pages → consultation-process.html | 120 | 189 | 197 | 5 | 5 | 5 | 158% | 164% |
| /privacy-policy | seo-pages → privacy-policy.html | 2 | 2 | 2 | 0 | 0 | 0 | 100% | 100% |
| /terms | seo-pages → terms.html | 2 | 2 | 3 | 0 | 0 | 0 | 100% | 150% |
| /cookies-policy | seo-pages → cookies-policy.html | 2 | 2 | 2 | 0 | 0 | 0 | 100% | 100% |
| /patient-information | seo-pages → patient-information.html | 2 | 3 | 2 | 0 | 0 | 0 | 150% | 100% |
| /patient-story | seo-pages → patient-story.html | 7 | 7 | 8 | 0 | 0 | 0 | 100% | 114% |
| /services/manual-therapy | service-pages.js + CMS dept | 234 | 229 | 236 | 8 | 8 | 8 | 98% | 101% |
| /services/osteopathy | service-pages.js + CMS dept | 216 | 215 | 226 | 8 | 8 | 8 | 100% | 105% |
| /services/physiotherapy | service-pages.js + CMS dept | 225 | 223 | 231 | 8 | 8 | 8 | 99% | 103% |
| /services/hernia-treatment | service-pages.js + CMS dept | 223 | 214 | 228 | 8 | 8 | 8 | 96% | 102% |
| /services/scoliosis | service-pages.js + CMS dept | 209 | 202 | 215 | 8 | 8 | 8 | 97% | 103% |
| /services/consult-spine | service-pages.js + CMS dept | 199 | 198 | 204 | 7 | 7 | 7 | 99% | 103% |
| /services/consult-neuro | service-pages.js + CMS dept | 198 | 186 | 201 | 7 | 7 | 7 | 94% | 102% |
| /services/kinesiotherapy | service-pages.js + CMS dept | 220 | 221 | 229 | 8 | 8 | 8 | 100% | 104% |
| /services/massage | service-pages.js + CMS dept | 207 | 205 | 218 | 8 | 8 | 8 | 99% | 105% |
| /services/acupuncture | service-pages.js + CMS dept | 183 | 181 | 192 | 6 | 6 | 6 | 99% | 105% |
| /services/traction | service-pages.js + CMS dept | 214 | 208 | 225 | 8 | 8 | 8 | 97% | 105% |
| /services/electrotherapy | service-pages.js + CMS dept | 187 | 187 | 198 | 7 | 7 | 7 | 100% | 106% |
| /services/osteochondrosis | service-pages.js + CMS dept | 209 | 205 | 218 | 8 | 8 | 8 | 98% | 104% |
| /services/radiculitis | service-pages.js + CMS dept | 209 | 204 | 218 | 8 | 8 | 8 | 98% | 104% |
| /services/arthrosis | service-pages.js + CMS dept | 208 | 207 | 220 | 8 | 8 | 8 | 100% | 106% |
| /services/sports-rehab | service-pages.js + CMS dept | 200 | 199 | 208 | 8 | 8 | 8 | 100% | 104% |
| /services/rehab-surgery | service-pages.js + CMS dept | 194 | 193 | 206 | 7 | 7 | 7 | 99% | 106% |
| /conditions/back-pain-treatment | condition-pages.js + condition-i18n | 461 | 438 | 454 | 7 | 7 | 7 | 95% | 98% |
| /conditions/neck-pain-treatment | condition-pages.js + condition-i18n | 386 | 362 | 356 | 7 | 7 | 7 | 94% | 92% |
| /conditions/sciatica | condition-pages.js + condition-i18n | 363 | 335 | 354 | 7 | 7 | 7 | 92% | 98% |
| /conditions/herniated-disc | condition-pages.js + condition-i18n | 340 | 303 | 317 | 7 | 7 | 7 | 89% | 93% |


*Showing 40/109 rows — see full data in audit JSON.*


---

## B. Content parity score by section

| Section | Pages | Avg RU vs HY word % | Avg EN vs HY word % |
| --- | --- | --- | --- |
| homepage | 1 | 86 | 84 |
| services | 18 | 99 | 104 |
| conditions | 14 | 92 | 95 |
| knowledge | 42 | 139 | 147 |
| other | 1 | 129 | 100 |
| contact/conversion | 3 | 115 | 134 |
| trust/authority | 15 | 121 | 125 |
| patient-care | 5 | 105 | 117 |
| legal | 4 | 113 | 113 |
| doctors | 6 | 93 | 103 |

**Interpretation:** Word-count ratio is a proxy; authority/knowledge pages show low % by design (HY long-form, RU/EN overlay-only).

---

## C. Worst RU pages (live word count vs HY)

| URL | HY words | RU words | RU/HY % | Class | Issues |
| --- | --- | --- | --- | --- | --- |
| /spine-health-resources | 101 | 34 | 34 | 0–39% Thin/placeholder | Missing sections: Ըստ վիճակների, Ըստ թերապևտիկ մեթոդների |
| /for-clinics-and-referrers | 103 | 35 | 34 | 0–39% Thin/placeholder | Missing sections: Գնահատվող վիճակներ, Մեր ծառայությունները |
| /media-and-expert-commentary | 82 | 34 | 41 | 40–69% Major content loss | Missing sections: Փորձագիտական թեմաներ, Կապ հաստատել |
| /patient-consultation-guide | 466 | 326 | 70 | 70–89% Noticeable missing content | Missing sections: Նախքան պատրաստվել, Սիմպտոմների փաստաթղթավորում |
| / | 125 | 108 | 86 | 70–89% Noticeable missing content | Missing sections: Առողջ ողնաշար, Բուժվող վիճակներ |
| /knowledge/lower-back-pain-causes | 365 | 318 | 87 | 70–89% Noticeable missing content | Missing sections: Ախտանիշներ, Պատճառներ |
| /conditions/radiculopathy | 329 | 291 | 88 | 70–89% Noticeable missing content | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |
| /reviews | 9 | 8 | 89 | 70–89% Noticeable missing content | — |
| /conditions/herniated-disc | 340 | 303 | 89 | 70–89% Noticeable missing content | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |
| /conditions/lower-back-pain | 399 | 356 | 89 | 70–89% Noticeable missing content | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |
| /conditions/leg-numbness | 345 | 306 | 89 | 70–89% Noticeable missing content | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |
| /about-doctor | 219 | 195 | 89 | 70–89% Noticeable missing content | Missing sections: Կրթություն և վերապատրաստում, Անդամություններ |
| /conditions/shoulder-pain | 324 | 293 | 90 | 90–99% Minor wording differences | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |
| /conditions/joint-pain | 320 | 289 | 90 | 90–99% Minor wording differences | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |
| /conditions/scoliosis-pain | 324 | 291 | 90 | 90–99% Minor wording differences | Missing sections: Ախտանիշներ, Երբ կարող է օգտակար լինել գնահատումը |

---

## D. Worst EN pages (live word count vs HY)

| URL | HY words | EN words | EN/HY % | Class | Issues |
| --- | --- | --- | --- | --- | --- |
| /spine-health-resources | 101 | 32 | 32 | 0–39% Thin/placeholder | — |
| /for-clinics-and-referrers | 103 | 33 | 32 | 0–39% Thin/placeholder | — |
| /media-and-expert-commentary | 82 | 33 | 40 | 40–69% Major content loss | — |
| /patient-consultation-guide | 466 | 354 | 76 | 70–89% Noticeable missing content | — |
| / | 125 | 105 | 84 | 70–89% Noticeable missing content | — |
| /about-doctor | 219 | 196 | 89 | 70–89% Noticeable missing content | — |
| /conditions/lower-back-pain | 399 | 364 | 91 | 90–99% Minor wording differences | — |
| /knowledge/lower-back-pain-causes | 365 | 333 | 91 | 90–99% Minor wording differences | — |
| /conditions/neck-pain-treatment | 386 | 356 | 92 | 90–99% Minor wording differences | — |
| /conditions/herniated-disc | 340 | 317 | 93 | 90–99% Minor wording differences | — |
| /conditions/leg-numbness | 345 | 324 | 94 | 90–99% Minor wording differences | — |
| /conditions/joint-pain | 320 | 301 | 94 | 90–99% Minor wording differences | — |
| /conditions/osteochondrosis | 316 | 298 | 94 | 90–99% Minor wording differences | — |
| /conditions/radiculopathy | 329 | 309 | 94 | 90–99% Minor wording differences | — |
| /conditions/posture-disorders | 334 | 314 | 94 | 90–99% Minor wording differences | — |

---

## E. CMS parity issues

| Severity | Type | ID/Path | Message | Source |
| --- | --- | --- | --- | --- |
| medium | cms-doctor | doc-1 | Doctor bio shorter/missing in RU (0 vs HY 64) | doctors table bio_ru |
| medium | cms-doctor | doc-2 | Doctor bio shorter/missing in RU (0 vs HY 63) | doctors table bio_ru |
| medium | cms-doctor | doc-3 | Doctor bio shorter/missing in RU (0 vs HY 65) | doctors table bio_ru |
| medium | cms-doctor | doc-4 | Doctor bio shorter/missing in RU (0 vs HY 64) | doctors table bio_ru |
| medium | cms-doctor | doc-5 | Doctor bio shorter/missing in RU (0 vs HY 82) | doctors table bio_ru |
| medium | cms-doctor | doc-6 | Doctor bio shorter/missing in RU (0 vs HY 52) | doctors table bio_ru |

**CMS content origin:**
| Layer | Path | Locales |
|-------|------|---------|
| SQLite CMS | `/var/lib/hivandanoc-cms/cms.db` | `title_hy/ru/en`, `bio_*`, `page_sections` |
| Published JSON | `published/content-{lang}.json` | Post-publish snapshots |
| Lang overlays | `lang/{hy,ru,en}.json` → `content.*` | Service item lists, home blocks |
| HY-only seed | `data/hospital.json` + `dept-translations` | HY services override in `buildPublicContent('hy')` |

---

## F. Translation quality issues

### Knowledge i18n (`server/services/knowledge-i18n.js`)
- **41/41** articles have RU/EN metadata overlays
- **~100%** have empty `symptoms[]`, `causes[]`, `faq[]` while HY `knowledge-config.js` is populated
- **RU H1 mixed language:** e.g. `"Back pain причины"`, `"Neck pain причины"` — English+Russian hybrid

### Condition i18n (`server/services/condition-i18n.js`)
- **13/13** slugs have RU/EN overlays with symptoms/whenToSeek lists
- **Generic repeated symptom bullets** across conditions (possible MT template artifact)

### Authority i18n (`server/services/authority-i18n.js`)
- **Identical `bodyIntro`** repeated across all 13 authority routes in RU and EN
- HY FAQ sections **not rendered** for RU/EN (`local-authority-pages.js`)

### Live leakage (crawl blocks)
4 pages with detected cross-language fragments in RU/EN crawl text.

---

## G. SEO depth gaps

| Gap | HY | RU | EN | Evidence |
|-----|----|----|-----|----------|
| Knowledge FAQ schema text | Full FAQ arrays | Empty | Empty | `knowledge-i18n.js` |
| Authority long-form body | Full HTML body + FAQ | 1-paragraph intro | 1-paragraph intro | `local-authority-config.js` vs `authority-i18n.js` |
| Service detail depth | CMS + HY dept-translations | CMS `_ru` + lang overlay | CMS `_en` + lang overlay | `helpers.js localizeServiceItems` |
| Homepage dynamic blocks | CMS + `lang.content` | Same structure, locale text | Same | Client `home.js` + SSR crawl |
| Conditions hub in sitemap | Indexed via detail pages | Hub excluded | Hub excluded | By design |

**Pages where HY > RU/EN by 50%+ (live word count):**
- /media-and-expert-commentary: RU 41%
- /spine-health-resources: RU 34%
- /for-clinics-and-referrers: RU 34%

---

## H. Trust / E-E-A-T gaps

| Page | HY trust signals | RU/EN gap |
|------|------------------|-----------|
| `/about` | Mission, leadership, awards, values | CMS-driven; parity depends on doctor bios |
| `/editorial-policy` | Full HY policy body | RU/EN: title + 1 intro paragraph only |
| `/consultation-process` | Full SSR copy | RU/EN localized via `seo-pages.js` — moderate parity |
| `/doctors/:slug` | Bio, education, languages from CMS | RU/EN use `pick(bio, lang)` — gaps if DB empty |
| `/find-a-doctor` | Doctor list crawl | Names localized; bios in crawl limited |
| Legal pages | Full `legal.json` bodies | **Strong parity** — tri-lingual HTML sections |

---

## I. Recommended fixes (audit only — do not implement yet)

### Critical
1. Populate `knowledge-i18n.js` `faq[]`, `symptoms[]`, `causes[]` for top 10 traffic articles (regenerate via `scripts/generate-ssr-i18n.js` after HY source update)
2. Fix RU knowledge H1 mixed-language strings (`Back pain причины` → full Russian)
3. Complete CMS `bio_ru` / `bio_en` for published doctors

### High
4. Expand `authority-i18n.js` with full body translations (or render HY FAQ with locale labels)
5. Audit CMS service `description_ru/en` for empty fallbacks to Armenian
6. Translate `data/hospital.json` `expertiseOverlay` (still Russian in HY seed file)

### Medium
7. Home `content.news[]` — empty; no RU/EN news parity possible until CMS populated
8. Patient stories — client-rendered; SSR shell only

### Low
9. Condition symptom list de-duplication (same 4 bullets across slugs in RU)

---

## J. Estimated impact

| Fix phase | SEO impact | Trust impact | Conversion impact | Effort |
|-----------|------------|--------------|-------------------|--------|
| Knowledge FAQ/symptom parity | **High** | Medium | Low | 2–3 days |
| Authority page body RU/EN | **High** | **High** | Medium | 3–5 days |
| CMS doctor bios | Medium | **High** | **High** | 1 day |
| Knowledge H1 cleanup | Medium | Low | Low | 2 hours |
| Service CMS descriptions | Medium | Medium | Medium | 1 day |

---

## K. Files / content sources

| Content | Primary files |
|---------|---------------|
| Homepage UI | `lang/{hy,ru,en}.json` → `pages.home`, `content.*` |
| Homepage dynamic | `js/home.js`, CMS `page_sections`, `data/hospital.json` |
| Services | CMS `services` table, `service-pages.js`, `lang/*.json content.departments` |
| Conditions | `condition-pages.js`, `condition-i18n.js` |
| Knowledge | `knowledge-config.js`, `knowledge-i18n.js` |
| Doctors | CMS `doctors`, `doctor-pages.js` |
| Authority | `local-authority-config.js`, `authority-i18n.js` |
| Legal | `lang/legal.json` |
| SSR UI strings | `server/services/i18n-ssr.js` → `ui(lang)` |

---

## Implementation plan

### Phase A — Quick wins (<1 hour)
- Fix obvious mixed-language knowledge H1s in `knowledge-i18n.js`
- Verify CMS doctor `bio_ru/en` non-empty in admin
- Document HY-only `hospital.json` expertiseOverlay for CMS migration

### Phase B — High-value content gaps (1–3 days)
- Regenerate knowledge/condition i18n from updated HY sources
- Fill top 10 knowledge article FAQ arrays in RU/EN
- CMS service description audit + backfill

### Phase C — Authority improvements (3–5 days)
- Translate authority page bodies or enable FAQ for RU/EN
- Editorial policy / medical review policy full text in RU/EN

### Phase D — Long-tail article parity (ongoing)
- Remaining 31 knowledge articles — symptoms, causes, FAQ
- Condition-specific symptom copy (replace generic templates)

---

*Generated by `scripts/content-parity-audit.js` — read-only audit.*
