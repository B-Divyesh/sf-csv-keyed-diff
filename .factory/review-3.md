# Review 3 — Compare CSV exports by business key

## Verdict: PASS

**PASS — zero findings and zero untested public claims.**

This strict review tested implementation
`a407ad7aeb4ec7194f6992f5ff0f74de165d6e59` at
<https://csv-keyed-diff.sociobot.in> on 5 September 2026 UTC. The documentation
base was `3fe276777279c76123a53792a3534756d6657d9c`; the commits after the
implementation only change reports. No product code changed during this review.

## Job, audience, and first action

The job is to compare two customer CSV exports by business key and explain
added, removed, and changed fields. The audience is an implementation or
operations worker who needs a reviewable reconciliation without a database or
spreadsheet workarounds.

Fresh 1440 × 900 desktop and 390 × 844 phone contexts started at scroll position
zero. Before scrolling, both showed **Compare CSV exports by business key**,
named implementation and operations teams, and showed **Try it with sample
data**. The action ended at 542 px on desktop and 482 px on phone. The phone
document had no horizontal overflow.

## Demo and real work

- One click opened `/demo` with the persistent **Demo — sample data, nothing is
  saved** label. The realistic report showed 2 changed, 1 added, 1 removed, 1
  duplicate-key group, and 1 unchanged record.
- **Reset demo** restored the sample and announced **Sample data reset.** The
  isolation claim changed and reset the demo, then returned to an existing real
  session and proved that its files, keys, and report were unchanged.
- Normal comparison, composite keys, reordered rows, quoted UTF-8 values,
  one-column files, duplicate-key quarantine, exact matching, filtered export,
  session restore, session clear, invalid-file recovery, the exact 50 MiB
  boundary, and one byte over the boundary passed against the live app.
- The seeded 10,000-row unit fixture returned exactly 30 changed, 15 added, 20
  removed, and 9,950 unchanged records.
- The free workflow made same-origin requests only. Recorded Pro verification
  sent a token-only GET with no CSV contents, filename, or request body. The app
  loaded no analytics, tracking pixel, remote font, or third-party runtime
  script.

## Claims

Every command in `.factory/claims.json` was run separately from the clean
checkout. All 17 passed. The combined claim suite also passed 17/17, and all 17
claim tests passed against the live HTTPS origin.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sandbox` | Pass | Demo reset preserved the saved real session |
| `local-processing` | Pass | Requests and loaded resources stayed on origin |
| `offline-reload` | Pass | Populated demo reloaded and exported CSV offline |
| `csv-values` | Pass | UTF-8, commas, quotes, and line breaks rendered intact |
| `key-alignment` | Pass | Composite key produced exact changed and unchanged counts |
| `reorder-changes` | Pass | Reordered sample produced every expected outcome |
| `duplicate-keys` | Pass | Duplicate rows were disclosed and excluded from pairing |
| `csv-export` | Pass | Selected filters controlled downloaded evidence rows |
| `session-restore` | Pass | A real local report returned after refresh |
| `session-clear` | Pass | Clear removed the real report after refresh |
| `file-limit` | Pass | 50 MiB accepted; 50 MiB plus one byte rejected |
| `free-workflow` | Pass | Comparison and CSV export worked without license or account |
| `pro-json` | Pass | $19 catalog, token restore, JSON export, and checkout passed |
| `pro-offline` | Pass | Cached JSON export worked offline and checked on reconnect |
| `pro-revocation` | Pass | Revocation removed the token and JSON access |
| `exact-matching` | Pass | Similar unequal keys remained an addition and removal |
| `one-column` | Pass | Key-only files produced added, removed, and unchanged rows |

The landing page, legal pages, README, and interface copy were cross-checked
against the register. No visitor-facing capability promise is unlisted or left
without its declared outcome test. There are zero untested public claims.

## Accessibility, mobile, offline, and routes

- The factory URL verifier passed `/`, `/demo`, `/privacy`, and `/terms`. Each
  returned 200 with its own title, `lang=en`, one `h1`, a main landmark, image
  alternatives, labelled buttons, and no console or page errors.
- Playwright axe scans found zero serious or critical violations on populated
  results, phone demo, legal pages, and the 404 page. The populated result
  outline follows `h2 → h3 → h4`.
- Keyboard checks covered the first-tab skip link, visible 3 px focus rings,
  file controls, key selection, comparison, record expansion, exports, and
  license restore. No trap was found. Visible phone links, buttons, and record
  controls met the 44 px target rule.
- At an effective 640 px reflow viewport, the page had no horizontal overflow
  and retained the demo reset, report, and export controls. Reduced motion
  changed scrolling to `auto` and visible transition duration to 0.01 ms.
- A dedicated live context reloaded the populated demo offline and downloaded
  its CSV report. The exact-artifact service-worker update test waited for the
  new controller, settled the initiating reload, and left only the new cache.
- `/privacy` and `/terms` use the shared header and footer. An unknown URL
  deliberately returned HTTP 404 with the designed recovery page and working
  home and demo links. This expected 404 is not a defect.
- Every discovered internal destination returned 200. GitHub returned 200.
  The Sociobot checkout returned the expected 303 redirect to hosted Dodo
  checkout. No payment was made.

## Clean checkout and quality gates

Node.js 22.23.2 and npm 10.9.8 were used after `npm ci`.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 62 packages installed, 0 vulnerabilities |
| `npm test` | Pass; 10/10 |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:e2e` | Pass; 30/30 |
| Each of 17 declared claim commands | Pass; 17/17 |
| `npm run test:claims` | Pass; 17/17 |
| Live-origin browser suite | Pass; 29/29 live-safe tests |
| `npm run test:live-checkout` | Pass; enabled $19 item and hosted redirect |
| `npm audit --omit=dev` and `npm audit` | Pass; 0 vulnerabilities |

