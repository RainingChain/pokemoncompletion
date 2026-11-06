## Running tests

Requires Bun 1.4.4 or newer. Stop development servers and build watchers and keep port 3100 free. Running tests rebuilds `dist` and starts the test server automatically.

Install dependencies and Chromium:

```sh
bun install --frozen-lockfile
bun install --cwd src --frozen-lockfile
bun --bun run playwright install chromium
```

Run all tests (Windows):

```sh
bun run test:e2e
```

On other operating systems, run without Windows snapshot comparisons:

```sh
bun run test:e2e --ignore-snapshots
```

Run a single test file:

```sh
bun run test:e2e emerald-battle-tower.spec.js --project=desktop
```
