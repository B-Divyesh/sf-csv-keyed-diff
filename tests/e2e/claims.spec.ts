import { expect, test, type Page } from '@playwright/test';

const basicBefore = 'id,name,status\n1,Ada,active\n2,Lin,active';
const basicAfter = 'id,name,status\n2,Lin,inactive\n3,Maya,new';

async function openDemo(page: Page) {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#results')).toBeVisible();
}

async function startReal(page: Page) {
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function loadPair(page: Page, before = basicBefore, after = basicAfter, beforeName = 'real-before.csv', afterName = 'real-after.csv') {
  await page.locator('#file-before').setInputFiles({ name: beforeName, mimeType: 'text/csv', buffer: Buffer.from(before) });
  await expect(page.locator('#status')).toContainText(`${beforeName} is ready`);
  await page.locator('#file-after').setInputFiles({ name: afterName, mimeType: 'text/csv', buffer: Buffer.from(after) });
  await expect(page.locator('#status')).toContainText(`${afterName} is ready`);
}

async function chooseKeysAndCompare(page: Page, keys: string[]) {
  for (const key of keys) {
    const input = page.locator(`#key-options input[value="${key}"]`);
    if (!await input.isChecked()) await input.evaluate((element: HTMLInputElement) => element.click());
    await expect(input).toBeChecked();
  }
  await page.getByRole('button', { name: 'Build change report' }).click();
  await expect(page.locator('#status')).toHaveText('Change report is ready.');
  await expect(page.locator('#results')).toBeVisible();
}

async function expectMetric(page: Page, kind: string, value: number) {
  await expect(page.locator(`.metric[data-kind="${kind}"] > span`)).toHaveText(String(value));
}

async function downloadText(page: Page, buttonName: string) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return { name: download.suggestedFilename(), text: Buffer.concat(chunks).toString('utf8') };
}

test('@claim:demo-sandbox sample mode resets in memory and does not change a real session', async ({ page }) => {
  await startReal(page);
  await loadPair(page);
  await chooseKeysAndCompare(page, ['id']);
  await expect(page.locator('#result-context')).toContainText('real-before.csv → real-after.csv');

  await page.goto('/demo');
  await expect(page.locator('#result-context')).toContainText('sample-before.csv → sample-after.csv');
  await loadPair(page, 'id,name\n9,Temporary', 'id,name\n9,Changed', 'demo-before.csv', 'demo-after.csv');
  await chooseKeysAndCompare(page, ['id']);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#result-context')).toContainText('sample-before.csv → sample-after.csv');
  await expect(page.locator('#status')).toHaveText('Sample data reset.');

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.locator('#result-context')).toContainText('real-before.csv → real-after.csv');
  await expect(page.locator('#status')).toContainText('Restored local session');
});

test('@claim:local-processing a complete comparison sends no CSV data or runtime resource off origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  const secret = 'PRIVATE-CUSTOMER-7788';
  await loadPair(page, `id,name\n1,${secret}`, `id,name\n1,${secret}-changed`, 'private-before.csv', 'private-after.csv');
  await chooseKeysAndCompare(page, ['id']);

  const origin = new URL(page.url()).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
  expect(requests.some((url) => url.includes(secret))).toBe(false);
  const remoteResources = await page.evaluate(() => performance.getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => new URL(url).origin !== location.origin));
  expect(remoteResources).toEqual([]);
});

test('@claim:offline-reload the populated sample reloads and exports CSV after the browser goes offline', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await openDemo(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText(/Offline — comparison and CSV export still work/)).toBeVisible();
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expectMetric(page, 'changed', 2);
    const download = await downloadText(page, 'Export filtered CSV');
    expect(download.name).toBe('csv-keyed-diff-report.csv');
    expect(download.text).toContain('changed,AC-1042');
  } finally {
    await context.close();
  }
});

test('@claim:csv-values UTF-8, quoted commas, quotes, and line breaks survive comparison', async ({ page }) => {
  await openDemo(page);
  await loadPair(
    page,
    'id,name,note\n1,"Amélie, Inc.","said ""yes""\nfirst line"',
    'id,name,note\n1,"Amélie & Co.","said ""yes""\nsecond line"',
  );
  await chooseKeysAndCompare(page, ['id']);
  await page.locator('.record.changed summary').click();
  await expect(page.locator('.record.changed .record-body')).toContainText('Amélie, Inc.');
  await expect(page.locator('.record.changed .record-body')).toContainText('said "yes"\nfirst line');
  await expect(page.locator('.record.changed .record-body')).toContainText('said "yes"\nsecond line');
});

