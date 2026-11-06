# CropEye Academy

Sitio estático de aprendizaje sobre la arquitectura del proyecto **CropEye**, la tesis chilena (INACAP, curso TIHI84) que construye una app Android para fotografiar hojas de tomate y papa y obtener un diagnóstico con una CNN y una explicación Grad-CAM.

El sitio contiene seis rutas, veinticuatro lecciones cortas y un registro de progreso que vive en el navegador. No hay backend, ni cuentas, ni servicios externos.

## Stack y por qué sin framework

El sitio usa HTML, CSS y módulos ES6 nativos. No hay framework, ni bundler, ni paso de compilación, ni dependencias de npm, ni enlaces a CDN.

La razón es doble. Primero, el contenido es el producto: un curso cuyas lecciones son archivos Markdown se edita mejor sin una cadena de herramientas que haya que mantener. Segundo, la longevidad: un sitio que solo necesita un servidor de archivos sigue funcionando dentro de cinco años, cuando el framework de moda ya cambió tres veces.

El costo es real y conviene decirlo: el renderizado del dashboard y de la lección se escribe a mano, el renderizador de Markdown soporta un subconjunto deliberadamente pequeño y no hay componentes reutilizables más allá de las funciones de `assets/js/ui/`. Para un curso de este tamaño, el intercambio es favorable.

## Estructura del proyecto

```text
cropeye-academy/
├── index.html                  Panel de rutas y progreso global
├── lesson.html                 Vista de lección (query: ?lesson=<id>)
├── assets/
│   ├── css/
│   │   ├── tokens.css          Colores, espaciado, tipografía, sombras
│   │   ├── base.css            Reset, foco, accesibilidad
│   │   ├── layout.css          Cabecera, dashboard, grilla de la lección
│   │   ├── components.css      Tarjetas, botones, sidebar, estados vacíos
│   │   └── lesson.css          Tipografía de lectura, breadcrumbs, callouts
│   └── js/
│       ├── main.js             Entrada del dashboard
│       ├── lesson-page.js      Entrada de la vista de lección
│       ├── core/
│       │   ├── state.js        Progreso en localStorage + suscripciones
│       │   └── content.js      Carga y aplanado del currículo
│       ├── lib/
│       │   ├── markdown.js     Renderizador seguro de Markdown
│       │   └── dom.js          Helpers de creación de nodos
│       └── ui/
│           ├── curriculum.js   Tarjetas de ruta y filas de lección
│           ├── progress.js     Barra de progreso de la cabecera
│           ├── sidebar.js      Árbol lateral y drawer móvil
│           └── lesson-nav.js   Navegación anterior / completar / siguiente
└── content/
    ├── curriculum.json         Fuente de verdad de la estructura
    └── lessons/*.md            Un archivo por lección
```

Todas las rutas son relativas. El sitio está pensado para servirse desde un subdirectorio (`/cropeye-academy/`), no desde la raíz de un dominio.

## Modelo de contenido

`content/curriculum.json` define una jerarquía de cuatro niveles:

```text
paths → modules → sections → lessons
```

Cada lección declara `id`, `title`, `summary`, `minutes` y `file`. El campo `file` es una ruta relativa a la raíz del sitio y apunta al Markdown correspondiente:

```json
{
  "id": "p1-m1-s1-l1",
  "title": "Qué es una enfermedad foliar",
  "summary": "…una frase que se muestra bajo el título…",
  "minutes": 7,
  "file": "content/lessons/p1-m1-s1-l1.md"
}
```

El orden del JSON es el orden del curso. `content.js` aplana la estructura una sola vez y usa ese arreglo para calcular la lección anterior y la siguiente, que cruzan módulos y rutas sin configuración adicional.

## Cómo agregar una lección en 3 pasos

1. **Agregar el nodo en `content/curriculum.json`.** Copiar un objeto `lessons[]` existente, cambiar `id`, `title`, `summary`, `minutes` y `file`. Mantener la convención `pN-mN-sN-lN` y respetar el orden deseado dentro de la sección.
2. **Crear el archivo Markdown** en `content/lessons/<id>.md`. Debe empezar con `# <título>` y usar el mismo título declarado en el JSON.
3. **Hacer commit y push.** GitHub Pages reconstruye el sitio; no hay build que ejecutar.

