import MarkdownIt from "markdown-it";

// HTML is permitted for repository-authored content such as merged table cells
// and existing heading anchors. Never use this renderer for user-supplied text.
const markdown = new MarkdownIt({ html: true });

// Wrap both Markdown tables and retained HTML tables, including those inside
// lists. This runs on trusted rendered HTML and keeps wide tables off the page edge.
function scrollableTables(html:string) {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, table =>
    `<div class="article-table" role="region" aria-label="Scrollable table" tabindex="0">${table}</div>`);
}

export function renderMarkdown(source:string, assets:Record<string, string> = {}) {
  const resolved = source.replace(/\{\{(\w+)\}\}/g, (_match, name:string) => {
    if (!Object.prototype.hasOwnProperty.call(assets, name))
      throw new Error(`Missing Markdown asset: ${name}`);
    return assets[name];
  });
  return scrollableTables(markdown.render(resolved));
}
