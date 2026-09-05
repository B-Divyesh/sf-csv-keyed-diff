# CSV Keyed Diff — repair 4 handoff

## Release status: PASS

Repair 4 resolved all seven findings from `.factory/review-1.md` and replaced the sixteen untested claims with fifteen bounded, registered claims. The untestable “All future Pro refinements” promise was removed instead of being renamed.

Product implementation and deployed source commit: `9093ee32c4cdfac3e4acb415b242fb87d5757f0d`.

Claims and regression commit used for the deployment: `fe4aa073e013c7660a054a86a8ba7dc39d77abed`.

Live-verification configuration commit: `d9629b880458c2f9c294bb36e658a30e148a84cf`. The final handoff commit is report-only and does not change the deployed artifact.

The artifact built at `9093ee3` was deployed to <https://csv-keyed-diff.sociobot.in> on 5 September 2026. Live JavaScript and CSS hashes match the local build.

## What changed

- Added `/demo` as a one-click, populated comparison with realistic customer data.
- Kept demo state in memory under the documented `demo:memory` namespace.
- Added the persistent **Demo — sample data, nothing is saved** banner.
- Added **Reset demo** and **Start for real** without reading or writing real session or license storage.
- Replaced the first screen with the direct job title **Compare CSV exports by business key**.
- Named implementation and operations teams, explained the sample result, and kept three short facts above the fold.
- Allowed valid one-column CSV files while preserving malformed-row and duplicate-header errors.
- Added a designed `/404.html`; unknown live paths now return HTTP 404 instead of the home page.
- Added the standard header navigation to privacy and terms.
- Removed the unbounded future-Pro promise.
- Added route metadata, canonical and social metadata, an Apple touch icon, and a 1200 × 630 derived social image.
- Changed service-worker update handling to wait for `controllerchange` before reloading.
- Added a production-like static test server that exercises the real 404 response and cache/security policy.
- Refined the landing page into a compact editorial workflow: a restrained hero, faded reconciliation artwork with colored row connectors, and an overlapping warm workbench.
- Enlarged and centered the three workflow markers, changed file inputs to dashed upload wells, tightened result density, and added colored record side rails.
- Kept the existing header, dark ink-and-paper palette, serif display type, plain wording, and responsive phone stacking.

## Finding disposition

| Review finding | Disposition |
| --- | --- |
| Missing demo sandbox | Fixed and covered by `@claim:demo-sandbox`; live `/demo` opens directly on populated results. |
| Missing claims registry and tests | Fixed with `.factory/claims.json` and one unique tagged outcome test for each retained claim. |
| One-column CSV rejection | Fixed by accepting Papa Parse's delimiter warning only for true one-column data; unit and browser checks pass. |
| Missing real 404 | Fixed with a static response override; live unknown paths return HTTP 404 and the designed recovery page. |
| Unclear first screen | Fixed; job, audience, sample action, next result, and three facts fit in the first 390 × 844 viewport. |
| Legal pages lacked standard navigation | Fixed; privacy and terms use the shared header, navigation, skip link, and footer. |
| Untestable future-Pro promise | Removed. |

Earlier cache headers, CSP, checkout registration, checkout-return token handling, file-input focus, mobile targets, and service-worker update behavior remain fixed. The update action now has a controlled browser regression that installs a changed worker, clicks the real action, waits for the initiating page to reload, and checks the new cache.

## Claims and product verification

Every command in `.factory/claims.json` was run separately from the documented clean setup. All fifteen passed. The Pro command also passed `npm run test:live-checkout`, confirming the enabled $19 USD item and redirect to hosted Dodo checkout.

The full local gates passed:

- `npm ci` — 62 packages installed; zero reported vulnerabilities.
- `npm test` — 10/10 passed.
- `npm run lint` — passed.
- `npm run build` — passed and produced `dist/`.
- `npm run test:e2e` — 26/26 passed.
- `npm run test:claims` — 15/15 passed.
- `npm run test:live-checkout` — passed.
- `npm audit --omit=dev` and `npm audit` — zero vulnerabilities.

Browser outcomes include the realistic demo, custom CSV input, UTF-8 and quoted cells, single and composite keys, reordered rows, all result types, duplicate quarantine, filtered CSV output, JSON output with a recorded valid license response, exact 50 MiB acceptance, oversized rejection, one-column input, restore, clear, invalid input recovery, keyboard use, and reduced motion.

