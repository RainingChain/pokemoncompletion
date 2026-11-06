import { test, expect } from './fixtures.js';
import { fileURLToPath } from 'node:url';

test('Platinum worker and WASM produce the known trainer seed', async ({ page }) => {
  await page.goto('/BattleFacilities/Platinum/RngManipulation');
  await page.waitForFunction(() => !!window.my_tests);
  // Existing application diagnostic performs a real worker/WASM calculation
  // and asserts the known output seed 364669460 for input 0x15BC6A14.
  expect(await page.evaluate(() => window.my_tests.generate_one())).toBe(true);
});

test('.NET save utilities load and execute the real assembly', async ({ page }) => {
  await page.goto('/completion/Emerald');
  const save = fileURLToPath(new URL('../../src/pokemonCompletion/utils/Pokemon Emerald.sav', import.meta.url));
  await page.locator('#file-upload').first().setInputFiles(save);
  await expect(page.getByText('Currently loaded savefile #1: Pokemon Emerald.sav', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unload .sav', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Import Progress/ })).toBeVisible();
  await page.getByRole('button', { name: 'Unload .sav', exact: true }).click();
  await expect(page.getByText('Load .sav', { exact: true })).toBeVisible();
});
