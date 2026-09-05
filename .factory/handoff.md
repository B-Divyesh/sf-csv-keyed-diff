# CSV Keyed Diff — repair 5 handoff

## Release status: PASS

Implementation and deployed artifact: `a407ad7aeb4ec7194f6992f5ff0f74de165d6e59`
(`fix: complete claim coverage and result semantics`). The prior strict-review
documentation head was `9752fd258abd95b85e284364cc18c611e059a5cc`.

The static deployment wrapper uploaded the fresh `dist/` artifact to the
existing `sf-csv-keyed-diff` static app on 5 September 2026. Live HTML points
to `assets/index-mgvPs1p4.js` and `assets/index-aDf2Ukhd.css`; both bytes match
the local build. Verification documentation commit:
`77d4ba8daff4afd0845291ff4e8e992baaed3f87`; it is report-only and does not
change the deployed artifact.

## What this repair changed

- Completed the offline claim: a populated report now has a browser regression
  that downloads its CSV evidence after an offline reload.
- Added the bounded `pro-offline` claim. A cached valid license keeps JSON
  evidence available offline and triggers one license check when connectivity
  returns.
- Narrowed the refund wording to the product behavior it can prove. When the
  Sociobot license service returns `revoked`, the app removes the saved token
  and JSON export access. The merchant remains the named external dependency
  for payment and refund requests.
- Added a real level-three heading for every expanded change record. Existing
  row-group headings are now level four, so populated results have a coherent
  `h2 → h3 → h4` outline.
- Marked the GitHub source and Sociobot checkout destinations in both visible
  or accessible names. The revoked-license purchase link has the same cue.
- Added browser regressions for rendered screen-reader heading levels and for
  the announced external destinations. These assert the visible/accessible
  result and destination, not only source text.

## Review finding disposition

| Review 2 finding | Current disposition |
| --- | --- |
| Offline CSV export, cached Pro offline behavior, and revocation were unregistered claims | Fixed. `.factory/claims.json` now has 17 bounded claims, each with one tagged clean-sandbox outcome test. |
| Expanded results skipped from `h2` to `h4` | Fixed. Expanded records expose a level-three record heading before their level-four field-row group headings. |
| Source and checkout links lacked external-destination cues | Fixed. The source says GitHub and the checkout says Sociobot checkout; their accessible names and actual external origins are tested. |

All findings from review 1 and the earlier verification reports remain fixed:
demo isolation, one-column parsing, the designed HTTP 404, legal navigation,
plain first screen, response headers/caching, checkout return handling, upload
focus, mobile targets, and service-worker update reload behavior.

## Verification from a clean setup

Documented setup used Node.js 22.23.2 and `npm ci` (62 packages, zero reported
install vulnerabilities).

- `npm test` — 10/10 passed.
- `npm run lint` — passed.
- `npm run build` — passed; `dist/` was produced.
- `npm run test:e2e` — 30/30 passed locally, including the production-artifact
  service-worker update test.
- `npm run test:claims` — 17/17 passed.
- Every one of the 17 declared claim commands was also invoked separately;
  all passed. `pro-json` additionally ran `npm run test:live-checkout`.
- `npm run test:live-checkout` — passed: the enabled $19 USD one-time item
  redirects to hosted Dodo checkout.
- `npm audit --omit=dev` and `npm audit` — zero vulnerabilities.

Local build payloads are 48,480 bytes of initial JavaScript and 19,349 bytes
of CSS before gzip. They remain below the static-product budgets.

## Live verification

Fresh browser contexts against <https://csv-keyed-diff.sociobot.in> passed:

- All 17 claim tests passed against the HTTPS origin.
- 12/12 app browser checks passed against the HTTPS origin. The only excluded
  check is the intentionally local-only worker-update simulation endpoint;
  that same check passed in the full 30/30 local production-artifact suite.
- The factory URL verifier passed home, `/demo`, and `/privacy`: route titles,
  `lang=en`, exactly one `h1`, `main`, image alternatives, labelled buttons,
  and zero console/page errors.
