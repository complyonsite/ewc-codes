# ComplyOnSite EWC codes

All **842 UK List of Waste (EWC) codes** with official descriptions, chapters,
sub-chapters, hazardous flags, WM3 entry types and mirror-entry links.
TypeScript declarations, npm-ready ESM, a standalone JSON file and a small Python
module. **Zero runtime dependencies**, no network calls.

Use it for code lookup, waste-software forms, official-text search and showing
mirror alternatives. Data snapshot: 7 October 2026; see [sources and derivation](SOURCES.md).

## Install

Package name: `complyonsite-ewc-codes`, version `1.0.0`.
The npm release is pending maintainer authentication; until it is published:

```sh
npm install https://github.com/complyonsite/ewc-codes/releases/download/v1.0.0/complyonsite-ewc-codes-1.0.0.tgz
```

After npm publication:

```sh
npm install complyonsite-ewc-codes
```

ESM only; CommonJS applications can use `await import('complyonsite-ewc-codes')`.

## TypeScript / JavaScript

```ts
import {
  entries, lookup, search, isHazardous, mirrorPartners,
  validateCodeFormat, referenceUrl,
} from 'complyonsite-ewc-codes';

entries.length;                         // 842
lookup('17 09 04')?.description;         // mixed construction and demolition wastes...
lookup('17-09-04')?.chapter.code;        // '17'
isHazardous('17 06 05');                 // true (asbestos-containing construction materials)
isHazardous('99 99 99');                 // undefined: not a listed code
mirrorPartners('17 09 04').map(e => e.display);
// ['17 09 01*', '17 09 02*', '17 09 03*']
search('asbestos');                      // official text / heading matches
search('17-09');                         // all four sub-chapter entries
validateCodeFormat('17 09 04');          // true
validateCodeFormat('99 99 99');          // true: syntax, not existence
lookup('99 99 99');                      // undefined
referenceUrl('170904');
// https://complyonsite.com/tools/ewc-code-finder?code=17-09-04
```

`normaliseCode()` also exports syntax normalisation to six digits, or `undefined`.
`chapters` and `subChapters` export the 20 and 111 headings. All published records
and their nested arrays/headings are frozen.

| Field | Meaning |
| --- | --- |
| `code` / `display` | Six digits / spaced code with the official asterisk |
| `description` / optional `note` | Official wording and any entry footnote |
| `hazardous` | Official asterisk flag for this code |
| `type` | `AH`, `AN`, `MH`, `MN`: absolute/mirror, hazardous/non-hazardous |
| `chapter` / `subChapter` | `{ code, display, title }` |
| `mirrorPartners` | Explicit opposite-side code links; zero, one or several |
| `subChapterPartners` | Broader inferred candidates, kept separate from explicit links |

Lookup accepts `170904`, `17 09 04`, `17-09-04`, `17.09.04` and an optional trailing
`*`. Separators must be consistent. A supplied asterisk does not override the
official flag: `isHazardous('170904*')` is false. Use `lookup()` to check existence.

Search is case-insensitive: exact code, numeric prefix, or all query words in the
official description and headings. Results stay in code order. Empty queries
return `[]`. No thesaurus synonyms or waste classification engine are included.

`mirrorPartners()` returns only explicit links; unknown, absolute and unpaired
codes return `[]`. Mirror choices can require composition, origin and hazardous
property assessment under WM3. This package describes entries; it cannot decide
which code applies to a particular waste. An asterisk flag is meaningful once
the appropriate code has been established.

## JSON

[Download `ewc-codes.json`](https://github.com/complyonsite/ewc-codes/blob/main/ewc-codes.json)
is a plain array of the same 842 records, suitable for any language.
It is included in the npm tarball and exported at
`complyonsite-ewc-codes/ewc-codes.json`. For example, in modern Node.js:

```js
import codes from 'complyonsite-ewc-codes/ewc-codes.json' with { type: 'json' };
console.log(codes.length); // 842
```

## Python

Copy `ewc_codes.py` and `ewc-codes.json` into the same directory on your Python
import path (or run Python from this checkout). Python 3.8+, standard library
only; no separate PyPI release.

```python
from ewc_codes import lookup, search, is_hazardous, mirror_partners

lookup('17 09 04')['type']                  # 'MN'
is_hazardous('17 06 05')                    # True
is_hazardous('999999')                      # None
[e['code'] for e in mirror_partners('170904')]
# ['170901', '170902', '170903']
search('asbestos')
```

Also exports `normalise_code`, `validate_code_format`, `reference_url`.
Record keys are identical to JSON/TypeScript. Returned records are independent
copies so caller edits do not affect later lookups.

## Human-readable reference

[ComplyOnSite EWC code finder](https://complyonsite.com/tools/ewc-code-finder)
provides the human-readable reference, with a page for every code, such as
[17 09 04](https://complyonsite.com/tools/ewc-code-finder?code=17-09-04).
Use `referenceUrl(code)` to link directly from your software.

## Licence

Code: [MIT](LICENSE). Source data: [Open Government Licence v3.0](DATA-LICENSE.md).

Contains public sector information licensed under the Open Government Licence v3.0.

Contains Natural Resources Wales information © Natural Resources Wales and Database Right. All rights reserved.

The List of Waste and WM3 are OGL-backed. **SEPA's Waste Thesaurus is excluded**:
its separate terms restrict commercial reuse and public redistribution.
No government logos or official endorsement are included. Preserve the data
attribution when redistributing it. See [SOURCES.md](SOURCES.md) for field-level provenance.

## Development and checks

```sh
npm ci
npm test                  # build/typecheck, data integrity and helper contracts
npm run test:python       # Python helpers against every JSON record
COMPLYONSITE_SOURCE=/path/to/ComplyOnSite npm run test:site
# Exact parity with every field in the site's own EWC lookup.
```

To update from a reviewed ComplyOnSite data change:

```sh
COMPLYONSITE_SOURCE=/path/to/ComplyOnSite npm run export:site
COMPLYONSITE_SOURCE=/path/to/ComplyOnSite npm run test:site
npm test
npm run test:python
```

Review the data diff and update SOURCES.md with the source commit, dates and
licence evidence before releasing. `npm run build` embeds the JSON in ESM and
emits declarations; no runtime JSON import support is needed for the main API.
