# CSV Keyed Diff

CSV Keyed Diff is a private, offline-capable reconciliation report generator for implementation and operations teams. It compares two CSV exports by one or more business-key columns, then explains added records, removed records, and exact field changes even when rows were reordered.

Live product: <https://csv-keyed-diff.sociobot.in>

## What it does

- Parses UTF-8 CSV, quoted commas, escaped quotes, and quoted line breaks.
- Aligns records by a user-selected single or composite key.
- Reports additions, removals, and field-level changes.
- Quarantines duplicate-key groups rather than inventing a pairing.
- Filters the review and exports the same filtered evidence as CSV.
- Recovers the current session from local IndexedDB and works after an offline reload.
- Offers an optional $19 one-time Pro license for JSON evidence bundles; the complete CSV comparison and CSV report are free.

Files are processed entirely in the browser. There is no CSV upload, analytics script, third-party runtime script, or remote font. Only Pro purchase and license verification contact the Sociobot billing API.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Vite prints the local development URL. For the production build:

```sh
npm run build
npm run preview
```

The exact deploy artifact is `dist/`, with `dist/index.html` at its root and static copies for `/privacy` and `/terms`.

## Verify

```sh
npm test
npm run lint
npm run build
npm run test:e2e
npm run test:live-checkout
```

Unit coverage includes the seeded 10,000-row success fixture, quoted data, composite keys, reordered records, duplicate keys, report export, and static-host cache/security policy. Playwright covers the end-to-end comparison, axe serious/critical checks, offline reload and session recovery, legal routes, and 390 px layout. `dist/staticwebapp.config.json` configures immutable caching for hashed JS/CSS, short-lived worker updates, and the response security policy on Azure Static Web Apps.

`test:live-checkout` is the release regression for the separately registered billing product. It checks the public Sociobot catalog entry, advertised price and return origin, then confirms that the production buy route redirects to Dodo's hosted HTTPS checkout. It creates an unpaid checkout session and requires network access.

## Product decisions and limits

- Column names must match exactly across files for use as a key; the app does not infer identities from sensitive data.
- Duplicate keys are displayed for human review and excluded from automatic pairings.
- Files are limited to 50 MB to keep browser memory use predictable.
- The current session is saved only on the device and can be erased with **Clear local session**.
- The factory registers the billing product separately. The client uses the slug-based Sociobot contract and contains no payment-provider code or product ID.

The researched scope is in `.factory/brief.json`, visual decisions and asset provenance are in `.factory/design.md`, and final verification is recorded in `.factory/handoff.md`.

## License

MIT. See [LICENSE](LICENSE).
