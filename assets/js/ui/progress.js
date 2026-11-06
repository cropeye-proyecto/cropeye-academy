/**
 * Global progress meter used in the dashboard header.
 * Renders once, then updates through the state subscription.
 */

import { countCompleted, subscribe } from '../core/state.js';
import { el } from '../lib/dom.js';

/**
 * @param {HTMLElement} container
 * @param {number} total total number of lessons
 * @returns {{update: () => void, setTotal: (n: number) => void, destroy: () => void}}
 */
export function mountProgress(container, total) {
  const count = el('span', { class: 'progress__count', text: `0 de ${total} lecciones` });
  const fill = el('span', { class: 'progress__fill' });
  const track = el('div', {
    class: 'progress__track',
    attrs: {
      role: 'progressbar',
      'aria-label': 'Progreso del curso',
      'aria-valuemin': '0',
      'aria-valuemax': String(total),
      'aria-valuenow': '0',
      'aria-valuetext': `0 de ${total} lecciones`,
    },
  }, fill);

  const wrapper = el('div', { class: 'progress' },
    el('div', { class: 'progress__meta' },
      el('span', { class: 'progress__label', text: 'Progreso' }),
      count,
    ),
    track,
  );

  container.replaceChildren(wrapper);

  function update() {
    const done = countCompleted();
    const safeTotal = Math.max(0, Number(total) || 0);
    const percent = safeTotal > 0 ? (done / safeTotal) * 100 : 0;
    const label = `${done} de ${safeTotal} lecciones`;

    count.textContent = label;
    fill.style.width = `${Math.min(100, percent)}%`;
    fill.dataset.complete = String(safeTotal > 0 && done >= safeTotal);

    track.setAttribute('aria-valuenow', String(done));
    track.setAttribute('aria-valuemax', String(safeTotal));
    track.setAttribute('aria-valuetext', label);
  }

  function setTotal(nextTotal) {
    total = Math.max(0, Number(nextTotal) || 0);
    update();
  }

  const unsubscribe = subscribe(update);
  update();

  return { update, setTotal, destroy: unsubscribe };
}
