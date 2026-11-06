import { test, expect } from './fixtures.js';

for (const [path, name, heading] of [
  ['/', 'home.png', 'Pokémon Projects'],
  ['/legal', 'legal.png', 'Use of Local Storage and Cookies'],
  ['/completion/Pinball', 'checklist.png', 'Pokémon Pinball'],
]) {
  test(`appearance: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading').filter({ hasText: heading }).first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(name, { animations: 'disabled' });
  });
}
