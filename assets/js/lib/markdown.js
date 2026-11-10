/**
 * Renderizador de Markdown pequeño y seguro para las lecciones.
 *
 * Todo el texto se escapa ANTES de interpretar el formato, así que el HTML
 * crudo del contenido nunca llega al DOM. Soporta:
 *
 *   # .. ####           encabezados (## y ### reciben un id para enlazar)
 *   **negrita** *cursiva* `código` [texto](url http, https o relativa)
 *   listas (anidadas), citas, reglas horizontales
 *   ```lang ruta/del/archivo     bloque de código con la ruta como título
 *   ![alt](assets/diagramas/x.svg)  diagrama SVG local (una línea propia)
 *   :::note / :::warning          notas y advertencias
 *   :::objetivos                  objetivos de aprendizaje (lista "- ")
 *   :::autoevaluacion             pares "? pregunta" / "= respuesta → #ancla"
 *   :::comision                   "? pregunta" (una línea), respuesta modelo, "! qué no decir"
 *
 * Un bloque ::: o ``` sin cierre se cierra al final del documento.
 */

const CALLOUT_LABELS = { note: 'Nota', warning: 'Advertencia' };

const LIST_ITEM_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const FENCE_RE = /^```\s*([a-zA-Z0-9-]*)(?:\s+(\S+))?\s*$/;
const FENCE_END_RE = /^```\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE_RE = /^&gt;\s?/; // ">" ya viene escapado
const BLOCK_RE = /^:::\s*(note|warning|objetivos|autoevaluacion|comision)\s*$/;
const BLOCK_END_RE = /^:::\s*$/;
const IMAGE_LINE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const DIAGRAM_SRC_RE = /^assets\/diagramas\/[\w-]+(?:\/[\w-]+)*\.svg$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Acepta http(s) y rutas relativas o anclas; rechaza cualquier otro esquema. */
function safeHref(raw) {
  const url = raw.trim();
  if (!url || /\s/.test(url)) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
  if (/^[./?#]/.test(url)) return url;
  if (/^[\w-]+([/?#].*)?$/.test(url)) return url;
  return null;
}

/** Id legible a partir de un título: minúsculas, sin tildes, con guiones. */
export function slugify(text) {
  return (
    String(text)
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z0-9#]+;/gi, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'seccion'
  );
}

/** Formato en línea. La entrada ya está escapada. */
function renderInline(text) {
  const codeSpans = [];
  let out = text.replace(/`([^`]+)`/g, (_m, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  // Una imagen en medio de un párrafo no se dibuja: queda su texto.
  out = out.replace(/!\[([^\]]*)\]\([^)\s]*\)/g, '$1');

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
    const safe = safeHref(href);
    if (!safe) return label;
    return `<a href="${safe}" rel="noopener noreferrer">${label}</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^\w_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');

  return out.replace(/\u0000(\d+)\u0000/g, (_m, i) => codeSpans[Number(i)]);
}

function isBlockStart(line) {
  return (
    FENCE_RE.test(line) ||
    BLOCK_RE.test(line) ||
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    QUOTE_RE.test(line) ||
    LIST_ITEM_RE.test(line) ||
    IMAGE_LINE_RE.test(line)
  );
}

function parseList(lines, start) {
  const items = [];
  let i = start;
  while (i < lines.length) {
    const match = lines[i].match(LIST_ITEM_RE);
    if (!match) {
      if (!lines[i].trim() && i + 1 < lines.length && LIST_ITEM_RE.test(lines[i + 1])) {
        i += 1;
        continue;
      }
      break;
    }
    items.push({
      indent: match[1].replace(/\t/g, '    ').length,
      ordered: /\d/.test(match[2]),
      text: match[3],
    });
    i += 1;
  }

  const roots = [];
  const stack = [{ indent: -1, children: roots }];
  for (const item of items) {
    while (stack.length > 1 && item.indent <= stack[stack.length - 1].indent) stack.pop();
    const node = { text: item.text, ordered: item.ordered, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push({ indent: item.indent, children: node.children });
  }
  return { html: renderListNodes(roots), next: i };
}

function renderListNodes(nodes) {
  if (!nodes.length) return '';
  const tag = nodes[0].ordered ? 'ol' : 'ul';
  const items = nodes
    .map((n) => `<li>${renderInline(n.text)}${renderListNodes(n.children)}</li>`)
    .join('');
  return `<${tag}>${items}</${tag}>`;
}

/** Lee las líneas de un bloque ::: hasta su cierre (o el final). */
function takeBlock(lines, start) {
  const buffer = [];
  let i = start;
  while (i < lines.length && !BLOCK_END_RE.test(lines[i])) {
    buffer.push(lines[i]);
    i += 1;
  }
  return { buffer, next: i + 1 };
}

function renderObjetivos(buffer) {
  const items = buffer
    .map((l) => l.match(/^\s*[-*]\s+(.*)$/))
    .filter(Boolean)
    .map((m) => `<li>${renderInline(m[1])}</li>`)
    .join('');
  return (
    '<section class="objetivos">' +
    '<h2 class="objetivos__titulo">Objetivos de aprendizaje</h2>' +
    '<p>Al terminar esta lección deberías poder:</p>' +
    `<ul>${items}</ul></section>`
  );
}

/** Agrupa líneas "? …" / "= …" (con continuaciones) en pares. */
function parsePairs(buffer) {
  const pairs = [];
  let current = null;
  let field = null;
  for (const raw of buffer) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('? ')) {
      current = { pregunta: line.slice(2), respuesta: '' };
      pairs.push(current);
      field = 'pregunta';
    } else if (line.startsWith('= ') && current) {
      current.respuesta = line.slice(2);
      field = 'respuesta';
    } else if (current && field) {
      current[field] += ` ${line}`;
    }
  }
  return pairs;
}

function renderAutoevaluacion(buffer) {
  const items = parsePairs(buffer)
    .map(({ pregunta, respuesta }) => {
      const m = respuesta.match(/^(.*?)\s*→\s*#([\w-]+)\s*$/);
      const texto = m ? m[1] : respuesta;
      const enlace = m
        ? `<p class="autoevaluacion__repaso"><a href="#${m[2]}">Repasar la sección</a></p>`
        : '';
      return (
        `<li><p class="autoevaluacion__pregunta">${renderInline(pregunta)}</p>` +
        '<details><summary>Ver respuesta</summary>' +
        `<p>${renderInline(texto)}</p>${enlace}</details></li>`
      );
    })
    .join('');
  return (
    '<section class="autoevaluacion">' +
    '<h2 id="autoevaluacion">Autoevaluación</h2>' +
    '<p class="autoevaluacion__indicacion">Responde cada pregunta con tus palabras antes de abrir la respuesta.</p>' +
    `<ol>${items}</ol></section>`
  );
}

function renderComision(buffer, ctx) {
  let pregunta = '';
  let evitar = '';
  const cuerpo = [];
  let field = null;
  for (const raw of buffer) {
    const line = raw.trim();
    if (line.startsWith('? ')) {
      pregunta = line.slice(2);
      field = 'pregunta';
    } else if (line.startsWith('! ')) {
      evitar = line.slice(2);
      field = 'evitar';
    } else if (!line) {
      field = null;
      cuerpo.push('');
    } else if (field === 'evitar') {
      evitar += ` ${line}`;
    } else {
      cuerpo.push(raw);
    }
  }
  const evitarHtml = evitar
    ? `<p class="comision__evitar"><strong>Qué no decir:</strong> ${renderInline(evitar)}</p>`
    : '';
  return (
    '<section class="comision">' +
    '<p class="comision__etiqueta">Pregunta de la comisión</p>' +
    `<p class="comision__pregunta">${renderInline(pregunta)}</p>` +
    '<details><summary>Ver respuesta modelo</summary>' +
    `${renderBlocks(cuerpo, ctx)}${evitarHtml}</details></section>`
  );
}

function renderBlocks(lines, ctx) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(FENCE_RE);
    if (fence) {
      const lang = fence[1].replace(/[^a-z0-9-]/gi, '');
      const ruta = fence[2] || '';
      const buffer = [];
      i += 1;
      while (i < lines.length && !FENCE_END_RE.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1;
      const langAttr = lang ? ` class="language-${lang}"` : '';
      const pre = `<pre><code${langAttr}>${buffer.join('\n')}</code></pre>`;
      out.push(
        ruta ? `<figure class="codigo"><figcaption>${ruta}</figcaption>${pre}</figure>` : pre
      );
      continue;
    }

    const block = line.match(BLOCK_RE);
    if (block) {
      const kind = block[1];
      const { buffer, next } = takeBlock(lines, i + 1);
      i = next;
      if (kind === 'objetivos') out.push(renderObjetivos(buffer));
      else if (kind === 'autoevaluacion') out.push(renderAutoevaluacion(buffer));
      else if (kind === 'comision') out.push(renderComision(buffer, ctx));
      else {
        out.push(
          `<div class="callout callout--${kind}" role="note">` +
            `<span class="callout__label">${CALLOUT_LABELS[kind]}</span>` +
            `${renderBlocks(buffer, ctx)}</div>`
        );
      }
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      const html = renderInline(heading[2].trim());
      let idAttr = '';
      if (level === 2 || level === 3) {
        const base = slugify(html);
        const count = (ctx.slugs.get(base) || 0) + 1;
        ctx.slugs.set(base, count);
        idAttr = ` id="${count === 1 ? base : `${base}-${count}`}"`;
      }
      out.push(`<h${level}${idAttr}>${html}</h${level}>`);
      i += 1;
      continue;
    }

    const image = line.match(IMAGE_LINE_RE);
    if (image) {
      const [, alt, src] = image;
      if (DIAGRAM_SRC_RE.test(src) && !src.includes('..')) {
        out.push(
          `<figure class="diagrama"><img src="${src}" alt="${alt}" loading="lazy">` +
            `<figcaption>${alt}</figcaption></figure>`
        );
      } else {
        out.push(`<p>${alt}</p>`);
      }
      i += 1;
      continue;
    }

    if (HR_RE.test(line)) {
      out.push('<hr>');
      i += 1;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const buffer = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        buffer.push(lines[i].replace(QUOTE_RE, ''));
        i += 1;
      }
      out.push(`<blockquote>${renderBlocks(buffer, ctx)}</blockquote>`);
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      const parsed = parseList(lines, i);
      out.push(parsed.html);
      i = parsed.next;
      continue;
    }

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
 * Convierte Markdown en HTML seguro.
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  const source = String(md == null ? '' : md).replace(/\r\n?/g, '\n');
  const lines = source.split('\n').map(escapeHtml);
  return renderBlocks(lines, { slugs: new Map() });
}
