# Recorrido completo de un análisis por el camino directo

Hasta aquí hemos estudiado cada pieza por separado y el contrato que las une. Esta lección las pone en movimiento. Seguiremos una sola foto desde el instante en que la persona toca el botón de la cámara hasta que ve el resultado en pantalla, pasando por cada archivo y cada función que participa. Es el recorrido que conviene saber contar de memoria, porque es la pregunta técnica más probable en una defensa: "explíquenos qué pasa cuando el usuario toma una foto".

:::objetivos
- narrar, en orden y sin saltos, el recorrido de un análisis por el camino directo;
- identificar en qué pieza y en qué archivo ocurre cada paso;
- explicar qué información viaja en cada momento y en qué formato;
- reconocer los puntos del recorrido donde el análisis puede detenerse y por qué.
:::

## Vista de conjunto

![Diagrama de secuencia del camino directo](assets/diagramas/p4-secuencia-directa.svg)

El diagrama es de secuencia: cada columna es un participante y el tiempo avanza hacia abajo. Hay cuatro participantes. La persona, que toma la foto y lee el resultado. La App, que en el diagrama aparece como un solo bloque aunque internamente participan varios archivos. La API de IA, que recibe la foto y responde. Y el almacenamiento del teléfono, donde la App guarda el análisis.

El camino directo es el que usa la App por defecto, sin cuenta. Recorrámoslo paso a paso.

## Del toque al envío

El recorrido empieza en `camara_screen.dart`. La persona ubica la hoja dentro del marco guía, elige el cultivo si lo conoce y toca el botón de captura. El plugin de cámara toma la foto y la guarda en un archivo temporal del teléfono. La pantalla de cámara no sabe qué hacer con esa foto: su único trabajo es entregar la ruta del archivo y el cultivo elegido a la pantalla de análisis, a la que navega en ese momento.

La pantalla de análisis, en `analisis_screen.dart`, comienza mostrando el estado de carga: la foto y la lista de pasos que se van marcando. Al mismo tiempo, en segundo plano, inicia tres tareas en orden. La primera es preparar la foto: llama a `PrepararImagen.aJpeg`, que lee el archivo, lo convierte a JPEG, lo reduce y descarta sus metadatos, y devuelve los bytes de la nueva imagen.

La segunda tarea es pedir el análisis. La pantalla obtiene el cliente vigente con `CropEyeApi.actual`, que en el camino directo es el cliente HTTP de la API de IA, y llama a su método `analizar` con los bytes de la foto y el cultivo. El cliente comprueba que la foto no supere el límite, arma la petición multiparte que vimos en la lección anterior y la envía a `/analisis` con un tiempo máximo de espera de veinte segundos.

## En el servidor de IA

La petición llega a `api.py` en el servidor. La función que atiende la ruta revisa el tipo de archivo, normaliza el cultivo si viene, lee los bytes y verifica su tamaño. Si algo de esto falla, responde de inmediato con el código de error correspondiente y el recorrido termina ahí.

Si todo está en orden, entrega los bytes al analizador de `nucleo.py`. El analizador abre la imagen, la endereza según su orientación, recorta el cuadrado central y la lleva al tamaño que espera el modelo. Luego, protegido por un candado que impide que dos análisis usen el modelo al mismo tiempo, ejecuta el filtro de hoja. Si la foto no parece una hoja, lanza una excepción que `api.py` convierte en un error 422 con el mensaje "no parece una hoja".

Si el filtro aprueba, el analizador ejecuta el modelo principal, que devuelve las probabilidades de cada clase y el mapa de activación. Si el usuario indicó un cultivo, se eliminan las clases del otro cultivo. Se elige la clase más probable, se decide si el resultado es confiable, se superpone el mapa de calor sobre la imagen y se arma la respuesta JSON con todos los campos del contrato, incluido el tiempo que tomó el análisis.

:::note
El modelo se carga una sola vez, cuando el servidor arranca, y queda en memoria. Cargarlo en cada petición tomaría muchos segundos. Esa es la razón de que la API tenga un ciclo de vida que crea el analizador al iniciar.
:::

## De vuelta en el teléfono

