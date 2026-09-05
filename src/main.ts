import './style.css';
import { compareCsv, parseCsv, reportCsv, type CsvData, type DiffResult, type RecordChange } from './csv';
import { cachedLicense, captureLicense, checkoutUrl, removeLicense, storeLicense, verifyLicense } from './license';
import { clearSession, loadSession, saveSession } from './storage';

const app = document.querySelector<HTMLDivElement>('#app')!;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
const isDemo = location.pathname === '/demo' || location.pathname === '/demo/';
document.body.classList.toggle('demo-mode', isDemo);

const DEMO_BEFORE = `account_id,customer,plan,owner,status,notes
AC-1042,"Northstar, Ltd.",Standard,Amélie Laurent,active,"Owner said ""ready""
Review Monday"
AC-1088,Cedar Health,Plus,Noah Khan,active,Renewal approved
AC-1103,Oak & Field,Standard,Lucía Vega,pending,Waiting for mapping
AC-1130,Orbit Logistics,Plus,Mina Park,active,Primary export
AC-1130,Orbit Logistics,Plus,Mina Park,paused,Duplicate source row
AC-1190,Harbor Works,Standard,Jamie Cole,active,Legacy account`;

const DEMO_AFTER = `account_id,customer,plan,owner,status,notes
AC-1204,Elm Studio,Standard,Priya Shah,new,New implementation
AC-1103,Oak & Field,Plus,Lucía Vega,active,Mapping complete
AC-1088,Cedar Health,Plus,Noah Khan,active,Renewal approved
AC-1042,"Northstar Group, Ltd.",Standard,Amélie Laurent,active,"Owner said ""ready""
Review Tuesday"
AC-1130,Orbit Logistics,Plus,Mina Park,active,Primary export
AC-1130,Orbit Logistics,Plus,Mina Park,paused,Duplicate source row`;

function setMetadata(title: string, description: string, path: string) {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://csv-keyed-diff.sociobot.in${path}`);
}

function sharedHeader() {
  return `<header class="site-header"><a class="wordmark" href="/" aria-label="CSV Keyed Diff home"><span class="mark" aria-hidden="true"></span> CSV Keyed Diff</a><nav aria-label="Primary"><a href="/demo">Demo</a><a href="/#workbench">Compare</a><a href="/privacy">Privacy</a></nav><span class="privacy-chip"><span aria-hidden="true">◆</span> Local only</span></header>`;
}

function sharedFooter() {
  return `<footer><div class="footer-inner"><a class="wordmark" href="/" aria-label="CSV Keyed Diff home"><span class="mark" aria-hidden="true"></span> CSV Keyed Diff</a><p>Compare CSV files by key on your device. This site uses generated imagery.<br><span>Built by Param Factory · v1.1.0</span></p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://github.com/B-Divyesh/sf-csv-keyed-diff">Source</a></nav></div></footer>`;
}

