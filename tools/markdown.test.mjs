// Pruebas del renderizador de Markdown: node --test tools/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderMarkdown as md } from '../assets/js/lib/markdown.js';

test('los h2 reciben un id legible y único', () => {
  assert.match(md('## Qué es una hoja'), /<h2 id="que-es-una-hoja">/);
  const doble = md('## A\n\n## A');
  assert.match(doble, /id="a"/);
  assert.match(doble, /id="a-2"/);
});

test('objetivos', () => {
  const html = md(':::objetivos\n- explicar el flujo\n- rastrear un error\n:::');
  assert.match(html, /class="objetivos"/);
  assert.equal(html.match(/<li>/g).length, 2);
});

test('autoevaluación con y sin ancla', () => {
  const con = md(':::autoevaluacion\n? ¿Pregunta?\n= Respuesta → #seccion\n:::');
  assert.match(con, /<summary>Ver respuesta<\/summary>/);
  assert.match(con, /href="#seccion"/);
  const sin = md(':::autoevaluacion\n? ¿Pregunta?\n= Respuesta\n:::');
  assert.doesNotMatch(sin, /<a /);
});

test('pregunta de la comisión', () => {
  const html = md(':::comision\n? ¿Por qué así?\nPorque sí.\n! Decir que lo hizo la IA.\n:::');
  assert.match(html, /Pregunta de la comisión/);
  assert.match(html, /Ver respuesta modelo/);
  assert.match(html, /Qué no decir:/);
  assert.match(html, /<p>Porque sí.<\/p>/);
});

test('código con la ruta del archivo', () => {
  const html = md('```dart lib/a.dart\nvoid main() {}\n```');
  assert.match(html, /<figcaption>lib\/a.dart<\/figcaption>/);
  assert.match(html, /language-dart/);
});

test('diagrama SVG local aceptado', () => {
  assert.match(md('![Flujo](assets/diagramas/flujo.svg)'), /<img src="assets\/diagramas\/flujo.svg" alt="Flujo"/);
});

test('imágenes que no son SVG locales se descartan', () => {
  for (const src of [
    'http://x/a.svg',
    'assets/diagramas/../../a.svg',
    'assets/diagramas/a.png',
    'data:image/svg+xml,<svg>',
  ]) {
    assert.doesNotMatch(md(`![x](${src})`), /<img/, src);
  }
});

test('el HTML crudo se escapa, también dentro de bloques', () => {
  const html = md(':::comision\n? <script>alert(1)</script>\n:::');
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test('enlaces con javascript: no producen href', () => {
  assert.doesNotMatch(md('[x](javascript:alert(1))'), /href=/);
});

test('un bloque sin cerrar no se traga el resto en silencio', () => {
  const html = md(':::note\ntexto\n\n## Después');
  assert.match(html, /texto/);
  assert.match(html, /Después/);
});
