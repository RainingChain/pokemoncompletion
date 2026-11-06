## Running tests

Requires Node.js 21.6 or newer. Stop development build watchers and keep port 3100 free. Running tests rebuilds `dist` and starts the test server automatically.

Install dependencies and Chromium:

```sh
npm ci
npm --prefix src ci
npx playwright install chromium
```

Run all tests (Windows):

```sh
npm run test:e2e
```

On other operating systems, run without Windows snapshot comparisons:

```sh
npx playwright test --ignore-snapshots
```

Run a single test file:

```sh
npx playwright test emerald-battle-tower.spec.js --project=desktop
```
