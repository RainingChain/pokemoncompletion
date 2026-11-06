import { test, expect, openPinball } from './fixtures.js';

test('checking and unchecking a collectible persists across reloads', async ({ page }) => {
  let row = await openPinball(page);
  await expect(row.getByRole('checkbox')).not.toBeChecked();
  await row.getByRole('checkbox').check();
  await expect(page.getByRole('heading', { name: /Completion: 1 \// })).toBeVisible();
  await page.reload();
  row = await openPinball(page);
  await expect(row.getByRole('checkbox')).toBeChecked();
  await row.getByRole('checkbox').uncheck();
  await page.reload();
  row = await openPinball(page);
  await expect(row.getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByRole('heading', { name: /Completion: 0 \// })).toBeVisible();
});

test('hide obtained filters rows and survives reload', async ({ page }) => {
  const row = await openPinball(page);
  await row.getByRole('checkbox').check();
  await page.getByLabel('Hide obtained elements', { exact: true }).check();
  // The current UI deliberately retains the last clicked row until reload.
  await expect(row.getByRole('checkbox')).toBeChecked();
  await page.reload();
  await page.getByRole('button', { name: 'Expand All', exact: true }).click();
  await expect(page.getByLabel('Hide obtained elements', { exact: true })).toBeChecked();
  await expect(row).toHaveCount(0);
  await page.getByLabel('Hide obtained elements', { exact: true }).uncheck();
  await expect(row.getByRole('checkbox')).toBeChecked();
});

test('exported progress can restore a checklist and remains after reload', async ({ page }) => {
  const row = await openPinball(page);
  await row.getByRole('checkbox').check();
  await page.getByText('Import/Export Between Computers', { exact: false }).click();
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const textarea = page.locator('textarea').first();
  const exported = await textarea.inputValue();
  expect(JSON.parse(exported).pokemon).toBe('1');
  await row.getByRole('checkbox').uncheck();
  await expect(row.getByRole('checkbox')).not.toBeChecked();
  await textarea.fill(exported);
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(row.getByRole('checkbox')).toBeChecked();
  await page.reload();
  await openPinball(page);
  await expect(row.getByRole('checkbox')).toBeChecked();
});

test('interactive map zoom changes the rendered map and can be collapsed', async ({ page }) => {
  await page.goto('/completion/Emerald');
  const map = page.locator('#myMap');
  await expect(map.locator('.leaflet-marker-icon').first()).toBeVisible();
  const marker = map.locator('.leaflet-marker-icon').first();
  const before = await marker.getAttribute('style');
  await map.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(marker).not.toHaveAttribute('style', before);
  await page.locator('#interactiveMapHeader').click();
  await expect(map).toBeHidden();
  await page.locator('#interactiveMapHeader').click();
  await expect(map).toBeVisible();
});
