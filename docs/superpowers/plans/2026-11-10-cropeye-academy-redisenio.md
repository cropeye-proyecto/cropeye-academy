# Rediseño de CropEye Academy: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el prototipo de CropEye Academy por un curso de 4 partes y 17 lecciones (más 4 cierres) para que el equipo estudie y defienda el proyecto, con un diseño más simple sobre la paleta actual.

**Architecture:** Sitio estático sin build (HTML, CSS y módulos ES nativos) en GitHub Pages. El contenido vive en `content/curriculum.json` (partes › lecciones) y en archivos Markdown que pasan por un renderizador seguro propio, ampliado con bloques de estudio. Los diagramas son SVG escritos a mano.

**Tech Stack:** HTML, CSS y JavaScript ES2022 sin dependencias; Node 24 (`node --test`) para probar el renderizador; Python 3 para validar el contenido; Edge headless y el emulador de Android para las capturas.

**Spec:** `docs/superpowers/specs/2026-11-10-cropeye-academy-redisenio-design.md`

## Global Constraints

- Todo el trabajo va en la rama `rediseno-estudio`; un solo PR a `main` al final.
- Sin dependencias de npm, sin CDN, sin paso de compilación. Todas las rutas son relativas (el sitio se sirve desde `/cropeye-academy/`).
- Paleta fija (no cambiar valores): `--bg #F6F4EE`, `--surface #EAE5D9`, `--border #D5CEBE`, `--text #2C2520`, `--text-muted #685B50`, `--accent #4F6F52`, `--accent-hover #3E5940`, `--accent-soft #739072`, `--success #5F8D4E`, `--success-bg #E3EFE0`.
- Una sola familia sans-serif del sistema; cuerpo de 17–18 px, interlineado 1,7; columna de lectura de unos 68ch. Sin modo oscuro, sin sombras, sin tarjetas anidadas, sin animaciones decorativas.
- Contraste AA (≥ 4,5:1 texto normal, ≥ 3:1 texto grande y bordes de foco) para cada par texto/fondo usado.
- Tono del contenido: prosa de profesor o investigador, primera persona plural, español neutro. Prohibido: listas de resumen, emojis, "En resumen", "¡Excelente pregunta!". La única lista obligatoria es la de objetivos.
- Lecciones de 1.200 a 2.000 palabras; cierres con 4 a 6 bloques `:::comision`.
- Se explica la **idea original** del proyecto: conceptos estables, sin cifras que cambian semana a semana ni historial de decisiones.
- El repo es público: fragmentos de código de ≤ 30 líneas, sin secretos, URLs internas ni configuración, siempre con la ruta del archivo real.
- Clave de progreso nueva: `cropeye.academy.v2` (la vieja `cropeye.progress` se ignora).

## Review Focus

1. **Lección inexistente en la URL** (`lesson.html?lesson=xyz`): debe mostrar "No encontramos esa lección" con un enlace al panel, nunca una página en blanco ni un error en consola sin manejar. Prueba en la Task 3.
2. **Bloque `:::` sin cerrar** en una lección: el renderizador no debe tragarse el resto del documento en silencio; cierra el bloque al final del archivo, y el validador lo reporta como error. Pruebas en las Tasks 1 y 2.
3. **Imagen que no es SVG local** (`http://…`, `../../x.svg`, `data:`, `.png`): se descarta y se deja solo el texto alternativo, sin crear `<img>`. Prueba en la Task 1.
4. **Celular de 360 px**: sin scroll horizontal de la página; los bloques de código y los SVG anchos hacen scroll o se escalan dentro de su caja. Captura en la Task 3.
5. **`localStorage` bloqueado o con progreso viejo**: el sitio funciona con progreso vacío y no muestra como completadas lecciones del prototipo. Prueba en la Task 2.

---

### Task 1: Renderizador de Markdown con bloques de estudio

**Files:**
- Modify: `assets/js/lib/markdown.js`
- Create: `tools/markdown.test.mjs`

