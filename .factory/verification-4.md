# Independent verification 4 — CSV Keyed Diff

## Verdict: FAIL

Candidate `f0a4a86af92864e05ce9638efd62e63de8576db4` was independently verified on 2026-08-28 UTC against <https://csv-keyed-diff.sociobot.in>. The checkout was retested from fresh evidence rather than inheriting the earlier deployment-only failure. The working tree was clean at the exact candidate before `npm ci`; no product code was changed.

The live deployment byte-matches the candidate build, the core keyed-diff workflow works, and production checkout now passes. Release acceptance nevertheless **FAILS** because the PWA's required in-app service-worker update action can strand the active tab in a reload that does not settle. A second, non-blocking parser defect rejects valid one-column CSV files.

## Defects

| Severity | Defect | Fresh evidence | Required resolution |
| --- | --- | --- | --- |
| **High — release blocker** | Clicking the PWA update toast's **Reload** action can hang the active tab during the worker handoff. | From a controlled HTTP server serving the exact fresh `dist/`, only the worker cache version was changed (`csv-keyed-diff-v3` to a byte-distinct QA version). `registration.update()` installed the worker and displayed **An updated version is ready**. Clicking **Reload** did not reach `DOMContentLoaded` within 5 seconds in the final instrumented run; earlier fresh repetitions timed out at 30 seconds and remained unevaluable until interrupted. A new page in the same browser context loaded successfully with only the new cache and an activated controller, proving install/activate completed while the initiating reload stalled. The handler posts `SKIP_WAITING` and immediately calls `location.reload()`, allowing the controlling worker to be replaced during its navigation fetch. | Post `SKIP_WAITING`, wait once for `navigator.serviceWorker.controllerchange`, then reload. Add a regression that clicks the actual toast action, requires the initiating page to settle, and verifies the new controller/cache. |
| **Medium** | A syntactically valid one-column CSV is rejected. | Live Chromium loaded `one-column.csv` containing `id\n1\n2\n`. The app returned: `CSV could not be read near row 1: Unable to auto-detect delimiting character; defaulted to ','`. `parseCsv` treats Papa Parse's delimiter auto-detection warning as fatal, so a legitimate key-only add/remove comparison cannot run. Multi-column files work; adding a dummy second column is a workaround. | Do not treat the delimiter auto-detection warning as fatal when a valid single-column shape exists; add parser and browser regressions. |

No critical data-integrity, privacy, accessibility, checkout, deployment-identity, or normal multi-column comparison defect was found.

## Clean checkout and repository gates

Environment: Node `22.23.2`, npm `10.9.8`, repository-pinned Playwright `1.58.2`.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 62 packages installed; 0 vulnerabilities reported. |
| `npm test` | PASS — 8/8 Vitest tests, including BOM/quoted input, composite keys, duplicate quarantine, filtered report generation, static deployment policy, and the seeded 10,000-row recall fixture. |
| `npm run typecheck` | PASS — `tsc --noEmit`. |
| `npm run lint` | PASS — repository lint alias runs the typecheck. |
| `npm run build` | PASS — exact Vite build plus postbuild; `dist/` produced. |
| `npm run test:e2e` | PASS — 4/4 Playwright tests. |
| `npm run test:live-checkout` | PASS — enabled catalog entry at $19 USD and HTTPS redirect to `checkout.dodopayments.com`. This closes the earlier deployment-only checkout failure. |
| `npm audit --omit=dev` / `npm audit` | PASS — 0 vulnerabilities in both scopes. |

The production build is within budget: initial JS `44,133` bytes raw / `16.24 kB` gzip, CSS `16,301` bytes raw / `4.79 kB` gzip, mobile hero WebP `11,986` bytes, desktop hero WebP `29,762` bytes, and no font payload. Fresh Lighthouse 13.4.1 mobile results were Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP `0.9 s`, LCP `1.1 s`, TBT `240 ms`, CLS `0`, total transfer `36 KiB`.

## Independent end-to-end exercise

Fresh live Chromium contexts covered normal, boundary, invalid-input, recovery, and ownership paths.