The fresh build contains 48,479 bytes of initial JavaScript and 19,353 bytes
of CSS before gzip. The mobile hero is 11,986 bytes. Fresh live mobile
Lighthouse scored Performance 100, Accessibility 100, Best Practices 100, and
SEO 100. FCP was 1.0 s, LCP 1.2 s, TBT 90 ms, CLS 0, and transfer 38 KiB.

## Deployment identity and headers

Fresh build and live production bytes match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `642542628c99139c640bbfcd94a0fc12e8c3be148298eedacc70cfbf4bd7d0da` |
| `assets/index-aDf2Ukhd.css` | `2c5ce7ec35cc0be5670bae664ba803a44f89b3382335b49d63a081e9124ea3ea` |
| `assets/index-mgvPs1p4.js` | `40590696ca36c83e22243bea59fc9da46ab87c963ef62d0745dbc1f443c5b403` |

Hashed JS and CSS use one-year immutable caching. `sw.js` uses
`no-cache, no-store, must-revalidate`. The live origin sends HSTS, `nosniff`,
strict-origin referrer policy, CSP with header-only `frame-ancestors`, and
Permissions-Policy. The manifest, robots file, sitemap, icons, offline shell,
legal routes, and designed 404 are present.

## Earlier findings

| Earlier finding | Current disposition and proof |
| --- | --- |
| Hashed assets lacked immutable caching | Fixed; live assets use one-year immutable caching |
| CSP and Permissions-Policy were absent | Fixed; both live response headers passed |
| Production checkout returned 404 | Fixed; catalog and hosted checkout redirect passed |
| A returned license could reuse an old invalid verdict | Fixed; checkout-return regression verified the new token |
| File inputs had no visible keyboard focus | Fixed; visible 3 px file-well focus passed live |
| Mobile links missed 44 px targets | Fixed; 390 px target checks passed |
| Update reload could strand its tab | Fixed; actual initiating-page reload regression passed |
| Valid one-column CSV was rejected | Fixed; local and live key-only claim passed |
| One-click demo and isolated sample state were missing | Fixed; populated, reset, persistence, and isolation passed |
| Claims register was absent with 16 untested claims | Fixed; all 17 registered commands passed separately and live |
| Offline CSV export, cached Pro offline behavior, and revocation were not registered | Fixed; each now has its own passing claim test |
| Real 404 page was missing | Fixed; unknown live route returns the designed HTTP 404 |
| First screen did not plainly name the job and action | Fixed; fresh desktop and phone checks passed before scrolling |
| Legal routes lacked the shared header | Fixed; shared header and footer passed on both routes |
| “All future Pro refinements” was untestable | Fixed; the promise was removed |
| Expanded results skipped heading level three | Fixed; live outline regression passed |
| External links lacked destination cues | Fixed; GitHub and Sociobot accessible names passed |

This is a static local-first PWA. Backend tenant isolation, server restart
persistence, health, rate limits, 429 responses, and SQLite do not apply.
CLI, library, and desktop consumer checks also do not apply. An AI step would
conflict with the brief's exact local reconciliation and no-inference boundary;
there is no missed AI feature.

Review evidence is under `/work/.evidence/review-3/`.
