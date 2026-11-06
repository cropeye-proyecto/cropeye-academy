/**
 * Lesson view entry point: resolves the lesson from the query string,
 * renders breadcrumbs, sidebar, Markdown body and footer navigation.
 */

import { loadCurriculum, findLesson, neighbours, loadLessonBody } from './core/content.js';
import { subscribe, isCompleted } from './core/state.js';
import { renderMarkdown } from './lib/markdown.js';
import { mountSidebar } from './ui/sidebar.js';
import { mountLessonNav } from './ui/lesson-nav.js';
import { el, clear, getQueryParam } from './lib/dom.js';

const shell = document.getElementById('lesson-shell');
const sidebar = document.getElementById('lesson-sidebar');
const sidebarTree = document.getElementById('sidebar-tree');
const sidebarPath = document.getElementById('sidebar-path');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarCollapse = document.getElementById('sidebar-collapse');
const backdrop = document.getElementById('sidebar-backdrop');
const toolbar = document.querySelector('.lesson-toolbar');
const breadcrumbs = document.getElementById('breadcrumbs');
const hero = document.getElementById('lesson-hero');
const article = document.getElementById('lesson-content');
const navHost = document.getElementById('lesson-nav');

function heroStatusNode() {
  return document.getElementById('lesson-status');
}

function renderHero(lesson) {
  if (!hero) return;
  clear(hero);

  const status = el('span', {
    class: 'lesson-hero__status',
    attrs: { id: 'lesson-status' },
    dataset: { completed: String(isCompleted(lesson.id)) },
    text: isCompleted(lesson.id) ? 'Completada' : 'Pendiente',
  });

  hero.append(
    el('p', { class: 'lesson-hero__eyebrow', text: lesson.pathTitle }),
    el('h1', { class: 'lesson-hero__title', text: lesson.title }),
    el('p', { class: 'lesson-hero__summary', text: lesson.summary }),
    el(
      'div',
      { class: 'lesson-hero__meta' },
      el('span', { text: `${lesson.minutes} min de lectura` }),
      el('span', { text: lesson.sectionTitle }),
      status,
    ),
  );
}

function updateHeroStatus(lesson) {
  const node = heroStatusNode();
  if (!node) return;
  const completed = isCompleted(lesson.id);
  node.dataset.completed = String(completed);
  node.textContent = completed ? 'Completada' : 'Pendiente';
}

function renderBreadcrumbs(lesson) {
  if (!breadcrumbs) return;
  clear(breadcrumbs);

  const list = el('ol', { class: 'breadcrumbs__list' });
  list.append(el('li', {}, el('a', { attrs: { href: 'index.html' } }, 'Panel')));
  list.append(
    el(
      'li',
      {},
      el('a', { attrs: { href: `index.html#path-${lesson.pathId}` } }, lesson.pathTitle),
    ),
  );
  list.append(
    el(
      'li',
      {},
      el(
        'a',
        {
          attrs: {
            href: `index.html#path-${lesson.pathId}-module-${lesson.moduleId}`,
          },
        },
        lesson.moduleTitle,
      ),
    ),
  );
  list.append(
    el(
      'li',
      {},
      el(
        'a',
        { attrs: { href: `index.html#section-${lesson.sectionId}` } },
        lesson.sectionTitle,
      ),
    ),
  );
  list.append(
    el(
      'li',
      {},
      el('span', { attrs: { 'aria-current': 'page' }, text: lesson.title }),
    ),
  );

  breadcrumbs.append(list);
}

function renderMinimalBreadcrumb() {
  if (!breadcrumbs) return;
  clear(breadcrumbs);
  breadcrumbs.append(
    el(
      'ol',
      { class: 'breadcrumbs__list' },
      el('li', {}, el('a', { attrs: { href: 'index.html' } }, 'Panel')),
    ),
  );
}

function hideSidebar() {
  if (sidebar) sidebar.hidden = true;
  if (sidebarToggle) sidebarToggle.hidden = true;
  if (backdrop) backdrop.hidden = true;
  if (shell) shell.dataset.sidebar = 'collapsed';
}

function hideFooterNav() {
  if (!navHost) return;
  clear(navHost);
  navHost.hidden = true;
}