function renderLegal(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  setMetadata(
    `${privacy ? 'Privacy' : 'Terms'} — CSV Keyed Diff`,
    privacy ? 'Read how CSV Keyed Diff keeps comparison data on your device.' : 'Read the terms for using CSV Keyed Diff and its optional Pro license.',
    `/${kind}`,
  );
  app.innerHTML = `${sharedHeader()}<main id="main" class="legal"><p class="eyebrow">${privacy ? 'Data handling' : 'Service terms'}</p><h1>${privacy ? 'Privacy' : 'Terms of use'}</h1>
    ${privacy ? `<p class="lede">Your CSV files are processed inside your browser. They are not uploaded to us.</p>
      <h2>Data stored on your device</h2><p>Your current comparison and chosen keys use IndexedDB. A Pro license token uses localStorage. This storage lets a real session return after a refresh. The demo uses memory only and never reads this stored session.</p><p>Use “Clear local session” to remove comparison data. Your browser can remove all site data.</p>
      <h2>Network requests</h2><p>The app shell comes from this site. A Pro purchase or license check contacts the Sociobot billing API. That request includes the license token, but never CSV contents or filenames.</p><p>The app uses no advertising, analytics, tracking pixels, remote fonts, or third-party runtime scripts.</p>
      <h2>Your choices</h2><p>You can compare CSV files and export a CSV report without an account or payment. Do not verify a Pro license if you do not want a license request.</p><p>For a privacy request, use the repository link in the footer to contact the operator.</p>` : `<p class="lede">Use this tool only with data you are allowed to process.</p>
      <h2>The service</h2><p>CSV Keyed Diff compares files locally and produces a review report. Check its results before changing customer or business data.</p><p>The report is not a backup. It is not legal, financial, or compliance advice.</p>
      <h2>Purchase and license</h2><p>CSV Keyed Diff Pro costs $19 once for one user. It adds JSON evidence export. The CSV comparison and CSV report remain free.</p><p>Sociobot and Dodo handle payment and refunds as merchant of record. A refund revokes the license.</p>
      <h2>Acceptable use and warranty</h2><p>Do not use the service unlawfully or disrupt it. The software is provided without warranties where the law permits.</p><p>Liability is limited to the amount paid for the license where the law permits.</p>`}
    <p class="policy-date">Effective 5 September 2026</p></main>${sharedFooter()}`;
}

if (location.pathname === '/privacy' || location.pathname === '/privacy/') renderLegal('privacy');
else if (location.pathname === '/terms' || location.pathname === '/terms/') renderLegal('terms');
else if (location.pathname === '/' || isDemo) void renderHome();
else renderFallback404();

function renderFallback404() {
  setMetadata('Page not found — CSV Keyed Diff', 'The requested CSV Keyed Diff page does not exist.', location.pathname);
  app.innerHTML = `${sharedHeader()}<main id="main" class="not-found"><p class="eyebrow">404 error</p><h1>This page does not exist</h1><p>Return to the CSV comparison or open the sample report.</p><div class="hero-actions"><a class="button primary" href="/">Compare CSV files</a><a class="button secondary" href="/demo">Open sample report</a></div></main>${sharedFooter()}`;
}

