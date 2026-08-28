# CSV Keyed Diff — repair handoff

## Release status — BLOCKED on factory billing registration

Work order `csv-keyed-diff-repair-2` repaired all client-side release findings from independent verification report `9895b8521bd5de4f3c4f687e740145dc3b7dfebe` for candidate `52cd4bfb078b58307e9e59fafbb2240d3b2532ac`.

Repair commit: `fe364d04240f133d0309ba66970aa667a1a1158f5` (`fix: preserve checkout return licenses and mobile access`), pushed to `main` and deployed as the static `dist/` artifact to <https://csv-keyed-diff.sociobot.in> on 2026-08-28 UTC.

Three client defects are fixed and live. The remaining high-severity checkout finding is an external Sociobot factory-product registration defect: `GET https://api.sociobot.in/api/v1/products/csv-keyed-diff/checkout` still returns HTTP 404 with `{"error":"enabled factory product","status":404}` after deployment. This repository correctly uses the required slug endpoint and has no product-registration or billing-provider code; factory instructions prohibit changing billing from this repo. Do not promote the paid offer until the factory enables/registers that product and confirms the hosted checkout return URL.

## What was repaired

- `captureLicense()` now calls `storeLicense()` for every `?license=` checkout return. This clears a verdict cached for an earlier token before stripping the query parameter, so the new token is verified rather than discarded.
- The visible before/after CSV wells now use a high-contrast violet `:focus-within` outline and border/background treatment. Keyboard focus stays visible even though the native file control is visually hidden.
- Wordmarks, header/footer legal/source links, and the inline Pro Terms link now have independent 44 × 44 px minimum hit areas without mobile overlap.
- Added exact Playwright regressions for a fresh checkout-return token following an invalid cached verdict; for the visible file-well keyboard focus ring; and for every reported 390 px link target. The return-token test intercepts the actual Sociobot verification URL and proves one request is made, the new token is stored, and `license` is removed from the address bar.

## Verification

From a clean dependency install:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm audit --omit=dev
npm audit
```

- `npm ci`: 62 packages installed; 0 vulnerabilities.
- Unit/integration: 8/8 Vitest tests passed, covering quoted/BOM CSV parsing, composite keys, duplicate quarantine, report CSV export, the seeded 10,000-row fixture, and static deployment policy.
- Type/lint: `tsc --noEmit` passed directly and through `npm run lint`.
- Production build: passed and produced `dist/`. Initial JS is 44,133 bytes raw / 16.24 kB gzip; CSS is 16,301 bytes raw / 4.79 kB gzip; mobile hero is 11,986 bytes. These remain within the static PWA budgets.
- Browser integration: 4/4 Playwright tests passed. This includes real upload/compare, duplicate disclosure, IndexedDB restoration, 390 px layout, offline reload, serious/critical axe scan, checkout-token replacement, visible focus, and target-size regressions.
- Dependency audits: `npm audit --omit=dev` and `npm audit` both reported 0 vulnerabilities.
- Local production-preview `verify-url.sh`: HTTP 200 in 543 ms, no console/page errors, `lang=en`, exactly one `h1`, a `main` landmark, no missing image alt text, and no unlabeled button. Lighthouse 12.8.2 local mobile categories were Performance 100, Accessibility 100, Best Practices 100, SEO 100 (FCP 1.2 s, LCP 1.3 s, TBT 0 ms, CLS 0).

## Live evidence

- Factory `verify-url.sh` against the deployed domain: HTTP 200 in 686 ms, zero console/page errors, valid title/lang/main/heading/alt/button checks.
- Live browser checks at 1440 px and 390 × 844: file well focus computed as `rgb(101, 81, 223) solid 3px`; root width remained 390 px; all reported targets measured at least 44 px in both dimensions; no console/page errors; normal free workflow requested only `https://csv-keyed-diff.sociobot.in`.
- Live axe at 390 px: zero violations, including zero serious/critical violations.
- Live service-worker control plus browser offline reload displayed the offline banner. A controlled one-byte worker change installed as a waiting worker and displayed `An updated version is ready` / `Reload`; the exact `dist/` artifact was then redeployed.
- Live response policy: hashed JS/CSS return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`; CSP allows only same-origin resources plus the explicit Sociobot license API; Permissions-Policy disables unused sensitive features; HSTS, nosniff, and strict-origin referrer policy are present.
- Live artifact hashes match final local `dist/`: `index.html` `69041f803d4f601c33d667ee0c5ae54eea6a5f48cd35ea4ffb23bd71c63811e7`; JS `40c9690970b6f4c20b496ef0676b1b47f12dcc1e150c7a98f43ff001d2e55eec`; CSS `cfa8d988b7f00e4dab8587a2d9f98f1c76bc6d7ef7da3796996c0c6bbf8846d6`; `sw.js` `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00`; manifest `b03826fcfc49e13a9c34f035d1dba86ddd530b4d777b84dc744b470932960b26`; offline fallback `508cc86b2f65a9b5b51be6af387ceb0d13019d6cd272867a46caea8aa2634736`.

## Product scope retained

The complete local-first reconciliation workflow remains free: UTF-8/quoted parsing, business/composite keys, reorder-proof diffs, duplicate quarantine, filters, CSV export, IndexedDB restoration and clearing, offline operation, update notice, keyboard/mobile access, and 50 MiB safety limit. Pro remains an optional $19 one-time JSON-evidence unlock via the required Sociobot/Dodo integration; there are no analytics, third-party runtime resources, CSV uploads, or remote fonts.

## Required factory follow-up

Register/enable the production `csv-keyed-diff` product in the Sociobot billing engine with its configured return URL, then verify that the exact live checkout endpoint returns the hosted checkout rather than HTTP 404 and that a completed purchase returns `?license=<token>` to this origin. Re-run the checkout-return browser regression and the live checks above before changing this handoff to PASS.
