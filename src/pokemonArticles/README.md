# Writing static pages

Articles use Markdown (`.md`) and are rendered to HTML once when the Express server
starts. Keep the existing public URL when changing a document's filename.

Use Markdown headings, paragraphs, lists, links, tables, images, and fenced code
blocks. Page styling belongs in `src/SimplePage/SimplePage.css`; legal-specific
styling belongs in `src/legal/legal.css`. Blank lines separate paragraphs; CSS
provides spacing between sections.

Import each document in `src/App_httpPages.ts` and call `renderMarkdown` at module
scope. The existing `renderArticle` helper adds the layout and back link.

Research pages share `src/common/article.hbs` and keep their own page build. Add
them with `researchConfig` in `webpack.config.js`; no per-page `.hbs` is needed.
Pass rendered Markdown as the fourth argument to `app.render2`, for example
`{ content: renderMarkdown(source) }`, then insert it inside `.markdown-content`
with `<%- locals.clientData.content %>`. Render at module scope, not per request.
Import the shared article CSS from the page's TypeScript entrypoint (the default
research entrypoint already does this). Keep breadcrumbs and back links in the
document so their existing destinations remain explicit.

To add page-specific CSS without a separate TypeScript entrypoint, import the
stylesheet with `?url` in `src/App_httpPages.ts` and pass it in the route's page
parameters:

```ts
import pageCss from "./pokemonCompletion/research/pkStateEmulator.css?url";

// Inside the route handler:
app.render2(res, filePath, { extraCss: [pageCss] }, { content: articleHtml });
```

Webpack emits these files as standalone assets with hashed URLs. The shared
header links them in the listed order after the page's base styles. Only routes
that list a stylesheet load it; no per-page CSS configuration is needed in
Webpack. These standalone stylesheets are copied as written: use public or
absolute URLs for any `url()` or `@import` references. Keep selectors scoped to
the page or article content.

Pages that only mount an application use `src/common/app.hbs`. Register them with
`appPageConfig(name, mountId, options)` in Webpack; `mountId` is supplied at build
time and must match the selector used by the page's TypeScript. Pages with unique
HTML, such as Shuffle's upload controls, keep a dedicated `.hbs` template.

For mixed interactive pages, keep controls and their IDs in Handlebars. Shuffle
uses three documents: `shuffleMod-intro.md` before the CIA controls,
`shuffleMod-save-instructions.md` between the upload controls, and
`shuffleMod-outro.md` after the save controls. The route passes these as
`intro`, `saveInstructions`, and `outro`. Each fragment must render independently:
do not open a list or HTML element in one fragment and close it in another.

For local images or downloads, import the asset in TypeScript and supply its URL:

```ts
const article = renderMarkdown(source, { IMG: imageUrl });
```

The document can then use `![Description]({{IMG}})`. The same convention applies
to downloadable scripts (`[Script]({{SCRIPT1}})`). This preserves bundler-generated
asset paths. Relative image paths in Markdown are not resolved automatically.

Occasional HTML is supported for merged or multiline table cells, existing heading
anchors, breadcrumbs, image IDs used by tools, and status classes. Prefer native
Markdown otherwise. Tables receive a keyboard-focusable scrolling wrapper from
the renderer; do not add your own. Keep styling in CSS rather than inline styles.
These documents are trusted repository content. Keep JavaScript event handlers
in the page's TypeScript entrypoint, outside the Markdown files.
