/**
 * Vista de lección: lee ?lesson=<id>, dibuja el índice, el contenido en
 * Markdown y el pie de navegación.
 */

import { findLesson, loadCurriculum, loadLessonBody, neighbours, totalLessons } from './core/content.js';
import { renderMarkdown } from './lib/markdown.js';
import { el, clear, getQueryParam } from './lib/dom.js';
import { mountLessonNav } from './ui/lesson-nav.js';
import { mountProgress } from './ui/progress.js';
import { mountSidebar } from './ui/sidebar.js';

const principal = document.getElementById('leccion');
const indice = document.getElementById('indice');
const botonIndice = document.getElementById('boton-indice');
const fondoIndice = document.getElementById('indice-fondo');
const progreso = document.getElementById('progreso');

function estado(titulo, texto) {
  clear(principal);
  principal.append(
    el(
      'div',
      { class: 'estado', attrs: { role: 'alert' } },
      el('h1', { text: titulo }),
      el('p', { text: texto }),
      el('a', { class: 'boton', attrs: { href: 'index.html' } }, 'Volver al panel'),
    ),
  );
  principal.removeAttribute('aria-busy');
}

function migas(lesson) {
  return el(
    'nav',
    { class: 'migas', attrs: { 'aria-label': 'Ubicación' } },
    el('a', { attrs: { href: 'index.html' } }, 'Inicio'),
    el('span', { attrs: { 'aria-hidden': 'true' }, text: '›' }),
    el('span', { text: `Parte ${lesson.partIndex}: ${lesson.partTitle}` }),
  );
}

/** Quita el primer H1 del cuerpo: el título se muestra desde el currículo. */
function sinPrimerH1(html) {
  return html.replace(/^\s*<h1>.*?<\/h1>\s*/s, '');
}

async function iniciar() {
  let curriculo;
  try {
    curriculo = await loadCurriculum();
  } catch (error) {
    console.error(error);
    estado('No pudimos cargar el curso', 'Revisa tu conexión y vuelve a intentarlo.');
    return;
  }
  mountProgress(progreso, totalLessons());

  const id = getQueryParam('lesson');
  const lesson = findLesson(id);
  mountSidebar({ container: indice, curriculum: curriculo, currentId: lesson?.id, boton: botonIndice, fondo: fondoIndice });

  if (!lesson) {
    estado(
      'No encontramos esa lección',
      'El enlace puede estar mal escrito o la lección cambió de nombre. Vuelve al panel para elegir una.',
    );
    return;
  }

  document.title = `${lesson.title} · CropEye Academy`;
  let cuerpo;
  try {
    cuerpo = sinPrimerH1(renderMarkdown(await loadLessonBody(lesson)));
  } catch (error) {
    console.error(error);
    estado('No pudimos cargar esta lección', 'Recarga la página o vuelve al panel.');
    return;
  }

  const etiqueta = lesson.kind === 'cierre' ? 'Cierre de la parte' : `Lección ${lesson.number}`;
  const contenido = el('div', { class: 'leccion__cuerpo prosa' });
  contenido.innerHTML = cuerpo; // salida del renderizador seguro (todo escapado)
  const pie = el('footer', { class: 'pie' });

  clear(principal);
  principal.append(
    el(
      'article',
      { class: 'leccion__articulo' },
      migas(lesson),
      el(
        'header',
        { class: 'leccion__cabecera' },
        el('p', { class: 'leccion__etiqueta', text: `${etiqueta} · ${lesson.minutes} min de lectura` }),
        el('h1', { class: 'leccion__titulo', text: lesson.title }),
        lesson.summary ? el('p', { class: 'leccion__resumen', text: lesson.summary }) : null,
      ),
      contenido,
      pie,
    ),
  );
  principal.removeAttribute('aria-busy');

  const { prev, next } = neighbours(lesson.id);
  mountLessonNav(pie, { lesson, prev, next });

  if (window.location.hash) {
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
  }
}

iniciar();
