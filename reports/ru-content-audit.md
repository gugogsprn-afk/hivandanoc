# RU Content Audit

**Baseline:** HY source of truth  
**Language:** RU (`ru`)

## Summary

- **Average crawl-block word count:** 279
- **Average word-count parity vs HY:** 117%
- **Pages with leakage flags:** 4
- **CMS issues affecting RU:** 6

## Worst parity pages

| URL | RU words | HY words | % | Class |
| --- | --- | --- | --- | --- |
| /spine-health-resources | 34 | 101 | 34 | 0–39% Thin/placeholder |
| /for-clinics-and-referrers | 35 | 103 | 34 | 0–39% Thin/placeholder |
| /media-and-expert-commentary | 34 | 82 | 41 | 40–69% Major content loss |
| /patient-consultation-guide | 326 | 466 | 70 | 70–89% Noticeable missing content |
| / | 108 | 125 | 86 | 70–89% Noticeable missing content |
| /knowledge/lower-back-pain-causes | 318 | 365 | 87 | 70–89% Noticeable missing content |
| /conditions/radiculopathy | 291 | 329 | 88 | 70–89% Noticeable missing content |
| /reviews | 8 | 9 | 89 | 70–89% Noticeable missing content |
| /conditions/herniated-disc | 303 | 340 | 89 | 70–89% Noticeable missing content |
| /conditions/lower-back-pain | 356 | 399 | 89 | 70–89% Noticeable missing content |
| /conditions/leg-numbness | 306 | 345 | 89 | 70–89% Noticeable missing content |
| /about-doctor | 195 | 219 | 89 | 70–89% Noticeable missing content |
| /conditions/shoulder-pain | 293 | 324 | 90 | 90–99% Minor wording differences |
| /conditions/joint-pain | 289 | 320 | 90 | 90–99% Minor wording differences |
| /conditions/scoliosis-pain | 291 | 324 | 90 | 90–99% Minor wording differences |

## Knowledge article source gaps (RU)

| Slug | Parity % | HY FAQ | RU FAQ | Missing fields |
| --- | --- | --- | --- | --- |
| back-pain-causes | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| neck-pain-causes | 38 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| herniated-disc-symptoms | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| posture-and-spine-health | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| rehabilitation-after-spine-surgery | 38 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| lower-back-pain-causes | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| sciatica-symptoms | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| neck-stiffness-causes | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| leg-numbness-and-spine | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| back-pain-when-sitting | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| when-back-pain-needs-evaluation | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| sciatica-vs-lower-back-pain | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| herniated-disc-vs-bulging-disc | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| back-pain-after-lifting | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| neck-pain-symptoms | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| back-pain-symptoms | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| shoulder-pain-causes | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| exercises-for-back-pain | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| spine-surgery-when-needed | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| what-is-osteochondrosis | 50 | 1 | 0 | symptoms, causes, whenToSeek, faq |

## Mixed-language / quality flags

None flagged.

## Condition pages source parity

| Slug | Parity % | Empty/missing |
| --- | --- | --- |
| back-pain-treatment | 86 | servicesIntro (short) |
| neck-pain-treatment | 86 | servicesIntro (short) |
| sciatica | 100 | — |
| herniated-disc | 100 | — |
| lower-back-pain | 100 | — |
| leg-numbness | 86 | h1 (short) |
| shoulder-pain | 86 | h1 (short) |
| joint-pain | 100 | — |
| scoliosis-pain | 100 | — |
| osteochondrosis | 86 | h1 (short) |
| radiculopathy | 86 | h1 (short) |
| thoracic-back-pain | 100 | — |
| posture-disorders | 86 | h1 (short) |

## Authority pages

All authority routes use a **single repeated `bodyIntro`** in `authority-i18n.js` (RU). HY full body + FAQ not translated.

## Priority remediation for RU

1. **Critical:** Knowledge FAQ/symptom/cause arrays (41 articles)
2. **High:** Authority page full-body translation
3. **High:** CMS doctor bios and service descriptions
4. **Medium:** De-template condition symptom bullets
5. **Low:** Mixed-language H1 cleanup

*See `reports/content-parity-audit.md` for full cross-locale analysis.*
