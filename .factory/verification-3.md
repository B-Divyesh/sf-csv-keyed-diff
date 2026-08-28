# Independent verification 3 — CSV Keyed Diff

## Verdict: FAIL

Candidate `ce32ea30d2edb2538cfbaf27f5e49b74f0abb62c` was independently verified on 2026-08-28 UTC against <https://csv-keyed-diff.sociobot.in>. The working tree was clean at that exact commit before a clean dependency installation. No product code was modified during verification.

The deployed application is exactly the candidate production artifact, and the free local-first CSV reconciliation workflow passes. Release acceptance nevertheless **FAILS** because the advertised paid checkout is unavailable in production. This is a deployment/factory-billing defect, not a client-code defect, but it makes the live one-time purchase offer non-functional.

## Release-blocking defect

| Severity | Defect | Fresh evidence | Required resolution |
| --- | --- | --- | --- |
| **High** | The live **Buy Pro securely** route cannot start checkout. | Fresh `GET https://api.sociobot.in/api/v1/products/csv-keyed-diff/checkout` returned HTTP `404` and `{"error":"enabled factory product","status":404}` at 2026-08-28 04:26 UTC. The live page's buy link targets this exact required Sociobot endpoint. | Enable/register the production `csv-keyed-diff` product and configured return URL in the Sociobot billing engine. Recheck that the endpoint redirects to hosted checkout and that a completed purchase returns `?license=` to this origin. |

No critical functional, data-locality, accessibility, caching, or artifact-identity defect was found. There are no library/CLI or backend-specific checks for this static PWA.

## Clean checkout gates

Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2 pinned by the repository.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 62 packages installed; 0 vulnerabilities reported. |
| `npm test` | PASS — 8/8 Vitest tests. This includes quoted/BOM CSV, composite keys, duplicate quarantine, report export, deployment policy, and the seeded 10,000-row fixture. |
| `npm run typecheck` | PASS — `tsc --noEmit`. |
| `npm run lint` | PASS — repository lint alias runs the typecheck. |
| `npm run build` | PASS — exact Vite production build and postbuild completed; `dist/` produced. |
| `npm run test:e2e` | PASS — 4/4 Playwright tests, including comparison, offline reload, axe serious/critical scan, checkout-return-token replacement, legal routes, visible file-well focus, and 390 px target regressions. |
| `npm audit --omit=dev` and `npm audit` | PASS — 0 vulnerabilities in both scopes. |

Production build budget: initial JS `44,133` bytes raw / `16.24 kB` gzip, CSS `16,301` bytes raw / `4.79 kB` gzip, mobile hero WebP `11,986` bytes, desktop hero WebP `29,762` bytes, and no font payload. All are within the stated budgets.

Fresh mobile Lighthouse 13.4.1 against the live URL (simulated throttling) scored Performance **97**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.1 s, TBT 190 ms, CLS 0, and total transfer 36 KiB.

## Independent product exercise

Fresh Chromium contexts exercised local `dist/` where an update simulation was necessary and the live deployment at desktop and 390 x 844.

- A browser reconciliation using UTF-8 BOM, quoted commas, quoted newlines, reordering, composite `tenant + id` keys, one addition, two changed records/four changed fields, one unchanged record, and a duplicate-key group returned exactly `2 changed / 1 added / 0 removed / 1 ambiguous / 1 unchanged`. The duplicate notice explicitly says the rows are excluded from automatic pairing. Filtered export produced `csv-keyed-diff-report.csv`, retained a UTF-8 BOM, and contained five CSV lines of field-level/duplicate evidence.
- A separate live 10,000-row browser run completed in 666 ms and returned exactly `31 changed / 15 added / 20 removed / 0 ambiguous / 9,949 unchanged`, matching the constructed expected set. This independently covers inserts, deletes, reorder-independent keyed matching, and updates at the researched success scale.
- Session state restored after reload. The confirmed **Clear local session** action returned the app to “Waiting for two CSV files” and it remained clear after reload.
- Recovery paths were exercised: a `.txt` file, empty CSV, duplicate headers, a row wider than its header, no shared headers, and a 52,428,801-byte CSV all showed an actionable error/warning and left comparison unavailable until valid input returned. A subsequent valid CSV immediately recovered to “1 records found.”
- Keyboard starts at the visible **Skip to comparison** link. Focusing a native file input gives its visible well a `rgb(101, 81, 223) solid 3px` outline. The repaired 390 px links/controls meet the 44 px targets; page, root, and body widths were all 390 px, with no horizontal overflow. The normal live browser runs had zero console errors and zero page errors.
- Axe found zero serious/critical violations on live home and privacy pages; the repository’s result-page Playwright axe regression also passed. The live pages have `lang=en`, one `h1`, a `main`, titles, labels, and meaningful hero alt text. With reduced motion, hero animation/transition durations computed as `0.01 ms` and scroll behavior as `auto`.

## PWA, privacy, and response policy

- After service-worker control, setting the live browser context offline and reloading preserved the app shell and showed the offline banner. Chromium’s manifest parser reported no manifest errors; the manifest has standalone display, versioned start URL, 192/512/maskable icons, and matching dark theme/background colors.
- Against a controlled server of the exact fresh `dist/` artifact, changing only `sw.js` bytes followed by `registration.update()` installed a waiting worker, displayed **An updated version is ready**, and **Reload** activated the new controller. This verifies the product’s update notification path without changing the deployed product.
- The full normal free workflow made same-origin requests only. Static inspection found no analytics, tracking pixel, remote font/script, CSV upload, beacon, WebSocket, or third-party runtime resource. CSV/report state is local IndexedDB; license state is localStorage as disclosed by `/privacy`. The only intentional external client request is Sociobot license verification; a synthetic invalid-token request returned the documented `{valid:false, reason:"invalid"}` shape, `Cache-Control: no-store`, and the correct origin-specific CORS header. No real license or payment was used.
- Live JS/CSS return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`; HTML uses brief revalidation. HTTPS redirects from HTTP and HSTS, `nosniff`, strict-origin referrer policy, restrictive same-origin CSP with only the Sociobot API connection exception, and Permissions-Policy are present. Missing assets return 404 rather than the SPA HTML; unknown application paths correctly fall back to the app.

## Candidate/live identity

Fresh local `dist/` bytes and the live deployment match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `69041f803d4f601c33d667ee0c5ae54eea6a5f48cd35ea4ffb23bd71c63811e7` |
| `assets/index-Di0EY9Vd.js` | `40c9690970b6f4c20b496ef0676b1b47f12dcc1e150c7a98f43ff001d2e55eec` |
| `assets/index-Cfrfj0IW.css` | `cfa8d988b7f00e4dab8587a2d9f98f1c76bc6d7ef7da3796996c0c6bbf8846d6` |
| `sw.js` | `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00` |
| `manifest.webmanifest` | `b03826fcfc49e13a9c34f035d1dba86ddd530b4d777b84dc744b470932960b26` |
| `offline.html` | `508cc86b2f65a9b5b51be6af387ceb0d13019d6cd272867a46caea8aa2634736` |

## Release decision

Do not promote this candidate until the factory billing registration is fixed and the hosted checkout/return path is independently retested. The free comparison product is otherwise ready and the prior production immutable-cache finding is confirmed fixed.
