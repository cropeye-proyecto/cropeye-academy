/**
 * Índice lateral de la lección: partes y lecciones, con la actual marcada.
 * En escritorio se puede plegar (la preferencia se guarda); en pantallas
 * angostas es un panel que se abre con el botón de la cabecera.
 */

import { lessonsOfPart } from '../core/content.js';
import { isCompleted, subscribe } from '../core/state.js';
import { el, clear, statusIcon } from '../lib/dom.js';

const PLEGADO_KEY = 'cropeye.academy.sidebar';
const ANGOSTO = window.matchMedia('(max-width: 899px)');

function leerPlegado() {
  try {
    return window.localStorage.getItem(PLEGADO_KEY) === '1';
  } catch (_e) {
    return false;
  }
}

function guardarPlegado(valor) {
  try {
    window.localStorage.setItem(PLEGADO_KEY, valor ? '1' : '0');
  } catch (_e) {
    // Sin almacenamiento: la preferencia dura hasta recargar.
  }
}

/**
 * @param {{container: HTMLElement, curriculum: Object, currentId: string,
 *          boton: HTMLButtonElement, fondo: HTMLElement}} opciones
 */
export function mountSidebar({ container, curriculum, currentId, boton, fondo }) {
  function dibujar() {
    clear(container);
    container.append(el('p', { class: 'indice__encabezado', text: 'Contenido del curso' }));
    curriculum.parts.forEach((part, i) => {
      const lecciones = lessonsOfPart(part.id);
      const actual = lecciones.some((l) => l.id === currentId);
      container.append(
        el(
          'details',
          { class: 'indice__parte', attrs: { open: actual } },
          el('summary', { class: 'indice__titulo-parte', text: `${i + 1}. ${part.title}` }),
          el(
            'ol',
            { class: 'indice__lista' },
            lecciones.map((l) => {
              const esActual = l.id === currentId;
              return el(
                'li',
                {},
                el(
                  'a',
                  {
                    class: `indice__enlace${esActual ? ' indice__enlace--actual' : ''}`,
                    attrs: {
                      href: `lesson.html?lesson=${encodeURIComponent(l.id)}`,
                      'aria-current': esActual ? 'page' : false,
                    },
                  },
                  statusIcon(isCompleted(l.id)),
                  el('span', {
                    text: l.kind === 'cierre' ? 'Cierre de la parte' : `${l.number}. ${l.title}`,
                  }),
                ),
              );
            }),
          ),
        ),
      );
    });
  }

  function abrirPanel(abierto) {
    document.body.classList.toggle('indice-abierto', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    fondo.hidden = !abierto;
    if (abierto) container.querySelector('.indice__enlace--actual, a')?.focus();
  }

  function aplicarPlegado(plegado) {
    document.body.classList.toggle('indice-plegado', plegado);
    boton.setAttribute('aria-expanded', String(!plegado));
  }

  boton.addEventListener('click', () => {
    if (ANGOSTO.matches) {
      abrirPanel(!document.body.classList.contains('indice-abierto'));
    } else {
      const plegado = !document.body.classList.contains('indice-plegado');
      aplicarPlegado(plegado);
      guardarPlegado(plegado);
    }
  });
  fondo.addEventListener('click', () => abrirPanel(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('indice-abierto')) {
      abrirPanel(false);
      boton.focus();
    }
  });
  ANGOSTO.addEventListener?.('change', () => {
    abrirPanel(false);
    aplicarPlegado(!ANGOSTO.matches && leerPlegado());
  });

  if (ANGOSTO.matches) boton.setAttribute('aria-expanded', 'false');
  else aplicarPlegado(leerPlegado());
  dibujar();
  subscribe(dibujar);
}