**Interfaces:**
- Produces: `renderMarkdown(md: string): string` (misma firma). HTML generado:
  - `## Título` → `<h2 id="titulo">Título</h2>`; el id es un slug en minúsculas, sin tildes, con espacios → `-`, y sufijo `-2`, `-3` si se repite.
  - `:::objetivos` → `<section class="objetivos"><h2 class="objetivos__titulo">Objetivos de aprendizaje</h2><p>Al terminar esta lección deberías poder:</p><ul>…</ul></section>` (los ítems son las líneas `- …` del bloque).
  - `:::autoevaluacion` → `<section class="autoevaluacion"><h2 id="autoevaluacion">Autoevaluación</h2><ol>` y, por cada par `? pregunta` / `= respuesta [→ #ancla]`, `<li><p class="autoevaluacion__pregunta">…</p><details><summary>Ver respuesta</summary><p>…</p><p><a href="#ancla">Repasar la sección</a></p></details></li>` (el enlace solo si hay ancla).
  - `:::comision` → `<section class="comision"><p class="comision__etiqueta">Pregunta de la comisión</p><p class="comision__pregunta">…</p><details><summary>Ver respuesta modelo</summary>…cuerpo renderizado…<p class="comision__evitar"><strong>Qué no decir:</strong> …</p></details></section>`.
  - ` ```dart lib/x.dart` → `<figure class="codigo"><figcaption>lib/x.dart</figcaption><pre><code class="language-dart">…</code></pre></figure>`; sin ruta, igual que hoy.
  - `![alt](assets/diagramas/x.svg)` → `<figure class="diagrama"><img src="assets/diagramas/x.svg" alt="alt" loading="lazy"><figcaption>alt</figcaption></figure>`, solo si la ruta empieza con `assets/diagramas/`, no contiene `..` y termina en `.svg`; si no, `<p>alt</p>`.
  - `:::note` y `:::warning` siguen igual.
  - Un bloque `:::` o ` ``` ` sin cierre se cierra al final del documento.

- [ ] **Step 1: Escribir las pruebas que fallan** en `tools/markdown.test.mjs` con `node:test` y `node:assert/strict`, importando `../assets/js/lib/markdown.js`. Casos:
  - `slug en h2`: `renderMarkdown('## Qué es una hoja')` contiene `<h2 id="que-es-una-hoja">`; dos `## A` producen `id="a"` y `id="a-2"`.
  - `objetivos`: el bloque con dos `- ` produce `class="objetivos"` y 2 `<li>`.
  - `autoevaluacion con ancla`: `? ¿P?` / `= R → #seccion` produce `<summary>Ver respuesta</summary>` y `href="#seccion"`; sin `→`, no hay `<a`.
  - `comision`: contiene `Pregunta de la comisión`, `Ver respuesta modelo` y `Qué no decir:`.
  - `codigo con ruta`: ` ```dart lib/a.dart ` produce `<figcaption>lib/a.dart</figcaption>` y `language-dart`.
  - `svg local aceptado`: `![Flujo](assets/diagramas/flujo.svg)` produce `<img src="assets/diagramas/flujo.svg" alt="Flujo"`.
  - `imagenes rechazadas`: para `http://x/a.svg`, `assets/diagramas/../../a.svg`, `assets/diagramas/a.png` y `data:image/svg+xml,<svg>` no aparece `<img`.
  - `html crudo escapado`: `<script>alert(1)</script>` dentro de `:::comision` aparece como `&lt;script&gt;`.
  - `javascript en enlace`: `[x](javascript:alert(1))` no produce `href=`.
  - `bloque sin cerrar`: `:::note\ntexto\n\n## Después` no se pierde: el resultado contiene `texto` y `Después`.
- [ ] **Step 2: Correr y ver que fallan.** Run: `node --test tools/` · Expected: FAIL en los casos nuevos.
- [ ] **Step 3: Implementar** en `markdown.js`. Mantener el escape previo de todo el documento (la línea `? `, `= `, `! ` se reconoce sobre el texto ya escapado, así que `→` y `#` siguen igual). El slug se calcula con `normalize('NFD')` y quitando los diacríticos; el contador de slugs se reinicia en cada llamada a `renderMarkdown`.
- [ ] **Step 4: Correr y ver que pasan.** Run: `node --test tools/` · Expected: todos PASS.
- [ ] **Step 5: Commit** `Markdown: bloques de objetivos, autoevaluación, comisión, código con ruta y diagramas SVG`.

