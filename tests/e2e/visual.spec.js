import { test, expect } from './fixtures.js';

for (const [path, name, heading] of [
  ['/', 'home.png', 'Pokémon Projects'],
  ['/legal', 'legal.png', 'Use of Local Storage and Cookies'],
  ['/completion/Pinball', 'checklist.png', 'Pokémon Pinball'],
  ['/completion/Emerald/Guide', 'emerald-guide.png', 'Pokémon Emerald: 100% Completion Guide'],
]) {
  test(`appearance: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading').filter({ hasText: heading }).first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(name, { animations: 'disabled' });
  });
}
