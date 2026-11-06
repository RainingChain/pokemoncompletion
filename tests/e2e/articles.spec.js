import { test, expect } from './fixtures.js';

const articles = [
  ['/completion/Emerald/Guide', 'Pokémon Emerald: 100% Completion Guide'],
  ['/articles/Platinum_Battle_Tower_RNG_Manipulation', 'Pokémon Platinum: Battle Tower RNG Manipulation'],
  ['/articles/Black2_Battle_Institute_9999_Points', 'Pokémon Black 2: Battle Institute 9999 Points'],
  ['/articles/GamePreservation', 'Pokémon Game Preservation'],
  ['/articles/Crystal_Unobtainable_Decorations', 'Pokémon Crystal: Unobtainable Decorations'],
  ['/articles/PinballRS_Complete_Pokedex', 'Pokémon Pinball Ruby & Sapphire: Complete Pokédex'],
  ['/articles/Black2_Subway_Rng_Manipulation', 'Pokémon Black 2: Subway RNG Manipulation'],
  ['/articles/Emerald_BattlePyramid_Exploit', 'Pokémon Emerald: Battle Pyramid Exploit'],
  ['/articles/Emerald_Battle_Tower_RNG_Manipulation', 'Pokémon Emerald: Battle Tower RNG Manipulation'],
];

for (const [url, heading] of articles) {
  test(`Markdown article: ${url}`, async ({ page }) => {
    expect((await page.goto(url)).status()).toBe(200);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    const content = page.locator('.markdown-content');
    await expect(content).not.toContainText('{{');
    for (const image of await content.locator('img').all()) {
      await expect(image).toHaveJSProperty('complete', true);
      expect(await image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0);
    }
    for (const link of await content.locator('a[href^="#"]').all()) {
      const target = await link.getAttribute('href');
      await expect(page.locator(target)).toHaveCount(1);
    }
  });
}

test('Markdown guide preserves nested RNG targets and script downloads', async ({ page, request }) => {
  await page.goto('/completion/Emerald/Guide');
  const mudkip = page.getByRole('link', { name: 'RNG manipulate Mudkip', exact: true });
  await expect(mudkip).toHaveAttribute('href', 'https://www.pokemonrng.com/emerald-static/');
  await expect(mudkip.locator('..').locator('ul')).toContainText('Target advance: 1475');
  await expect(mudkip.locator('..').locator('ul')).toContainText('Target nature: Brave.');
  await page.goto('/articles/Emerald_Battle_Tower_RNG_Manipulation');
  const scripts = page.getByRole('link', { name: 'Script', exact: true });
  await expect(scripts).toHaveCount(4);
  for (const link of await scripts.all()) {
    const script = await request.get(await link.getAttribute('href'));
    expect(script.status()).toBe(200);
    expect((await script.text()).length).toBeGreaterThan(100);
  }
  await page.goto('/articles/Black2_Subway_Rng_Manipulation');
  await expect(page.locator('.markdown-content pre code')).toHaveCount(3);
  await expect(page.locator('.markdown-content pre code').last()).toHaveText('AbilityIdx = (seed >> 32) % 2\n');
});

test('legal cookie opt-out works without an inline event handler', async ({ page }) => {
  await page.goto('/legal');
  const optOut = page.locator('#cookie-opt-out');
  await expect(optOut).not.toHaveAttribute('onclick');
  await optOut.click();
  await expect(page.getByRole('button', { name: 'Accept', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('acceptedCookies'))).toBe('');
});
