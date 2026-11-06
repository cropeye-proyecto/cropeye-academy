/**
 * Minimal, safe Markdown renderer.
 *
 * Supported: headings (#..####), paragraphs, **bold**, *italic*, `code`,
 * fenced code blocks, ordered/unordered lists (nested), blockquotes,
 * horizontal rules, links (http/https/relative only) and callouts:
 *
 *   :::note
 *   ...
 *   :::
 *
 * The whole source is HTML-escaped BEFORE inline formatting is applied, so
 * raw HTML in content can never reach the DOM. Output is a plain HTML string;
 * callers are responsible for inserting it into a trusted container.
 */

const CALLOUT_LABELS = { note: 'Nota', warning: 'Advertencia' };

const LIST_ITEM_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const FENCE_RE = /^```\s*([a-zA-Z0-9-]*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE_RE = /^&gt;\s?/; // ">" is escaped before block parsing
const CALLOUT_RE = /^:::\s*(note|warning)\s*$/;

/** Escape every character that could start markup or break an attribute. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Accept http(s) and same-document/relative URLs only.
 * Anything with another scheme (javascript:, data:, vbscript:, mailto:…)
 * is rejected so links cannot become an injection vector.
 */
function safeHref(raw) {
  const url = raw.trim();
  if (!url || /\s/.test(url)) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null; // any other scheme
  if (/^[./?#]/.test(url)) return url; // ./x, ../x, /x, #x, ?x
  if (/^[\w-]+([/?#].*)?$/.test(url)) return url; // content/lessons/x.md
  return null;
}

/** Inline formatting. Input must already be HTML-escaped. */
function renderInline(text) {
  const codeSpans = [];

  // 1. Protect inline code from any further formatting.
  let out = text.replace(/`([^`]+)`/g, (_match, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  // 2. Links (validated scheme, escaped text as attribute value).
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
    const safe = safeHref(href);
    if (!safe) return match;
    return `<a href="${safe}" rel="noopener noreferrer">${label}</a>`;
  });

  // 3. Strong, then emphasis.
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^\w_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');

  // 4. Restore code spans.
  return out.replace(/\u0000(\d+)\u0000/g, (_match, index) => codeSpans[Number(index)]);
}

/** True when a line starts a block that must not be folded into a paragraph. */
function isBlockStart(line) {
  return (
    FENCE_RE.test(line) ||
    CALLOUT_RE.test(line) ||
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    QUOTE_RE.test(line) ||
    LIST_ITEM_RE.test(line)
  );
}

/** Render a nested list from flat indented items. */
function parseList(lines, start) {
  const items = [];
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(LIST_ITEM_RE);

    if (!match) {
      // A blank line only ends the list when the next line is not an item.
      if (!line.trim() && i + 1 < lines.length && LIST_ITEM_RE.test(lines[i + 1])) {
        i += 1;
        continue;
      }
      break;
    }

    items.push({
      indent: match[1].replace(/\t/g, '    ').length,
      ordered: /\d/.test(match[2]),
      text: match[3],
      children: [],
    });
    i += 1;
  }

  // Build the tree with an indentation stack.
  const roots = [];
  const stack = [{ indent: -1, children: roots }];

  for (const item of items) {
    while (stack.length > 1 && item.indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    const node = { text: item.text, ordered: item.ordered, children: [] };
    parent.children.push(node);
    stack.push({ indent: item.indent, children: node.children });
  }

  return { html: renderListNodes(roots), next: i };
}

function renderListNodes(nodes) {
  if (!nodes.length) return '';
  const ordered = Boolean(nodes[0].ordered);
  const tag = ordered ? 'ol' : 'ul';
  const items = nodes
    .map((node) => {
      const nested = node.children.length ? renderListNodes(node.children) : '';
      return `<li>${renderInline(node.text)}${nested}</li>`;
    })
    .join('');
  return `<${tag}>${items}</${tag}>`;
}

/** Render an array of already-escaped lines into block HTML. */
function renderBlocks(lines) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Fenced code block.
    const fence = line.match(FENCE_RE);
    if (fence) {
      const lang = fence[1].replace(/[^a-z0-9-]/gi, '');
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1; // skip the closing fence
      const langAttr = lang ? ` class="language-${lang}"` : '';
      // Lines are already HTML-escaped once, before block parsing.
      out.push(`<pre><code${langAttr}>${buffer.join('\n')}</code></pre>`);
      continue;
    }

    // Callout container.
    const callout = line.match(CALLOUT_RE);
    if (callout) {
      const kind = callout[1];
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1; // skip the closing marker
      out.push(
        `<div class="callout callout--${kind}" role="note">` +
          `<span class="callout__label">${CALLOUT_LABELS[kind]}</span>` +
          `${renderBlocks(buffer)}</div>`
      );
      continue;
    }

    // Heading.
    const heading = line.match(HEADING_RE);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // Horizontal rule.
    if (HR_RE.test(line)) {
      out.push('<hr>');
      i += 1;
      continue;
    }

    // Blockquote: collect the quoted lines and render them recursively.
    if (QUOTE_RE.test(line)) {
      const buffer = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        buffer.push(lines[i].replace(QUOTE_RE, ''));
        i += 1;
      }
      out.push(`<blockquote>${renderBlocks(buffer)}</blockquote>`);
      continue;
    }

    // Lists.
    if (LIST_ITEM_RE.test(line)) {
      const parsed = parseList(lines, i);
      out.push(parsed.html);
      i = parsed.next;
      continue;
    }

    // Paragraph: consecutive plain lines are joined with a space.
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return out.join('\n');
}

/**
 * Render Markdown to an HTML string.
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  const source = String(md == null ? '' : md).replace(/\r\n?/g, '\n');
  const lines = source.split('\n').map(escapeHtml);
  return renderBlocks(lines);
}
