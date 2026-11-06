import { fileURLToPath } from 'node:url';
import { test, expect } from './fixtures.js';

const save = fileURLToPath(new URL('../fixtures/Pokemon Emerald.sav', import.meta.url));

async function exportProgress(page) {
  const button = page.getByRole('button', { name: 'Export', exact: true });
  if (!await button.isVisible())
    await page.getByText('Import/Export Between Computers', { exact: false }).click();
  await button.click();
  return JSON.parse(await page.locator('textarea').last().inputValue());
}

async function loadSave(page) {
  await page.locator('#file-upload').first().setInputFiles(save);
  await expect(page.getByText('Currently loaded savefile #1: Pokemon Emerald.sav', { exact: true })).toBeVisible();
  await page.getByRole('heading', { name: /Import Progress/ }).click();
}

for (const initial of ['empty', 'stale map-item progress']) {
  test(`Emerald save synchronizes a checklist with ${initial} state and persists after reload`, async ({ page }) => {
    await page.goto('/completion/Emerald');
    const empty = await exportProgress(page);
    expect(Object.values(empty).every(value => value === '')).toBe(true);

    if (initial !== 'empty') {
      // Seed incorrect existing progress through the public import UI, so the
      // synchronization must remove stale checks as well as add obtained ones.
      // Hidden Nugget in the Trick House: the copied save has not collected it.
      await page.locator('textarea').last().fill(JSON.stringify({ itemInMap: '501' }));
      await page.getByRole('button', { name: 'Import', exact: true }).click();
      expect((await exportProgress(page)).itemInMap).toBe('501');
    }

    await loadSave(page);
    if (initial !== 'empty')
      await expect(page.getByRole('heading', { name: 'Elements not obtained in .sav file but marked as obtained in the website tracker:', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Sync All Categories', exact: true }).click();
    await expect(page.getByText('No differences between .sav and website tracker', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Import Progress/ })).toContainText('No Differences');

    const synchronized = await exportProgress(page);
    expect(synchronized).not.toEqual(empty);
    // Characterize all exported category IDs, not only the aggregate count.
    expect(JSON.stringify(synchronized, null, 2) + '\n').toMatchSnapshot('emerald-synchronized-progress.json');
    expect(synchronized.pokemon.split(',')).toHaveLength(386);
    expect(synchronized.itemInMap.split(',')).not.toContain('501');
    await expect(page.getByRole('heading', { name: /Completion: \d+ \// })).not.toContainText('Completion: 0 /');

    await page.reload();
    expect(await exportProgress(page)).toEqual(synchronized);
    await expect(page.getByRole('heading', { name: /Completion: \d+ \// })).not.toContainText('Completion: 0 /');

    // Loading the same save again must find no differences after persistence.
    await loadSave(page);
    await expect(page.getByText('No differences between .sav and website tracker', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sync All Categories', exact: true })).toHaveCount(0);
  });
}
