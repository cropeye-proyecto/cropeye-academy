# CropEye Academy: rediseño para estudiar el proyecto

Fecha: 2026-11-10 · Rama: `rediseno-estudio` · Estado: aprobado en conversación, pendiente de revisión escrita

## 1. Propósito

El equipo construyó gran parte de CropEye con asistencia de IA y no todos entienden por completo cómo funciona. CropEye Academy es el material interno para estudiarlo. El orden de prioridad es:

1. **Poder explicar y defender el proyecto** ante la comisión y el profesor guía.
2. **Poder trabajar el código con criterio**: modificarlo, revisar lo que genera la IA y depurar cuando algo falla.

El sitio actual es un prototipo y se reemplaza por completo.

### Criterios de éxito

- Una persona del equipo que lea las 4 partes en orden puede explicar con sus palabras el problema, la solución y el recorrido técnico de un análisis entre App, Backend y API de IA.
- Puede responder sin ayuda las preguntas de la comisión de cada parte.
- Puede abrir el archivo del repo que corresponde a cada pieza y reconocer qué hace.
- Cualquier integrante puede corregir o agregar una lección editando un archivo Markdown, sin instalar nada.

### Principios de contenido

- **Se explica la idea original del proyecto**, no cada decisión intermedia. Las lecciones describen conceptos estables (el flujo de un análisis, por qué existe un umbral, qué hace un token) y evitan cifras o detalles que cambian semana a semana. La actualización completa se hará en la versión final.
- **Alcance completo**: núcleo de diagnóstico y funciones de huerto, con el mismo nivel de detalle.
- **Tono de profesor o investigador**, al estilo de The Odin Project y HTB Academy: prosa continua, primera persona plural ("veamos", "notemos"), español neutro, párrafos de ideas completas. Nada de listas de resumen, emojis ni frases de asistente ("En resumen", "¡Excelente pregunta!").
- **Fragmentos de código cortos y genéricos.** El repositorio de la Academy es público y los repos del proyecto son privados: cada fragmento tiene como máximo unas 30 líneas, no incluye secretos, URLs internas ni configuración, y siempre indica la ruta del archivo real.

## 2. Estructura del curso

Dos niveles: **partes › lecciones**. Cada parte termina con una lección de cierre que solo contiene preguntas de la comisión sobre la parte completa.

**Parte 1. El problema**
1. Enfermedades foliares: qué son y por qué el tiempo importa
2. Quién vive el problema y cómo lo resuelve hoy
- Cierre de la Parte 1

**Parte 2. La solución**
3. La idea: diagnosticar desde la foto de una hoja
4. El sistema en tres piezas: App, Backend y API de IA
5. De herramienta de diagnóstico a app del huerto
- Cierre de la Parte 2

**Parte 3. Cómo funciona por dentro**
6. El modelo: aprender de imágenes
7. Saber cuándo no responder: filtro de hoja, confianza y umbral
8. Explicar la predicción: Grad-CAM
9. La app: de la cámara al resultado
10. La app: lo que se guarda en el teléfono
11. El backend: usuarios, tokens y base de datos
12. Las funciones del huerto por dentro
- Cierre de la Parte 3

**Parte 4. Cómo se conecta todo**
13. El contrato: qué viaja entre App y API de IA
14. Recorrido completo de un análisis por el camino directo
15. Recorrido con cuenta: App → Backend → almacenamiento → IA
16. Cuando algo falla
17. Privacidad y datos personales
- Cierre de la Parte 4

Total: 17 lecciones y 4 cierres.

## 3. Formato de una lección

Extensión: 1.200 a 2.000 palabras (10 a 15 minutos). Orden fijo:

1. **Introducción**: un párrafo con el problema que resuelve la lección y por qué importa en CropEye.
2. **Objetivos de aprendizaje** (`:::objetivos`): "Al terminar esta lección deberías poder…" con 3 o 4 verbos concretos. Es la única lista obligatoria.
3. **Desarrollo** en secciones `##`, una idea por sección, con:
   - diagramas SVG cuando hay un flujo o una relación entre piezas;
   - recorridos por el código real con fragmentos cortos que indican repo y archivo;
   - notas (`:::note`) y advertencias (`:::warning`) para trampas comunes.
4. **Autoevaluación** (`:::autoevaluacion`): de 3 a 5 preguntas; cada respuesta está oculta y enlaza a la sección donde se explica.
5. **Pregunta de la comisión** (`:::comision`): pregunta difícil, respuesta modelo de 1 o 2 párrafos y "qué no decir".
6. **Para profundizar**: archivos del repo que conviene leer después.

Las lecciones de cierre contienen solo una introducción breve y de 4 a 6 bloques `:::comision`.

## 4. Diseño visual

Se conserva la paleta de `assets/css/tokens.css` (papel `#F6F4EE`, arena `#EAE5D9`, borde `#D5CEBE`, corteza `#2C2520`, texto secundario `#685B50`, salvia `#4F6F52`). Cambia la composición.

