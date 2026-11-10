/**
 * Pie de la lección: anterior, marcar como completada y siguiente.
 */

import { isCompleted, toggle } from '../core/state.js';
import { el, clear } from '../lib/dom.js';

function enlace(lesson, sentido) {
  if (!lesson) return el('span', { class: 'pie__vacio' });
  const etiqueta = sentido === 'prev' ? '← Anterior' : 'Siguiente →';
  const titulo = lesson.kind === 'cierre' ? `Cierre: ${lesson.partTitle}` : lesson.title;
  return el(
    'a',
    {
      class: `pie__enlace pie__enlace--${sentido}`,
      attrs: { href: `lesson.html?lesson=${encodeURIComponent(lesson.id)}`, rel: sentido },
    },
    el('span', { class: 'pie__sentido', text: etiqueta }),
    el('span', { class: 'pie__titulo', text: titulo }),
  );
}

/** @param {HTMLElement} container @param {{lesson: Object, prev: Object|null, next: Object|null}} datos */
export function mountLessonNav(container, { lesson, prev, next }) {
  const boton = el('button', { class: 'boton', attrs: { type: 'button' } });

  function pintar() {
    const hecha = isCompleted(lesson.id);
    boton.textContent = hecha ? '✓ Completada' : 'Marcar como completada';
    boton.classList.toggle('boton--hecho', hecha);
    boton.setAttribute('aria-pressed', String(hecha));
  }

  boton.addEventListener('click', () => {
    toggle(lesson.id);
    pintar();
  });

  clear(container);
  container.append(
    el('div', { class: 'pie__completar' }, boton),
    el('div', { class: 'pie__vecinos' }, enlace(prev, 'prev'), enlace(next, 'next')),
  );
  pintar();
}