/** Friendly not-found panel, used for missing or unknown ids. */
function renderNotFound(detail) {
  hideSidebar();
  renderMinimalBreadcrumb();
  if (hero) clear(hero);
  hideFooterNav();
  if (!article) return;

  article.classList.remove('prose');
  article.removeAttribute('aria-busy');
  clear(article);
  article.append(
    el(
      'div',
      { class: 'state-panel state-panel--wide', attrs: { role: 'alert' } },
      el('div', { class: 'state-panel__icon', attrs: { 'aria-hidden': 'true' }, text: '◇' }),
      el('h2', { text: 'No encontramos esa lección' }),
      el('p', {
        text: 'El enlace puede estar incompleto o la lección ya no forma parte del currículo. Vuelve al panel y elige otra desde el listado.',
      }),
      detail ? el('p', { class: 'text-muted', text: detail }) : null,
      el(
        'div',
        { class: 'state-panel__actions' },
        el('a', { class: 'btn btn--primary', attrs: { href: 'index.html' } }, 'Volver al panel'),
      ),
    ),
  );

  document.title = 'Lección no encontrada · CropEye Academy';
}

function renderBodyError(error) {
  if (!article) return;
  clear(article);
  article.append(
    el(
      'div',
      { class: 'state-panel', attrs: { role: 'alert' } },
      el('h2', { text: 'No pudimos cargar el contenido' }),
      el('p', {
        text: 'El archivo Markdown de esta lección no está disponible en este momento.',
      }),
      el('p', {
        class: 'text-muted',
        text: error && error.message ? error.message : 'Error desconocido.',
      }),
      el(
        'div',
        { class: 'state-panel__actions' },
        el('a', { class: 'btn', attrs: { href: 'index.html' } }, 'Volver al panel'),
      ),
    ),
  );
}

function renderFatal(error) {
  hideSidebar();
  renderMinimalBreadcrumb();
  if (hero) clear(hero);
  hideFooterNav();
  if (!article) return;

  article.classList.remove('prose');
  clear(article);
  article.append(
    el(
      'div',
      { class: 'state-panel', attrs: { role: 'alert' } },
      el('h2', { text: 'No pudimos cargar el currículo' }),
      el('p', { text: 'Revisa tu conexión y recarga la página para intentarlo de nuevo.' }),
      el('p', {
        class: 'text-muted',
        text: error && error.message ? error.message : 'Error desconocido.',
      }),
      el(
        'div',
        { class: 'state-panel__actions' },
        el('a', { class: 'btn btn--primary', attrs: { href: 'index.html' } }, 'Ir al panel'),
      ),
    ),
  );
}

async function init() {
  const lessonId = getQueryParam('lesson');

  let curriculum;
  try {
    curriculum = await loadCurriculum();
  } catch (error) {
    renderFatal(error);
    return;
  }

  if (!lessonId) {
    renderNotFound('Falta el parámetro «lesson» en la dirección.');
    return;
  }

  const lesson = findLesson(lessonId);
  if (!lesson) {
    renderNotFound(`No existe una lección con el identificador «${lessonId}».`);
    return;
  }

  document.title = `${lesson.title} · ${curriculum.title || 'CropEye Academy'}`;

  renderBreadcrumbs(lesson);
  renderHero(lesson);

  const { prev, next } = neighbours(lesson.id);
  const nav = mountLessonNav(navHost, { lesson, prev, next });

  const sidebarController = mountSidebar({
    shell,
    tree: sidebarTree,
    pathTitle: sidebarPath,
    toggleButton: sidebarToggle,
    collapseButton: sidebarCollapse,
    backdrop,
    curriculum,
    lesson,
  });

  subscribe(() => {
    sidebarController.refresh();
    nav.refresh();
    updateHeroStatus(lesson);
  });

  if (article) {
    article.setAttribute('aria-busy', 'true');
    try {
      const raw = await loadLessonBody(lesson);
      // The renderer escapes all source HTML before emitting any markup, so
      // the resulting string only contains tags generated by markdown.js.
      article.innerHTML = renderMarkdown(raw);
    } catch (error) {
      renderBodyError(error);
    } finally {
      article.removeAttribute('aria-busy');
    }
  }

  // Keep the toolbar accessible on mobile even before scrolling.
  if (toolbar) toolbar.hidden = false;
}

init();
