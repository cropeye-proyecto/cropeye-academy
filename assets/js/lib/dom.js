/**
 * Tiny DOM helpers. No framework, no dependencies.
 */

/**
 * Create an element.
 * @param {string} tag
 * @param {Object} [props] class/text/attrs/dataset/handlers
 * @param {...(Node|string|null)} children
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  if (props.class) node.className = props.class;
  if (props.text != null) node.textContent = String(props.text);
  if (props.html != null) node.innerHTML = props.html; // only for trusted, static markup

  if (props.attrs) {
    for (const [name, value] of Object.entries(props.attrs)) {
      if (value === false || value == null) continue;
      node.setAttribute(name, value === true ? '' : String(value));
    }
  }

  if (props.dataset) {
    for (const [name, value] of Object.entries(props.dataset)) {
      node.dataset[name] = String(value);
    }
  }

  if (props.on) {
    for (const [type, listener] of Object.entries(props.on)) {
      node.addEventListener(type, listener);
    }
  }

  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

/** Remove every child of a node without using innerHTML. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/**
 * Build the lesson status icon.
 * Pending: hollow circle. Completed: check mark in --success.
 * @param {boolean} completed
 * @param {string} [label] accessible label for standalone usage
 */
export function statusIcon(completed, label) {
  const span = el('span', {
    class: 'status-icon',
    dataset: { completed: String(Boolean(completed)) },
    attrs: label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' },
  });

  if (completed) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 12 12');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M2 6.4 4.7 9 10 3.2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.append(path);
    span.append(svg);
  }

  return span;
}

/** Read a query string parameter from the current URL. */
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Simple debounce used for resize-driven work. */
export function debounce(fn, wait = 150) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}