- Fresh 1440 × 900 desktop and 390 × 844 phone sessions began at scroll zero.
  Each showed **Compare CSV exports by business key**, the implementation and
  operations audience, and **Try it with sample data** before scrolling. The
  action ended at 542 px on desktop and 482 px on phone.
- Both fresh sessions entered the sample in one click. They showed the
  persistent sample label and a realistic 2 changed / 1 added / 1 removed /
  1 ambiguous report; **Reset demo** returned **Sample data reset.** The live
  `@claim:demo-sandbox` regression separately proved that demo activity does
  not change a saved real comparison.
- The live `@claim:offline-reload` test downloaded a populated CSV while
  offline. Live Pro fixture checks proved cached offline JSON access,
  reconnection verification, and revoked-license removal without a purchase.
- Live `/`, `/demo`, `/privacy`, and `/terms` returned 200. An intentionally
  missing route returned a designed HTTP 404, which is expected. GitHub
  returned 200 and checkout returned the expected 303 redirect.
- Hashed JS/CSS use one-year immutable caching; `sw.js` is revalidated with
  `no-cache, no-store, must-revalidate`. CSP, Permissions-Policy, HSTS,
  `nosniff`, and strict-origin referrer policy are present.

Playwright axe integration found zero serious or critical findings on the
populated desktop result, phone demo, privacy, terms, and 404 flows. The
standalone Lighthouse run used the installed full Chromium with explicit
headless/no-sandbox flags; mobile scores were Performance 100, Accessibility
100, Best Practices 100, SEO 100 (FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0,
38 KiB transfer).

Evidence is in `/work/.evidence/repair-5-live/`. The required catalog copy is
also at `/work/.evidence/catalog-description.txt` and remains a 108-byte
verb-first description.

## Known limits and honest dependencies

- Files above 50 MiB are rejected before parsing.
- Duplicate keys require human review; the app never guesses a pairing.
- Key column names must match exactly. There are no database connectors or
  cloud sync, matching the researched scope.
- The free comparison flow does not send CSV contents or filenames off-origin.
  Optional Pro verification sends only a license token to the Sociobot API.
- No paid purchase or refund was completed in verification. Checkout
  registration was verified without payment; offline and revocation behavior
  uses recorded license-service responses. Sociobot and Dodo remain the
  external merchant/refund dependency described in the terms.

This is a static local-first PWA. Backend tenant isolation, restart
persistence, health, rate-limit/429, SQLite, and CLI/library/desktop consumer
checks do not apply.

## Verification 6 handoff — 2026-09-05 UTC

Independent QA reviewed implementation
`a407ad7aeb4ec7194f6992f5ff0f74de165d6e59` and documentation head
`da57e4f263ed383bc9f75f45de680899af331205`. Result: **PASS — zero findings
and zero untested public claims.** No product code changed during verification.

The verifier ran `npm ci`, unit tests (10/10), lint, build, the full E2E suite
(30/30), every one of the 17 declared claim commands separately, the combined
claim suite (17/17), checkout registration, and both audits. The 17 claim tests
also passed against the live HTTPS origin; 12 live-safe app checks passed, while
the production-artifact-only worker update check passed locally.

Fresh desktop and phone sessions stated the job, audience, and sample action
before scrolling. `/demo` showed the persistent isolated-sample label and the
expected 2 changed / 1 added / 1 removed / 1 duplicate / 1 unchanged report;
reset restored it. Offline export, demo isolation, invalid/boundary/recovery,
keyboard, focus, reduced motion, legal routes, links, privacy behavior, and the
designed HTTP 404 passed through the browser regressions. Live assets
byte-match the implementation build. Lighthouse scored 100 for Performance,
Accessibility, Best Practices, and SEO (LCP 1.1 s; CLS 0).

Known limits remain intentional product boundaries, not QA findings: CSV files
over 50 MiB are rejected; duplicate keys require human review; selected key
names must match exactly; no database connector or cloud sync is provided.
