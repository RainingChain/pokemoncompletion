import { test as base, expect } from '@playwright/test';

// Local app assets and runtimes remain real. Only unrelated third-party requests
// are isolated, including the external map imagery (not the map implementation).
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const origin = new URL(baseURL).origin;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (new URL(response.url()).origin === origin && response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', request => {
      if (new URL(request.url()).origin === origin && request.failure()?.errorText !== 'net::ERR_ABORTED')
        errors.push(`${request.failure()?.errorText} ${request.url()}`);
    });
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin)
        return route.continue();
      if (url.hostname === 'pokemonmap.b-cdn.net')
        return route.fulfill({
          contentType: 'image/png',
          body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
        });
      return route.abort();
    });
    await page.addInitScript(() => {
      if (window !== window.top)
        return;
      // Avoid a consent overlay changing screenshots or intercepting controls.
      localStorage.setItem('acceptedCookies', 'f4102444800000');
    });
    await use(page);
    expect(errors, 'No uncaught browser errors or failing local assets').toEqual([]);
  },
});

export { expect };

export async function openPinball(page) {
  await page.goto('/completion/Pinball');
  await expect(page.getByRole('heading', { name: /Pokémon 100% Checklist.*Pinball/ })).toBeVisible();
  await page.getByRole('button', { name: 'Expand All', exact: true }).click();
  return page.getByRole('row').filter({ has: page.getByRole('link', { name: 'Bulbasaur', exact: true }) });
}