Si la lección pertenece a una sección nueva, agregar antes el nodo `sections[]` y, si corresponde, el `modules[]`. No hace falta tocar JavaScript ni CSS.

## Ejecutar en local

El sitio usa `fetch` y módulos ES6, así que **no funciona abriendo los archivos con `file://`**. Hay que servirlo por HTTP:

```bash
# Opción 1: Python (sin instalar nada)
python -m http.server 8080

# Opción 2: Node
npx serve .
```

Luego abrir `http://localhost:8080/`. Cualquier servidor de archivos estáticos sirve.

## Desplegar en GitHub Pages

1. Subir el contenido a la rama `main`.
2. En el repositorio: **Settings → Pages**.
3. En *Source*, elegir **Deploy from a branch**.
4. Seleccionar la rama `main` y la carpeta `/ (root)`.
5. Guardar y esperar la publicación.

El sitio queda en `https://<usuario>.github.io/cropeye-academy/`. Como todas las rutas son relativas, el subdirectorio no requiere configuración extra. Si el proyecto se sirve desde otro subdirectorio, tampoco hace falta cambiar nada.

## Progreso

El progreso se guarda en `localStorage` bajo la clave `cropeye.progress`:

```json
{
  "version": 1,
  "completed": ["p1-m1-s1-l1", "p2-m1-s1-l1"]
}
```

- Si `localStorage` no está disponible (modo privado, almacenamiento bloqueado), el sitio funciona con estado vacío y no lanza errores.
- Si el JSON está corrupto o la versión no coincide, el estado se reinicia a `{ "version": 1, "completed": [] }`.
- Cada cambio emite un evento `cropeye:progress-change` en `document` y notifica a los suscriptores, de modo que el dashboard, el sidebar y el botón de la lección se actualizan en tiempo real.
- La preferencia de sidebar colapsado se guarda aparte, en `cropeye.sidebar.collapsed`.

No hay sincronización entre dispositivos: el progreso pertenece al navegador donde se completó la lección.

## Limitación conocida

Esta versión entrega **una lección por sección**. Es una decisión de alcance, no una restricción del modelo: el esquema admite cualquier cantidad de lecciones dentro de `sections[].lessons[]`, y el renderizado del dashboard, el sidebar y la navegación ya las recorre todas.

Para publicar una segunda lección en una sección existente alcanza con agregar el nodo y el archivo. La única razón para no hacerlo hoy es que el contenido está planificado en veinticuatro piezas de una lección cada una.

## Convenciones de contenido

- **Título como H1.** El Markdown empieza con `# <título>`, una sola vez. La vista de lección muestra el título desde el JSON y oculta el H1 duplicado del cuerpo.
- **Una idea por sección.** Cada `##` desarrolla un concepto; si aparecen dos ideas, conviene separarlas en dos secciones.
- **Callouts para lo importante.** Usar `:::note` para contexto y `:::warning` para riesgos o afirmaciones que no deben pasarse por alto. El bloque se cierra con `:::` en una línea propia.
- **Extensión objetivo.** Entre 350 y 600 palabras por lección. Si el tema es corto, profundizar con un caso concreto antes que rellenar.
- **Subconjunto de Markdown.** El renderizador soporta encabezados de `#` a `####`, párrafos, negrita, cursiva, código en línea, bloques de código, listas anidadas, citas, reglas horizontales, enlaces y callouts. **No** admite HTML crudo, imágenes, tablas ni Markdown dentro de bloques de código.
- **Enlaces seguros.** Solo se aceptan enlaces `http`, `https` o relativos; cualquier otro esquema se descarta.
- **Español neutro.** El contenido se escribe en español profesional neutro, sin regionalismos. Los identificadores y comentarios del código van en inglés.

## Estado del contenido

Las veinticuatro lecciones cubren el problema agronómico, el modelo y sus datos, el backend, la app Flutter, la integración y la documentación del proyecto. Los datos técnicos provienen de los informes y repositorios de CropEye; cuando la documentación y el código no coinciden, la lección lo señala explícitamente.
