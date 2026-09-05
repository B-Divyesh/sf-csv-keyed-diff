# CSV Keyed Diff

Compare two CSV exports by business key and explain every changed field. The app is for implementation and operations teams.

Live product: <https://csv-keyed-diff.sociobot.in>

One-click sample: <https://csv-keyed-diff.sociobot.in/demo>

## What it does

- Reads UTF-8, quoted commas, escaped quotes, quoted line breaks, and one-column CSV files.
- Aligns records by one selected key or a composite key.
- Finds additions, removals, and field changes even when rows move.
- Lists duplicate-key groups without guessing which records match.
- Filters the review and exports the same evidence as CSV.
- Restores a real session from local IndexedDB after a refresh.
- Works offline after the first visit.

The complete comparison and CSV report are free. A $19 one-time Pro license for one user adds JSON evidence export.

CSV files stay in the browser. The app has no analytics, tracking pixel, remote font, or third-party runtime script.

## Try the isolated sample

Open `/demo` or select **Try it with sample data**. A filled report appears immediately.

The banner remains visible while the demo is active. **Reset demo** restores the sample, and **Start for real** leaves it.

Demo changes use memory only. They never read or write the real IndexedDB session or license storage.

See [.factory/demo.md](.factory/demo.md) for the sample contents and isolation details.

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Build and serve the production artifact:

```sh
npm run build
npm run preview
```

The deploy artifact is `dist/`. It contains real files for `/demo`, `/privacy`, `/terms`, and the designed 404 response.

## Verify

Run the full local gate from a clean checkout:

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
npm run test:claims
npm run test:live-checkout
```

The checkout test requires network access. It creates an unpaid checkout session and checks the registered price and return origin.

Every visitor-facing product claim is registered in [.factory/claims.json](.factory/claims.json). Each entry names its clean demo command and observable result.

Unit coverage includes the seeded 10,000-row fixture, quoted data, composite keys, duplicate keys, one-column files, and report export. Browser coverage includes normal, invalid, boundary, recovery, keyboard, mobile, privacy, offline, legal, and 404 paths.

## Product limits

- Key column names must match exactly across both files.
- The app does not infer identity or use fuzzy matching.
- Duplicate keys require human review and are excluded from automatic pairing.
- A file can be at most 50 MiB. Larger files are rejected before parsing.
- **Clear local session** removes the saved comparison from IndexedDB.
- Pro purchase and verification use the Sociobot billing API.

The researched scope is in [.factory/brief.json](.factory/brief.json). Visual decisions and asset provenance are in [.factory/design.md](.factory/design.md).

## Deploy

Deploy only the contents of `dist/` to the product's static host. Do not deploy source files or change shared infrastructure.

## License

MIT. See [LICENSE](LICENSE).
