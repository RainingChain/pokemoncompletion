import MarkdownIt from "markdown-it";

// HTML is permitted for repository-authored content such as merged table cells
// and existing heading anchors. Never use this renderer for user-supplied text.
const markdown = new MarkdownIt({ html: true });

export function renderMarkdown(source:string, assets:Record<string, string> = {}) {
  const resolved = source.replace(/\{\{(\w+)\}\}/g, (_match, name:string) => {
    if (!Object.prototype.hasOwnProperty.call(assets, name))
      throw new Error(`Missing Markdown asset: ${name}`);
    return assets[name];
  });
  return markdown.render(resolved);
}
