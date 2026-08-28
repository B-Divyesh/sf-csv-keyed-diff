# Independent verification 2 — CSV Keyed Diff

## Verdict

**FAIL** for candidate `52cd4bfb078b58307e9e59fafbb2240d3b2532ac` at <https://csv-keyed-diff.sociobot.in>, tested 2026-08-28 UTC.

The free reconciliation workflow is accurate, private, fast, offline-capable, and byte-for-byte deployed from the candidate build. The earlier immutable-cache and response-hardening defect is fixed. Release acceptance still fails because the production checkout is unavailable, license replacement can discard a newly returned token, the primary file inputs have no visible keyboard focus, and several mobile links miss the required 44 px target size.

The checkout was clean and exactly at the candidate before `npm ci`. Product code was not changed.

## Defects

| Severity | Defect | Fresh evidence and expected resolution |
| --- | --- | --- |
| **High** | The advertised **Buy Pro securely** action is dead in production. | The link correctly targets `https://api.sociobot.in/api/v1/products/csv-keyed-diff/checkout`, but both `HEAD` and `GET` returned HTTP 404 with `{"error":"enabled factory product","status":404}`. Register/enable the production factory product and confirm the live link reaches hosted checkout and returns to this origin with a license. The complete free workflow remains usable. |
| **Medium** | A new checkout-return license is discarded when a recent invalid verdict for an older token is cached. | Starting with `sb_license_verdict:csv-keyed-diff={valid:false,reason:"invalid",checkedAt:Date.now()}`, navigation to `/?license=new-paid-token` stripped the URL but made **no** verify request, removed the new token and showed “License no longer active (invalid).” `captureLicense()` stores the new token without clearing the old verdict. Clear the verdict whenever a query-string license is captured, then verify the new token. Manual paste/restore is a workaround because that path clears the verdict. |
| **Medium** | The two primary CSV file inputs have no visible keyboard focus. | Focusing `#file-before` or `#file-after` places focus on a `1×1` CSS-pixel input with `opacity: 0`; its 3 px outline is therefore invisible, while the visible `.file-well` label computes `outline: none`. Add a designed `:focus-within` treatment to the visible file well and recheck keyboard-only upload. |
| **Low** | Multiple mobile links are smaller than the required 44×44 CSS px target. | At 390 px, measured targets included the header/footer wordmarks at `167×24`, the inline Pro Terms link at `35×14`, and footer Privacy/Terms/Source links at `58×21`, `47×21`, and `54×21`. Increase their effective hit areas without creating overlap; remeasure at 390 px. |

Automated axe and Lighthouse accessibility scores were clean; neither tool detects the invisible transparent-input focus treatment or this work order's stricter 44 px target rule.

