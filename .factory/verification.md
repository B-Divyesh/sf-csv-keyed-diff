# Verification report — CSV Keyed Diff

**Result: FAIL** — the candidate is functionally sound and the live site is the exact candidate artifact, but the production deployment does not meet the required immutable caching policy for hashed static assets. This is a deployment-only medium-severity defect.

## Scope and identity

- Work order: `csv-keyed-diff-verify-1`
- Candidate: `50bdc8f13c4a5204a311335d58be023fcce7a811`
- Tested URL: <https://csv-keyed-diff.sociobot.in>
- Verification date: 2026-08-28 UTC
- Checkout was clean before `npm ci`; no product source files were changed during verification.

The live HTML SHA-256 was `6d23ad532062836604b6340a12c73a8f311302b6efaf47afadada3a831ebf3df`, identical to local `dist/index.html`. Live bytes also matched the candidate build for `index-U-sXWPMz.js` (`ca05ac…0789`), `index-Ckzq6nlQ.css` (`eccdf3…7e88`), `sw.js` (`b2a1b1…b26`), `manifest.webmanifest` (`b03826…b26`), `offline.html` (`508cc8…4736`), `/privacy`, `/terms`, and `icon-192.png`.

## Commands and automated gates

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

All passed from the candidate checkout:

- `npm ci`: 63 packages audited; 0 vulnerabilities.
- `npm test`: 6/6 unit tests passed, including BOM/quoted cells/line breaks, malformed shape and duplicate headers, composite keys, duplicate quarantine, CSV export, and the 10,000-row seeded fixture. The fixture result was 15 added, 20 removed, 30 changed, and 9,950 unchanged records.
- `npm run build`: TypeScript no-emit check and Vite production build passed. `dist/` was produced. Initial JS was 44,161 bytes / 16.25 KB gzip; CSS 15,941 bytes / 4.73 KB gzip; mobile hero 11,986 bytes. There are no font downloads. These are within the stated 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB mobile-hero budgets.
- `npm run test:e2e`: 2/2 Playwright tests passed. This includes an axe scan with zero serious or critical violations, IndexedDB restore, service-worker offline reload, duplicate disclosure, legal routes, and 390 px overflow.
- Fresh mobile Lighthouse against local production preview: Performance 99, Accessibility 100, LCP 1.3 s, CLS 0, TBT 130 ms, transferred weight 36 KiB.

There is no separate lint script in `package.json`; the build's `tsc --noEmit` is the available type gate.

## Independent product exercise

Using a fresh Chromium profile against the production preview, I independently verified:

- Keyboard begins at the visible skip link; focus has a 3 px designed focus ring. The document has `lang=en`, one `h1`, a `main` landmark, title, labeled controls, and meaningful hero alt text.
- Normal reconciliation with a composite `id + region` key: reordered records, quoted commas, one added, one removed, one changed record (two changed fields), one unchanged record, and one duplicate-key group produced the expected review counts. The duplicate group explicitly says it is excluded from automatic pairing.
- Filtered CSV export contained field-level changed evidence and a duplicate record. Turning off `changed` removed it from the visible review.
- Invalid/recovery paths: non-CSV extension, empty CSV, malformed row with too many cells, no shared headers, and a 52,428,801-byte CSV all showed actionable errors/warnings and left the compare action safely disabled until valid input/key selection.
- The saved report restored after reload from IndexedDB; the confirmed **Clear local session** action removed it and it did not restore on the next reload.
- At 390×844 the home page had no horizontal overflow and the file target was at least 44 px high. With `prefers-reduced-motion: reduce`, button transition and hero animation durations were `0.01ms` and document scroll behavior was `auto`.
- Offline: after first load and service-worker control, `context.setOffline(true)` plus reload showed the offline banner and loaded the app shell. A test-only local server then served a byte-changed worker; it installed as waiting and the in-app reload/update toast appeared.
- The normal free workflow made only same-origin requests; no console or page errors occurred. Static inspection finds no analytics, third-party runtime script, remote font, CSV upload, or outbound request other than the optional Sociobot license API path. Live 390 px smoke had one `h1`, one `main`, no overflow, an active service worker, same-origin requests only, and no errors.

## Live response and privacy policy checks

- Live `/`, JS, CSS, service worker, legal routes, and manifest returned 200. HTTPS/HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin` are present.
- CSV data remains browser-local in the exercised free workflow. Current comparison data is intentionally retained only in local IndexedDB until explicitly cleared; optional license state is localStorage, as disclosed by `/privacy`.
- **Caching failure:** live `https://csv-keyed-diff.sociobot.in/assets/index-U-sXWPMz.js` and `…/index-Ckzq6nlQ.css` return `Cache-Control: public, must-revalidate, max-age=30`. They are content-hashed static assets but are neither long-lived nor `immutable`, contrary to the PWA performance contract. The service worker does cache the shell, so offline behavior passes; repeat online loads still need unnecessary revalidation.
- **Hardening observation (low):** the live responses do not include `Content-Security-Policy` or `Permissions-Policy`. This did not expose a functional failure in this audit, but a restrictive CSP and permissions policy should be configured with the caching correction.

## Defects

| Severity | Defect | Evidence / required resolution |
| --- | --- | --- |
| Medium | Hashed production JS and CSS are not long-lived immutable cache entries. | Live headers are `Cache-Control: public, must-revalidate, max-age=30` for both hashed assets. Configure the deployment to use a long lifetime (for example `max-age=31536000, immutable`) for `/assets/index-*.js` and `/assets/index-*.css`; keep `sw.js` short-lived so updates are detected. Re-run live header verification. |
| Low | Missing CSP and Permissions-Policy response headers. | Add a policy compatible with same-origin assets and the explicit optional Sociobot billing endpoint, then validate the free workflow and Pro verification path. |

No critical or high-severity functional, accessibility, privacy, offline, or artifact-identity defect was found. The result remains **FAIL** until the medium deployment caching defect is corrected and independently rechecked.
