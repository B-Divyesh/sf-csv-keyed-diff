import './style.css';
import { compareCsv, parseCsv, reportCsv, type CsvData, type DiffResult, type RecordChange } from './csv';
import { cachedLicense, captureLicense, checkoutUrl, removeLicense, storeLicense, verifyLicense } from './license';
import { clearSession, loadSession, saveSession } from './storage';

const app = document.querySelector<HTMLDivElement>('#app')!;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);

function sharedFooter() {
  return `<footer><div class="footer-inner"><a class="wordmark" href="/" aria-label="CSV Keyed Diff home"><span class="mark" aria-hidden="true"></span> CSV Keyed Diff</a><p>Files never leave your device. Generated imagery disclosed.</p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://github.com/B-Divyesh/sf-csv-keyed-diff">Source</a></nav></div></footer>`;
}

function renderLegal(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — CSV Keyed Diff`;
  app.innerHTML = `<header class="site-header"><a class="wordmark" href="/"><span class="mark" aria-hidden="true"></span> CSV Keyed Diff</a></header>
    <main id="main" class="legal"><p class="eyebrow">Plain-language policy</p><h1>${privacy ? 'Privacy' : 'Terms of use'}</h1>
    ${privacy ? `<p class="lede">Your CSV files are processed inside your browser. They are not uploaded to us.</p>
      <h2>What stays on your device</h2><p>The current comparison, chosen keys, and license token are stored locally in IndexedDB or localStorage so the app can recover after a refresh and work offline. Use “Clear local session” in the app to remove comparison data. Your browser’s site-data controls can remove everything.</p>
      <h2>What reaches the network</h2><p>The app shell is downloaded from our host. If you buy or verify a Pro license, the token is sent to Sociobot’s billing API. CSV contents and filenames are never included. We use no advertising, tracking pixels, third-party fonts, or runtime scripts.</p>
      <h2>Your choices</h2><p>You can use the complete comparison and CSV report workflow without an account. Avoid Pro verification if you do not want a license request. Contact the operator through the repository linked in the footer for privacy questions.</p>` : `<p class="lede">Use the tool to reconcile data you are authorized to process. The software is provided as-is.</p>
      <h2>The service</h2><p>CSV Keyed Diff compares files locally and produces review aids. You remain responsible for validating results before acting on them. Do not treat the report as a backup or as professional legal, financial, or compliance advice.</p>
      <h2>Purchase and license</h2><p>CSV Keyed Diff Pro is a one-time $19 purchase for one user. Sociobot/Dodo is the merchant of record and handles payment and refunds. A refund revokes the license. The free comparison workflow and CSV report remain available without payment.</p>
      <h2>Acceptable use and warranty</h2><p>Do not use the service unlawfully or attempt to disrupt it. To the extent permitted by law, the software is supplied without warranties and liability is limited to the amount paid for the license.</p>`}
    <p class="policy-date">Effective 28 August 2026</p></main>${sharedFooter()}`;
}

if (location.pathname.startsWith('/privacy')) renderLegal('privacy');
else if (location.pathname.startsWith('/terms')) renderLegal('terms');
else void renderHome();

async function renderHome() {
  captureLicense();
  document.title = 'CSV Keyed Diff — Explain every changed record';
  app.innerHTML = `<div id="offline-banner" class="offline-banner" hidden><span aria-hidden="true">●</span> Offline — comparison and exports still work.</div>
  <header class="site-header"><a class="wordmark" href="/" aria-label="CSV Keyed Diff home"><span class="mark" aria-hidden="true"></span> CSV Keyed Diff</a><nav aria-label="Primary"><a href="#workbench">Compare</a><a href="#method">Method</a><a href="#pro">Pro</a></nav><span class="privacy-chip"><span aria-hidden="true">◆</span> Local only</span></header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">A reconciliation report, not another spreadsheet</p><h1 id="hero-title">Find the record.<br><em>Explain the change.</em></h1><p class="lede">Compare two CSV exports by the business key that actually identifies a customer, order, or account. See additions, removals, and field changes—even when rows moved.</p><a class="button primary" href="#workbench">Compare two CSVs <span aria-hidden="true">↓</span></a><p class="micro"><span aria-hidden="true">●</span> Private by design · Works offline · UTF-8 and quoted cells</p></div>
    <figure class="hero-art"><picture><source media="(max-width: 600px)" srcset="/assets/reconciliation-lens-mobile.webp"><img src="/assets/reconciliation-lens.webp" width="960" height="640" alt="Two paper data sheets aligned behind a round inspection lens and a key-shaped pin, with three report slips below" fetchpriority="high" decoding="async"></picture><figcaption>Two exports in. One reviewable account of what changed.</figcaption></figure></section>

    <section id="workbench" class="workbench" aria-labelledby="workbench-title"><div class="section-heading"><p class="eyebrow">The workbench</p><h2 id="workbench-title">Place two exports on the table</h2><p>“Before” is the older file. “After” is the newer file. Headers must be on the first row.</p></div>
      <div class="file-grid">
        ${fileWell('before', '01', 'Before CSV', 'The earlier export')}
        <div class="flow-arrow" aria-hidden="true">→</div>
        ${fileWell('after', '02', 'After CSV', 'The newer export')}
      </div>
      <div id="key-step" class="key-step" aria-labelledby="key-title"><div class="step-label"><span>03</span><div><h3 id="key-title">Choose the business key</h3><p>Select one or more columns that uniquely identify a record.</p></div></div><div id="key-options" class="key-options"><p class="empty-inline">Load both files to see shared columns.</p></div></div>
      <div class="compare-row"><button id="compare" class="button primary compare-button" disabled>Build change report <span aria-hidden="true">→</span></button><button id="clear" class="button quiet" type="button">Clear local session</button><p id="status" class="status" role="status" aria-live="polite">Waiting for two CSV files.</p></div>
    </section>

    <section id="results" class="results" hidden aria-labelledby="results-title"><div class="results-head"><div><p class="eyebrow">Reconciliation report</p><h2 id="results-title">What changed</h2><p id="result-context"></p></div><div class="result-actions"><button id="export-csv" class="button primary">Export filtered CSV</button><button id="export-json" class="button secondary" hidden>Export evidence JSON <span class="pro-tag">Pro</span></button></div></div>
      <div id="summary" class="summary" aria-label="Change summary"></div>
      <fieldset id="filters" class="filters"><legend>Include in view and export</legend></fieldset>
      <div id="duplicate-note"></div><div id="records" class="records"></div><button id="more" class="button secondary more" hidden>Show 100 more records</button>
    </section>

    <section id="method" class="method" aria-labelledby="method-title"><div><p class="eyebrow">The method</p><h2 id="method-title">Keys first. Evidence second.</h2></div><ol><li><span>1</span><div><h3>Parse honestly</h3><p>Quoted values, UTF-8, line breaks, and reordered rows are read as data—not as text lines.</p></div></li><li><span>2</span><div><h3>Align by your key</h3><p>One or several columns define identity. No sensitive-data inference or fuzzy matching.</p></div></li><li><span>3</span><div><h3>Quarantine ambiguity</h3><p>Duplicate keys are disclosed and excluded from automatic pairings.</p></div></li></ol></section>

    <section id="pro" class="pro-section" aria-labelledby="pro-title"><div><p class="eyebrow">Optional permanent unlock</p><h2 id="pro-title">Keep the core free.<br><em>Package the evidence with Pro.</em></h2><p>The complete keyed comparison and filtered CSV report are free. Pro adds a structured JSON evidence bundle for implementation handoffs and saved license portability.</p></div><div class="price-panel"><p class="price"><span>$</span>19</p><p>One time · one user</p><ul><li>JSON evidence bundle</li><li>All future Pro refinements</li><li>No subscription or account</li></ul><a id="buy" class="button primary" href="${checkoutUrl}">Buy Pro securely</a><button id="restore-toggle" class="text-button" type="button">Have a license? Restore it</button><form id="restore-form" hidden><label for="license-token">License token</label><div class="license-row"><input id="license-token" name="license" autocomplete="off" spellcheck="false"><button class="button secondary" type="submit">Verify</button></div></form><p id="license-status" class="license-status" role="status" aria-live="polite"></p><p class="merchant">Checkout by Sociobot/Dodo, merchant of record. <a href="/terms">Terms</a> apply.</p></div></section>
  </main>${sharedFooter()}<div id="update-toast" class="toast" hidden><span>An updated version is ready.</span><button class="button primary" id="reload">Reload</button></div>`;

  type State = { before?: CsvData; after?: CsvData; keys: string[]; result?: DiffResult; filters: Set<string>; limit: number };
  const state: State = { keys: [], filters: new Set(['changed', 'added', 'removed', 'duplicates']), limit: 100 };
  const status = element<HTMLParagraphElement>('status');

  function element<T extends HTMLElement>(id: string) { return document.getElementById(id) as T; }

  async function restore() {
    try {
      const saved = await loadSession();
      if (saved) {
        state.before = saved.before;
        state.after = saved.after;
        state.keys = saved.keys ?? [];
        state.result = saved.result;
        updateFiles(); updateKeys(); updateCompare();
        if (state.result) renderResults();
        status.textContent = `Restored local session from ${new Date(saved.updatedAt).toLocaleString()}.`;
      }
    } catch { status.textContent = 'Local session could not be restored. You can still compare files.'; }
  }

  async function persist() {
    try { await saveSession({ before: state.before, after: state.after, keys: state.keys, result: state.result, updatedAt: Date.now() }); } catch { /* comparison still works */ }
  }

  async function receive(side: 'before' | 'after', file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) { showError(`${file.name} is not a .csv file. Choose a CSV export.`); return; }
    if (file.size > 50 * 1024 * 1024) { showError(`${file.name} is over the 50 MB browser safety limit.`); return; }
    status.textContent = `Reading ${file.name}…`;
    document.body.classList.add('busy');
    await new Promise(requestAnimationFrame);
    try {
      state[side] = parseCsv(await file.text(), file.name);
      state.result = undefined;
      updateFiles(); updateKeys(); updateCompare(); await persist();
      status.textContent = `${file.name} is ready. ${state[side]!.rows.length.toLocaleString()} records found.`;
      element('results').hidden = true;
    } catch (error) { showError(error instanceof Error ? error.message : 'The CSV could not be read.'); }
    finally { document.body.classList.remove('busy'); }
  }

  function showError(message: string) { status.innerHTML = `<span class="error-mark">!</span> ${escapeHtml(message)}`; }
  function updateFiles() {
    for (const side of ['before', 'after'] as const) {
      const data = state[side]; const well = element(`well-${side}`); const facts = element(`facts-${side}`);
      well.classList.toggle('loaded', Boolean(data));
      facts.innerHTML = data ? `<strong>${escapeHtml(data.name)}</strong><span>${data.rows.length.toLocaleString()} rows · ${data.headers.length} columns</span>` : `<strong>Choose or drop a CSV</strong><span>Up to 50 MB · stays on this device</span>`;
    }
  }
  function updateKeys() {
    const target = element('key-options');
    if (!state.before || !state.after) { target.innerHTML = '<p class="empty-inline">Load both files to see shared columns.</p>'; return; }
    const common = state.before.headers.filter((header) => state.after!.headers.includes(header));
    state.keys = state.keys.filter((key) => common.includes(key));
    if (!common.length) { target.innerHTML = '<p class="warning-inline">No shared column names. Rename at least one header so a business key exists in both files.</p>'; return; }
    target.innerHTML = common.map((header) => `<label class="key-chip"><input type="checkbox" value="${escapeHtml(header)}" ${state.keys.includes(header) ? 'checked' : ''}><span>${escapeHtml(header)}</span></label>`).join('');
    target.querySelectorAll<HTMLInputElement>('input').forEach((input) => input.addEventListener('change', () => {
      state.keys = [...target.querySelectorAll<HTMLInputElement>('input:checked')].map((item) => item.value); state.result = undefined; updateCompare(); void persist();
    }));
  }
  function updateCompare() { element<HTMLButtonElement>('compare').disabled = !(state.before && state.after && state.keys.length); }

  document.querySelectorAll<HTMLInputElement>('input[type=file]').forEach((input) => input.addEventListener('change', () => { const file = input.files?.[0]; if (file) void receive(input.dataset.side as 'before' | 'after', file); input.value = ''; }));
  document.querySelectorAll<HTMLElement>('.file-well').forEach((well) => {
    ['dragenter', 'dragover'].forEach((type) => well.addEventListener(type, (event) => { event.preventDefault(); well.classList.add('dragging'); }));
    ['dragleave', 'drop'].forEach((type) => well.addEventListener(type, (event) => { event.preventDefault(); well.classList.remove('dragging'); }));
    well.addEventListener('drop', (event) => { const file = event.dataTransfer?.files[0]; if (file) void receive(well.dataset.side as 'before' | 'after', file); });
  });

  element('compare').addEventListener('click', async () => {
    if (!state.before || !state.after) return;
    status.textContent = 'Aligning records and comparing fields…'; document.body.classList.add('busy'); await new Promise(requestAnimationFrame);
    try { state.result = compareCsv(state.before, state.after, state.keys); state.limit = 100; renderResults(); await persist(); element('results').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); status.textContent = 'Change report is ready.'; }
    catch (error) { showError(error instanceof Error ? error.message : 'Comparison failed.'); }
    finally { document.body.classList.remove('busy'); }
  });

  element('clear').addEventListener('click', async () => {
    if (!confirm('Clear both loaded files, keys, and the current report from this device?')) return;
    state.before = undefined; state.after = undefined; state.result = undefined; state.keys = []; await clearSession(); updateFiles(); updateKeys(); updateCompare(); element('results').hidden = true; status.textContent = 'Local session cleared.';
  });

  function renderResults() {
    const result = state.result!; element('results').hidden = false;
    element('result-context').textContent = `${state.before!.name} → ${state.after!.name} · keyed by ${result.keys.join(' + ')}`;
    const metrics = [['changed', result.changed.length, 'Changed'], ['added', result.added.length, 'Added'], ['removed', result.removed.length, 'Removed'], ['duplicates', result.duplicates.length, 'Ambiguous'], ['same', result.unchanged, 'Unchanged']];
    element('summary').innerHTML = metrics.map(([kind, count, label]) => `<div class="metric ${kind}"><span>${Number(count).toLocaleString()}</span><small>${label}</small></div>`).join('');
    element('filters').innerHTML = `<legend>Include in view and export</legend>` + metrics.slice(0, 4).map(([kind, count, label]) => `<label><input type="checkbox" value="${kind}" ${state.filters.has(String(kind)) ? 'checked' : ''}><span>${label} <b>${Number(count).toLocaleString()}</b></span></label>`).join('');
    element('filters').querySelectorAll<HTMLInputElement>('input').forEach((input) => input.addEventListener('change', () => { input.checked ? state.filters.add(input.value) : state.filters.delete(input.value); state.limit = 100; renderRecords(); }));
    element('duplicate-note').innerHTML = result.duplicates.length ? `<div class="ambiguity-note"><span aria-hidden="true">◇</span><div><strong>${result.duplicates.length.toLocaleString()} key${result.duplicates.length === 1 ? '' : 's'} need a human pairing</strong><p>At least one file contains the same key more than once. These rows are disclosed below and excluded from automatic added, removed, and changed counts.</p></div></div>` : '';
    element('export-json').hidden = !cachedLicense().unlocked;
    renderRecords();
  }
  function renderRecords() {
    const result = state.result!; const groups: Array<[string, RecordChange[]]> = [['changed', result.changed], ['added', result.added], ['removed', result.removed]];
    const chunks: string[] = []; let shown = 0; let total = 0;
    for (const [kind, items] of groups) {
      if (!state.filters.has(kind)) continue; total += items.length;
      for (const item of items) { if (shown >= state.limit) break; chunks.push(recordCard(kind, item)); shown++; }
    }
    if (state.filters.has('duplicates')) { total += result.duplicates.length; for (const item of result.duplicates) { if (shown >= state.limit) break; chunks.push(`<details class="record duplicate"><summary><span class="status-word">Ambiguous</span><strong>${escapeHtml(item.key)}</strong><span>${item.before.length} before · ${item.after.length} after</span></summary><div class="record-body"><p>These rows share a key, so the app will not guess which records correspond.</p>${rowTable('Before rows', item.before)}${rowTable('After rows', item.after)}</div></details>`); shown++; } }
    element('records').innerHTML = chunks.length ? chunks.join('') : '<div class="empty-results"><span aria-hidden="true">◎</span><h3>No records in this view</h3><p>Turn on another report filter to inspect its records.</p></div>';
    const more = element<HTMLButtonElement>('more'); more.hidden = shown >= total; more.textContent = `Show ${Math.min(100, total - shown)} more records`;
  }
  function recordCard(kind: string, item: RecordChange) {
    const detail = kind === 'changed' ? `<div class="field-table" role="table" aria-label="Changed fields"><div class="field-head" role="row"><span role="columnheader">Field</span><span role="columnheader">Before</span><span role="columnheader">After</span></div>${item.fields.map((field) => `<div class="field-row" role="row"><strong role="cell">${escapeHtml(field.column)}</strong><span role="cell">${value(field.before)}</span><span role="cell">${value(field.after)}</span></div>`).join('')}</div>` : rowTable(kind === 'added' ? 'New row' : 'Previous row', [kind === 'added' ? item.after! : item.before!]);
    return `<details class="record ${kind}"><summary><span class="status-word">${kind}</span><strong>${escapeHtml(item.key)}</strong><span>${kind === 'changed' ? `${item.fields.length} field${item.fields.length === 1 ? '' : 's'}` : 'Full record'}</span></summary><div class="record-body">${detail}</div></details>`;
  }
  function value(text: string) { return text === '' ? '<i class="empty-value">empty</i>' : `<span class="cell-value">${escapeHtml(text)}</span>`; }
  function rowTable(title: string, rows: Record<string, string>[]) { return `<div class="row-group"><h4>${title}</h4>${rows.length ? rows.map((row) => `<dl>${Object.entries(row).map(([key, val]) => `<div><dt>${escapeHtml(key)}</dt><dd>${value(val)}</dd></div>`).join('')}</dl>`).join('') : '<p>No matching row in this file.</p>'}</div>`; }

  element('more').addEventListener('click', () => { state.limit += 100; renderRecords(); });
  element('export-csv').addEventListener('click', () => { if (state.result) download('csv-keyed-diff-report.csv', reportCsv(state.result, state.filters), 'text/csv;charset=utf-8'); });
  element('export-json').addEventListener('click', () => { if (state.result && cachedLicense().unlocked) download('csv-keyed-diff-evidence.json', JSON.stringify({ generatedAt: new Date().toISOString(), before: state.before?.name, after: state.after?.name, report: state.result }, null, 2), 'application/json'); });
  function download(name: string, content: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  const restoreToggle = element<HTMLButtonElement>('restore-toggle'); const restoreForm = element<HTMLFormElement>('restore-form');
  restoreToggle.addEventListener('click', () => { restoreForm.hidden = !restoreForm.hidden; if (!restoreForm.hidden) element<HTMLInputElement>('license-token').focus(); });
  restoreForm.addEventListener('submit', async (event) => { event.preventDefault(); const token = element<HTMLInputElement>('license-token').value.trim(); if (!token) return; storeLicense(token); element('license-status').textContent = 'Checking license…'; await reconcileLicense(true); });
  async function reconcileLicense(force = false) {
    const cached = cachedLicense(); if (!cached.token) return;
    if (cached.unlocked) { element('license-status').innerHTML = '<strong>Pro unlocked on this device.</strong> Your evidence export is ready.'; if (state.result) element('export-json').hidden = false; }
    try {
      const verdict = await verifyLicense(force);
      if (verdict?.valid) { element('license-status').innerHTML = '<strong>Pro unlocked on this device.</strong> Your evidence export is ready.'; if (state.result) element('export-json').hidden = false; }
      else if (verdict) { removeLicense(); element('license-status').innerHTML = `License no longer active (${escapeHtml(verdict.reason ?? 'invalid')}). <a href="${checkoutUrl}">Buy a new license</a>.`; if (state.result) element('export-json').hidden = true; }
    } catch { element('license-status').textContent = cached.unlocked ? 'Pro remains available offline; verification will retry later.' : 'Could not verify right now. Check your connection and try again.'; }
  }
  await restore(); await reconcileLicense(); setupConnectivity(); registerServiceWorker();
}

function fileWell(side: 'before' | 'after', number: string, title: string, subtitle: string) {
  return `<div><div class="step-label"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div><label id="well-${side}" class="file-well" data-side="${side}" for="file-${side}"><input id="file-${side}" data-side="${side}" type="file" accept=".csv,text/csv"><span class="file-icon" aria-hidden="true">↥</span><span id="facts-${side}" class="file-facts"><strong>Choose or drop a CSV</strong><span>Up to 50 MB · stays on this device</span></span><span class="button secondary">Browse</span></label></div>`;
}

function setupConnectivity() {
  const banner = document.getElementById('offline-banner')!;
  const update = () => { banner.hidden = navigator.onLine; };
  addEventListener('online', update); addEventListener('offline', update); update();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    const toast = document.getElementById('update-toast')!;
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) toast.hidden = false; });
    });
    document.getElementById('reload')?.addEventListener('click', () => { registration.waiting?.postMessage('SKIP_WAITING'); location.reload(); });
  });
}
