# CSV Keyed Diff — review 1 handoff

## Release status: FAIL

Review 1 completed against <https://csv-keyed-diff.sociobot.in> on 2026-09-05 UTC. The implementation reviewed is `fe364d04240f133d0309ba66970aa6671a1158f5`; the later documentation head is `2bbd659c46968c26875e31ee92879dfeb1de73d8`. No product code was changed.

There are 7 findings and 16 untested public claims, so this product does not pass. The two high findings are the absent required one-click demo sandbox and absent `.factory/claims.json`/tagged demo claim tests. A valid one-column CSV is still rejected, there is no designed 404 route, the first screen is not clear enough for a cold visitor, legal routes lack the standard header navigation, and the indefinite “All future Pro refinements” promise is untestable.

## What was checked

- Clean-install commands passed: `npm ci`, `npm test` (8/8), `npm run lint`, `npm run build`, `npm run test:e2e` (4/4), and `npm run test:live-checkout`; both npm audits reported zero vulnerabilities.
- Fresh desktop and 390 px phone sessions exercised the populated normal CSV report, CSV export, offline reload, route titles, legal pages, keyboard/focus regressions, mobile reflow, reduced motion, privacy traffic, and live response headers.
- The normal report returned the expected changed/added/removed/ambiguous counts, exported CSV, had no free-flow cross-origin request, and had no console/page error. Playwright axe found no serious or critical issue. The standalone axe CLI could not start because its Selenium Chrome binary is unavailable in this container.
- Earlier cache/header, checkout, license-return, focus, and mobile target findings are fixed. The prior update-toast reload failure was not reproduced on an exact-dist controlled update; the one-column CSV defect remains.

Read `.factory/review-1.md` for the exact evidence, all 16 claims, prior-finding dispositions, and required repairs. The next implementation should build `/demo` with isolated sample storage and claim tests before re-reviewing the remaining product fixes.
