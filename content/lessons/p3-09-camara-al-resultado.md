# La app: de la cámara al resultado

Ya conocemos lo que ocurre en el servidor de inteligencia artificial. Ahora volvemos al teléfono para seguir, dentro del código de la app, el recorrido que hace un análisis desde que la persona abre la cámara hasta que ve el resultado. Esta es la parte del sistema con la que el usuario interactúa directamente, y también la que más se presta a errores sutiles: fotos giradas, archivos demasiado grandes, conexiones que se cortan o pantallas que quedan cargando para siempre. Entender cómo la app maneja cada uno de esos casos es lo que permite modificarla con criterio.

:::objetivos
- identificar las pantallas y servicios que participan en un análisis y el orden en que actúan;
- explicar qué hace la preparación de la foto y por qué es necesaria;
- describir cómo la app decide qué API usar y cómo envía la foto;
- explicar cómo la pantalla de resultado garantiza que nunca quede cargando indefinidamente.
:::

## Las piezas que participan

En el código de la app, un análisis involucra principalmente cuatro archivos, cada uno con una responsabilidad clara. La pantalla de cámara, en `camara_screen.dart`, muestra la vista previa con el marco guía y el selector de cultivo, y entrega la ruta de la foto tomada. El servicio de preparación, en `preparar_imagen.dart`, convierte esa foto en un JPEG listo para enviar. El cliente de la API, en `cropeye_api.dart`, envía el JPEG y traduce la respuesta a objetos de la app. La pantalla de análisis, en `analisis_screen.dart`, orquesta todo lo anterior, muestra la carga y presenta el resultado o el error.

![Recorrido de un análisis dentro de la app](assets/diagramas/p3-app-camara-resultado.svg)

Esta división no es casual. La cámara no sabe nada de la API; la preparación no sabe nada de pantallas; el cliente de la API no sabe cómo se mostrará el resultado. Gracias a esa separación, se puede cambiar la forma de enviar la foto, por ejemplo para pasar por el Backend, sin tocar la cámara ni la pantalla.

## Capturar: la cámara y el cultivo

La pantalla de cámara usa el plugin oficial de cámara de Flutter para mostrar la vista previa a pantalla completa, con un recuadro que indica dónde ubicar la hoja y la instrucción "Una sola hoja, de cerca, con luz de día". El recuadro no recorta la foto; sirve para guiar a la persona, y coincide con el cuadrado central que analizará el modelo.

Debajo de la vista previa está el selector de cultivo, con las opciones de cada cultivo y "No sé". Como vimos en la lección 7, elegir un cultivo restringe las categorías posibles, y elegir el equivocado perjudica el resultado; por eso "No sé" es el valor por defecto. La pantalla también permite elegir una foto de la galería, y se encarga de un detalle técnico importante: liberar la cámara cuando la app pasa a segundo plano y volver a abrirla al regresar, para no dejar el recurso bloqueado.

## Preparar: una foto que el servidor pueda recibir

Las fotos de un celular moderno pesan varios megabytes, vienen en formatos diversos, como HEIC en algunos teléfonos, y guardan metadatos, entre ellos la orientación y a veces la ubicación. Enviar la foto tal cual sería lento, podría superar el límite de tamaño de la API y expondría datos personales.

```dart lib/services/preparar_imagen.dart
final resultado = await FlutterImageCompress.compressWithFile(
  ruta,
  minWidth: lado,
  minHeight: lado,
  quality: calidad,
  format: CompressFormat.jpeg,
  keepExif: false,
);
```

El servicio de preparación resuelve los tres problemas en un solo paso. Convierte cualquier formato a JPEG, reduce la foto para que su lado mayor no supere unos 1.600 píxeles con una calidad de compresión alta, y descarta los metadatos con `keepExif: false`. El tamaño elegido no es arbitrario: el modelo trabaja con imágenes mucho más pequeñas, así que reducir la foto no pierde información útil y acelera el envío.

:::note
Al reducir la foto, la librería respeta la orientación indicada en los metadatos antes de descartarlos. Así la hoja llega derecha al servidor aunque el teléfono la haya guardado girada.
:::

## Enviar: elegir la API y armar la petición

La pantalla de análisis no decide por sí misma a qué servicio enviar la foto. Le pide al cliente la API vigente, y el cliente decide según la configuración: en modo simulado, usado para desarrollar sin servidor, responde con resultados de ejemplo; si el usuario inició sesión y activó "Analizar con mi cuenta", usa el Backend; en cualquier otro caso, usa la API de IA directamente. Esa decisión vive en un solo lugar del código, lo que evita que distintas pantallas tomen decisiones contradictorias.

