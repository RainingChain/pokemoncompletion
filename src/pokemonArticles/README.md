# Writing static pages

Articles use Markdown (`.md`) and are rendered to HTML once when the Express server
starts. Keep the existing public URL when changing a document's filename.

Use Markdown headings, paragraphs, lists, links, tables, images, and fenced code
blocks. Page styling belongs in `src/SimplePage/SimplePage.css`; legal-specific
styling belongs in `src/legal/legal.css`. Blank lines separate paragraphs; CSS
provides spacing between sections.

Import each document in `src/App_httpPages.ts` and call `renderMarkdown` at module
scope. The existing `renderArticle` helper adds the layout and back link.

For local images or downloads, import the asset in TypeScript and supply its URL:

```ts
const article = renderMarkdown(source, { IMG: imageUrl });
```

The document can then use `![Description]({{IMG}})`. The same convention applies
to downloadable scripts (`[Script]({{SCRIPT1}})`). This preserves bundler-generated
asset paths. Relative image paths in Markdown are not resolved automatically.

Occasional HTML is supported for merged table cells, existing heading anchors,
and CSS classes. These documents are trusted repository content. Keep JavaScript
event handlers in `src/SimplePage/SimplePage.ts`, outside the Markdown files.