La respuesta llega al cliente HTTP de la App. Si el código es 200, el cliente convierte el JSON en dos objetos: el resultado del análisis, con la clase, el nombre, la confianza y las alternativas, y los bytes del mapa de calor decodificados del base64. Si el código es un error, el cliente lo traduce a un error de la App con su tipo y su mensaje.

La tercera tarea de la pantalla de análisis es guardar. Si el resultado no proviene del modo simulado, la pantalla llama al historial para que guarde la foto, el mapa y el resultado con la escritura atómica que estudiamos en la lección 10. Si la persona llegó a la cámara desde una planta de Mi huerto, el análisis queda asociado a esa planta. Si el guardado falla, por ejemplo porque el teléfono no tiene espacio, la pantalla lo registra pero muestra el resultado igual: perder el guardado es preferible a perder el diagnóstico.

Antes de mostrar el resultado, la pantalla espera a que se cumpla el tiempo mínimo de carga, para que la persona alcance a leer los pasos. Recién entonces cambia de estado y presenta el resultado, con su forma confiable o no confirmada, o el error con su mensaje y sus botones.

## Dónde puede detenerse el recorrido

Contar el recorrido completo implica saber también dónde puede terminar antes de tiempo. En el teléfono, la foto puede no poder leerse o convertirse. En la red, la conexión puede no existir o el servidor puede no responder dentro de los veinte segundos. En la API, la foto puede ser de un formato no aceptado, demasiado grande, no ser una imagen válida o no parecer una hoja. Y en el servidor puede ocurrir un error interno.

Lo importante es que en todos esos casos el recorrido termina en un estado definido: la pantalla de análisis muestra un error con un mensaje comprensible y una acción posible, ya sea reintentar o volver a la cámara. En ningún caso la persona queda frente a una pantalla que carga para siempre. Estudiaremos esos errores con detalle en la lección 16.

:::warning
En una defensa, cuando expliques el recorrido, no olvides el filtro de hoja ni el valor `confiable`. Son los pasos que distinguen a CropEye de un clasificador ingenuo, y omitirlos hace que el sistema parezca más simple de lo que es.
:::

:::autoevaluacion
? ¿Qué entrega la pantalla de cámara a la pantalla de análisis?
= La ruta del archivo de la foto y el cultivo elegido; no procesa ni envía la foto. → #del-toque-al-envio
? ¿Qué hace el analizador con la imagen antes de ejecutar el filtro?
= La endereza según su orientación, recorta el cuadrado central y la lleva al tamaño que espera el modelo. → #en-el-servidor-de-ia
? ¿Qué ocurre si el guardado en el historial falla?
= Se registra el problema pero el resultado se muestra igual, porque perder el guardado es preferible a perder el diagnóstico. → #de-vuelta-en-el-telefono
? Nombra tres puntos donde el recorrido puede terminar antes de mostrar un resultado.
= Foto ilegible en el teléfono, sin conexión o tiempo agotado en la red, formato o tamaño no aceptado, imagen inválida, no es una hoja, o error interno del servidor. → #donde-puede-detenerse-el-recorrido
:::

:::comision
? Explíquenos, paso a paso, qué ocurre cuando el usuario toma una foto.
La pantalla de cámara captura la foto y entrega su ruta y el cultivo a la pantalla de análisis. Esta prepara la foto como JPEG reducido y sin metadatos y la envía como formulario multiparte a `/analisis` de la API de IA. En el servidor se valida el tipo y el tamaño, se endereza y recorta la imagen, el filtro comprueba que sea una hoja, el modelo calcula las probabilidades, se restringe por cultivo si corresponde, se decide si el resultado es confiable y se genera el mapa de calor. La App recibe el JSON, lo convierte en un resultado y un mapa, lo guarda en el historial con escritura atómica y lo muestra en su forma confiable o no confirmada. Si algo falla en cualquier punto, la pantalla muestra un error con una acción posible.
! Saltar del "toma la foto" al "muestra el resultado" sin mencionar el filtro, la confianza ni el guardado.
:::

## Para profundizar

- `cropeye-app/lib/screens/analisis_screen.dart`: el método `_analizar` con los tres pasos.
- `cropeye-ia/api.py` y `cropeye-ia/nucleo.py`: la ruta `/analisis` y el método `analizar`.
- `cropeye-app/lib/services/historial.dart`: el guardado del análisis.
