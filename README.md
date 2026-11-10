# CropEye Academy

Material de estudio del proyecto **CropEye**: una app Android que fotografía hojas de tomate y papa y entrega un diagnóstico con una red neuronal y un mapa de calor Grad-CAM.

El propósito del sitio es que el equipo pueda **defender el proyecto primero y trabajar en él después**. Por eso sigue la idea original: problema → solución → detalle de cada pieza → cómo se conectan el Backend, la App y la API de IA.

Sitio publicado: https://cropeye-proyecto.github.io/cropeye-academy/

## Estructura del curso

| Parte | Tema | Lecciones |
|---|---|---|
| 1 | El problema | p1-01, p1-02 y cierre |
| 2 | La solución | p2-03 a p2-05 y cierre |
| 3 | Las piezas en detalle | p3-06 a p3-12 y cierre |
| 4 | Cómo se conectan | p4-13 a p4-17 y cierre |

Cada lección trae objetivos, diagramas, fragmentos de código comentados, autoevaluación y una pregunta de la comisión. Cada cierre reúne de 4 a 6 preguntas de la comisión con respuesta modelo y "qué no decir". El progreso se guarda solo en el navegador (`localStorage`).

## Ejecutar en local

Es un sitio estático sin paso de compilación:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Archivos principales

- `content/curriculum.json`: partes y lecciones.
- `content/lessons/<id>-<slug>.md`: el texto de cada lección.
- `assets/diagramas/*.svg`: diagramas dibujados a mano. Usan la paleta del sitio y llevan `<title>` y `<desc>`.
- `assets/js/lib/markdown.js`: renderizador seguro con bloques propios.
- `tools/`: validador y pruebas.

## Guía para escribir lecciones

- **Tono:** de profesor o investigador. Se explica el porqué, no solo el qué. Sin resúmenes de una línea.
- **Bloques disponibles:**
  - `:::objetivos` con una lista `- ...`
  - `:::autoevaluacion` con pares `? pregunta` / `= respuesta → #ancla` (de 3 a 5)
  - `:::comision` con `? pregunta` en una línea, la respuesta modelo y `! qué no decir`
  - Bloque de código con ruta: ```` ```dart lib/archivo.dart ````
  - Imágenes solo desde `assets/diagramas/*.svg`
- **Código:** como máximo 30 líneas por fragmento, genérico y sin secretos, URLs privadas ni claves. El repo es público.
- **Extensión:** entre 1200 y 2000 palabras por lección.

## Verificación

```bash
python tools/validar.py .               # contenido y estructura
python -m unittest tools/test_validar.py
node --test tools/*.test.mjs            # renderizador y currículo
python tools/contraste.py               # contraste WCAG AA de la paleta
```