## Clean build and repository gates

Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2` with its pinned Chromium.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 62 packages installed, 63 audited, 0 vulnerabilities. |
| `npm test` | PASS — 8/8 Vitest tests, including deployment policy and the seeded 10,000-row fixture. |
| `npm run typecheck` | PASS — `tsc --noEmit`. |
| `npm run lint` | PASS — repository lint alias runs the typecheck. |
| `npm run build` | PASS — exact production build produced `dist/`. |
| `npm run test:e2e` | PASS — 2/2 Playwright tests. |
| `npm audit --omit=dev` / `npm audit` | PASS — 0 vulnerabilities in both scopes. |

Production build output:

- Initial JS: 44,161 bytes raw / 16.25 kB gzip (budget 200 kB).
- CSS: 15,941 bytes raw / 4.73 kB gzip (budget 50 kB).
- Mobile hero WebP: 11,986 bytes; desktop hero WebP: 29,762 bytes (budget 300 kB).
- No font payload. The build target is ES2022.

## Independent functional exercise

Fresh Chromium contexts exercised both the local production preview and the live URL at 1440 px and 390×844 px.

- A composite `tenant + id` comparison included UTF-8/BOM, quoted commas, escaped quotes, quoted line breaks, reordering, two changed records (three changed fields), one addition, one removal, one duplicate-key group and one unchanged record. The UI returned exactly `2 changed / 1 added / 1 removed / 1 ambiguous / 1 unchanged` and disclosed that duplicates were excluded from automatic pairing.
- The filtered CSV download used the expected filename, began with a UTF-8 BOM, escaped JSON/commas correctly, and included `changed`, `added`, `removed`, and `duplicate` evidence.
- The seeded 10,000-row browser exercise returned exactly `30 changed / 15 added / 20 removed / 0 ambiguous / 9,950 unchanged` in 463 ms live (497 ms local), matching the unit fixture with 100% expected recall.
- Pagination rendered 100, then 200, then all 206 changed/added/removed records; the live comparison completed in 145 ms.
- Invalid and recovery paths passed for a non-CSV extension, empty file, duplicate headers, an over-wide malformed row, no shared headers, and a 52,428,801-byte file over the 50 MiB safety limit. Errors were actionable and the app recovered with subsequent valid files.
- IndexedDB restored the report after reload. Canceling **Clear local session** preserved it; confirming removed files, keys, and report, and the cleared state remained after reload.
- Keyboard Space selected both composite key checkboxes and Enter ran the comparison. The skip link was the first Tab stop and visibly focused. There was no keyboard trap. The file-focus defect is recorded above.
- Turning every report filter off produced the designed empty state. Duplicate details and field-level before/after evidence were operable.
- At 390 px there was no document overflow (`innerWidth`, root scroll width, and body scroll width were all 390). Mobile screenshots showed intentional stacking and no obscured controls. Reduced motion computed button/hero durations of `0.01 ms` with automatic rather than smooth scrolling.
- Desktop results, mobile results, `/privacy`, and `/terms` each had zero axe serious/critical violations. Browser runs had zero console errors and zero uncaught page errors.

## Privacy and outbound traffic

- The complete free workflow made same-origin requests only, locally and live. No CSV content or filename left the origin.
- Static inspection found no analytics, tracking pixel, remote font, third-party runtime script, `sendBeacon`, WebSocket, or data-upload endpoint. CSV/report state is stored only in IndexedDB; license state is stored in localStorage, matching `/privacy`.
- The only runtime `fetch` outside the service worker is the documented Sociobot verification request. A controlled fresh-license exercise issued exactly one `GET` to `/api/v1/products/csv-keyed-diff/verify?license=fresh-token`, with no body or CSV data, stripped the token from the browser URL, and unlocked Pro after a valid response.
- The live verification API returned `{valid:false, reason:"invalid"}` for a synthetic invalid token with `Cache-Control: no-store` and the correct origin-specific CORS header. No real license or payment was used.
- The live CSP restricts default resources to self and permits connections only to self plus `https://api.sociobot.in`; Permissions-Policy disables unused sensitive capabilities. HTTPS redirects with 301, HSTS is present, and responses include `nosniff` and a strict-origin referrer policy.

## PWA, offline, update, and manifest

- After service-worker control, a browser-level offline switch plus reload loaded the app shell and visible offline banner on both the production preview and live deployment.
- A controlled production-artifact server changed the bytes of `sw.js` after initial control. `registration.update()` installed a waiting worker, the app displayed **An updated version is ready**, and **Reload** activated the new worker (`v2` controller) with no waiting worker or console/page error afterward.
- Chromium parsed the live manifest without manifest errors and reported no installability errors. It includes versioned `start_url`, standalone display, theme/background colors, 192 px, 512 px, and 512 px maskable icons; raster dimensions match their declarations.
- Live `sw.js` is `no-cache, no-store, must-revalidate`; the manifest is revalidated. Hashed JS/CSS are cached for one year with `immutable`.

## Live identity, response policy, and performance

Local `dist/` and the live deployment matched exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `6d23ad532062836604b6340a12c73a8f311302b6efafadada3a831ebf3df` |
| `assets/index-U-sXWPMz.js` | `ca05ac6b065336fcc393e74989cbff94dd3fbb59de37ad552c85d428f0840789` |
| `assets/index-Ckzq6nlQ.css` | `eccdf39fc3d43c8147b35338e34c375249db8f8a444565488deafcdd13d07e88` |
| `sw.js` | `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00` |
| `manifest.webmanifest` | `b03826fcfc49e13a9c34f035d1dba86ddd530b4d777b84dc744b470932960b26` |
| `offline.html` | `508cc86b2f65a9b5b51be6af387ceb0d13019d6cd272867a46caea8aa2634736` |

Unknown navigations correctly fall back to the app; missing `/assets/*.js` return 404 rather than HTML. The factory `verify-url.sh` returned HTTP 200, a 1,139 ms network-idle load, zero console/page errors, `lang=en`, one `h1`, a `main`, no missing image alt, and no unlabeled button.

Fresh Lighthouse 12.8.2 mobile simulation against the live URL scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100: FCP 1.1 s, LCP 1.1 s, TBT 40 ms, CLS 0, Speed Index 1.3 s, and 36 KiB total transfer.

## Release decision

The previous deployment-only immutable-cache defect is resolved, but this candidate is **not release-ready**. Keep the result at **FAIL** until production checkout works and the medium accessibility/license defects are corrected and independently reverified. No library/CLI or backend consumer/concurrency checks apply to this static PWA.
