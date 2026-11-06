/**
 * Dashboard rendering: one card per path, modules and sections nested inside.
 * Collapse state lives in module memory only (a reload resets it on purpose).
 */

import { el, clear, statusIcon } from '../lib/dom.js';
import { allLessons } from '../core/content.js';
import { isCompleted } from '../core/state.js';

/** Path ids currently collapsed. Memory-only, never persisted. */
const collapsedPaths = new Set();

/**
 * Render the full dashboard into a container.
 * @param {HTMLElement} container
 * @param {Object} curriculum
 */
export function renderCurriculum(container, curriculum) {
  clear(container);

  const fragment = document.createDocumentFragment();
  (curriculum.paths || []).forEach((path, index) => {
    fragment.append(buildPathCard(path, index));
  });

  container.append(fragment);
  updateLessonStates(container);
}

function buildPathCard(path, index) {
  const expanded = !collapsedPaths.has(path.id);
  const bodyId = `path-body-${path.id}`;
  const lessons = allLessons({ paths: [path] });

  const countNode = el('span', {
    class: 'path-card__count',
    dataset: { pathCount: path.id },
    text: `${lessons.length} lecciones`,
  });

  const toggle = el(
    'button',
    {
      class: 'btn btn--ghost btn--icon path-card__toggle',
      attrs: {
        type: 'button',
        'aria-expanded': String(expanded),
        'aria-controls': bodyId,
        'aria-label': expanded
          ? `Ocultar las lecciones de ${path.title}`
          : `Mostrar las lecciones de ${path.title}`,
      },
    },
    el('span', { class: 'chevron' }),
  );

  const header = el(
    'header',
    { class: 'path-card__header' },
    el(
      'div',
      { class: 'path-card__meta' },
      el('p', { class: 'path-card__eyebrow', text: `Ruta ${index + 1}` }),
      el('h3', { class: 'path-card__title', text: path.title }),
      el('p', { class: 'path-card__desc', text: path.description }),
    ),
    el('div', { class: 'path-card__side' }, countNode, toggle),
  );

  const bodyInner = el('div', { class: 'path-card__body-inner' });
  for (const module of path.modules || []) {
    bodyInner.append(buildModule(path, module));
  }

  const body = el('div', { class: 'path-card__body', attrs: { id: bodyId } }, bodyInner);

  const card = el(
    'article',
    {
      class: 'path-card',
      attrs: { id: `path-${path.id}` },
      dataset: { pathId: path.id, expanded: String(expanded) },
    },
    header,
    body,
  );

  toggle.addEventListener('click', () => {
    const next = card.dataset.expanded !== 'true';
    card.dataset.expanded = String(next);
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute(
      'aria-label',
      next ? `Ocultar las lecciones de ${path.title}` : `Mostrar las lecciones de ${path.title}`,
    );
    if (next) collapsedPaths.delete(path.id);
    else collapsedPaths.add(path.id);
  });

  return card;
}

function buildModule(path, module) {
  const node = el(
    'div',
    {
      class: 'module',
      attrs: { id: `path-${path.id}-module-${module.id}` },
    },
    el('h4', { class: 'module__title', text: module.title }),
    el('p', { class: 'module__desc', text: module.description }),
  );

  for (const section of module.sections || []) {
    node.append(buildSection(section));
  }

  return node;
}

function buildSection(section) {
  const headingId = `heading-${section.id}`;

  const node = el(
    'section',
    {
      class: 'section',
      attrs: { id: `section-${section.id}`, 'aria-labelledby': headingId },
    },
    el('h5', { class: 'section__title', attrs: { id: headingId }, text: section.title }),
  );

  const list = el('ul', { class: 'lesson-list' });
  for (const lesson of section.lessons || []) {
    list.append(el('li', {}, buildLessonRow(lesson)));
  }
  node.append(list);

  return node;
}

function buildLessonRow(lesson) {
  const completed = isCompleted(lesson.id);

  return el(
    'a',
    {
      class: 'lesson-row',
      attrs: { href: `lesson.html?lesson=${encodeURIComponent(lesson.id)}` },
      dataset: { lessonId: lesson.id, completed: String(completed) },
    },
    statusIcon(completed),
    el(
      'span',
      { class: 'lesson-row__body' },
      el(
        'span',
        { class: 'lesson-row__title', text: lesson.title },
        el('span', {
          class: 'visually-hidden',
          dataset: { statusText: '' },
          text: completed ? 'Completada' : 'Pendiente',
        }),
      ),
      el('span', { class: 'lesson-row__summary', text: lesson.summary }),
    ),
    el('span', { class: 'lesson-row__meta', text: `${lesson.minutes} min` }),
  );
}

/**
 * Sync every rendered lesson row with the current state.
 * Safe to call on the whole document or on a subtree.
 * @param {ParentNode} [root]
 */
export function updateLessonStates(root = document) {
  for (const row of root.querySelectorAll('.lesson-row[data-lesson-id]')) {
    const completed = isCompleted(row.dataset.lessonId);
    row.dataset.completed = String(completed);

    const icon = row.querySelector('.status-icon');
    if (icon) icon.replaceWith(statusIcon(completed));

    const statusText = row.querySelector('[data-status-text]');
    if (statusText) statusText.textContent = completed ? 'Completada' : 'Pendiente';
  }

  for (const card of root.querySelectorAll('.path-card[data-path-id]')) {
    updatePathCount(card);
  }
}

function updatePathCount(card) {
  const rows = card.querySelectorAll('.lesson-row[data-lesson-id]');
  if (!rows.length) return;

  let done = 0;
  for (const row of rows) {
    if (row.dataset.completed === 'true') done += 1;
  }

  const counter = card.querySelector('[data-path-count]');
  if (counter) counter.textContent = `${done} de ${rows.length} completadas`;
}
