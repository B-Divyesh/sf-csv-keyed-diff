# Review 2 — Compare CSV exports by business key

## Verdict: FAIL

**FAIL — 3 findings and 3 untested public claims.**

The implementation reviewed is `9093ee32c4cdfac3e4acb415b242fb87d5757f0d`.
The documentation base is `278c061197668ef71ca48fc589d9cffa525234c1`.
Only `.factory/handoff.md` and `.factory/verification-5.md` differ between
those commits, so the later documentation did not require a new product
image. The live JavaScript, CSS, and HTML match a fresh build byte-for-byte.

No product code was changed during this review.

## Job, audience, and first action

The job is to compare two customer CSV exports by a business key and explain
added, removed, and changed fields. The audience is an implementation or
operations worker who needs a reviewable reconciliation without a database or
spreadsheet workarounds.

Fresh 1440 × 900 desktop and 390 × 844 phone contexts started at scroll
position zero. Before scrolling, both showed **Compare CSV exports by business
key**, named implementation and operations teams, and showed **Try it with
sample data**. The action ended at 542 px on desktop and 482 px on phone. The
phone page had no horizontal overflow.

## Findings

| Severity | Finding | Evidence and required result |
| --- | --- | --- |
| Medium | The claims registry is incomplete. Three public promises have no exact registered outcome test. | The offline banner promises that CSV export works offline, but `@claim:offline-reload` only reloads the report and checks a count. The license state promises “Pro remains available offline. The app will check again later,” but no claim entry exercises that state or a later check. Terms promise that refunds are handled by the merchant of record and that a refund revokes the license, while the Pro claim covers only price, restore, JSON export, request privacy, and checkout redirect. Manual browser checks confirmed offline export and current cached/revoked front-end behavior, but the claims contract still requires each promise in `.factory/claims.json` with one exact clean-sandbox test. Add those tests or narrow the copy. |
| Low | Expanded result records skip heading level 3. | In the live populated demo, **Review changed records** is an `h2`, while expanded row groups such as **New row**, **Previous row**, **Before rows**, and **After rows** are `h4`. The accessibility snapshot exposes “heading New row, level 4” without a level-3 record heading. This conflicts with the required ordered outline. Give each record a real level-3 heading or change the visible row-group headings to the next logical level. |
| Low | External links do not identify themselves as external. | The live **Source** link goes to GitHub and **Buy Pro securely** goes through the Sociobot endpoint to hosted checkout. Neither visible text nor accessible name says it leaves the product site. Add a plain external cue to both links, then cover their accessible names. |

## Untested public claims

All 15 commands declared in `.factory/claims.json` passed separately. The
following three promises remain outside an exact claim command:

1. CSV evidence export still works after the app goes offline.
2. A cached Pro license remains available offline and is checked again later.
3. Refund handling revokes the Pro license.

The review manually downloaded `csv-keyed-diff-report.csv` after an offline
reload. It also observed the cached-offline status and a recorded `revoked`
response removing the token. Those checks establish current behavior; they do
not replace the required registry entries and repeatable claim commands.

## Demo and real workflow

- One click opened `/demo` with the persistent **Demo — sample data, nothing
  is saved** label and exactly 2 changed, 1 added, 1 removed, 1 ambiguous, and
  1 unchanged record.
- **Reset demo** restored those counts and reported **Sample data reset.**
- A live fresh-context isolation check changed and reset the sample, then
  returned to the previously saved real session. No real session or license
  value was changed by demo mode.
- Normal comparison, filtered CSV download, one-column files, composite keys,
  quoted UTF-8 data, duplicate-key quarantine, exact matching, restore, clear,
  invalid-file recovery, the exact 50 MiB boundary, and the one-byte-over
  rejection all passed against live.
- A fresh live 10,000-row reordered comparison completed in 118 ms and returned
  exactly 30 changed, 15 added, 20 removed, and 9,950 unchanged records.

## Accessibility, routes, privacy, and offline

- The factory URL verifier passed `/`, `/demo`, `/privacy`, and `/terms` with
  correct titles, `lang=en`, one `h1`, `main`, image alternatives, labelled
  buttons, and zero console or page errors.