test('@claim:key-alignment one or more selected columns align business records', async ({ page }) => {
  await openDemo(page);
  await loadPair(
    page,
    'tenant,id,name,status\nA,1,One,open\nB,1,Other,closed',
    'tenant,id,name,status\nB,1,Other,active\nA,1,One,open',
  );
  await chooseKeysAndCompare(page, ['tenant', 'id']);
  await expect(page.locator('#result-context')).toContainText('keyed by tenant + id');
  await expectMetric(page, 'changed', 1);
  await expectMetric(page, 'unchanged', 1);
});

test('@claim:reorder-changes reordered sample rows yield exact added, removed, and changed outcomes', async ({ page }) => {
  await openDemo(page);
  await expectMetric(page, 'changed', 2);
  await expectMetric(page, 'added', 1);
  await expectMetric(page, 'removed', 1);
  await expectMetric(page, 'unchanged', 1);
});

test('@claim:duplicate-keys duplicate keys are disclosed and excluded from automatic counts', async ({ page }) => {
  await openDemo(page);
  await expectMetric(page, 'duplicates', 1);
  await expect(page.locator('.ambiguity-note')).toContainText('do not affect added, removed, or changed counts');
  await page.locator('.record.duplicate summary').click();
  await expect(page.locator('.record.duplicate')).toContainText('2 before · 2 after');
});

test('@claim:csv-export the filter controls the records written to the CSV report', async ({ page }) => {
  await openDemo(page);
  for (const kind of ['added', 'removed', 'duplicates']) await page.locator(`#filters input[value="${kind}"]`).uncheck({ force: true });
  const download = await downloadText(page, 'Export filtered CSV');
  expect(download.name).toBe('csv-keyed-diff-report.csv');
  expect(download.text.startsWith('\uFEFFchange_type,account_id,column,before,after')).toBe(true);
  expect(download.text.match(/(?:^|\r\n)changed,/g)).toHaveLength(5);
  expect(download.text).not.toContain('\nadded,');
  expect(download.text).not.toContain('\nremoved,');
  expect(download.text).not.toContain('\nduplicate,');
});

test('@claim:session-restore a real comparison returns after a page reload', async ({ page }) => {
  await startReal(page);
  await loadPair(page);
  await chooseKeysAndCompare(page, ['id']);
  await page.reload();
  await expect(page.locator('#status')).toContainText('Restored local session');
  await expect(page.locator('#result-context')).toContainText('real-before.csv → real-after.csv');
  await expectMetric(page, 'changed', 1);
});

test('@claim:session-clear clearing a real session removes it after reload', async ({ page }) => {
  await startReal(page);
  await loadPair(page);
  await chooseKeysAndCompare(page, ['id']);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear local session' }).click();
  await expect(page.locator('#status')).toHaveText('Local session cleared.');
  await expect(page.locator('#results')).toBeHidden();
  await page.reload();
  await expect(page.locator('#status')).toHaveText('Waiting for two CSV files.');
  await expect(page.locator('#results')).toBeHidden();
});

test('@claim:file-limit a 50 MiB file is accepted and a larger file is rejected', async ({ page }) => {
  await page.addInitScript(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      if (this.name === 'limit.csv') return Promise.resolve('id\n1');
      return original.call(this);
    };
  });
  await openDemo(page);
  const setSizedFile = (size: number, name: string) => page.locator('#file-before').evaluate((input, value) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(value.size)], value.name, { type: 'text/csv' }));
    (input as HTMLInputElement).files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { size, name });

  await setSizedFile(50 * 1024 * 1024, 'limit.csv');
  await expect(page.locator('#status')).toContainText('limit.csv is ready. 1 records found.');
  await setSizedFile(50 * 1024 * 1024 + 1, 'too-large.csv');
  await expect(page.locator('#status')).toContainText('too-large.csv is over the 50 MiB browser limit');
});

test('@claim:free-workflow CSV comparison and CSV export finish without a license or account', async ({ page }) => {
  await openDemo(page);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:csv-keyed-diff'))).toBeNull();
  await expect(page.locator('#export-json')).toBeHidden();
  const download = await downloadText(page, 'Export filtered CSV');
  expect(download.text).toContain('changed,AC-1042');
  await expectMetric(page, 'added', 1);
  await expectMetric(page, 'removed', 1);
});

