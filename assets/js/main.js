/**
 * Dashboard entry point. Loads the curriculum, renders the path cards and
 * keeps every lesson row in sync with the progress state.
 */

import { loadCurriculum, totalLessons } from './core/content.js';
import { subscribe } from './core/state.js';
import { mountProgress } from './ui/progress.js';
import { renderCurriculum, updateLessonStates } from './ui/curriculum.js';
import { el, clear } from './lib/dom.js';

const root = document.getElementById('curriculum-root');
const progressHost = document.getElementById('header-progress');
const tagline = document.getElementById('site-tagline');

let meter = null;
let subscribed = false;

function renderLoading() {
  clear(root);
  root.append(el('p', { class: 'text-muted', text: 'Cargando el currículo…' }));
}

function renderError(error) {
  clear(root);

  const retry = el(
    'button',
    { class: 'btn btn--primary', attrs: { type: 'button' } },
    'Reintentar',
  );
  retry.addEventListener('click', () => init(true));

  root.append(
    el(
      'div',
      {
        class: 'state-panel',
        attrs: { role: 'alert' },
      },
      el('div', { class: 'state-panel__icon', attrs: { 'aria-hidden': 'true' }, text: '⚠' }),
      el('h2', { text: 'No pudimos cargar el currículo' }),
      el('p', {
        text: 'Revisa tu conexión y vuelve a intentarlo. Si el problema persiste, el archivo content/curriculum.json podría estar incompleto.',
      }),
      el('p', {
        class: 'text-muted',
        text: error && error.message ? error.message : 'Error desconocido.',
      }),
      el('div', { class: 'state-panel__actions' }, retry),
    ),
  );
}

async function init(force = false) {
  renderLoading();
  root.setAttribute('aria-busy', 'true');

  try {
    const curriculum = await loadCurriculum(force);

    if (tagline && curriculum.tagline) tagline.textContent = curriculum.tagline;
    if (curriculum.title) {
      document.title = `${curriculum.title} · Aprende la arquitectura desde adentro`;
    }

    renderCurriculum(root, curriculum);

    const total = totalLessons(curriculum);
    if (meter) meter.destroy();
    meter = mountProgress(progressHost, total);

    if (!subscribed) {
      subscribe(() => updateLessonStates(root));
      subscribed = true;
    } else {
      updateLessonStates(root);
    }
  } catch (error) {
    if (meter) {
      meter.destroy();
      meter = null;
    }
    clear(progressHost);
    renderError(error);
  } finally {
    root.removeAttribute('aria-busy');
  }
}

if (root) init();
