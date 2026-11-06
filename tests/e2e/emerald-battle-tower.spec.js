import { test, expect } from './fixtures.js';

test('Battle Tower generates teams for 49 wins, Dev, and male Shuckle', async ({ page }) => {
  // Generation explores the real RNG/probability graph and can take longer in CI.
  test.setTimeout(180_000);
  await page.goto('/BattleFacilities/Emerald/RngManipulation');
  const tool = page.locator('.pkRngAbuse');
  const inputRow = name => tool.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });

  await tool.locator('select').first().selectOption({ label: 'Battle Tower' });
  await inputRow('Win Count').locator('input').fill('49');
  await inputRow('Current Trainer').locator('input').fill('Dev');
  const pokemon = inputRow('Trainer Pokémon #1');
  await pokemon.getByPlaceholder('Name', { exact: true }).fill('Shuckle');
  // Inputs commit on change/blur, matching a user moving to the gender control.
  await pokemon.getByPlaceholder('Name', { exact: true }).press('Tab');
  await pokemon.getByRole('radio', { name: 'Male', exact: true }).check();
  await expect(tool.getByText('Attempting RNG manipulation of Round 8, Battle 1', { exact: true })).toBeVisible();
  await expect(tool.getByText('Result: No data about the opponent team has been calculated.', { exact: true })).toBeVisible();

  await tool.getByRole('button', { name: 'Generate', exact: true }).click();
  const teams = tool.getByRole('radio', { name: 'Teams', exact: true });
  await expect(teams).toBeVisible({ timeout: 150_000 });
  await teams.check();
  await expect(tool.getByText('Progress:', { exact: false })).toHaveCount(0);
  await expect(tool.getByText('No possible trainer teams found.', { exact: true })).toHaveCount(0);
  await expect(tool.getByText('Error:', { exact: false })).toHaveCount(0);

  const output = tool.locator('.smaller-pk-icons');
  const rows = output.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows).toHaveCount(10);
  const results = await rows.evaluateAll(elements => elements.map(row =>
    Array.from(row.querySelectorAll('td')).slice(0, 2).map(cell => cell.innerText.replace(/\s+/g, ' ').trim())
  ));
  for (const [probability, team] of results) {
    expect(probability).toMatch(/^\d+(\.\d+)?%$/);
    expect(team).toMatch(/^Shuckle \d M@/);
  }
  // Record user-visible probabilities, Pokémon, genders, items, abilities and
  // moves. Exclude calculation duration and optional RNG-frame debug details.
  expect(JSON.stringify(results, null, 2) + '\n').toMatchSnapshot('dev-male-shuckle-teams.json');
});
