import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const before = 'id,name,status\n1,Ada,active\n2,Lin,active\n4,Sam,pending\n4,Samuel,pending';
const after = 'id,name,status\n3,Maya,new\n1,Ada,inactive\n4,Sam,done\n4,Samuel,pending';

test('compares files, discloses duplicate keys, and passes a populated accessibility scan', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compare CSV exports by business key');
  await page.locator('#file-before').setInputFiles({ name: 'before.csv', mimeType: 'text/csv', buffer: Buffer.from(before) });
  await page.locator('#file-after').setInputFiles({ name: 'after.csv', mimeType: 'text/csv', buffer: Buffer.from(after) });
  await page.locator('#key-options input[value="id"]').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#key-options input[value="id"]')).toBeChecked();
  await page.getByRole('button', { name: 'Build change report' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#summary')).toContainText('Changed');
  await expect(page.locator('#summary')).toContainText('Ambiguous');
  await expect(page.locator('.ambiguity-note')).toContainText('human pairing');
  await page.locator('.record.changed summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.record.changed')).toHaveAttribute('open', '');

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

});

test('legal routes use the shared header and mobile layout does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('header nav')).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('Built by Param Factory');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('unknown paths return the designed 404 page with an actual 404 status', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — CSV Keyed Diff');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
  await expect(page.getByRole('link', { name: 'Compare CSV files' })).toHaveAttribute('href', '/');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('the first phone screen states the job, audience, and sample action without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compare CSV exports by business key');
  await expect(page.getByText(/For implementation and operations teams/)).toBeVisible();
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(action).toBeVisible();
  expect((await action.boundingBox())!.y + (await action.boundingBox())!.height).toBeLessThan(844);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('demo opens with the sample report and persistent label in the first viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — CSV Keyed Diff');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Review changed records' })).toBeInViewport();
  await expect(page.locator('.metric[data-kind="changed"]')).toBeInViewport();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('reduced motion removes smooth scrolling and visible transition duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const styles = await page.getByRole('link', { name: 'Try it with sample data' }).evaluate((element) => ({
    duration: getComputedStyle(element).transitionDuration,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(Number.parseFloat(styles.duration)).toBeLessThanOrEqual(0.001);
  expect(styles.scroll).toBe('auto');
});

test('the update action waits for the new worker, reloads, and leaves the new cache active', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.evaluate(() => fetch('/__test/sw-version?value=2', { method: 'POST' }));
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  await expect(page.getByText('An updated version is ready.')).toBeVisible();
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: 'Reload app' }).click(),
  ]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compare CSV exports by business key');
  await expect.poll(() => page.evaluate(() => caches.keys())).toEqual(['csv-keyed-diff-test-2']);
  await page.evaluate(() => fetch('/__test/sw-version', { method: 'POST' }));
});

test('a checkout return verifies its new token instead of reusing an older verdict', async ({ page }) => {
  let verificationRequests = 0;
  await page.addInitScript(() => {
    localStorage.setItem('sb_license_verdict:csv-keyed-diff', JSON.stringify({ valid: false, reason: 'invalid', checkedAt: Date.now() }));
    localStorage.setItem('sb_license:csv-keyed-diff', 'older-token');
  });
  await page.route('https://api.sociobot.in/api/v1/products/csv-keyed-diff/verify?license=new-paid-token', async (route) => {
    verificationRequests += 1;
    await route.fulfill({ json: { valid: true, reason: 'ok' } });
  });

  await page.goto('/?license=new-paid-token');

  await expect(page.getByText(/Pro is active on this device/)).toBeVisible();
  expect(verificationRequests).toBe(1);
  await expect.poll(() => page.evaluate(() => ({
    href: location.href,
    token: localStorage.getItem('sb_license:csv-keyed-diff'),
  }))).toEqual(expect.objectContaining({ token: 'new-paid-token' }));
  expect(await page.evaluate(() => location.search)).toBe('');
});

test('file wells expose keyboard focus and mobile links have 44px hit areas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.locator('#file-before').focus();
  await expect(page.locator('#well-before')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('#well-before')).toHaveCSS('outline-width', '3px');

  for (const selector of ['header .wordmark', 'footer .wordmark', '#pro .merchant a', 'footer nav a']) {
    const boxes = await page.locator(selector).evaluateAll((links) => links.map((link) => {
      const box = link.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }));
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