- **Cabecera** delgada con el nombre del sitio y el progreso global.
- **Panel de inicio**: presentación breve del curso, botón "Continuar donde quedaste" y las **4 partes como tarjetas** apiladas al ancho de lectura. Cada tarjeta (fondo arena, borde suave, sin sombra) muestra título, un párrafo de presentación, progreso ("3 de 5") y la lista de sus lecciones (número, título, minutos y marca de completada).
- **Vista de lección**: en escritorio, índice del curso a la izquierda (fijo y plegable) y columna de lectura centrada de unos 68 caracteres. En celular, el índice se abre como panel desde un botón. Migas de pan cortas (Parte › Lección) arriba; al final, "← Anterior · Marcar como completada · Siguiente →".
- **Tipografía**: una sola familia sans-serif del sistema; cuerpo de 17–18 px con interlineado de 1,7; monoespaciada para código. Se elimina la serif.
- **Bloques**:
  - nota: borde izquierdo salvia;
  - advertencia: borde izquierdo en tono tierra;
  - autoevaluación: `<details>` nativo con "Ver respuesta";
  - comisión: fondo arena con la etiqueta "Pregunta de la comisión";
  - código: fondo corteza con la ruta del archivo como encabezado.
- **Sin** tarjetas anidadas, sombras ni animaciones decorativas.
- **Accesibilidad**: contraste AA comprobado para cada par texto/fondo, foco visible, navegación completa con teclado, enlace "Saltar al contenido", respeto de `prefers-reduced-motion` y texto alternativo en cada diagrama.
- **Fuera de alcance**: modo oscuro.

## 5. Cambios técnicos

El sitio sigue siendo estático (HTML, CSS y módulos ES nativos) en GitHub Pages, sin build ni dependencias.

### Contenido

- `content/curriculum.json` con la forma:

```json
{
  "version": 2,
  "title": "CropEye Academy",
  "parts": [
    {
      "id": "p1",
      "title": "El problema",
      "summary": "…",
      "lessons": [
        { "id": "p1-01", "title": "…", "summary": "…", "minutes": 12,
          "file": "content/lessons/p1-01-enfermedades-foliares.md" },
        { "id": "p1-cierre", "title": "Cierre: preguntas de la comisión", "summary": "…",
          "minutes": 8, "file": "content/lessons/p1-cierre.md", "kind": "cierre" }
      ]
    }
  ]
}
```

- Se borran las 24 lecciones actuales y se escriben 21 archivos nuevos (17 lecciones y 4 cierres).

### Markdown

Se conserva el renderizador seguro (todo se escapa antes de dar formato) y se agregan:

- `:::objetivos` … `:::` → lista con el encabezado "Objetivos de aprendizaje".
- `:::autoevaluacion` … `:::`, con pares `? pregunta` / `= respuesta` (la respuesta puede terminar con `→ #ancla`), que se convierte en `<details><summary>`.
- `:::comision` … `:::`, con las líneas `? pregunta`, el cuerpo de la respuesta modelo y `! qué no decir`.
- Bloque de código con ruta: ` ```dart lib/services/historial.dart` muestra la ruta como encabezado.
- Imagen SVG local: `![texto alternativo](assets/diagramas/nombre.svg)`. Solo se aceptan rutas relativas que terminen en `.svg`; cualquier otra imagen se ignora.
- Los encabezados `##` reciben un `id` derivado del texto, para los enlaces de la autoevaluación.

### Diagramas

Entre 10 y 15 archivos SVG escritos a mano en `assets/diagramas/`, con la paleta del sitio, texto real (no imágenes de texto), `<title>` y `<desc>` para lectores de pantalla.

### JavaScript

- `core/content.js`: carga y aplanado de partes › lecciones.
- `core/state.js`: se conserva. Clave nueva `cropeye.academy.v2` en `localStorage`, para no mezclar el progreso del prototipo.
- `ui/curriculum.js`: tarjetas de partes con su lista de lecciones.
- `ui/sidebar.js`: índice de 2 niveles.
- `ui/lesson-nav.js`: se adapta a la nueva estructura.

### CSS

Se reescriben `layout.css`, `components.css` y `lesson.css` sobre los tokens existentes. En `tokens.css` se ajustan tipografía, espaciado y radios, y se mantienen los colores.

### Verificación

- `tools/validar.py`: cada lección del JSON existe, el H1 coincide con el título, los bloques `:::` están cerrados, los SVG referenciados existen y cada lección tiene objetivos, autoevaluación y pregunta de la comisión.
- `tools/markdown.test.mjs`: pruebas del renderizador con Node, incluidos los bloques nuevos y los casos de seguridad (HTML crudo, `javascript:`, imágenes no SVG).
- Contraste AA comprobado con un script sobre los pares de colores usados.
- Capturas del panel y de una lección en escritorio y en el celular del emulador de Android.

### Documentación

El README se reescribe con la estructura nueva, cómo correr el sitio en local y una guía para escribir una lección: tono, bloques, diagramas y el límite de los fragmentos de código.

## 6. Fuera de alcance

Buscador, modo oscuro, cuentas, sincronización del progreso y repaso espaciado.

## 7. Entrega

Todo el trabajo va en la rama `rediseno-estudio`, con commits por etapa (base técnica, diseño, contenido por parte, documentación), y se integra con un único pull request hacia `main`.