### Task 2: Modelo de contenido de 2 niveles, progreso nuevo y validador

**Files:**
- Modify: `content/curriculum.json` (reescribir), `assets/js/core/content.js`, `assets/js/core/state.js`
- Delete: `content/lessons/p*-m*-s*-l*.md` (las 24 del prototipo)
- Create: `tools/validar.py`, `tools/test_validar.py`, `tools/content.test.mjs`

**Interfaces:**
- Consumes: nada de la Task 1.
- Produces:
  - `curriculum.json` con la forma de la sección 5 del spec: `version: 2`, `parts[]` con `id` (`p1`…`p4`), `title`, `summary` y `lessons[]` (`id`, `title`, `summary`, `minutes`, `file`, `kind?: "cierre"`). Las 21 entradas con los títulos exactos de la sección 2 del spec; ids `p1-01`…`p4-17` con numeración global y `pN-cierre`; archivos `content/lessons/<id>-<slug>.md` y `content/lessons/pN-cierre.md`; cierres titulados `Cierre: preguntas de la comisión`.
  - `content.js`: `loadCurriculum(force?) → Promise<curriculum>`, `allLessons() → Lesson[]` (cada uno con `partId`, `partTitle`, `partIndex` (1–4) y `number` (1–17, `null` en los cierres)), `findLesson(id) → Lesson|null`, `neighbours(id) → {prev, next}`, `lessonsOfPart(partId) → Lesson[]`, `totalLessons() → 21`, `loadLessonBody(lesson|id) → Promise<string>`. Lanza un error si falta `parts`.
  - `state.js`: misma API; `STORAGE_KEY = 'cropeye.academy.v2'`, `STATE_VERSION = 2`; nueva `firstPending(ids: string[]) → string|null` para "Continuar donde quedaste".
  - `tools/validar.py [raíz]`: sale con código 0 si todo está bien; si no, imprime una línea por problema y sale con 1. Valida: cada `file` existe; el primer H1 coincide con `title`; bloques `:::` y ` ``` ` cerrados; cada SVG referenciado existe en `assets/diagramas/`; las lecciones normales tienen `:::objetivos`, `:::autoevaluacion` (3 a 5 `?`) y `:::comision`, y suman entre 1.200 y 2.000 palabras; los cierres tienen entre 4 y 6 `:::comision`; ningún archivo de `content/lessons/` queda fuera del JSON.

- [ ] **Step 1: Pruebas que fallan.** `tools/test_validar.py` (unittest) arma un sitio mínimo en un directorio temporal y comprueba que `validar.py` detecta: archivo faltante, H1 distinto, bloque sin cerrar, SVG inexistente, lección sin `:::comision`, cierre con 2 preguntas y archivo huérfano; y que un sitio correcto sale con 0. `tools/content.test.mjs` carga `content.js` con un `fetch` falso que devuelve un JSON de 2 partes y comprueba `number`, `partIndex`, `neighbours` entre partes y `lessonsOfPart`. Agregar a `tools/content.test.mjs` un caso de `state.js` con un `localStorage` falso que trae `cropeye.progress` viejo con ids completados: `getState().completed` debe quedar vacío; y otro con un `localStorage` que lanza en `getItem`: `load()` no lanza.
- [ ] **Step 2: Correr y ver que fallan.** Run: `python -m unittest tools/test_validar.py` y `node --test tools/` · Expected: FAIL.
- [ ] **Step 3: Implementar** el JSON, `content.js`, `state.js` y `validar.py`. Borrar las 24 lecciones viejas.
- [ ] **Step 4: Correr y ver que pasan.** Run: `python -m unittest tools/test_validar.py` y `node --test tools/` · Expected: PASS. Run: `python tools/validar.py .` · Expected: falla solo por los 21 archivos de lecciones que todavía no existen (las Tasks 4 a 8 los crean).
- [ ] **Step 5: Commit** `Contenido en 2 niveles (partes y lecciones), progreso v2 y validador`.

### Task 3: Diseño nuevo: panel con tarjetas por parte y vista de lección

**Files:**
- Modify: `index.html`, `lesson.html`, `assets/css/tokens.css`, `assets/css/base.css`, `assets/css/layout.css`, `assets/css/components.css`, `assets/css/lesson.css`, `assets/js/main.js`, `assets/js/lesson-page.js`, `assets/js/ui/curriculum.js`, `assets/js/ui/sidebar.js`, `assets/js/ui/lesson-nav.js`, `assets/js/ui/progress.js`
- Create: `tools/contraste.py`, `content/lessons/_muestra.md` (lección de prueba temporal, se borra en la Task 8)

**Interfaces:**
- Consumes: `renderMarkdown` (Task 1); `loadCurriculum`, `allLessons`, `lessonsOfPart`, `findLesson`, `neighbours`, `loadLessonBody`, `totalLessons` (Task 2); `isCompleted`, `toggle`, `countCompleted`, `subscribe`, `firstPending` (Task 2).
- Produces: `renderCurriculum(container, curriculum)` dibuja una `<section class="parte">` por parte (título, `summary`, "N de M" y `<ol>` con número, título, minutos y estado; los cierres van al final con la etiqueta "Cierre"). `mountSidebar({container, curriculum, currentId})` muestra un índice de 2 niveles con la parte actual abierta. `mountLessonNav(container, {lesson, prev, next})` muestra "← Anterior · Marcar como completada · Siguiente →".

- [ ] **Step 1: Prueba de contraste que falla.** `tools/contraste.py` calcula la razón WCAG de cada par usado (lista fija en el script: texto/fondo, texto secundario/fondo, texto secundario/arena, acento/fondo, acento/arena, texto/arena, blanco/acento, texto claro/corteza del código, foco/fondo) y sale con 1 si alguno no cumple su mínimo. Run: `python tools/contraste.py` con los tokens nuevos aún sin definir · Expected: FAIL por las variables que faltan (`--code-bg`, `--code-text`, `--warning-border`).
- [ ] **Step 2: Implementar los tokens y el CSS.** Agregar `--code-bg: #2C2520`, `--code-text: #F6F4EE`, `--warning-border: #9A6B3F` (tono tierra), `--font-body` igual a la pila sans-serif actual, `--text-body: 1.0625rem`, `--leading: 1.7`, `--reading-width: 68ch`; eliminar `--font-serif` y las sombras. Reescribir `layout.css`, `components.css` y `lesson.css` según la sección 4 del spec. El índice lateral es fijo desde 900 px, con un botón para plegarlo (preferencia guardada en `cropeye.academy.sidebar`), y pasa a un panel con botón bajo ese ancho. Los bloques `pre` y `figure.diagrama` hacen `overflow-x: auto` y las imágenes `max-width: 100%`.
- [ ] **Step 3: Contraste pasa.** Run: `python tools/contraste.py` · Expected: todos los pares OK. Si un par no cumple, se oscurece el tono derivado; nunca se cambian los colores de la paleta fija.
- [ ] **Step 4: Implementar el JS de la interfaz** con las firmas de Interfaces. Si el id de la URL no existe, `lesson-page.js` muestra `No encontramos esa lección` y un enlace "Volver al panel". "Continuar donde quedaste" usa `firstPending(allLessons().map(l => l.id))` y se oculta si todo está completo. Escribir `content/lessons/_muestra.md` usando todos los bloques de la Task 1 y apuntarlo temporalmente desde una entrada extra en `curriculum.json` (se quita en la Task 8).
- [ ] **Step 5: Verificación visual.** Servir con `python -m http.server 8080`. Capturas con Edge headless (1366 px) del panel, de la lección de muestra y de `lesson.html?lesson=xyz`. Abrir la lección de muestra en el Chrome del emulador de Android (360–412 px) y comprobar que no hay scroll horizontal y que el índice se abre y cierra con su botón. Recorrer el panel y la lección solo con el teclado (Tab, Enter): el foco siempre es visible y el enlace "Saltar al contenido" funciona.
- [ ] **Step 6: Commit** `Diseño nuevo: tarjetas por parte, índice lateral y lectura simple sobre la paleta actual`.

