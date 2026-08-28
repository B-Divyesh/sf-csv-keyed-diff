# CSV Keyed Diff — independent verification handoff

## Release status — FAIL

Candidate `52cd4bfb078b58307e9e59fafbb2240d3b2532ac` was independently tested on 2026-08-28 UTC at <https://csv-keyed-diff.sociobot.in>. Full evidence is in `.factory/verification-2.md`.

The free CSV reconciliation PWA passes clean install, all repository gates, exact production build, normal/error/recovery workflows, the 10,000-row expected-recall fixture, CSV export, local persistence, offline reload and service-worker updating. Live bytes match the candidate build. Lighthouse mobile is 100/100/100/100, axe reports no serious/critical findings, the bundle budgets pass, and the earlier immutable-cache/CSP deployment defect is fixed.

Release acceptance still fails on four fresh findings:

1. **High — production checkout unavailable:** `GET https://api.sociobot.in/api/v1/products/csv-keyed-diff/checkout` returns HTTP 404 and `{"error":"enabled factory product","status":404}`. The advertised Buy Pro action cannot start a purchase.
2. **Medium — replacement license discarded:** a new `?license=` return token reuses a recent invalid verdict from an older token, makes no verification request, and removes the new token. Clear `sb_license_verdict:csv-keyed-diff` in `captureLicense()` when storing a new query token.
3. **Medium — invisible core keyboard focus:** the before/after file inputs focus a transparent 1×1 element while the visible file well has no focus treatment. Add a visible `:focus-within` style.
4. **Low — undersized mobile links:** header/footer wordmarks and legal/source links measure 14–24 px high at 390 px rather than the required 44 px target.

## Verification commands

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

All commands above passed. Build output: JS 44,161 bytes raw / 16.25 kB gzip; CSS 15,941 bytes / 4.73 kB gzip; mobile hero 11,986 bytes. `dist/` was produced.

Independent browser coverage included 1440 px and 390×844 px, keyboard-only key selection/compare, invalid files and recovery, composite keys, duplicates, filters, downloads, pagination, IndexedDB restore/clear, offline reload, update toast/activation, reduced motion, manifest installability, privacy/outbound requests, response headers/caching, and local/live artifact hashes. The 10,000-row live run returned 30 changed, 15 added, 20 removed, and 9,950 unchanged in 463 ms.

Fresh Lighthouse 12.8.2 live mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, TBT 40 ms, CLS 0, total transfer 36 KiB.

## Next steps

- Register/enable the production Sociobot billing product and verify the checkout/return path.
- Correct license-verdict invalidation and the two accessibility issues without regressing the free workflow.
- Re-run all gates plus the exact reproduction cases in `.factory/verification-2.md`; do not promote until they pass.

No product code was modified during this verification. Only the verification and handoff documentation should be committed.