test('@claim:pro-json a valid restored Pro license enables a structured JSON evidence export', async ({ page }) => {
  let verificationRequest: { url: string; method: string; body: string | null } | undefined;
  await page.route('https://api.sociobot.in/api/v1/products/csv-keyed-diff/verify?license=fixture-pro-license', async (route) => {
    verificationRequest = { url: route.request().url(), method: route.request().method(), body: route.request().postData() };
    await route.fulfill({ json: { valid: true, reason: 'ok' } });
  });
  await startReal(page);
  await loadPair(page);
  await chooseKeysAndCompare(page, ['id']);
  await expect(page.locator('.price-panel')).toContainText('$19');
  await expect(page.locator('.price-panel')).toContainText('One-time purchase · one user');
  await page.getByRole('button', { name: 'Have a license? Restore it' }).click();
  await page.getByLabel('License token').fill('fixture-pro-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('#license-status')).toContainText('Pro is active on this device');
  expect(verificationRequest).toEqual({
    url: 'https://api.sociobot.in/api/v1/products/csv-keyed-diff/verify?license=fixture-pro-license',
    method: 'GET',
    body: null,
  });
  expect(verificationRequest?.url).not.toContain('real-before.csv');
  const download = await downloadText(page, 'Export evidence JSON');
  expect(download.name).toBe('csv-keyed-diff-evidence.json');
  const evidence = JSON.parse(download.text);
  expect(evidence).toEqual(expect.objectContaining({ before: 'real-before.csv', after: 'real-after.csv' }));
  expect(evidence.report.changed).toHaveLength(1);
});

test('@claim:pro-offline a cached Pro license keeps JSON evidence available offline and checks on reconnect', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await loadPair(page);
    await chooseKeysAndCompare(page, ['id']);
    await page.evaluate(() => {
      localStorage.setItem('sb_license:csv-keyed-diff', 'offline-fixture-license');
      localStorage.setItem('sb_license_verdict:csv-keyed-diff', JSON.stringify({ valid: true, reason: 'ok', checkedAt: 0 }));
    });

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#license-status')).toHaveText('Pro remains available offline. It will check when you are online.');
    await expect(page.getByRole('button', { name: 'Export evidence JSON' })).toBeVisible();
    const offlineExport = await downloadText(page, 'Export evidence JSON');
    expect(JSON.parse(offlineExport.text)).toEqual(expect.objectContaining({ before: 'real-before.csv', after: 'real-after.csv' }));

    let verificationRequests = 0;
    await page.route('https://api.sociobot.in/api/v1/products/csv-keyed-diff/verify?license=offline-fixture-license', async (route) => {
      verificationRequests += 1;
      await route.fulfill({ json: { valid: true, reason: 'ok' } });
    });
    await context.setOffline(false);
    await expect.poll(() => verificationRequests).toBe(1);
    await expect(page.locator('#license-status')).toContainText('Pro is active on this device');
    expect(verificationRequests).toBe(1);
  } finally {
    await context.close();
  }
});

test('@claim:pro-revocation a revoked license response removes Pro JSON access', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('sb_license:csv-keyed-diff')) {
      localStorage.setItem('sb_license:csv-keyed-diff', 'revoked-fixture-license');
      localStorage.setItem('sb_license_verdict:csv-keyed-diff', JSON.stringify({ valid: true, reason: 'ok', checkedAt: Date.now() }));
    }
  });
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/csv-keyed-diff/verify?license=revoked-fixture-license', async (route) => {
    verificationRequests += 1;
    await route.fulfill({ json: { valid: false, reason: 'revoked' } });
  });
  await startReal(page);
  await loadPair(page);
  await chooseKeysAndCompare(page, ['id']);
  await expect(page.getByRole('button', { name: 'Export evidence JSON' })).toBeVisible();
  await page.evaluate(() => {
    const key = 'sb_license_verdict:csv-keyed-diff';
    const verdict = JSON.parse(localStorage.getItem(key) ?? '{}');
    localStorage.setItem(key, JSON.stringify({ ...verdict, checkedAt: 0 }));
  });
  await page.reload();
  await expect(page.locator('#license-status')).toContainText('The license is not active (revoked).');
  await expect(page.getByRole('button', { name: 'Export evidence JSON' })).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:csv-keyed-diff'))).toBeNull();
  expect(verificationRequests).toBe(1);
});

test('@claim:exact-matching similar values are not inferred to be the same key', async ({ page }) => {
  await openDemo(page);
  await loadPair(page, 'id,name\n001,Same customer', 'id,name\n1,Same customer');
  await chooseKeysAndCompare(page, ['id']);
  await expectMetric(page, 'changed', 0);
  await expectMetric(page, 'added', 1);
  await expectMetric(page, 'removed', 1);
});

test('@claim:one-column a key-only CSV produces additions, removals, and unchanged records', async ({ page }) => {
  await openDemo(page);
  await loadPair(page, 'id\n1\n2', 'id\n2\n3');
  await chooseKeysAndCompare(page, ['id']);
  await expectMetric(page, 'changed', 0);
  await expectMetric(page, 'added', 1);
  await expectMetric(page, 'removed', 1);
  await expectMetric(page, 'unchanged', 1);
});
