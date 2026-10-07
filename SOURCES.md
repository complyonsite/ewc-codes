# Sources and derivation

Data snapshot: 7 October 2026. Exported only from `src/features/ewc/lookup.ts`,
`data.ts`, `codes.ts` and `sources.ts` in the ComplyOnSite checkout at commit
`4bd8aa50b162ccc337062ea1a178b47e29418df1`. Those four files had no uncommitted
changes. No SEPA Waste Thesaurus, everyday-name mapping, site prose or site search
synonym data was copied.

| Fields | Source |
| --- | --- |
| Codes, descriptions, asterisks, footnotes and headings | [Commission Decision 2000/532/EC, Annex](https://www.legislation.gov.uk/eudn/2000/532/annex), retained UK version as at 31 December 2020 |
| AH / AN / MH / MN entry types | [WM3 Appendix A](https://www.gov.uk/government/publications/waste-classification-technical-guidance), 1st edition v1.2.GB, updated 28 September 2021 |
| Three chapter 17 mirror groups | [GOV.UK construction and demolition waste guide](https://www.gov.uk/guidance/construction-and-demolition-waste-how-to-classify) |
| 16 01 22 → 16 01 21* candidate | [GOV.UK vehicle and oily wastes guide](https://www.gov.uk/guidance/vehicle-and-oily-wastes-how-to-classify) |

Source checkout licence evidence: `docs/research/2026-09-29-ewc/sources-and-licences.md`.
The package uses OGL attribution; NRW's additional statement is included in DATA-LICENSE.md.

## Mirror links

`mirrorPartners` contains explicit relationships read from the List of Waste's
references (including ranges), plus the construction guide's three groups.
These are reciprocal links between MH and MN entries, not necessarily one-to-one
pairs. 302 entries have at least one explicit partner.

`subChapterPartners` is separate: where a mirror entry has no explicit partner,
the site's lookup supplies opposite-side, otherwise unpaired mirror entries in
the same sub-chapter. These are candidates inferred from the sub-chapter, not
pairs declared by WM3. For 16 01 22, the vehicle guide's 16 01 21* candidate comes
first; it is AH and the relationship is one-way. The `mirrorPartners()` helper
returns only explicit links. Consumers can inspect `subChapterPartners` separately.

343 entries have either kind of partner. Eight mirror entries have neither:
01 03 99, 01 04 99, 01 05 99, 10 02 15, 10 14 01*, 14 06 04*, 14 06 05*, 17 06 05*.
An empty partner list does not turn a mirror entry into an absolute entry.

Descriptions are verbatim. Chapter titles retain the source words in sentence
case. Code displays use standard spaces and attach the asterisk directly.
The footnote for 16 02 13* and 20 01 35* is retained in `note`.

## Verification

- All 842 records, including notes, headings and both partner fields, matched the
  site's lookup through `npm run test:site` on 7 October 2026.
- A fresh fetch of the [Annex XML](https://www.legislation.gov.uk/eudn/2000/532/annex/data.xml)
  on 7 October 2026 matched all 842 codes, descriptions and asterisk flags.
  Fetched XML SHA-256: `c6670e9703709dba022e2151780abf1aa8a398f92d1be89f684d52acd2224ba9`.
- WM3 entry types were preserved from the site's separately checked source data;
  this package release did not independently re-extract the WM3 PDF.
- Counts: AH 235, AN 256, MH 173, MN 178; 408 hazardous entries; 20 chapters;
  111 sub-chapters.

## Excluded source

[SEPA Waste Thesaurus](https://www.sepa.org.uk/media/162682/sepa-waste-thesaurus.pdf)
is not reused: it has no OGL statement, and [SEPA's data terms](https://beta.sepa.scot/about-sepa/access-to-information/guide-to-information/terms-and-conditions-of-use-of-data/)
restrict commercial use and public redistribution. No thesaurus names or derived
synonym mappings are shipped.
