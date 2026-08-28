import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const before = 'id,name,status\n1,Ada,active\n2,Lin,active\n4,Sam,pending\n4,Samuel,pending';
const after = 'id,name,status\n3,Maya,new\n1,Ada,inactive\n4,Sam,done\n4,Samuel,pending';

test('compares files, discloses duplicate keys, and works offline', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find the record');
  await page.locator('#file-before').setInputFiles({ name: 'before.csv', mimeType: 'text/csv', buffer: Buffer.from(before) });
  await page.locator('#file-after').setInputFiles({ name: 'after.csv', mimeType: 'text/csv', buffer: Buffer.from(after) });
  await page.getByText('id', { exact: true }).last().click();
  await page.getByRole('button', { name: 'Build change report' }).click();
  await expect(page.locator('#summary')).toContainText('Changed');
  await expect(page.locator('#summary')).toContainText('Ambiguous');
  await expect(page.locator('.ambiguity-note')).toContainText('human pairing');

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Offline — comparison/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'What changed' })).toBeVisible();
});

test('legal routes have one h1 and mobile layout does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
