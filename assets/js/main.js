/**
 * Panel de inicio: carga el currículo, dibuja una tarjeta por parte y mantiene
 * las marcas de progreso al día.
 */

import { allLessons, findLesson, loadCurriculum, totalLessons } from './core/content.js';
import { firstPending, subscribe } from './core/state.js';
import { renderCurriculum, updateLessonStates } from './ui/curriculum.js';
import { mountProgress } from './ui/progress.js';
import { el, clear } from './lib/dom.js';

const raiz = document.getElementById('partes');
const progreso = document.getElementById('progreso');
const continuar = document.getElementById('continuar');

let medidor = null;
let suscrito = false;

function pintarContinuar() {
  const id = firstPending(allLessons().map((l) => l.id));
  const leccion = id && findLesson(id);
  clear(continuar);
  continuar.hidden = !leccion;
  if (!leccion) return;
  const empezado = allLessons()[0].id !== id;
  continuar.append(
    el(
      'a',
      { class: 'boton', attrs: { href: `lesson.html?lesson=${encodeURIComponent(id)}` } },
      empezado ? 'Continuar donde quedaste' : 'Empezar el curso',
    ),
    el('span', {
      class: 'presentacion__siguiente',
      text: leccion.kind === 'cierre' ? `Cierre de la parte ${leccion.partIndex}` : `${leccion.number}. ${leccion.title}`,
    }),
  );
}

function mostrarError(error) {
  clear(raiz);
  const reintentar = el('button', { class: 'boton', attrs: { type: 'button' } }, 'Reintentar');
  reintentar.addEventListener('click', () => iniciar(true));
  raiz.append(
    el(
      'div',
      { class: 'estado', attrs: { role: 'alert' } },
      el('h2', { text: 'No pudimos cargar el curso' }),
      el('p', { text: 'Revisa tu conexión y vuelve a intentarlo.' }),
      el('p', { class: 'texto-secundario', text: error?.message || 'Error desconocido.' }),
      reintentar,
    ),
  );
  raiz.removeAttribute('aria-busy');
}

async function iniciar(forzar = false) {
  try {
    const curriculo = await loadCurriculum(forzar);
    renderCurriculum(raiz, curriculo);
    if (medidor) medidor.destroy();
    medidor = mountProgress(progreso, totalLessons());
    pintarContinuar();
    if (!suscrito) {
      subscribe(() => {
        updateLessonStates(raiz);
        pintarContinuar();
      });
      suscrito = true;
    }
  } catch (error) {
    console.error(error);
    mostrarError(error);
  }
}

iniciar();
