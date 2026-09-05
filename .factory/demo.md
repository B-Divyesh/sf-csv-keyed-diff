# CSV Keyed Diff demo

Demo URL: <https://csv-keyed-diff.sociobot.in/demo>

The landing page opens this demo in one click. `/demo` immediately loads `sample-before.csv` and `sample-after.csv`, selects `account_id`, and displays a populated report with two changed records, one addition, one removal, one duplicate-key group, and one unchanged record. The sample includes reordered rows, UTF-8 names, quoted commas, escaped quotes, and a quoted line break.

The persistent banner says **Demo — sample data, nothing is saved**. **Reset demo** restores the bundled sample and filters. **Start for real** discards the in-memory sample and opens the normal app.

Demo state uses the in-memory namespace `demo:memory`. It never calls the real `csv-keyed-diff` IndexedDB session store and does not read or write license localStorage. Closing or leaving the page discards every demo change. The `@claim:demo-sandbox` browser regression creates a real session, changes and resets demo data, and proves that the real session is unchanged afterward.
