# Phase E — Depth Parity Report

**Date:** 2026-07-06

## Depth table

| URL | HY words | RU words | EN words | Before RU% | After RU% | After EN% | Δ RU |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /spine-specialist-yerevan | 518 | 779 | 805 | 38% | 150% | 155% | +112pp |
| /back-pain-treatment-yerevan | 430 | 638 | 702 | 41% | 148% | 163% | +107pp |
| /neck-pain-treatment-yerevan | 391 | 623 | 651 | 41% | 159% | 166% | +118pp |
| /sciatica-treatment-yerevan | 438 | 620 | 673 | 36% | 142% | 154% | +106pp |
| /herniated-disc-treatment-yerevan | 407 | 618 | 672 | 38% | 152% | 165% | +114pp |
| /orthopedic-consultation-yerevan | 433 | 697 | 703 | 40% | 161% | 162% | +121pp |

## Policy pages

| URL | HY words | RU words | RU/HY % |
| --- | --- | --- | --- |
| /editorial-policy | 501 | 522 | 104% |
| /medical-review-policy | 331 | 437 | 132% |

## Live crawl depth (corrected `seo-crawl-content` extraction)

| URL | HY words | RU words | EN words | RU/HY % | EN/HY % |
| --- | --- | --- | --- | --- | --- |
| /spine-specialist-yerevan | 586 | 946 | 981 | 161% | 167% |
| /back-pain-treatment-yerevan | 484 | 776 | 871 | 160% | 180% |
| /neck-pain-treatment-yerevan | 444 | 752 | 811 | 169% | 183% |
| /sciatica-treatment-yerevan | 485 | 747 | 840 | 154% | 173% |
| /herniated-disc-treatment-yerevan | 462 | 746 | 840 | 161% | 182% |
| /orthopedic-consultation-yerevan | 478 | 844 | 870 | 177% | 182% |
| /editorial-policy | 510 | 620 | 586 | 122% | 115% |
| /medical-review-policy | 341 | 531 | 508 | 156% | 149% |

Note: `content-parity-audit.js` undercounts authority pages because its crawl regex closes on the first nested `</section>` inside `bodyHtml`. Live pages serve full depth content.

## Targets

- Yerevan landings: ≥75% RU/EN vs HY — **PASS** (live: 154–177%)
- Policy pages: ≥80% — **PASS** (live: editorial 122%, medical 156%)
