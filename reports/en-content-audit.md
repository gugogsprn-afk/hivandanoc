# EN Content Audit

**Baseline:** HY source of truth  
**Language:** EN (`en`)

## Summary

- **Average crawl-block word count:** 295
- **Average word-count parity vs HY:** 124%
- **Pages with leakage flags:** 2
- **CMS issues affecting EN:** 0

## Worst parity pages

| URL | EN words | HY words | % | Class |
| --- | --- | --- | --- | --- |
| /spine-health-resources | 32 | 101 | 32 | 0–39% Thin/placeholder |
| /for-clinics-and-referrers | 33 | 103 | 32 | 0–39% Thin/placeholder |
| /media-and-expert-commentary | 33 | 82 | 40 | 40–69% Major content loss |
| /patient-consultation-guide | 354 | 466 | 76 | 70–89% Noticeable missing content |
| / | 105 | 125 | 84 | 70–89% Noticeable missing content |
| /about-doctor | 196 | 219 | 89 | 70–89% Noticeable missing content |
| /conditions/lower-back-pain | 364 | 399 | 91 | 90–99% Minor wording differences |
| /knowledge/lower-back-pain-causes | 333 | 365 | 91 | 90–99% Minor wording differences |
| /conditions/neck-pain-treatment | 356 | 386 | 92 | 90–99% Minor wording differences |
| /conditions/herniated-disc | 317 | 340 | 93 | 90–99% Minor wording differences |
| /conditions/leg-numbness | 324 | 345 | 94 | 90–99% Minor wording differences |
| /conditions/joint-pain | 301 | 320 | 94 | 90–99% Minor wording differences |
| /conditions/osteochondrosis | 298 | 316 | 94 | 90–99% Minor wording differences |
| /conditions/radiculopathy | 309 | 329 | 94 | 90–99% Minor wording differences |
| /conditions/posture-disorders | 314 | 334 | 94 | 90–99% Minor wording differences |

## Knowledge article source gaps (EN)

| Slug | Parity % | HY FAQ | EN FAQ | Missing fields |
| --- | --- | --- | --- | --- |
| back-pain-causes | 38 | 2 | 0 | symptoms, causes, whenToSeek, faq |
| neck-pain-causes | 38 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| herniated-disc-symptoms | 38 | 1 | 0 | symptoms, causes, whenToSeek, faq |
| posture-and-spine-health | 38 | 1 | 0 | symptoms, causes, whenToSeek, faq |
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
| back-pain-treatment | 71 | intro (short); servicesIntro (short) |
| neck-pain-treatment | 71 | intro (short); servicesIntro (short) |
| sciatica | 100 | — |
| herniated-disc | 100 | — |
| lower-back-pain | 100 | — |
| leg-numbness | 86 | h1 (short) |
| shoulder-pain | 100 | — |
| joint-pain | 86 | h1 (short) |
| scoliosis-pain | 100 | — |
| osteochondrosis | 100 | — |
| radiculopathy | 86 | h1 (short) |
| thoracic-back-pain | 100 | — |
| posture-disorders | 86 | h1 (short) |

## Authority pages

All authority routes use a **single repeated `bodyIntro`** in `authority-i18n.js` (EN). HY full body + FAQ not translated.

## Priority remediation for EN

1. **Critical:** Knowledge FAQ/symptom/cause arrays (41 articles)
2. **High:** Authority page full-body translation
3. **High:** CMS doctor bios and service descriptions
4. **Medium:** De-template condition symptom bullets
5. **Low:** Mixed-language H1 cleanup

*See `reports/content-parity-audit.md` for full cross-locale analysis.*