- A desktop comparison used UTF-8 BOM, quoted commas, an escaped quote, a quoted newline, reordered rows, composite `tenant + id` keys, and a duplicate group. It returned exactly `1 changed / 1 added / 1 removed / 1 ambiguous / 1 unchanged`. Expanded evidence showed `active → inactive`; ambiguous rows were quarantined with the promised human-pairing disclosure.
- Keyboard-only operation selected both key checkboxes with Space, ran comparison with Enter, opened record details with Enter, and changed export filters with Space. The filtered download retained a UTF-8 BOM and keyed columns, contained the changed field, and excluded unchecked added/removed/duplicate evidence.
- IndexedDB restored the files, keys, and report after reload. Offline reload retained the report and displayed the offline banner. Canceling **Clear local session** preserved state; confirming it removed the report and local comparison.
- Invalid and recovery coverage included wrong extension, empty input, duplicate headers, a row wider than its header, a file of 50 MiB + 1 byte, and schemas with no common header. Each produced an actionable status and valid input recovered. Header-only two-column CSVs produced a valid all-zero report.
- A 105-addition case initially rendered 100 records, labelled the remaining 5, and revealed all 105 on request.
- The researched 10,000-row expected-recall case passed in the repository suite with exactly `15 added / 20 removed / 30 changed / 9,950 unchanged` despite reorder.

## Accessibility, responsive behavior, and browser health

- Desktop and `390 × 844` mobile were checked and visually inspected. At 390 px the document/root/body did not overflow. Tested visible header, footer, purchase, restore, and legal targets were at least `44 × 44` CSS px.
- The skip link was the first Tab target. The native file control produced the designed solid `3px` focus treatment. All exercised custom controls worked from the keyboard.
- Axe found **0 serious/critical** findings on populated results, mobile home, `/privacy`, and `/terms`. Both legal routes had one `h1` and one `main`.
- With `prefers-reduced-motion: reduce`, animation and transition durations computed to `0.01 ms` and scroll behavior to `auto`.
- The factory `verify-url.sh` returned HTTP 200, a 1,060 ms load, zero console/page errors, `lang=en`, one `h1`, `main=true`, zero missing image alts, and zero unlabeled buttons. The broader browser exercise also had zero console errors, page errors, or online request failures.

## Privacy, PWA metadata, and response policy

- The entire free workflow made no cross-origin requests. Static inspection found no analytics, beacon, WebSocket, remote font, third-party runtime script, or CSV upload. The only client cross-origin `fetch` is the documented optional license verification request.
- A synthetic invalid-license request returned HTTP 200 with `{valid:false, reason:"invalid"}`, `Cache-Control: no-store`, and `Access-Control-Allow-Origin: https://csv-keyed-diff.sociobot.in`; no CSV content or filename was sent.
- Chromium parsed the live manifest with zero errors. It reports standalone display, the versioned start URL, matching `#11131a` theme/background colors, and four icons including 192, 512, and maskable variants.
- Offline reload passes, while the update-button defect above fails the separate mandatory update check.
- HTTP redirects to HTTPS. Live HTML includes HSTS, CSP, Permissions-Policy, `nosniff`, and strict-origin referrer policy. Hashed JS/CSS are `public, max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`; the manifest revalidates. Unknown app routes return the shell and missing assets return 404.

## Candidate/live identity

The fresh local production output and live bytes match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `69041f803d4f601c33d667ee0c5ae54eea6a5f48cd35ea4ffb23bd71c63811e7` |
| `assets/index-Di0EY9Vd.js` | `40c9690970b6f4c20b496ef0676b1b47f12dcc1e150c7a98f43ff001d2e55eec` |
| `assets/index-Cfrfj0IW.css` | `cfa8d988b7f00e4dab8587a2d9f98f1c76bc6d7ef7da3796996c0c6bbf8846d6` |
| `sw.js` | `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00` |
| `manifest.webmanifest` | `b03826fcfc49e13a9c34f035d1dba86ddd530b4d777b84dc744b470932960b26` |
| `offline.html` | `508cc86b2f65a9b5b51be6af387ceb0d13019d6cd272867a46caea8aa2634736` |

Package/consumer and backend concurrency/persistence/health checks do not apply to this static PWA.

## Release decision

Do not promote this candidate. Repair and regression-test the update-toast reload handoff, then address the valid one-column CSV rejection. Re-run offline/update verification against the repaired candidate. The earlier production checkout blocker is independently confirmed fixed.
