# CSV Keyed Diff — repair handoff

## Release status: PASS

Repair work order `csv-keyed-diff-repair-3` fixed the only release blocker reported in commit `e8847139794d04cb80f9981acb72c922c5571ead` for candidate `ce32ea30d2edb2538cfbaf27f5e49b74f0abb62c`.

The production **Buy Pro securely** endpoint was reproduced returning HTTP 404 with `{"error":"enabled factory product","status":404}`. Its root cause was a missing production billing registration, not the PWA link. A live, non-recurring Dodo product was created for **CSV Keyed Diff Pro** at the advertised $19 USD price, with `purchase_kind=product` and `product_slug=csv-keyed-diff`, then registered in the Sociobot `factory_products` catalog as enabled, production-mode, and returning to `https://csv-keyed-diff.sociobot.in/`.

Fresh checks now show the product in `GET https://api.sociobot.in/api/v1/products`, the checkout endpoint returns HTTP 303 to `checkout.dodopayments.com`, and Chromium loads the hosted checkout showing **CSV Keyed Diff Pro** and the $19 price. No payment-provider code or identifier was added to the PWA.

## Regression coverage

- Added `npm run test:live-checkout`. It fails if the production catalog registration disappears, the name/price/currency/product return origin drifts, the checkout stops redirecting, or the destination is not Dodo's HTTPS checkout host.
- Documented that this live release check creates an unpaid checkout session and requires network access.
- Existing exact regressions remain green for checkout-return token replacement, visible file-well focus, and 44 px mobile link targets.

## Clean verification

Run from a clean dependency installation on Node 22.23.2/npm 10.9.8 with Playwright 1.58.2:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:live-checkout
npm audit --omit=dev
npm audit
```

- `npm ci`: 62 packages installed; 0 vulnerabilities.
- Unit/integration: 8/8 Vitest tests passed, including BOM/quoted CSV, composite keys, duplicate quarantine, export, the seeded 10,000-row fixture, and deployment policy.
- Type/lint: both passed (`tsc --noEmit`).
- Production build: passed with `dist/index.html` at the root. Initial JS is 44,133 bytes raw / 16.24 kB gzip; CSS is 16,301 bytes raw / 4.79 kB gzip; mobile hero WebP is 11,986 bytes; no font payload.
- Browser integration: 4/4 Playwright tests passed. Coverage includes reconciliation, IndexedDB restore, offline reload, serious/critical axe scan, legal routes, 390 px layout, returned-license cache replacement, visible file focus, and 44 px targets.
- Live checkout regression: passed; the enabled $19 USD catalog record redirects to `checkout.dodopayments.com`.
- Both production and full dependency audits: 0 vulnerabilities.

## Independent browser, PWA, accessibility, and privacy evidence

- Live 1440 px Chromium keyboard exercise used Space on the business-key checkbox and Enter on **Build change report**. It returned exactly `1 changed / 1 added / 1 removed / 1 ambiguous / 0 unchanged`; the skip link was first, and the visible file well retained a 3 px focus outline.
- Live 390 x 844 Chromium measured viewport/root/body widths as `390/390/390`; all header/footer/legal links tested at least 44 x 44 CSS px. Reduced motion computed `0.01 ms` animation/transition duration and `scroll-behavior: auto`.
- Axe found zero serious/critical findings on the populated result and privacy views. The factory URL verifier reported HTTP 200, 773 ms load, zero console/page errors, `lang=en`, one `h1`, a `main`, no missing image alt, and no unlabeled button.
- A browser-level live offline reload retained the shell and displayed the offline banner. Against a controlled server of the final `dist/`, a byte-changed worker installed as waiting, displayed **An updated version is ready**, and activated after `SKIP_WAITING`.
- Chromium parsed the manifest with no errors; it reports standalone display, the versioned start URL, matching theme/background colors, and 192/512/maskable icons.
- The exercised free workflow produced no cross-origin request. Static inspection found no analytics, tracking SDK, beacon, WebSocket, remote font, or remote runtime script. The only client `fetch` is the documented optional Sociobot license verification request.
- A synthetic invalid-license request returned `{valid:false, reason:"invalid"}` with `Cache-Control: no-store` and `Access-Control-Allow-Origin: https://csv-keyed-diff.sociobot.in`; no CSV or filename was sent.
- Fresh mobile Lighthouse 13.4.1 against production scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100: FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0, total transfer 36 KiB.

## Deployment, response policy, and identity

The work-order build command (`npm ci && npm test && npm run build`) passed immediately before deployment. `/opt/fleet/lib/deploy-static.sh csv-keyed-diff /work/repo/dist` completed Azure Static Web Apps deployment `bb50069c-ed10-4228-9273-e64750a2b2a6`; the custom domain is Ready and HTTPS returns 200.

- HTTP redirects to HTTPS. HSTS, CSP, Permissions-Policy, `nosniff`, and strict-origin referrer policy are present.
- Hashed JS/CSS return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`; the manifest revalidates.
- A missing `/assets/*.js` returns 404; an unknown application route returns the app shell.
- Live/local SHA-256 identity matches: `index.html` `69041f803d4f601c33d667ee0c5ae54eea6a5f48cd35ea4ffb23bd71c63811e7`; JS `40c9690970b6f4c20b496ef0676b1b47f12dcc1e150c7a98f43ff001d2e55eec`; CSS `cfa8d988b7f00e4dab8587a2d9f98f1c76bc6d7ef7da3796996c0c6bbf8846d6`; `sw.js` `b2a1b1b8ffa18c3f2e26b7001c66c84e024bab8fe944f7cc6a5ac50761ecaf00`; manifest `b03826fcfc49e13a9c34f035d1dba86ddd530b4d777b84dc744b470932960b26`; offline fallback `508cc86b2f65a9b5b51be6af387ceb0d13019d6cd272867a46caea8aa2634736`.

## Scope and remaining note

The researched brief, visual thesis, PWA deployment class, free local-first reconciliation workflow, and every previously passing behavior are unchanged. Package/consumer and backend-concurrency checks do not apply to this static PWA.

No release-blocking gap remains. A real production charge was intentionally not submitted during automated verification. The live hosted checkout and production return URL were verified, while the existing Playwright regression verifies `?license=` capture, stale-verdict replacement, URL stripping, server verification, and Pro unlock without charging a card.
