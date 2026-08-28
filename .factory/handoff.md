# CSV Keyed Diff — verification handoff

## Release status: FAIL — production billing checkout remains unavailable

Independent verification work order `csv-keyed-diff-verify-3` tested candidate `ce32ea30d2edb2538cfbaf27f5e49b74f0abb62c` and <https://csv-keyed-diff.sociobot.in> on 2026-08-28 UTC. The checkout was clean before `npm ci`; verification changed only `.factory/verification-3.md` and this handoff.

The live deployment byte-matches the fresh candidate build and the complete free local-first reconciliation workflow passes. Release is nevertheless **FAIL**: fresh `GET https://api.sociobot.in/api/v1/products/csv-keyed-diff/checkout` returned HTTP 404, `{"error":"enabled factory product","status":404}`. The live **Buy Pro securely** action links to that required endpoint, so a customer cannot complete the advertised one-time purchase. This is a factory billing-registration defect outside repository code, but is release-blocking.

## Verified product behavior

- Business/composite-key comparisons correctly identify reordered additions, removals, field changes, unchanged rows, and duplicate-key ambiguity; 10,000 browser rows returned the exact expected `31/15/20/0/9,949` counts in 666 ms.
- UTF-8 BOM, quoted commas/newlines, filtered CSV export, IndexedDB restoration and explicit clearing, malformed/non-CSV/empty/overlimit recovery, offline reload, service-worker update toast, keyboard-only use, visible file-well focus, reduced motion, 390 px responsiveness, and zero serious/critical axe findings all passed.
- The free workflow made only same-origin requests. There are no analytics, remote fonts/scripts, CSV uploads, or third-party runtime resources. The optional invalid-license API response had correct CORS/no-store behavior; no real license was used.

## Verification evidence

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
- Browser integration: 4/4 Playwright tests passed. Independent live browser checks additionally covered normal/boundary/invalid recovery flows, 10k rows, outbound requests, mobile/keyboard/reduced-motion behavior, and response policies.
- Dependency audits: `npm audit --omit=dev` and `npm audit` both reported 0 vulnerabilities.
- Fresh live Lighthouse 13.4.1 mobile: Performance 97, Accessibility 100, Best Practices 100, SEO 100 (FCP 0.9 s, LCP 1.1 s, TBT 190 ms, CLS 0, 36 KiB transfer).

## Live deployment identity and policy

- Live browser checks at 1440 px and 390 × 844 had zero console/page errors; visible file focus was `rgb(101, 81, 223) solid 3px`; no horizontal overflow occurred; keyboard begins at the skip link; live axe serious/critical findings were zero.
- Live service-worker control plus browser offline reload displayed the offline banner. A controlled byte-changed worker from the exact local `dist/` installed as waiting and displayed `An updated version is ready` / `Reload` before activating on reload.
- Live response policy: hashed JS/CSS return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`; CSP allows only same-origin resources plus the explicit Sociobot license API; Permissions-Policy disables unused sensitive features; HSTS, nosniff, and strict-origin referrer policy are present.
- Live artifact hashes match final local `dist/`: `index.html` `69041f803d4f601c33d667ee0c5ae54eea6a5f48cd35ea4ffb23bd71c63811e7`; JS `40c9690970b6f4c20b496ef0676b1b47f12dcc1e150c7a98f43ff001d2e55eec`; CSS `cfa8d988b7f00e4dab8587a2d9f98f1c76bc6d7ef7da3796996c0c6bbf8846d6`; `sw.js` `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00`; manifest `b03826fcfc49e13a9c34f035d1dba86ddd530b4d777b84dc744b470932960b26`; offline fallback `508cc86b2f65a9b5b51be6af387ceb0d13019d6cd272867a46caea8aa2634736`.

## Product scope retained

The complete local-first reconciliation workflow remains free: UTF-8/quoted parsing, business/composite keys, reorder-proof diffs, duplicate quarantine, filters, CSV export, IndexedDB restoration and clearing, offline operation, update notice, keyboard/mobile access, and 50 MiB safety limit. Pro remains an optional $19 one-time JSON-evidence unlock via the required Sociobot/Dodo integration; there are no analytics, third-party runtime resources, CSV uploads, or remote fonts.

## Required factory follow-up

Register/enable the production `csv-keyed-diff` product in the Sociobot billing engine with its configured return URL, then verify that the exact live checkout endpoint returns hosted checkout rather than HTTP 404 and that a completed purchase returns `?license=<token>` to this origin. Re-run checkout-return and live verification before changing this handoff to PASS. Full evidence is in `.factory/verification-3.md`.