### Tasks 4 a 8: contenido

Reglas comunes a las tareas de contenido:
- **Fuente de verdad:** el código actual de `cropeye-app` (`C:\dev\cropeye-app`, rama `plan-app-integrado`), `cropeye-api` (`C:\dev\cropeye-api`) y `cropeye-ia` (clonar con `gh repo clone cropeye-proyecto/cropeye-ia C:\dev\cropeye-ia` si no está). Antes de escribir una lección, leer los archivos que cita. Si el código y un documento no coinciden, manda el código.
- **Idea original:** explicar el concepto estable; nombrar cifras solo cuando son parte de la idea (por ejemplo, que existe un umbral de confianza) y evitar detalles volátiles.
- **Cada lección** sigue el formato de la sección 3 del spec con los bloques de la Task 1, y cada diagrama es un SVG en `assets/diagramas/` con `viewBox`, `<title>`, `<desc>`, la paleta y texto real (fuente del sistema, ≥ 14 px a 680 px de ancho).
- **Verificación de cada tarea:** `python tools/validar.py .` sin errores para los archivos de la tarea, y lectura de la lección en el navegador local para revisar diagramas y anclas de la autoevaluación.
- **Commit por tarea:** `Contenido Parte N: <título de la parte>`.

### Task 4: Parte 1, el problema

