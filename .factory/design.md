# CSV Keyed Diff — visual thesis

## Direction: the midnight reconciliation garden

CSV comparison is usually rendered as spreadsheet chrome or red/green code diff. This product instead treats two exports as two strange specimens brought into a quiet editorial workroom: keys pin records in place, a glass lens exposes field-level mutations, and a report tray collects only the evidence that matters. The surreal scenery makes the purpose memorable while the working surface stays restrained and precise.

The single-mode dark treatment is intentional. Confidential reconciliation work often happens alongside terminals and admin tools; an ink-dark canvas reduces glare, makes paper-white data surfaces distinct, and lets status colors remain legible without feeling like alarms.

## Palette

- `ink #11131A`: page background, derived from blueprint ink and a night workroom.
- `ink-raised #191C25`: raised controls and result rails.
- `paper #F3F0E7`: primary text and the warm surface of an archival report.
- `paper-muted #B9B7B0`: secondary copy (5.2:1+ on ink).
- `key-lime #C7F36A`: primary action and selected key; the label pinned to a specimen.
- `key-ink #17200A`: text on key-lime.
- `iris #A997FF`: focus, linkage, and changed fields.
- `aqua #67D8D0`: added records.
- `coral #FF8A72`: removed records and destructive/error states.
- `amber #F5C96A`: duplicate-key ambiguity and warnings.

Color is never the only signal: every status is paired with a word, icon, or patterned marker.

## Type

- Editorial display: Georgia, `Times New Roman`, serif. Its high-contrast shapes supply the report-room voice without a font download.
- Working text and data: Inter-like system stack (`ui-sans-serif`, `system-ui`, `Segoe UI`, sans-serif); table numbers use `font-variant-numeric: tabular-nums`.
- Scale: 48/56 hero, 32/38 section, 24/30 subsection, 18/28 lead, 16/24 body, 13/18 label. One `h1`; headings remain in order.

## Spacing and layout

An 8px base rhythm with 4px for tight label relationships. Content is capped at 1240px. The landing header uses an editorial 7/5 split: copy and task control on the left, explanatory art on the right. Setup then becomes a linear three-act workbench—load, key, review. On 390px, art crops to a shallow scene, file wells stack, results become record cards, and sticky/fixed chrome is avoided so browser controls and safe areas cannot cover actions.

Controls are at least 44px tall, adjacent actions have 8px separation, and table density is reserved for the report rather than the setup flow.

## Interaction grammar

- Dropping a file “places a specimen”: the well changes from dashed to solid and reveals file facts.
- Key columns are literal removable tags shared between both schemas. Common headers are offered; mismatch is stated, never inferred.
- The compare action closes the setup act and opens a paper-like evidence ledger.
- Result filters are a single segmented rail. Clicking a record opens a field ledger immediately below/from its originating card.
- Duplicate keys are quarantined into an ambiguity section; the app does not invent a pairing.
- Import/export and restore-license actions are explicit ownership affordances.

## Motion policy

Useful transitions run 180–240ms: file facts fade/translate from their well; results reveal from the compare button’s direction; expanded field detail opens with opacity and a small vertical transform. The illustration has one slow, non-looping entrance. No background loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are instant opacity/cuts.

## Asset plan and provenance

Hero subject: two oversized translucent paper leaves printed with abstract grid marks, anchored by a luminous key-shaped pin, passing through a round inspection lens; tiny report slips gather below. World/materials: midnight editorial still life, ink-black stage, cut paper, frosted glass, soft grain, tactile risograph edges. Light/lens: controlled side light, subtle violet rim, orthographic editorial composition with generous negative space. Palette words: warm paper, chartreuse, iris violet, oxidized aqua, coral accent. Negative list: people, hands, brands, logos, readable words, numbers, UI screenshots, gradients, glossy 3D app icons, watermark, illegible pseudo-text.

Generation prompt: “Surreal editorial still life for a private CSV reconciliation tool: two oversized translucent warm-paper leaves with sparse abstract grid marks (no letters or numbers), aligned by a luminous chartreuse key-shaped pin and viewed through one circular frosted-glass inspection lens; a few tiny aqua, violet and coral report slips collect below; midnight ink-black stage, cut-paper and risograph texture, controlled soft side light, subtle violet rim light, orthographic magazine composition, generous negative space, sophisticated tactile materials, limited palette of warm ivory, chartreuse, iris violet, oxidized aqua and coral. No people, no hands, no brands, no logos, no readable text, no numbers, no watermark, no UI screenshot, no glossy app icon.”

Generated with the factory image model (`factory-image`, Azure AI Foundry) on 2026-08-28. Generated output is original for this product. The selected source and prompt sidecar live in `assets/src/`; optimized WebP/AVIF derivatives ship in `public/assets/`. App icons are hand-authored SVG geometry and rasterized locally; they use the same key/lens motif.