async function renderHome() {
  if (!isDemo) captureLicense();
  setMetadata(
    isDemo ? 'Demo — CSV Keyed Diff' : 'CSV Keyed Diff — Compare CSV files by key',
    'Compare two CSV exports by business key and export a field-level change report. Files stay on your device.',
    isDemo ? '/demo' : '/',
  );
  app.innerHTML = `<div id="offline-banner" class="offline-banner" hidden><span aria-hidden="true">●</span> Offline — comparison and CSV export still work.</div>
  ${isDemo ? '<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" class="banner-button" type="button">Reset demo</button><a class="banner-button" href="/">Start for real</a></div></aside>' : ''}
  ${sharedHeader()}
  <main id="main">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">CSV reconciliation for operations teams</p><h1 id="hero-title">Compare CSV exports by business key</h1><p class="lede">For implementation and operations teams who need a clear record of added, removed, and changed fields.</p><div class="hero-actions"><a class="button primary" href="/demo">Try it with sample data</a><a class="button secondary" href="#workbench">Compare your CSV files</a></div><p class="action-note">The sample opens a filled report with changed, added, removed, and duplicate records.</p><ul class="plain-facts"><li>Files stay on this device.</li><li>Works offline after the first visit.</li><li>CSV comparison and CSV export are free.</li></ul></div>
    <figure class="hero-art"><picture><source media="(max-width: 600px)" srcset="/assets/reconciliation-lens-mobile.webp"><img src="/assets/reconciliation-lens.webp" width="960" height="640" alt="Two paper data sheets aligned behind a round inspection lens and a key-shaped pin, with three report slips below" fetchpriority="high" decoding="async"></picture><figcaption>The lens marks changed fields while the key aligns each record.</figcaption></figure></section>

    <section id="workbench" class="workbench" aria-labelledby="workbench-title"><div class="section-heading"><p class="eyebrow">Load files</p><h2 id="workbench-title">Load the older and newer CSV files</h2><p>Use the older file as “Before” and the newer file as “After.” Put headers on the first row.</p></div>
      <div class="file-grid">
        ${fileWell('before', '01', 'Before CSV', 'The older export')}
        <div class="flow-arrow" aria-hidden="true">→</div>
        ${fileWell('after', '02', 'After CSV', 'The newer export')}
      </div>
      <div id="key-step" class="key-step" aria-labelledby="key-title"><div class="step-label"><span>03</span><div><h3 id="key-title">Choose the business key</h3><p>Select one or more columns that identify one record.</p></div></div><div id="key-options" class="key-options"><p class="empty-inline">Load both files to see shared columns.</p></div></div>
      <div class="compare-row"><button id="compare" class="button primary compare-button" disabled>Build change report <span aria-hidden="true">→</span></button><button id="clear" class="button quiet" type="button">${isDemo ? 'Reset sample data' : 'Clear local session'}</button><p id="status" class="status" role="status" aria-live="polite">Waiting for two CSV files.</p></div>
    </section>

    <section id="results" class="results" hidden aria-labelledby="results-title"><div class="results-head"><div><p class="eyebrow">Comparison results</p><h2 id="results-title">Review changed records</h2><p id="result-context"></p></div><div class="result-actions"><button id="export-csv" class="button primary">Export filtered CSV</button><button id="export-json" class="button secondary" hidden>Export evidence JSON <span class="pro-tag">Pro</span></button></div></div>
      <div id="summary" class="summary" aria-label="Change summary"></div>
      <fieldset id="filters" class="filters"><legend>Include in view and export</legend></fieldset>
      <div id="duplicate-note"></div><div id="records" class="records"></div><button id="more" class="button secondary more" hidden>Show 100 more records</button>
    </section>

    <section id="method" class="method" aria-labelledby="method-title"><div><p class="eyebrow">How it works</p><h2 id="method-title">Build a keyed change report</h2></div><ol><li><span>1</span><div><h3>Read CSV values</h3><p>The parser keeps UTF-8 text, quoted values, line breaks, and row order changes.</p></div></li><li><span>2</span><div><h3>Match exact keys</h3><p>You select one or more key columns. The app does not infer identities or use fuzzy matching.</p></div></li><li><span>3</span><div><h3>Separate duplicate keys</h3><p>Duplicate keys are listed for review and excluded from automatic pairing.</p></div></li></ol></section>

    <section id="pro" class="pro-section" aria-labelledby="pro-title"><div><p class="eyebrow">Optional Pro license</p><h2 id="pro-title">Export JSON evidence with Pro</h2><p>The full keyed comparison and filtered CSV report are free. Pro adds a structured JSON file for implementation handoffs.</p></div><div class="price-panel"><p class="price"><span>$</span>19</p><p>One-time purchase · one user</p><ul><li>JSON evidence export</li><li>License restore on another device</li><li>CSV report stays free</li></ul><a id="buy" class="button primary" href="${checkoutUrl}">Buy Pro securely</a><button id="restore-toggle" class="text-button" type="button">Have a license? Restore it</button><form id="restore-form" hidden><label for="license-token">License token</label><div class="license-row"><input id="license-token" name="license" autocomplete="off" spellcheck="false"><button class="button secondary" type="submit">Verify license</button></div></form><p id="license-status" class="license-status" role="status" aria-live="polite"></p><p class="merchant">Sociobot and Dodo handle checkout as merchant of record. <a href="/terms">Read the terms</a>.</p></div></section>
  </main>${sharedFooter()}<div id="update-toast" class="toast" hidden><span>An updated version is ready.</span><button class="button primary" id="reload">Reload app</button></div>`;

  type State = { before?: CsvData; after?: CsvData; keys: string[]; result?: DiffResult; filters: Set<string>; limit: number };
  const defaultFilters = () => new Set(['changed', 'added', 'removed', 'duplicates']);
  const state: State = { keys: [], filters: defaultFilters(), limit: 100 };
  const status = element<HTMLParagraphElement>('status');

  function element<T extends HTMLElement>(id: string) { return document.getElementById(id) as T; }

  function seedDemo(message = 'Sample report is ready.') {
    state.before = parseCsv(DEMO_BEFORE, 'sample-before.csv');
    state.after = parseCsv(DEMO_AFTER, 'sample-after.csv');
    state.keys = ['account_id'];
    state.filters = defaultFilters();
    state.result = compareCsv(state.before, state.after, state.keys);
    state.limit = 100;
    updateFiles(); updateKeys(); updateCompare(); renderResults();
    status.textContent = message;
  }

  async function restore() {
    if (isDemo) { seedDemo(); return; }
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
    } catch { status.textContent = 'The local session could not be restored. You can still compare files.'; }
  }

  async function persist() {
    if (isDemo) return;
    try { await saveSession({ before: state.before, after: state.after, keys: state.keys, result: state.result, updatedAt: Date.now() }); } catch { /* The comparison remains available in memory. */ }
  }

  async function receive(side: 'before' | 'after', file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) { showError(`${file.name} is not a .csv file. Choose a CSV export.`); return; }
    if (file.size > 50 * 1024 * 1024) { showError(`${file.name} is over the 50 MiB browser limit. Choose a smaller file.`); return; }
    status.textContent = `Reading ${file.name}…`;
    document.body.classList.add('busy');
    await new Promise(requestAnimationFrame);
    try {
      state[side] = parseCsv(await file.text(), file.name);
      state.result = undefined;
      updateFiles(); updateKeys(); updateCompare(); await persist();
      status.textContent = `${file.name} is ready. ${state[side]!.rows.length.toLocaleString()} records found.`;
      element('results').hidden = true;
    } catch (error) { showError(error instanceof Error ? error.message : 'The CSV could not be read. Choose another file.'); }
    finally { document.body.classList.remove('busy'); }
  }

  function showError(message: string) { status.innerHTML = `<span class="error-mark">!</span> ${escapeHtml(message)}`; }
  function updateFiles() {
    for (const side of ['before', 'after'] as const) {
      const data = state[side]; const well = element(`well-${side}`); const facts = element(`facts-${side}`);
      well.classList.toggle('loaded', Boolean(data));
      facts.innerHTML = data ? `<strong>${escapeHtml(data.name)}</strong><span>${data.rows.length.toLocaleString()} rows · ${data.headers.length} columns</span>` : `<strong>Choose or drop a CSV</strong><span>Files over 50 MiB are rejected · stays on this device</span>`;
    }
  }
  function updateKeys() {
    const target = element('key-options');
    if (!state.before || !state.after) { target.innerHTML = '<p class="empty-inline">Load both files to see shared columns.</p>'; return; }
    const common = state.before.headers.filter((header) => state.after!.headers.includes(header));
    state.keys = state.keys.filter((key) => common.includes(key));
    if (!common.length) { target.innerHTML = '<p class="warning-inline">No column names match. Rename a key column so it has the same name in both files.</p>'; return; }
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
    status.textContent = 'Matching keys and comparing fields…'; document.body.classList.add('busy'); await new Promise(requestAnimationFrame);
    try { state.result = compareCsv(state.before, state.after, state.keys); state.limit = 100; renderResults(); await persist(); element('results').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); status.textContent = 'Change report is ready.'; }
    catch (error) { showError(error instanceof Error ? error.message : 'The comparison failed. Check the selected key.'); }
    finally { document.body.classList.remove('busy'); }
  });

  element('clear').addEventListener('click', async () => {
    if (isDemo) { seedDemo('Sample data reset.'); element('results').scrollIntoView(); return; }
    if (!confirm('Clear both loaded files, selected keys, and the current report from this device?')) return;
    state.before = undefined; state.after = undefined; state.result = undefined; state.keys = []; await clearSession(); updateFiles(); updateKeys(); updateCompare(); element('results').hidden = true; status.textContent = 'Local session cleared.';
  });

  element<HTMLButtonElement>('reset-demo')?.addEventListener('click', () => { seedDemo('Sample data reset.'); element('results').scrollIntoView(); });

  function renderResults() {
    const result = state.result!; element('results').hidden = false;
    element('result-context').textContent = `${state.before!.name} → ${state.after!.name} · keyed by ${result.keys.join(' + ')}`;
    const metrics = [['changed', result.changed.length, 'Changed'], ['added', result.added.length, 'Added'], ['removed', result.removed.length, 'Removed'], ['duplicates', result.duplicates.length, 'Ambiguous'], ['unchanged', result.unchanged, 'Unchanged']];
    element('summary').innerHTML = metrics.map(([kind, count, label]) => `<div class="metric ${kind}" data-kind="${kind}"><span>${Number(count).toLocaleString()}</span><small>${label}</small></div>`).join('');
    element('filters').innerHTML = `<legend>Include in view and export</legend>` + metrics.slice(0, 4).map(([kind, count, label]) => `<label><input type="checkbox" value="${kind}" ${state.filters.has(String(kind)) ? 'checked' : ''}><span>${label} <b>${Number(count).toLocaleString()}</b></span></label>`).join('');
    element('filters').querySelectorAll<HTMLInputElement>('input').forEach((input) => input.addEventListener('change', () => { input.checked ? state.filters.add(input.value) : state.filters.delete(input.value); state.limit = 100; renderRecords(); }));
    element('duplicate-note').innerHTML = result.duplicates.length ? `<div class="ambiguity-note"><span aria-hidden="true">◇</span><div><strong>${result.duplicates.length.toLocaleString()} key${result.duplicates.length === 1 ? '' : 's'} need human pairing</strong><p>A file has the same key more than once. These rows appear below but do not affect added, removed, or changed counts.</p></div></div>` : '';
    element('export-json').hidden = isDemo || !cachedLicense().unlocked;
    renderRecords();
  }
  function renderRecords() {
    const result = state.result!; const groups: Array<[string, RecordChange[]]> = [['changed', result.changed], ['added', result.added], ['removed', result.removed]];
    const chunks: string[] = []; let shown = 0; let total = 0;
    for (const [kind, items] of groups) {
      if (!state.filters.has(kind)) continue; total += items.length;
      for (const item of items) { if (shown >= state.limit) break; chunks.push(recordCard(kind, item)); shown++; }
    }
    if (state.filters.has('duplicates')) { total += result.duplicates.length; for (const item of result.duplicates) { if (shown >= state.limit) break; chunks.push(`<details class="record duplicate"><summary><span class="status-word">Ambiguous</span><strong>${escapeHtml(item.key)}</strong><span>${item.before.length} before · ${item.after.length} after</span></summary><div class="record-body"><p>These rows share a key, so the app will not guess which records match.</p>${rowTable('Before rows', item.before)}${rowTable('After rows', item.after)}</div></details>`); shown++; } }
    element('records').innerHTML = chunks.length ? chunks.join('') : '<div class="empty-results"><span aria-hidden="true">◎</span><h3>No records in this view</h3><p>Select another report filter to inspect its records.</p></div>';
    const more = element<HTMLButtonElement>('more'); more.hidden = shown >= total; more.textContent = `Show ${Math.min(100, total - shown)} more records`;
  }
  function recordCard(kind: string, item: RecordChange) {
    const detail = kind === 'changed' ? `<div class="field-table" role="table" aria-label="Changed fields"><div class="field-head" role="row"><span role="columnheader">Field</span><span role="columnheader">Before</span><span role="columnheader">After</span></div>${item.fields.map((field) => `<div class="field-row" role="row"><strong role="cell">${escapeHtml(field.column)}</strong><span role="cell">${value(field.before)}</span><span role="cell">${value(field.after)}</span></div>`).join('')}</div>` : rowTable(kind === 'added' ? 'New row' : 'Previous row', [kind === 'added' ? item.after! : item.before!]);
    return `<details class="record ${kind}"><summary><span class="status-word">${kind}</span><strong>${escapeHtml(item.key)}</strong><span>${kind === 'changed' ? `${item.fields.length} field${item.fields.length === 1 ? '' : 's'}` : 'Full record'}</span></summary><div class="record-body">${detail}</div></details>`;
  }
  function value(text: string) { return text === '' ? '<i class="empty-value">empty</i>' : `<span class="cell-value">${escapeHtml(text)}</span>`; }
  function rowTable(title: string, rows: Record<string, string>[]) { return `<div class="row-group"><h4>${title}</h4>${rows.length ? rows.map((row) => `<dl>${Object.entries(row).map(([key, val]) => `<div><dt>${escapeHtml(key)}</dt><dd>${value(val)}</dd></div>`).join('')}</dl>`).join('') : '<p>No matching row appears in this file.</p>'}</div>`; }

  element('more').addEventListener('click', () => { state.limit += 100; renderRecords(); });
  element('export-csv').addEventListener('click', () => { if (state.result) download('csv-keyed-diff-report.csv', reportCsv(state.result, state.filters), 'text/csv;charset=utf-8'); });
  element('export-json').addEventListener('click', () => { if (state.result && !isDemo && cachedLicense().unlocked) download('csv-keyed-diff-evidence.json', JSON.stringify({ generatedAt: new Date().toISOString(), before: state.before?.name, after: state.after?.name, report: state.result }, null, 2), 'application/json'); });
  function download(name: string, content: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  const restoreToggle = element<HTMLButtonElement>('restore-toggle'); const restoreForm = element<HTMLFormElement>('restore-form');
  restoreToggle.addEventListener('click', () => { restoreForm.hidden = !restoreForm.hidden; if (!restoreForm.hidden) element<HTMLInputElement>('license-token').focus(); });
  restoreForm.addEventListener('submit', async (event) => { event.preventDefault(); const token = element<HTMLInputElement>('license-token').value.trim(); if (!token || isDemo) return; storeLicense(token); element('license-status').textContent = 'Checking license…'; await reconcileLicense(true); });
  async function reconcileLicense(force = false) {
    if (isDemo) return;
    const cached = cachedLicense(); if (!cached.token) return;
    if (cached.unlocked) { element('license-status').innerHTML = '<strong>Pro is active on this device.</strong> JSON export is ready.'; if (state.result) element('export-json').hidden = false; }
    try {
      const verdict = await verifyLicense(force);
      if (verdict?.valid) { element('license-status').innerHTML = '<strong>Pro is active on this device.</strong> JSON export is ready.'; if (state.result) element('export-json').hidden = false; }
      else if (verdict) { removeLicense(); element('license-status').innerHTML = `The license is not active (${escapeHtml(verdict.reason ?? 'invalid')}). <a href="${checkoutUrl}">Buy a new license</a>.`; if (state.result) element('export-json').hidden = true; }
    } catch { element('license-status').textContent = cached.unlocked ? 'Pro remains available offline. The app will check again later.' : 'The license could not be checked. Check your connection and try again.'; }
  }
  await restore(); await reconcileLicense(); setupConnectivity(); registerServiceWorker();
}

function fileWell(side: 'before' | 'after', number: string, title: string, subtitle: string) {
  return `<div><div class="step-label"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div><label id="well-${side}" class="file-well" data-side="${side}" for="file-${side}"><input id="file-${side}" data-side="${side}" type="file" accept=".csv,text/csv"><span class="file-icon" aria-hidden="true">↥</span><span id="facts-${side}" class="file-facts"><strong>Choose or drop a CSV</strong><span>Files over 50 MiB are rejected · stays on this device</span></span><span class="button secondary">Browse files</span></label></div>`;
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
    document.getElementById('reload')?.addEventListener('click', () => {
      if (!registration.waiting) { location.reload(); return; }
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      }, { once: true });
      registration.waiting.postMessage('SKIP_WAITING');
    });
  });
}