**Files:** Create `content/lessons/p1-01-*.md`, `p1-02-*.md`, `p1-cierre.md`; `assets/diagramas/p1-avance-enfermedad.svg`.

- [ ] **Step 1:** Escribir la lección 1 (qué es una enfermedad foliar, cómo avanza y por qué el tiempo de detección importa) con el diagrama del avance de la enfermedad en el tiempo frente a las oportunidades de actuar. Fuentes: la investigación F2 del equipo (fichas del INIA en `cropeye-app/assets/datos/fichas.json`).
- [ ] **Step 2:** Escribir la lección 2: quién vive el problema (huerto casero y agricultor pequeño de la zona central), cómo lo resuelve hoy y qué limita el acceso a un diagnóstico experto.
- [ ] **Step 3:** Escribir el cierre con 4 a 6 preguntas de la comisión sobre el problema y su relevancia.
- [ ] **Step 4:** Verificar y hacer commit.

### Task 5: Parte 2, la solución

**Files:** Create `p2-03-*.md`, `p2-04-*.md`, `p2-05-*.md`, `p2-cierre.md`; `assets/diagramas/p2-idea-foto-diagnostico.svg`, `p2-tres-piezas.svg`.

- [ ] **Step 1:** Lección 3, la idea: de la foto de una hoja a un diagnóstico explicado y con advertencias, con el diagrama del recorrido de punta a punta.
- [ ] **Step 2:** Lección 4, las tres piezas: App (Flutter), Backend (`cropeye-api`, FastAPI y base de datos) y API de IA (`cropeye-ia`), con la responsabilidad de cada una y el diagrama de componentes con sus flechas (camino directo App → IA y camino con cuenta App → Backend → IA).
- [ ] **Step 3:** Lección 5: por qué la app crece hacia el huerto (Mi huerto, línea de tiempo, fichas, cosechas, clima, "¿Acertó?"), qué problema resuelve cada función y por qué los datos viven en el teléfono.
- [ ] **Step 4:** Cierre con 4 a 6 preguntas de la comisión. Verificar y hacer commit.

### Task 6: Parte 3a, la inteligencia artificial (lecciones 6 a 8)

**Files:** Create `p3-06-*.md`, `p3-07-*.md`, `p3-08-*.md`; `assets/diagramas/p3-laboratorio-vs-campo.svg`, `p3-filtro-confianza-umbral.svg`, `p3-gradcam.svg`.

- [ ] **Step 1:** Leer en `cropeye-ia` el entrenamiento, la inferencia, el filtro de hoja y el Grad-CAM, y en `cropeye-app/INTEGRACION_API.md` el contrato.
- [ ] **Step 2:** Lección 6: aprender de imágenes, datos de laboratorio frente a campo, modelos preentrenados y por qué se combinan, con su diagrama.
- [ ] **Step 3:** Lección 7: filtro de hoja, confianza, umbral y la clase "Otra"; qué significa "confiable" en la app. Con el diagrama del recorrido de decisión.
- [ ] **Step 4:** Lección 8: Grad-CAM, qué muestra, cómo se lee y sus límites, con el diagrama.
- [ ] **Step 5:** Verificar y hacer commit `Contenido Parte 3 (IA): lecciones 6 a 8`.

