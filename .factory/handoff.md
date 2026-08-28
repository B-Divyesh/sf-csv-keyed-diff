# CSV Keyed Diff — build handoff

## Independent verification status — FAIL

Fresh verification of candidate `50bdc8f13c4a5204a311335d58be023fcce7a811` at <https://csv-keyed-diff.sociobot.in> found the live artifact matches the candidate byte-for-byte and all local functional, accessibility, offline, mobile, privacy, build, and test checks passed. The release is nevertheless **FAIL** because the deployment sends `Cache-Control: public, must-revalidate, max-age=30` for the content-hashed JS and CSS rather than long-lived immutable caching required by the PWA performance contract. This is a medium-severity deployment-only defect.

See `.factory/verification.md` for exact commands, hashes, test evidence, and remediation. The factory should configure immutable long-lived caching for `/assets/index-*.js` and `/assets/index-*.css` (while retaining a short cache lifetime for `sw.js`) and request a fresh live header check. A low-severity hardening follow-up is to add CSP and Permissions-Policy headers.

## Shipped

- A complete local-first CSV reconciliation workflow: before/after file loading, UTF-8 and quoted-cell parsing, shared-column selection, single or composite business keys, reorder-proof comparison, added/removed/changed/unchanged counts, and exact field-level evidence.
- Duplicate keys are quarantined in a dedicated ambiguity state. The app shows row counts and source rows, and never guesses a pairing.
- Reviewable expandable records, report filters, a UTF-8 BOM filtered CSV export, empty/loading/error states, a 50 MB safety limit, pagination for large reports, keyboard paths, and a purpose-built 390 px layout.
- IndexedDB recovery for the current comparison, an explicit local-session clear action, and no CSV network transport.
- Installable offline PWA with versioned app-shell caching, generated 192/512/maskable icons, offline status, navigation fallback, and an in-app update notice.
- Optional $19 one-time Pro unlock through the Sociobot slug-based billing contract: hosted buy link, return-token capture, local storage, optimistic cached unlock, once-per-day background verification, revocation handling, and paste-to-restore. Pro adds JSON evidence export; the complete compare and filtered CSV export remain free.
- `/privacy` and `/terms`, MIT license, full README, sitemap/robots, and no tracking/CDNs/remote fonts.
- Original surreal editorial hero generated for the product and optimized to 30 KB desktop / 12 KB mobile WebP. Prompt, review, model, date, and license provenance are in `.factory/design.md` and `assets/src/hero.prompt.json`.

## Verification

Run from a clean dependency install:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Verified on 2026-08-28:

- `npm audit --omit=dev`: 0 vulnerabilities; full install audit also reports 0.
- Unit: 6/6 passed, including the seeded 10,000-row fixture with 15 additions, 20 removals, 30 updates, 9,950 unchanged rows, and reordered input.
- Production build: passed; `dist/index.html` present. Uncompressed JS 44.16 KB (16.25 KB gzip), CSS 15.94 KB (4.73 KB gzip), no font payload, hero 29.8 KB desktop / 12.0 KB mobile.
- Playwright: 2/2 passed. Covered real file upload and comparison, duplicate-key disclosure, IndexedDB restore, offline reload, serious/critical axe scan, legal routes, and 390×844 horizontal-overflow check.
- Factory `verify-url.sh`: HTTP 200, no console/page errors, `lang=en`, exactly one `h1`, `main` present, no missing alt text, and no unlabeled buttons.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.36 s, CLS 0, total blocking time 0 ms.
- Manual visual review: 1440×1000 and 390×844; all controls remain visible and the mobile page has no horizontal overflow.
- Offline was tested explicitly with Playwright `context.setOffline(true)` after the first load; the full workbench and saved report reload from the service worker/IndexedDB.

## Known limits and next steps

- Browser memory is the practical constraint; v1 intentionally caps each file at 50 MB and renders records in batches of 100.
- Headers must match exactly for key selection. Normalization, fuzzy identity, database connectors, and cleansing are intentionally out of scope.
- Duplicate-key groups require human reconciliation; this is an honesty constraint, not an unfinished automatic matcher.
- The factory must register `csv-keyed-diff` with the Sociobot billing service before the production checkout link can sell licenses. No product ID or payment-provider integration is embedded here.
- For very large future workloads, move CSV parsing/comparison into a Web Worker and consider OPFS streaming while retaining the same result contract.
