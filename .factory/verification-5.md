# Independent verification 5 — Compare CSV exports by business key

## Verdict: PASS

**PASS — zero findings and zero untested public claims.**

This independent check reviewed the deployed implementation
`9093ee32c4cdfac3e4acb415b242fb87d5757f0d` at
<https://csv-keyed-diff.sociobot.in> on 2026-09-05 UTC. The documentation and
report head is `8cc88bd70ab4ace2da36554f5d36b98225ad1d79`; it is report-only.
No product source was changed during this verification.

## Job, audience, and first action

The product compares two customer CSV exports by a business key and explains
added, removed, and changed fields. It is for implementation and operations
teams who need a reviewable reconciliation without spreadsheet workarounds.

In fresh desktop and 390 × 844 phone browser contexts, before scrolling, the
page states **“Compare CSV exports by business key”**, names that audience, and
shows **“Try it with sample data”**. The action was visible at 542 px on desktop
and 482 px on phone; phone `scrollWidth` equalled `innerWidth` (390 px).

## Live product evidence

- Fresh `/demo` opened a populated report with 2 changed, 1 added, 1 removed,
  1 ambiguous, and 1 unchanged record. The persistent label was present.
  **Reset demo** restored those exact counts and reported “Sample data reset.”
- Demo isolation was exercised in one fresh context: a saved real
  `qa-real-before.csv → qa-real-after.csv` comparison survived a changed and
  reset demo, then returned after **Start for real**. Demo held no license value.
- Fresh online paths covered normal comparison, a rejected `.txt` file,
  recovery with valid CSVs, and valid one-column exports. The one-column result
  was exactly 0 changed / 1 added / 1 removed / 1 unchanged.
- A live 10,000-row reordered run completed in 290 ms and returned exactly
  30 changed, 15 added, 20 removed, and 9,950 unchanged. A 50 MiB file was
  accepted; a file one byte larger was rejected with the stated limit.
- A fresh controlled offline context reloaded `/demo` with its offline banner,
  demo label, and 2 changed records. The repository's exact-artifact update
  test also passed as part of the full E2E suite.
- `/privacy` and `/terms` each returned 200 with their route title, one `h1`,
  `main`, shared navigation/footer, and no phone overflow. An unknown route
  returned HTTP 404, title **“Page not found — CSV Keyed Diff”**, the designed
  recovery page, and a working home link.
- All discovered landing-page links worked: internal routes returned 200; the
  documented checkout endpoint returned its expected 303 hosted-checkout
  redirect; the repository link returned 200.

## Accessibility, privacy, and browser health

- The worker URL verifier passed on live home, demo, and privacy: titles,
  `lang=en`, one `h1`, `main`, image alt text, labelled buttons, and zero page
  or console errors.
- Fresh Playwright axe scans found zero violations, including zero serious or
  critical violations, on desktop home/demo, phone home, privacy, terms, and
  the 404 page. The standalone `@axe-core/cli` launcher could not start this
  container's Playwright Chrome; the required Playwright axe integration was
  used successfully instead.
- Keyboard smoke checks found the skip link as the first Tab target with a
  3 px iris focus ring. The focused upload well has a visible 3 px focus ring.
  Reduced-motion CSS computed to `0.00001s` transition duration and `auto`
  scroll behavior.
- The exercised free flow made no cross-origin requests. The privacy claim's
  dedicated clean-context test also passed. Static responses use HTTPS/HSTS,
  `nosniff`, strict referrer policy, CSP, and Permissions-Policy. Hashed JS/CSS
  cache for one year with `immutable`; `sw.js` is revalidated/no-store.

## Candidate and deployment identity

The freshly built candidate and live deployment match byte-for-byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `055d1175864ccab6bdda90e6e0db9a76fc61692d3a2f6867e91b16519697dbb3` |
| `assets/index-D0ymRhQV.js` | `b2d6bf169f4cf0abec0f277701f807eb90d29b98420e9cd0c43d79b24f88af95` |
| `assets/index-BI3Sm7US.css` | `a9e96a7e679eafa02d87d9d3bc23e28624b74295daade73d8fde861b759deb96` |

## Clean checkout and claims

From a clean working tree, `npm ci`, `npm test` (10/10), `npm run lint`, and
`npm run build` passed. `npm run test:e2e` passed 26/26. The checkout check
passed, confirming the enabled $19 USD product and hosted checkout redirect.
Both production-only and full dependency audits reported zero vulnerabilities.

Every declared command in `.factory/claims.json` was invoked separately from
the documented demo entry point. All 15 passed; no claim is untested:

| Claim IDs | Result |
| --- | --- |
| `demo-sandbox`, `local-processing`, `offline-reload`, `csv-values`, `key-alignment` | Pass |
| `reorder-changes`, `duplicate-keys`, `csv-export`, `session-restore`, `session-clear` | Pass |
| `file-limit`, `free-workflow`, `pro-json`, `exact-matching`, `one-column` | Pass |

The public-copy/claim cross-check found each visitor-facing product assertion
represented in the registry; the generated-imagery disclosure is provenance,
not a performance or product-capability claim.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Immutable asset caching; CSP/Permissions-Policy | Fixed and live headers verified. |
| Production checkout; returned-license cache handling | Fixed; checkout and browser regressions pass. |
| Upload focus visibility; mobile target/overflow issues | Fixed; visible 3 px well focus and 390 px checks pass. |
| Update toast could strand its tab | Fixed; actual reload regression passes. |
| One-column CSV rejected | Fixed; fresh live one-column comparison passes. |
| Missing demo, claim registry, real 404, legal navigation, and plain first screen | Fixed; each was exercised above. |
| Unbounded future-Pro promise | Removed; all remaining claims are registered and tested. |

Backend tenant isolation, persistence/restart, health, and rate limiting do not
apply to this static local-first PWA. CLI, library, and desktop artifact checks
also do not apply.

## Evidence

Evidence is stored under `/work/.evidence/`: `live-browser.json`,
`live-data-paths.json`, `live-boundary.json`, `claim-commands.log`,
`test-e2e.log`, `live-checkout.log`, `artifact-sha256.txt`,
`live-headers.txt`, and `lighthouse-live.json`. Fresh mobile Lighthouse scored
Performance 99, Accessibility 100, Best Practices 100, and SEO 100; LCP was
1.7 s, CLS 0, and transfer 38 KiB.
