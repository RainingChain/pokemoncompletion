import { test, expect } from './fixtures.js';

const pages = [
  ['/', 'Pokémon Projects', 'Pokémon Projects'],
  ['/legal', 'Pokémon Completion', 'Use of Local Storage and Cookies'],
  ['/articles', 'Pokémon Articles', 'Articles'],
  ['/completion', 'Pokémon 100% Checklist', '100% Checklist'],
  ['/BattleFacilities', 'Pokémon Battle Facilities', 'Battle Facilities'],
  ['/VersionCompatibility/GenIII', 'Pokémon Gen III - Version Compability', 'Generation III'],
  ['/completion/Emerald', 'Pokémon Emerald Interactive Map & 100% Checklist Challenge', 'Pokémon Emerald'],
  ['/BattleFacilities/Emerald/RngManipulation', 'Pokémon Emerald Battle Facilities RNG Manipulation Tool', 'Pokémon Emerald RNG Manipulation'],
  ['/BattleFacilities/Platinum/RngManipulation', 'Pokémon Platinum Battle Facilities RNG Manipulation Tool', 'Pokemon Platinum RNG Manipulation'],
];

for (const [path, title, heading] of pages) {
  test(`direct navigation: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading').filter({ hasText: heading }).first()).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('<%-');
  });
}

test('home links navigate to the checklist index', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/completion"]').last().click();
  await expect(page).toHaveURL('/completion');
  await expect(page.locator('a[href="/completion/Emerald"]').first()).toBeVisible();
});

// HTTP assertions use the API fixture because a 404 is intentional here.
test('unknown games redirect to the checklist index', async ({ request }) => {
  const response = await request.get('/completion/NotARealGame', { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe('/completion');
});

test('unknown pages return the rendered 404, missing assets return an empty 404', async ({ request }) => {
  const page = await request.get('/this-page-does-not-exist');
  expect(page.status()).toBe(404);
  expect(await page.text()).toContain('Page not found.');
  const asset = await request.get('/webpackAssets/does-not-exist.js');
  expect(asset.status()).toBe(404);
  expect(await asset.text()).toBe('');
});
