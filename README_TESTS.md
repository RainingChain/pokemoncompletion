## Browser regression tests

Install both dependency trees and the test browser:

```sh
npm ci
npm --prefix src ci
npx playwright install chromium
npm run test:e2e
```

Playwright builds the current application with Webpack, then starts a dedicated
Express server at `http://localhost:3100`. No manually started server is needed;
port 3100 must be free. The build replaces `dist`, so stop any development build
watcher before running it. Tests never connect to the production website.

The desktop Chromium suite covers direct page navigation, navigation links,
redirects, 404s, checklist persistence, the hide-obtained filter, export/import,
map zoom/collapse, Platinum's worker/WASM calculation, and loading/unloading the
existing Emerald save fixture through the real .NET runtime. Mobile Chromium
covers direct navigation and screenshots; checklist interactions are currently
desktop-only because the existing mobile compact layout intercepts checkbox
clicks. Each test receives a fresh browser context and local storage. Analytics
requests are blocked and external map tiles use a fixed placeholder image; map
logic and all local app assets/runtimes remain real. Browser exceptions and failed
local asset requests fail the test.

Additional Emerald tests upload `tests/fixtures/Pokemon Emerald.sav` (copied from
the PkCompletionist test suite) and press **Sync All Categories** in **Import
Progress**. They cover empty progress and a stale collected map item, compare all
exported category IDs to a JSON baseline, verify persistence across reload, and
load the save again to check there are no remaining differences. The fixture's
source and checksum are recorded in `tests/fixtures/README.md`.

Known current behavior: with this save, the overall completion counter changes
from 2,332 immediately after synchronization to 2,333 after reload even though
the exported progress is identical. These tests assert the persisted category
data rather than equality of that aggregate counter.

Home, legal, and checklist viewport screenshots are checked on desktop and mobile.
The committed baselines are for Windows and the pinned Playwright Chromium version;
CI uses Windows as well. On another OS, run behavior tests with
`npx playwright test --ignore-snapshots`, or explicitly generate and review that
platform's baselines. Screenshot updates are intentional:

```sh
npm run test:e2e:update
npm run test:e2e:report
```

Review the changed PNGs before committing them. Normal runs fail on missing
baselines. Failed tests retain traces and screenshots in `test-results/`; the HTML
report is in `playwright-report/`. GitHub Actions runs the suite on pull requests
and uploads both directories for debugging. This suite captures current behavior;
it does not replace future logic/data tests or establish full browser coverage.
