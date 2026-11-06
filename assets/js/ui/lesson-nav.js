/**
 * Lesson footer navigation: previous / complete toggle / next.
 * Previous and next follow the global curriculum order.
 */

import { el, clear } from '../lib/dom.js';
import { isCompleted, toggle } from '../core/state.js';

/**
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Object} options.lesson current lesson
 * @param {Object|null} options.prev
 * @param {Object|null} options.next
 * @param {(completed: boolean) => void} [options.onChange]
 */
export function mountLessonNav(container, { lesson, prev, next, onChange }) {
  const prevControl = prev
    ? el(
        'a',
        {
          class: 'btn lesson-nav__prev',
          attrs: {
            href: `lesson.html?lesson=${encodeURIComponent(prev.id)}`,
            title: prev.title,
          },
        },
        '← Lección anterior',
      )
    : el(
        'button',
        { class: 'btn lesson-nav__prev', attrs: { type: 'button', disabled: true } },
        '← Lección anterior',
      );

  const nextControl = next
    ? el(
        'a',
        {
          class: 'btn lesson-nav__next',
          attrs: {
            href: `lesson.html?lesson=${encodeURIComponent(next.id)}`,
            title: next.title,
          },
        },
        'Siguiente lección →',
      )
    : el(
        'button',
        { class: 'btn lesson-nav__next', attrs: { type: 'button', disabled: true } },
        'Siguiente lección →',
      );

  const completeButton = el('button', {
    class: 'btn btn--primary btn--complete lesson-nav__complete',
    attrs: { type: 'button', 'aria-pressed': String(isCompleted(lesson.id)) },
  });

  function paint() {
    const completed = isCompleted(lesson.id);
    completeButton.setAttribute('aria-pressed', String(completed));
    completeButton.dataset.completed = String(completed);
    completeButton.textContent = completed ? 'Completado ✓' : 'Marcar como completado';
  }

  completeButton.addEventListener('click', () => {
    const completed = toggle(lesson.id);
    paint();
    if (onChange) onChange(completed);
  });

  clear(container);
  container.append(
    el(
      'nav',
      { class: 'lesson-nav', attrs: { 'aria-label': 'Navegación entre lecciones' } },
      prevControl,
      completeButton,
      nextControl,
    ),
  );

  paint();

  return { refresh: paint };
}
