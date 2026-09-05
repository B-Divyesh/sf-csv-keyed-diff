# Review 1 — Compare two CSV exports by business key

## Result: FAIL

This review found **7 findings** and **16 untested public claims**. The product cannot pass while either number is non-zero.

Reviewed implementation: `fe364d04240f133d0309ba66970aa6671a1158f5` (`fix: preserve checkout return licenses and mobile access`). The live application at <https://csv-keyed-diff.sociobot.in> byte-matches its fresh production JavaScript build. The documentation-only head reviewed alongside it is `2bbd659c46968c26875e31ee92879dfeb1de73d8` (`docs: record fourth independent verification failure`). The later `e470ea9` adds a checkout test; it does not change the shipped product artifact.

## What the product is for

The job is to compare two customer CSV exports by a business key and explain added, removed, and changed fields. The audience is an implementation or operations worker who needs a reviewable reconciliation report without a database or spreadsheet workarounds.

Before scrolling, fresh desktop and 390 px phone sessions showed the headline “Find the record. Explain the change.”, a description of keyed CSV comparison, and **Compare two CSVs**. The first actual task action is to supply the older CSV, then the newer CSV. There is no **Try it with sample data** action, no sample result, and no description of what a primary action will show.

## Findings

| Severity | Finding | Evidence and required result |
| --- | --- | --- |
| High | The required one-click demo sandbox is absent. | Live `/` contains no sample-data action or sample label. Live `/demo` returns the normal landing page with the normal title and no sample text or banner. There is no `.factory/demo.md`, sample fixture, `demo:` storage namespace, **Reset demo**, or **Start for real** action. Add a direct `/demo` route that opens a realistic populated comparison, labels it “Demo — sample data, nothing is saved”, keeps it isolated from real IndexedDB data, and documents the reset and namespace. |
| High | The required claims register is absent, leaving all identified public claims untested under the claims contract. | `.factory/claims.json` does not exist and the repository has no `@claim:` test tags. The existing tests are useful regression tests but are not one clean demo-entry test per public claim. Add the registry and one tagged sandbox test for every claim, or remove claims that cannot be tested. The 16 untested claims are listed below. |
| Medium | Valid one-column CSV files are rejected. | Fresh live Chromium selecting `one.csv` with `id\n1\n2\n` displayed: “CSV could not be read near row 1: Unable to auto-detect delimiting character; defaulted to ','”. A key-only export is valid and should support add/remove reconciliation. Handle Papa Parse's one-column delimiter warning as a valid shape and add unit and browser regressions. |
| Medium | There is no real 404 page. | Fresh live `GET /404` returned HTTP 200 and rendered the home page, with the home title and headline. The required site structure calls for a designed 404 route with a way back; a missing route must not silently look like a successful home request. Ship `/404.html` and configure the static host response override, then cover it in the sitemap/routing review as appropriate. |
| Low | The first screen does not meet the plain-words first-screen contract. | The headline does not name CSV comparison or the intended worker, and “Find the record. Explain the change.” is not a clear job statement for a cold visitor. The primary action is an anchor to a file form, not the required one-click sample, and gives no adjacent explanation of the result. Replace it with a concise job headline, audience sentence, and the sample action after the demo exists. |
| Low | Privacy and terms do not use the required consistent site header. | Fresh `/privacy` and `/terms` each had one `h1`, one `main`, and the correct route title, but `header nav` was absent on both pages while it is present on home. Keep the wordmark, primary navigation, skip link, and footer structure consistent across routes. |
| Low | The public promise “All future Pro refinements” cannot be verified. | The live Pro panel promises future unspecified work. It has no bounded observable outcome, price entitlement test, or claim entry. Remove this promise or replace it with a defined, testable entitlement. |

## Untested public claims

The following 16 distinct visitor-facing claims appear on the live page, legal copy, or README but have no required claims entry and no tagged clean-demo test:

1. Files stay on the device / are processed only in the browser.
2. The product works offline after the first visit.
3. UTF-8 CSV is supported.
4. Quoted commas, quotes, and line breaks are supported.
5. Rows can be aligned by a selected single or composite business key.
6. Reordered rows still produce added, removed, and field-level changes.
7. Duplicate keys are disclosed and excluded from automatic pairing.
8. The filtered report exports as CSV.
9. The local session restores after a refresh.
10. A local session can be erased with **Clear local session**.
11. Files at or below the stated 50 MB browser limit are accepted and larger files are rejected.
12. The complete comparison and CSV-report workflow is free.
13. Pro is a $19 one-time, one-user purchase and enables JSON evidence export.
14. No CSV upload, analytics, tracking pixel, third-party runtime script, or remote font is used.
15. The app makes no sensitive-data inference or fuzzy matching.
16. All future Pro refinements are included.

