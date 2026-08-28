# CSV Keyed Diff — repair handoff

## Release status — PASS

Repair work order `csv-keyed-diff-repair-1` resolved every release-blocking finding in the independent verification report at commit `37122392e5f3be4b61646cb07fafe1430aa105c3`, for candidate `50bdc8f13c4a5204a311335d58be023fcce7a811`.

Repair commit: `8c064e2a751ad3045d6d6dfcafd1f71103a9848e` (`fix: cache hashed static assets immutably`), pushed to `main` and deployed as the static `dist/` artifact to <https://csv-keyed-diff.sociobot.in> on 2026-08-28 UTC.

## What was repaired

- Added `public/staticwebapp.config.json`, copied into `dist/` by Vite, so Azure Static Web Apps serves Vite’s content-hashed `/assets/*.js` and `/assets/*.css` with `Cache-Control: public, max-age=31536000, immutable`.
- Kept `sw.js` deliberately revalidatable with `Cache-Control: no-cache, no-store, must-revalidate`; the manifest is also revalidated, preserving PWA update detection.
- Preserved the existing SPA fallback exclusions for assets and direct static files.
- Closed the verifier’s low-severity hardening observation with a restrictive CSP (same-origin app resources plus the explicit Sociobot license API) and a Permissions-Policy that disables unused sensitive capabilities.
- Added exact regression coverage in `tests/deployment.test.ts` for immutable JS/CSS, worker cache behavior, CSP/Permissions-Policy, and SPA fallback rules. `npm run lint` now explicitly runs the repository’s TypeScript type gate.

## Live response evidence

Fresh `HEAD` checks after deployment returned:

- `/assets/index-U-sXWPMz.js`: `Cache-Control: public, max-age=31536000, immutable`
- `/assets/index-Ckzq6nlQ.css`: `Cache-Control: public, max-age=31536000, immutable`
- `/sw.js`: `Cache-Control: no-cache, no-store, must-revalidate`
- `/manifest.webmanifest`: `Cache-Control: no-cache, must-revalidate`
- JS, CSS, worker, and manifest all include the configured CSP and Permissions-Policy.

The live SHA-256 bytes exactly match the deployed build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `6d23ad532062836604b6340a12c73a8f311302b6efafadada3a831ebf3df` |
| `assets/index-U-sXWPMz.js` | `ca05ac6b065336fcc393e74989cbff94dd3fbb59de37ad552c85d428f0840789` |
| `assets/index-Ckzq6nlQ.css` | `eccdf39fc3d43c8147b35338e34c375249db8f8a444565488deafcdd13d07e88` |
| `sw.js` | `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00` |

## Verification

From a clean dependency install, all gates passed:

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
npm audit --omit=dev
npm audit
```

- `npm ci`: 63 packages audited; 0 vulnerabilities.
- Unit/integration: 8/8 passed. This includes CSV parsing, composite key comparison, duplicate-key quarantine, CSV report export, the seeded 10,000-row fixture, and the new static deployment-policy regressions.
- Type/lint: `tsc --noEmit` passed via `npm run lint`.
- Production build: passed with `dist/index.html` and `dist/staticwebapp.config.json`. JS is 44,161 bytes / 16,148 bytes gzip; CSS is 15,941 bytes / 4,742 bytes gzip; mobile hero is 11,986 bytes. All remain within the static PWA budgets.
- Playwright local production preview: 2/2 passed, covering real uploads and comparison, duplicate disclosure, axe serious/critical scan, IndexedDB restoration, offline reload, legal routes, and 390×844 overflow.
- Fresh live browser exercise at 1440px and 390×844: visible keyboard skip link, real comparison and saved report, no 390px horizontal overflow, zero axe serious/critical violations, service-worker-controlled offline reload, and zero page/console errors.
- PWA update: an isolated production-artifact server served a byte-changed worker after initial control; `registration.update()` installed it as waiting and displayed the in-app update toast.
- Factory `verify-url.sh` against the live domain: HTTP 200, no console/page errors, `lang=en`, exactly one `h1`, `main` present, no missing image alt text, and no unlabeled buttons.
- Lighthouse 12.8.2, fresh live mobile audit: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 20 ms.
- Privacy/response policy: normal comparison sent no CSV data off-device; live checks found only same-origin app assets during the free workflow. The sole permitted external destination remains the optional Sociobot license API, explicitly allowed by CSP and documented in Privacy.

## Product scope retained

- Complete local-first CSV reconciliation: UTF-8/quoted parsing, one or composite business keys, reorder-proof adds/removes/field diffs, duplicate-key quarantine, filters, CSV export, and explicit errors/empty states.
- IndexedDB recovery, local-session clearing, PWA install/offline behavior, update notice, 50 MB safety limit, pagination, keyboard access, and 390px layout.
- Optional $19 Sociobot/Dodo one-time Pro unlock for JSON evidence export; free comparison and CSV export remain ungated.
- `/privacy`, `/terms`, MIT license, no analytics, no remote fonts/scripts, and generated-asset provenance remain unchanged in `.factory/design.md`.

## Known limits and next steps

- Browser memory is the practical constraint; files are capped at 50 MB and records render in batches of 100.
- Header names must match exactly for key selection. Normalization, fuzzy identity, connectors, and cleansing are intentionally out of scope.
- Duplicate-key groups require human reconciliation and are intentionally never auto-paired.
- The factory must register the Sociobot billing product before production checkout can sell licenses. No product ID or payment-provider integration is embedded here.
- For substantially larger future workloads, move parsing/comparison into a Web Worker and consider OPFS streaming without changing the report contract.