- Full Playwright axe scans found zero automated violations on desktop home
  and demo, phone home and demo, privacy, terms, and the 404 page. The manual
  heading-outline finding above remains.
- Keyboard comparison, the first-tab skip link, visible 3 px upload focus,
  44 px phone targets, reduced motion, and phone overflow checks passed.
- `/privacy` and `/terms` returned 200 with route-specific titles and the
  shared header/footer. An unknown path deliberately returned HTTP 404 with
  **Page not found — CSV Keyed Diff** and working recovery links.
- The exercised free flow made same-origin requests only. The Pro fixture sent
  one token-only GET with no body or CSV filename. No analytics, tracking,
  remote font, or third-party runtime script was observed.
- A dedicated context reloaded the populated demo offline. The report and CSV
  download still worked. The exact-artifact service-worker update regression
  also passed in the local production server.
- Every discovered destination returned its expected status. The checkout
  command confirmed an enabled $19 USD item and redirect to hosted Dodo
  checkout. No purchase or refund was made.

Backend tenant isolation, server restart persistence, health, rate limits,
SQLite, and 429 behavior do not apply to this static local-first PWA. CLI,
library, and desktop consumer checks also do not apply. The brief does not
benefit from an AI step; exact local reconciliation is the intended job.

## Clean checkout and claim commands

A fresh clone at `278c061` used Node.js 22 with the documented Node.js 20+
requirement.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 62 packages installed, 0 vulnerabilities reported |
| `npm test` | Pass; 10/10 |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:e2e` | Pass; 26/26 |
| 15 declared claim commands, each invoked separately | Pass; 15/15 |
| Live-origin Playwright suite excluding the local-only update endpoint | Pass; 25/25 |
| `npm audit --omit=dev` and `npm audit` | Pass; 0 vulnerabilities |
| `npm run test:live-checkout` | Pass; $19 item and hosted checkout redirect |

The build contains 47,976 bytes of initial JavaScript, 19,229 bytes of CSS,
and an 11,986-byte mobile hero. Fresh mobile Lighthouse scored 100 for
Performance, Accessibility, Best Practices, and SEO, with 1.1 s LCP, 10 ms
TBT, 0 CLS, and 38 KiB transfer.

## Deployment identity and headers

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `055d1175864ccab6bdda90e6e0db9a76fc61692d3a2f6867e91b16519697dbb3` |
| `assets/index-D0ymRhQV.js` | `b2d6bf169f4cf0abec0f277701f807eb90d29b98420e9cd0c43d79b24f88af95` |
| `assets/index-BI3Sm7US.css` | `a9e96a7e679eafa02d87d9d3bc23e28624b74295daade73d8fde861b759deb96` |

The live and fresh-build hashes match. Live hashed assets use one-year
immutable caching. `sw.js` uses `no-cache, no-store, must-revalidate`. CSP,
Permissions-Policy, HSTS, strict referrer policy, and `nosniff` are present.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Hashed assets lacked immutable caching; CSP and Permissions-Policy were absent | Fixed; live headers passed. |
| Production checkout was unavailable | Fixed; the live checkout command passed. |
| A returned license could reuse an old verdict | Fixed; the browser regression passed. |
| Upload focus was invisible; phone links missed 44 px targets | Fixed; keyboard and target regressions passed. |
| The update action could strand its tab | Fixed; the exact-artifact reload regression passed. |
| Valid one-column CSV was rejected | Fixed; the live one-column outcome passed. |
| Demo sandbox, real 404, legal navigation, and plain first screen were missing | Fixed and exercised in fresh desktop and phone contexts. |
| The claims registry was absent and 16 claims were untested | The original claims were bounded and all 15 declared commands pass, but the three fresh gaps above keep the broader claims contract open. |
| “All future Pro refinements” was untestable | Removed. |

## Evidence

Review evidence is under `/work/.evidence/review-2/`, including command logs,
fresh-browser screenshots and JSON, live test output, all-axe output, headers,
asset hashes, the 10,000-row result, Lighthouse JSON, and the manual license and
offline checks.
