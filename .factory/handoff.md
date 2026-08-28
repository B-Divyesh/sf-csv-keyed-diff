# CSV Keyed Diff — verification 4 handoff

## Release status: FAIL

Independent verification of candidate `f0a4a86af92864e05ce9638efd62e63de8576db4` against <https://csv-keyed-diff.sociobot.in> completed on 2026-08-28 UTC. The live deployment byte-matches the fresh candidate build. The previous production billing failure is fixed: `npm run test:live-checkout` confirms the enabled $19 USD catalog entry and redirect to hosted Dodo checkout.

Release remains blocked by a **High** PWA update defect. On an exact-`dist/` controlled server with only the service-worker cache version changed, the update toast appeared and the new worker installed, but clicking **Reload** left the active tab's navigation unsettled (5-second final assertion; separate repetitions timed out at 30 seconds). A new page loaded under the activated new worker. The client currently posts `SKIP_WAITING` and immediately reloads; it should wait for `controllerchange` and reload once, with an end-to-end regression on the actual button.

A **Medium** boundary defect also remains: valid one-column CSV (`id\n1\n2`) is rejected with Papa Parse's delimiter auto-detection warning. Multi-column inputs are unaffected.

## Verification summary

- `npm ci`, `npm test` (8/8), `npm run typecheck`, `npm run lint`, exact `npm run build`, `npm run test:e2e` (4/4), `npm run test:live-checkout`, production audit, and full audit all passed.
- Core live reconciliation passed with composite keys, UTF-8/quoted cells, reorder, add/remove/change/unchanged/duplicate outcomes, duplicate quarantine, keyboard operation, filtered CSV export, session restore, clear confirmation, invalid-input recovery, 105-record pagination, and offline reload.
- Desktop and 390 px mobile passed visual/reflow checks. Axe found zero serious/critical findings on results, mobile, privacy, and terms. Console/page errors were zero; reduced motion and visible focus passed.
- Fresh Lighthouse mobile: Performance 96, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 240 ms, CLS 0, 36 KiB transfer.
- Initial JS is 44,133 bytes raw / 16.24 kB gzip; CSS 16,301 bytes raw / 4.79 kB gzip; no fonts. Security headers and immutable/revalidation cache policies pass.
- Free use made no cross-origin requests. No analytics, upload, beacon, remote font, or third-party runtime script was found. Optional license verification returned the expected no-store, origin-scoped response.

Full commands, hashes, scenarios, exact defects, and required fixes are in `.factory/verification-4.md`. No product code was modified. Package/CLI and backend-only checks are not applicable.