Some existing unit, Playwright, and live-checkout checks incidentally exercise parts of this list. They do not meet the required claim format because there is no `claims.json`, no `@claim:<id>` mapping, and no clean `/demo` entry point. Item 16 is not currently a testable product promise.

## Checks that passed

From a clean working tree, `npm ci`, `npm test` (8/8), `npm run lint`, `npm run build`, `npm run test:e2e` (4/4), and `npm run test:live-checkout` all passed. `npm audit --omit=dev` and `npm audit` reported zero vulnerabilities. `dist/` was produced. Initial JavaScript was 44,133 bytes raw / 16.24 kB gzip; CSS was 16,301 bytes raw / 4.79 kB gzip.

Fresh desktop live exercise loaded a before/after pair containing one changed record, one added record, one removed record, and one duplicate key. The UI reported exactly `1 Changed / 1 Added / 1 Removed / 1 Ambiguous / 0 Unchanged`; it disclosed the human-pairing rule, exported `csv-keyed-diff-report.csv` (239 bytes), and made no free-flow cross-origin request. Browser console and page errors were zero.

Fresh 390 × 844 phone exercise started at scroll position zero with the headline, description, and primary action fully visible. It had no horizontal overflow. The repository keyboard/focus and 44 px mobile-target regression checks passed. The skip link, labels, landmarks, titles, `lang=en`, one `h1`, and `main` were present on the checked routes. Reduced motion computed `scroll-behavior: auto` and 0.01 ms animation/transition durations.

`/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTP 200, 740 ms network-idle load, zero console errors, title, `lang`, one `h1`, `main`, image alt text, and labeled buttons. The standalone `npx @axe-core/cli` could not launch because this container has no Chrome binary for Selenium; the repository-pinned Playwright axe integration was used instead and found zero serious or critical violations on populated desktop results and fresh phone home.

After service-worker control, setting the fresh live browser context offline and reloading returned the cached shell with the offline banner and no console errors. A controlled server of the exact fresh `dist/` artifact changed only the service-worker cache version. It displayed the update toast; clicking **Reload** settled the initiating page and left only the new cache (`csv-keyed-diff-review-update-2`). This recheck does not reproduce verification 4's update-reload defect.

Live `/privacy` and `/terms` returned 200 with correct route titles and one `h1`; the checkout test confirmed the enabled $19 catalog item and redirect to hosted Dodo checkout. HTTPS, HSTS, `nosniff`, strict-origin referrer policy, CSP, Permissions-Policy, immutable hashed JS/CSS caching, and revalidatable service worker headers were present.

## Earlier review findings

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Verification 1: hashed assets lacked immutable caching. | Fixed. Live hashed JS/CSS use `Cache-Control: public, max-age=31536000, immutable`. |
| Verification 1: CSP and Permissions-Policy were missing. | Fixed. Both response headers are live and match the static configuration. |
| Verification 2 and 3: production checkout was unavailable. | Fixed. `npm run test:live-checkout` passed and confirmed hosted checkout redirect. |
| Verification 2: a checkout-return token could be replaced by an old cached verdict. | Fixed. The repository checkout-return regression passed. |
| Verification 2: file wells had invisible keyboard focus. | Fixed. The repository focus regression passed. |
| Verification 2: mobile links missed 44 px targets. | Fixed. The repository target regression passed at 390 px. |
| Verification 4: update-toast reload could leave the active tab unsettled. | Not reproduced. The fresh controlled exact-artifact update test completed the actual reload and activated only the changed cache. |
| Verification 4: one-column CSV is rejected. | Still open; reproduced live and recorded above. |

Backend tenant, persistence/restart, health, rate-limit, and 429 checks do not apply to this static PWA. CLI/library/desktop clean-consumer checks do not apply.

## Required next work

Build the demo sandbox and its claim tests first. Then repair one-column parsing, add the true 404 route and consistent legal header, remove or bound the future-refinements promise, and rerun this review from `/demo` in fresh desktop and phone contexts.
