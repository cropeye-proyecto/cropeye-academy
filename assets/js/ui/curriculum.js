/**
 * Panel de inicio: una tarjeta por parte con su lista de lecciones.
 */

import { lessonsOfPart } from '../core/content.js';
import { isCompleted } from '../core/state.js';
import { el, clear, statusIcon } from '../lib/dom.js';

function filaLeccion(lesson) {
  const done = isCompleted(lesson.id);
  const cierre = lesson.kind === 'cierre';
  return el(
    'li',
    { class: `fila${cierre ? ' fila--cierre' : ''}`, dataset: { lessonId: lesson.id } },
    el(
      'a',
      {
        class: 'fila__enlace',
        attrs: { href: `lesson.html?lesson=${encodeURIComponent(lesson.id)}` },
      },
      el('span', { class: 'fila__numero', text: cierre ? '' : String(lesson.number) }),
      el(
        'span',
        { class: 'fila__texto' },
        el('span', { class: 'fila__titulo', text: lesson.title }),
        el('span', { class: 'fila__resumen', text: lesson.summary || '' }),
      ),
      el('span', { class: 'fila__minutos', text: `${lesson.minutes} min` }),
      statusIcon(done, done ? 'Completada' : 'Pendiente'),
    ),
  );
}

function conteo(partId) {
  const lecciones = lessonsOfPart(partId);
  const hechas = lecciones.filter((l) => isCompleted(l.id)).length;
  return `${hechas} de ${lecciones.length} completadas`;
}

/** Dibuja las tarjetas de las partes dentro de [container]. */
export function renderCurriculum(container, curriculum) {
  clear(container);
  curriculum.parts.forEach((part, i) => {
    const tituloId = `parte-${part.id}`;
    container.append(
      el(
        'section',
        {
          class: 'parte',
          attrs: { 'aria-labelledby': tituloId },
          dataset: { partId: part.id },
        },
        el(
          'header',
          { class: 'parte__cabecera' },
          el(
            'div',
            { class: 'parte__fila' },
            el('p', { class: 'parte__etiqueta', text: `Parte ${i + 1}` }),
            el('p', { class: 'parte__conteo', text: conteo(part.id) }),
          ),
          el('h2', { class: 'parte__titulo', attrs: { id: tituloId }, text: part.title }),
          el('p', { class: 'parte__resumen', text: part.summary || '' }),
        ),
        el('ol', { class: 'parte__lecciones' }, lessonsOfPart(part.id).map(filaLeccion)),
      ),
    );
  });
  container.removeAttribute('aria-busy');
}

/** Actualiza marcas y conteos sin volver a dibujar todo. */
export function updateLessonStates(root = document) {
  for (const fila of root.querySelectorAll('[data-lesson-id]')) {
    const done = isCompleted(fila.dataset.lessonId);
    const icono = fila.querySelector('.status-icon');
    if (icono) icono.replaceWith(statusIcon(done, done ? 'Completada' : 'Pendiente'));
  }
  for (const parte of root.querySelectorAll('[data-part-id]')) {
    const c = parte.querySelector('.parte__conteo');
    if (c) c.textContent = conteo(parte.dataset.partId);
  }
}