The privacy claim records every request during a marked CSV comparison. It observed same-origin requests only and no private value in a URL. The Pro fixture observed one token-only GET with no body or filename.

Offline verification uses its own fresh browser context. The populated demo reloaded while offline with the banner and exact result counts. The service-worker update test also passed.

Playwright axe found no serious or critical issue on populated results, the phone demo, legal routes, or the 404 page. The factory URL verifier reported zero console or page errors on live home, demo, and privacy routes.

## Live and performance evidence

Fresh live browser contexts passed all 15 claim tests. Separate fresh phone checks confirmed the first-screen job, audience, sample action, no horizontal overflow, and demo results in the first viewport.

Live mobile Lighthouse 13.0.1 scores:

- Performance: 100
- Accessibility: 100
- Best practices: 100
- SEO: 100
- FCP: 0.9 s
- LCP: 1.1 s
- TBT: 0 ms
- CLS: 0
- Transfer: 36 KiB

Build payloads are 47,976 bytes of initial JavaScript and 19,229 bytes of CSS. The mobile hero is 11,986 bytes. These are below the product budgets.

Live routing and response checks:

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200.
- Unknown page: HTTP 404 with `Page not found — CSV Keyed Diff`.
- Hashed JavaScript and CSS: one-year immutable cache.
- `sw.js`: no-cache/no-store/must-revalidate.
- CSP, Permissions-Policy, HSTS, referrer policy, and `nosniff`: present.

Evidence is under `/work/.evidence/`, including claim logs, live route checks, verifier screenshots and JSON, Lighthouse JSON, and the copied catalog description.

The final design release was also checked cold on live home and demo routes. Both returned 200 with zero page or console errors; fresh desktop and 390 px phone browser tests passed the first-screen and one-click sample paths.

## Known limits

- Files above 50 MiB are rejected before parsing.
- Duplicate keys require human review; the app never invents a pairing.
- Key column names must match exactly.
- The app has no database connectors or cloud sync, matching the brief.
- No paid purchase or refund was completed. The authorised check created only an unpaid checkout session; license behavior used recorded API responses.
- The work order referenced `/work/.evidence/qa-report.md` and `qa-result.json`, but those input files were absent when this repair started. The committed review history was used instead.

This is a static PWA. Backend tenant isolation, server restart persistence, health, 429 handling, and SQLite checks do not apply. CLI, library, and desktop consumer checks also do not apply.

## Verification 5 — independent release confirmation

**PASS on 2026-09-05 UTC: zero findings and zero untested claims.**

The implementation reviewed and deployed is
`9093ee32c4cdfac3e4acb415b242fb87d5757f0d`; the verification documentation
head is `8cc88bd70ab4ace2da36554f5d36b98225ad1d79` (report-only). The live
JavaScript, CSS, and HTML matched a fresh build byte-for-byte.

Fresh desktop and phone sessions confirmed the job, audience, and one-click
sample action before scrolling. The populated demo carried its persistent
sample label, reset to its original counts, and did not alter a previously
saved real comparison. Normal, invalid, recovery, exact-limit, one-column, and
10,000-row reordered CSV paths passed on live. Offline demo reload, legal
routes, designed 404, links, keyboard focus, reduced motion, privacy, and
accessibility all passed.

Verification gates:

- `npm ci`, `npm test` (10/10), `npm run lint`, and `npm run build` passed.
- `npm run test:e2e` passed 26/26, including the exact-artifact service-worker
  update regression.
- Every one of the 15 commands declared in `.factory/claims.json` was run
  separately and passed; no public claim remains untested.
- `npm run test:live-checkout` passed for the enabled $19 USD catalog item and
  hosted checkout redirect. `npm audit --omit=dev` and `npm audit` found zero
  vulnerabilities.
- Live worker URL checks and Playwright axe scans reported zero browser errors
  and zero serious/critical accessibility violations. Lighthouse mobile scored
  99 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO (1.7 s
  LCP, CLS 0, 38 KiB transfer).

The full independent report is `.factory/verification-5.md`; copied runtime
evidence is under `/work/.evidence/`.
