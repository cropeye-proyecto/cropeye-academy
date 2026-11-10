// Pruebas del currículo y del progreso: node --test tools/*.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

// Entorno de navegador mínimo para state.js.
function storageFalso(inicial = {}, { rota = false } = {}) {
  const datos = { ...inicial };
  return {
    getItem: (k) => {
      if (rota) throw new Error('bloqueado');
      return k in datos ? datos[k] : null;
    },
    setItem: (k, v) => {
      if (rota) throw new Error('bloqueado');
      datos[k] = String(v);
    },
    datos,
  };
}
globalThis.window = { localStorage: storageFalso() };
globalThis.document = { dispatchEvent() {} };
globalThis.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o?.detail; } };

const content = await import('../assets/js/core/content.js');

const curriculo = {
  version: 2,
  parts: [
    { id: 'p1', title: 'Uno', lessons: [
      { id: 'p1-01', title: 'A', file: 'a.md' },
      { id: 'p1-cierre', title: 'Cierre', file: 'c1.md', kind: 'cierre' },
    ] },
    { id: 'p2', title: 'Dos', lessons: [{ id: 'p2-02', title: 'B', file: 'b.md' }] },
  ],
};

test('aplana partes y numera solo las lecciones', () => {
  content.setCurriculum(curriculo);
  assert.equal(content.totalLessons(), 3);
  assert.equal(content.findLesson('p1-01').number, 1);
  assert.equal(content.findLesson('p1-cierre').number, null);
  assert.equal(content.findLesson('p2-02').number, 2);
  assert.equal(content.findLesson('p2-02').partIndex, 2);
});

test('vecinos cruzan de una parte a otra', () => {
  content.setCurriculum(curriculo);
  assert.equal(content.neighbours('p1-cierre').next.id, 'p2-02');
  assert.equal(content.neighbours('p1-01').prev, null);
  assert.deepEqual(content.lessonsOfPart('p1').map((l) => l.id), ['p1-01', 'p1-cierre']);
});

test('un currículo sin "parts" se rechaza', () => {
  assert.throws(() => content.setCurriculum({ paths: [] }), /parts/);
});

test('el progreso del prototipo no se mezcla con el nuevo', async () => {
  window.localStorage = storageFalso({
    'cropeye.progress': JSON.stringify({ version: 1, completed: ['p1-m1-s1-l1'] }),
  });
  const state = await import(`../assets/js/core/state.js?viejo=${Date.now()}`);
  assert.deepEqual(state.getState().completed, []);
  assert.equal(state.firstPending(['p1-01', 'p2-02']), 'p1-01');
  state.toggle('p1-01');
  assert.equal(state.firstPending(['p1-01', 'p2-02']), 'p2-02');
  assert.ok(window.localStorage.datos['cropeye.academy.v2']);
});

test('con localStorage bloqueado el progreso funciona vacío', async () => {
  window.localStorage = storageFalso({}, { rota: true });
  const state = await import(`../assets/js/core/state.js?bloqueado=${Date.now()}`);
  assert.doesNotThrow(() => state.load());
  assert.equal(state.toggle('p1-01'), true);
});
