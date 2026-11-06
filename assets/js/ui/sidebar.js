/**
 * Lesson sidebar: tree of the current path, collapsible on desktop and a
 * drawer on mobile (backdrop, Escape to close, closes on navigation).
 * The desktop collapsed flag is persisted in localStorage.
 */

import { el, clear, statusIcon } from '../lib/dom.js';
import { isCompleted } from '../core/state.js';

const STORAGE_KEY = 'cropeye.sidebar.collapsed';
const MOBILE_QUERY = '(max-width: 900px)';

function readCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_error) {
    return false;
  }
}

function saveCollapsed(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch (_error) {
    // Storage unavailable: the preference simply does not persist.
  }
}

/**
 * @param {Object} options
 * @param {HTMLElement} options.shell       element carrying data-sidebar
 * @param {HTMLElement} options.tree        container for the links
 * @param {HTMLElement} options.pathTitle   current path title node
 * @param {HTMLElement} options.toggleButton toolbar toggle
 * @param {HTMLElement} options.collapseButton in-sidebar toggle
 * @param {HTMLElement} options.backdrop    mobile backdrop
 * @param {Object} options.curriculum
 * @param {Object} options.lesson
 */
export function mountSidebar(options) {
  const { shell, tree, pathTitle, toggleButton, collapseButton, backdrop, curriculum, lesson } = options;

  const mq = window.matchMedia(MOBILE_QUERY);
  let collapsed = readCollapsed();
  let drawerOpen = false;

  renderTree();

  function renderTree() {
    clear(tree);

    const path = (curriculum.paths || []).find((item) => item.id === lesson.pathId);
    pathTitle.textContent = path ? path.title : '';

    if (!path) return;

    for (const module of path.modules || []) {
      const wrapper = el(
        'div',
        { class: 'sidebar__module' },
        el('h3', { class: 'sidebar__module-title', text: module.title }),
      );

      for (const section of module.sections || []) {
        wrapper.append(el('p', { class: 'sidebar__section-label', text: section.title }));

        const list = el('ul', { class: 'sidebar__list' });
        for (const item of section.lessons || []) {
          list.append(el('li', {}, buildLink(item)));
        }
        wrapper.append(list);
      }

      tree.append(wrapper);
    }
  }

  function buildLink(item) {
    const current = item.id === lesson.id;
    const completed = isCompleted(item.id);

    const attrs = {
      href: `lesson.html?lesson=${encodeURIComponent(item.id)}`,
    };
    if (current) attrs['aria-current'] = 'page';

    return el(
      'a',
      {
        class: 'sidebar__link',
        attrs,
        dataset: { lessonId: item.id, completed: String(completed) },
        on: {
          click: () => {
            // Navigating away: close the drawer so it never lingers.
            if (mq.matches) closeDrawer(false);
          },
        },
      },
      statusIcon(completed),
      el(
        'span',
        {},
        item.title,
        el('span', {
          class: 'visually-hidden',
          dataset: { statusText: '' },
          text: completed ? 'Completada' : 'Pendiente',
        }),
      ),
    );
  }

  function sync() {
    if (mq.matches) {
      shell.dataset.sidebar = drawerOpen ? 'open' : 'closed';
      const label = drawerOpen ? 'Cerrar panel de lecciones' : 'Abrir panel de lecciones';
      for (const button of [toggleButton, collapseButton]) {
        if (!button) continue;
        button.setAttribute('aria-expanded', String(drawerOpen));
        button.setAttribute('aria-label', label);
      }
      if (backdrop) backdrop.tabIndex = drawerOpen ? 0 : -1;
      return;
    }

    shell.dataset.sidebar = collapsed ? 'collapsed' : 'expanded';
    const label = collapsed ? 'Mostrar panel de lecciones' : 'Ocultar panel de lecciones';
    for (const button of [toggleButton, collapseButton]) {
      if (!button) continue;
      button.setAttribute('aria-expanded', String(!collapsed));
      button.setAttribute('aria-label', label);
    }
    if (backdrop) backdrop.tabIndex = -1;
  }

  function closeDrawer(restoreFocus) {
    if (!drawerOpen) return;
    drawerOpen = false;
    sync();
    if (restoreFocus && toggleButton) toggleButton.focus();
  }

  function handleToggle() {
    if (mq.matches) {
      drawerOpen = !drawerOpen;
      sync();
      if (drawerOpen) {
        const first = tree.querySelector('a');
        if (first) first.focus();
      } else if (toggleButton) {
        toggleButton.focus();
      }
      return;
    }

    collapsed = !collapsed;
    saveCollapsed(collapsed);
    sync();
  }

  function handleBackdrop() {
    closeDrawer(true);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && mq.matches && drawerOpen) {
      event.preventDefault();
      closeDrawer(true);
    }
  }

  function handleViewportChange() {
    drawerOpen = false;
    sync();
  }

  toggleButton?.addEventListener('click', handleToggle);
  collapseButton?.addEventListener('click', handleToggle);
  backdrop?.addEventListener('click', handleBackdrop);
  document.addEventListener('keydown', handleKeydown);
  mq.addEventListener('change', handleViewportChange);

  sync();

  /** Re-read completion marks without re-rendering (keeps focus intact). */
  function refresh() {
    for (const link of tree.querySelectorAll('[data-lesson-id]')) {
      const completed = isCompleted(link.dataset.lessonId);
      link.dataset.completed = String(completed);

      const icon = link.querySelector('.status-icon');
      if (icon) icon.replaceWith(statusIcon(completed));

      const statusText = link.querySelector('[data-status-text]');
      if (statusText) statusText.textContent = completed ? 'Completada' : 'Pendiente';
    }
  }

  function destroy() {
    toggleButton?.removeEventListener('click', handleToggle);
    collapseButton?.removeEventListener('click', handleToggle);
    backdrop?.removeEventListener('click', handleBackdrop);
    document.removeEventListener('keydown', handleKeydown);
    mq.removeEventListener('change', handleViewportChange);
  }

  return { refresh, closeDrawer, destroy };
}
