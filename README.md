
Source code for https://pokemoncompletion.com

For support, contact RainingChain on [Discord](https://discord.com/invite/tMXrJzjWmg)

To run locally:
 - Install [Bun](https://bun.com/docs/installation) 1.4.4 or newer (CI uses 1.4.4).
 - `bun install --frozen-lockfile`
 - `bun install --cwd src --frozen-lockfile`
 - `bun run compil`
 - In another terminal, `bun run start`
 - Go to http://localhost:3000/

This project also relies on [PkCompletionist](https://github.com/RainingChain/PkCompletionist).

The root and `src` packages have separate `bun.lock` files. Run `bun install` in the corresponding directory after changing dependencies and commit the updated lockfile.

The Heroku `Procfile` runs Bun. The Heroku app must use a Bun-capable buildpack that installs the pinned Bun version and the root production dependencies; the Node.js buildpack alone is insufficient. Build locally with `bun run compil-prod` before running `bun ./deploy_heroku.js` to prepare the deployment checkout.

See [README_TESTS.md](README_TESTS.md) for browser regression testing instructions.

See [Writing static pages](src/pokemonArticles/README.md) for Markdown authoring instructions.