### Task 7: Parte 3b, la app y el backend (lecciones 9 a 12 y cierre)

**Files:** Create `p3-09-*.md`, `p3-10-*.md`, `p3-11-*.md`, `p3-12-*.md`, `p3-cierre.md`; `assets/diagramas/p3-app-camara-resultado.svg`, `p3-almacenamiento-atomico.svg`, `p3-backend-tokens.svg`.

- [ ] **Step 1:** Lección 9: cámara, selector de cultivo, `PrepararImagen` (JPEG, tamaño, sin EXIF), llamada a la API y pantalla de resultado (`lib/screens/camara_screen.dart`, `lib/services/preparar_imagen.dart`, `lib/services/cropeye_api.dart`, `lib/screens/analisis_screen.dart`), con su diagrama.
- [ ] **Step 2:** Lección 10: almacenamiento local, carpetas por registro y escritura atómica (`lib/services/escritura_atomica.dart`, `historial.dart`, `huerto.dart`, `cosechas.dart`), con su diagrama.
- [ ] **Step 3:** Lección 11: backend, modelo de datos, registro, login, access y refresh token, roles y auditoría (`cropeye-api/app/routers/auth.py`, `core/security.py`, `models/models.py`), con su diagrama.
- [ ] **Step 4:** Lección 12: funciones del huerto por dentro, datos con fuente en JSON (`assets/datos/`), clima con Open-Meteo y reglas de helada y tizón, y diseño del huerto.
- [ ] **Step 5:** Cierre de la Parte 3 con 4 a 6 preguntas de la comisión. Verificar y hacer commit `Contenido Parte 3 (app y backend): lecciones 9 a 12`.

### Task 8: Parte 4, cómo se conecta todo; README y entrega

**Files:** Create `p4-13-*.md` a `p4-17-*.md`, `p4-cierre.md`; `assets/diagramas/p4-contrato.svg`, `p4-secuencia-directa.svg`, `p4-secuencia-con-cuenta.svg`, `p4-mapa-errores.svg`, `p4-datos-personales.svg`. Modify `README.md`, `content/curriculum.json` (quitar `_muestra`). Delete `content/lessons/_muestra.md`.

- [ ] **Step 1:** Lección 13: el contrato App ↔ API de IA (multipart, campos, respuesta, `confiable`, `top3`, mapa de calor), con su diagrama.
- [ ] **Step 2:** Lección 14: el recorrido directo de un análisis, paso a paso por los archivos, con un diagrama de secuencia.
- [ ] **Step 3:** Lección 15: el recorrido con cuenta (crear análisis, URL de subida, submit, estados y consultas repetidas, resultado), con un diagrama de secuencia; explicar la idea de una URL firmada sin depender de cómo esté configurado el almacenamiento hoy.
- [ ] **Step 4:** Lección 16: cómo falla cada pieza y cómo lo muestra la app (`error_analisis.dart`), con el mapa de errores.
- [ ] **Step 5:** Lección 17: datos personales, EXIF, consentimiento de "¿Acertó?" y lo que exige la ley chilena (Ley 19.628 y Ley 21.719, sin fechas de vigencia, que cambian), con su diagrama.
- [ ] **Step 6:** Cierre de la Parte 4. Quitar `_muestra` del JSON y borrar el archivo.
- [ ] **Step 7:** Reescribir el README: propósito, estructura, correr en local, guía para escribir una lección (tono, bloques, diagramas, límite de los fragmentos de código) y cómo correr `validar.py`, `contraste.py` y `node --test tools/`.
- [ ] **Step 8: Verificación final.** Run: `python tools/validar.py .` → 0 errores; `python -m unittest tools/test_validar.py` y `node --test tools/` → PASS; `python tools/contraste.py` → OK. Capturas del panel y de una lección por parte en escritorio y en el emulador.
- [ ] **Step 9:** Commit `Contenido Parte 4 y README` y abrir un único PR `rediseno-estudio` → `main`.