En el camino directo, el cliente arma una petición de formulario con la foto en el campo `imagen` y, si el usuario eligió un cultivo, el campo `cultivo`. Antes de enviarla comprueba que la foto no supere el límite de diez megabytes, para dar un mensaje claro sin esperar al servidor. Envía la petición con un tiempo máximo de espera y, si la respuesta es exitosa, la convierte en un objeto de la app con el diagnóstico y el mapa de calor. Si la respuesta es un error, la traduce a un tipo de error de la app, tema que estudiaremos con detalle en la lección 16.

## Mostrar: una pantalla que nunca queda cargando

La pantalla de análisis tiene tres estados: cargando, resultado y error. Mientras espera, muestra la foto y una lista de pasos que se van marcando, como "Revisando que sea una hoja" o "Generando el mapa de calor". Esos pasos avanzan por tiempo y no reflejan el progreso real del servidor, que responde en menos de un segundo; la pantalla impone una duración mínima para que la persona alcance a leerlos y entienda qué está ocurriendo.

El detalle más importante de esta pantalla está en cómo maneja los errores. Todo el proceso de preparar, enviar y guardar está dentro de un bloque que captura no solo los errores esperados, como una foto ilegible o una conexión caída, sino también cualquier error inesperado. Si algo falla de una forma que nadie previó, la pantalla muestra igualmente un mensaje de error con un botón para volver, en lugar de quedar cargando para siempre. Este comportamiento se agregó después de detectar, en pruebas, que un fallo del plugin de compresión dejaba la pantalla congelada.

:::warning
Cuando modifiques este flujo, nunca dejes un camino de ejecución que termine sin cambiar el estado de la pantalla. Una pantalla que queda cargando es el peor error posible para el usuario, porque no sabe si esperar o salir.
:::

Una vez obtenido el resultado, la pantalla lo guarda en el historial del teléfono, salvo que provenga del modo simulado, y presenta las tarjetas que ya conocemos: el diagnóstico con su confianza, la planta asociada, las alternativas, el comparador entre la foto y el mapa de calor, la ficha de manejo si el resultado es confiable y la pregunta "¿Acertó?".

:::autoevaluacion
? ¿Qué cuatro archivos participan principalmente en un análisis y qué hace cada uno?
= La pantalla de cámara captura la foto y el cultivo; el servicio de preparación produce el JPEG; el cliente de la API envía la foto y traduce la respuesta; la pantalla de análisis orquesta y muestra el resultado o el error. → #las-piezas-que-participan
? ¿Qué tres problemas resuelve la preparación de la foto?
= Unifica el formato a JPEG, reduce el tamaño para que el envío sea rápido y quede bajo el límite, y elimina los metadatos, incluida la ubicación. → #preparar-una-foto-que-el-servidor-pueda-recibir
? ¿Cómo decide la app si usa la API de IA, el Backend o el modo simulado?
= Lo decide el cliente en un solo lugar: simulado si está activado, el Backend si hay sesión y el usuario activó "Analizar con mi cuenta", y la API de IA en cualquier otro caso. → #enviar-elegir-la-api-y-armar-la-peticion
? ¿Qué garantiza que la pantalla de análisis no quede cargando para siempre?
= Que todo el proceso está dentro de un bloque que captura también los errores inesperados y siempre termina mostrando un resultado o un error. → #mostrar-una-pantalla-que-nunca-queda-cargando
:::

:::comision
? ¿Por qué la app reduce y recomprime la foto antes de enviarla? ¿No se pierde información para el diagnóstico?
No se pierde información útil, porque el modelo analiza imágenes mucho más pequeñas que la foto original: la reducción ocurre igual en el servidor. Hacerla en el teléfono tiene tres ventajas: el envío es más rápido en redes móviles, la foto queda bajo el límite de tamaño de la API y se eliminan los metadatos, incluida la ubicación. La librería respeta la orientación antes de descartar los metadatos, así que la hoja llega derecha.
! Decir que se comprime "para ahorrar espacio" sin mencionar la privacidad ni el límite de la API.
:::

## Para profundizar

- `cropeye-app/lib/screens/camara_screen.dart`: la cámara, el marco guía y el selector de cultivo.
- `cropeye-app/lib/services/preparar_imagen.dart`: la conversión a JPEG.
- `cropeye-app/lib/services/cropeye_api.dart`: el cliente HTTP y la API simulada.
- `cropeye-app/lib/screens/analisis_screen.dart`: los estados de carga, resultado y error.
