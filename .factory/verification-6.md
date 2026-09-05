# Verification 6 — Compare CSV exports by business key

## Verdict: PASS

**PASS — zero findings and zero untested public claims.**

This independent verification reviewed implementation
`a407ad7aeb4ec7194f6992f5ff0f74de165d6e59`
(`fix: complete claim coverage and result semantics`) at
<https://csv-keyed-diff.sociobot.in> on 2026-09-05 UTC. The documentation
head is `da57e4f263ed383bc9f75f45de680899af331205`
(`docs: record repair 5 documentation sha`); it is report-only and does not
change the reviewed image. No product code was changed during this verification.

## Job, audience, and first action

The product compares two customer CSV exports by business key and explains
added, removed, and changed fields. It is for implementation and operations
workers who need a reviewable reconciliation without a database or spreadsheet
workarounds.

Fresh desktop (1440 × 900) and phone (390 × 844) browser contexts both started
at scroll position zero. Before scrolling, each showed **Compare CSV exports by
business key**, the implementation-and-operations audience, and **Try it with
sample data**. The action ended at 542 px on desktop and 482 px on phone. The
phone document had no horizontal overflow.

## Live product checks

- One click opened `/demo` with the persistent **Demo — sample data, nothing is
  saved** label and a populated report: 2 changed, 1 added, 1 removed, 1
  duplicate group, and 1 unchanged record. **Reset demo** restored the sample
  and announced **Sample data reset.**
- The full 17-test live claim suite passed. It includes demo isolation, normal
  comparison, UTF-8/quoted values, composite keys, row reordering, duplicate
  quarantine, filtered CSV download, real-session restore and clear, the 50 MiB
  boundary, free workflow, Pro fixture behavior, exact matching, one-column
  files, offline reload/export, reconnection, and revoked-license recovery.
- The 12 live-safe app checks passed. The actual update-toast reload check is
  intentionally local-only because it depends on the test worker endpoint; it
  passed in the full local 30-test E2E suite.
- `/privacy` and `/terms` returned 200 with route titles, one `h1`, one `main`,
  and the shared navigation. An unknown URL returned the designed page with
  HTTP 404, which is expected, and a working home link.
- Live desktop and phone checks had no console or page errors. Playwright axe
  found zero serious or critical violations on the populated demo in both
  viewports. Reduced-motion, keyboard/focus, labels, mobile targets, and the
  ordered populated result outline are covered by the passing browser suite.
- The factory URL checker passed `/`, `/demo`, `/privacy`, and `/terms`: each
  had a title, `lang=en`, exactly one `h1`, a main landmark, image alternatives,
  labelled buttons, and no console errors.
- The free demo flow made no cross-origin request under the privacy claim.
  Optional Pro fixture verification sends a token-only request to Sociobot; no
  CSV contents or filename were sent. No analytics, tracking pixels, remote
  fonts, or third-party runtime scripts were observed.

## Claims

All 17 commands from `.factory/claims.json` were invoked separately from the
clean checkout, and all passed. `pro-json` also ran the declared live checkout
command. The combined local claim command then passed 17/17, and the same 17
claim tests passed against the HTTPS origin.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | Pass | isolated `/demo` reset and real-session regression |
| `local-processing` | Pass | request and resource-origin regression |
| `offline-reload` | Pass | dedicated offline reload and CSV download |
| `csv-values` | Pass | quoted UTF-8 field rendering regression |
| `key-alignment` | Pass | composite-key result regression |
| `reorder-changes` | Pass | exact populated outcome counts |
| `duplicate-keys` | Pass | ambiguity count and exclusion regression |
| `csv-export` | Pass | filtered downloaded report regression |
| `session-restore` | Pass | real local refresh regression |
| `session-clear` | Pass | clear-and-reload regression |
| `file-limit` | Pass | exact 50 MiB and one-byte-over regression |
| `free-workflow` | Pass | no-license comparison and CSV download |
| `pro-json` | Pass | recorded token-only verification, JSON export, checkout registration |
| `pro-offline` | Pass | cached JSON export offline and one reconnect check |
| `pro-revocation` | Pass | recorded revocation removes token and JSON access |
| `exact-matching` | Pass | unequal similar identifiers remain add/remove |
| `one-column` | Pass | key-only add/remove/unchanged regression |

No visitor-facing capability promise found on the landing page, legal pages, or
README was left outside this register. There are zero untested public claims.

## Clean checkout and quality gates

Node 22.23.2 and npm 10.9.8 were used.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 62 packages installed, 0 install vulnerabilities |
| `npm test` | Pass; 10/10 |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:e2e` | Pass; 30/30 |
| Each of 17 declared claim commands | Pass |
| `npm run test:claims` | Pass; 17/17 |
| `npm run test:live-checkout` | Pass; enabled $19 USD item and hosted checkout redirect |
| `npm audit --omit=dev` and `npm audit` | Pass; 0 vulnerabilities |

The fresh build is 48,480 bytes of JavaScript and 19,349 bytes of CSS before
gzip. Lighthouse mobile against live scored Performance 100, Accessibility 100,
Best Practices 100, and SEO 100; LCP was 1.1 s and CLS was 0.

## Deployment identity and routes

Fresh `dist/` and live production bytes match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `642542628c99139c640bbfcd94a0fc12e8c3be148298eedacc70cfbf4bd7d0da` |
| `assets/index-aDf2Ukhd.css` | `2c5ce7ec35cc0be5670bae664ba803a44f89b3382335b49d63a081e9124ea3ea` |
| `assets/index-mgvPs1p4.js` | `40590696ca36c83e22243bea59fc9da46ab87c963ef62d0745dbc1f443c5b403` |

Live hashed JS/CSS use one-year immutable caching. `sw.js` has revalidation and
no-store headers. The live origin sends HSTS, `nosniff`, strict-origin referrer
policy, CSP including response-header `frame-ancestors`, and Permissions-Policy.
`robots.txt`, `sitemap.xml`, manifest, service worker, legal routes, and the
designed 404 all returned their expected result. GitHub returned 200; the
Sociobot checkout endpoint returned its expected HTTPS 303 redirect to Dodo.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Immutable asset caching, CSP, and Permissions-Policy missing | Fixed; live headers pass. |
| Checkout unavailable or returned token could reuse an old verdict | Fixed; checkout and return-token regressions pass. |
| File focus, mobile targets, and phone overflow | Fixed; keyboard and 390 px checks pass. |
| Update toast could leave its initiating tab unsettled | Fixed; actual reload regression passes locally. |
| Valid one-column CSV rejected | Fixed; key-only claim passes locally and live. |
| Missing demo, claims register, designed 404, legal navigation, and plain first screen | Fixed; each is exercised above. |
| Unbounded future-Pro promise | Removed. |
| Offline CSV export, cached Pro offline behavior, and revocation unregistered | Fixed; each has its own passing claim test. |
| Populated results skipped heading level three | Fixed; level-three record headings precede level-four detail groups. |
| GitHub and checkout links lacked external cues | Fixed; accessible names identify their external destination. |

This is a static local-first PWA. Backend tenant isolation, server restart
persistence, health, rate limits/429, SQLite, and CLI/library/desktop consumer
checks do not apply. Product limits are disclosed and tested: files over 50 MiB
are rejected, duplicate keys require review, and identity matching is exact.

Evidence is under `/work/.evidence/verify-6-live/` and
`/work/.evidence/verify-6-lighthouse.json`.
