# Recorrido con cuenta: App, Backend, almacenamiento e IA

El camino directo de la lección anterior es simple porque la API de IA responde en una sola llamada y no recuerda nada. Cuando el usuario tiene una cuenta y elige analizar a través de ella, el recorrido cambia de naturaleza: el análisis se convierte en un proceso con estados, que pasa por el Backend, por un almacenamiento de archivos y por la API de IA, y que la App debe seguir hasta que termina. Esta lección explica ese recorrido y, sobre todo, las ideas de diseño que lo justifican: el procesamiento asíncrono, las URL firmadas y la consulta repetida del estado.

:::objetivos
- explicar por qué el camino con cuenta procesa los análisis de forma asíncrona;
- describir las etapas del recorrido y los estados por los que pasa un análisis;
- explicar qué es una URL firmada y qué problema resuelve;
- describir cómo la App sigue un análisis hasta su resultado y qué hace si no termina.
:::

## Por qué asíncrono

En el camino directo, la App envía la foto y espera con la conexión abierta hasta que llega el diagnóstico. Esto funciona porque la API de IA responde en menos de un segundo y no hace nada más. En el camino con cuenta, el Backend tiene más trabajo: registrar el análisis en la base de datos, guardar la imagen, llamar a la API de IA con reintentos si falla, guardar el resultado con sus alternativas y dejar todo en la auditoría. Si además la API de IA está ocupada o se reinicia, el tiempo total puede crecer.

Mantener una conexión abierta durante todo ese trabajo es frágil. Una red móvil inestable puede cortarla a la mitad, y la persona no sabría si su análisis se procesó o no. La alternativa que usa el Backend es el procesamiento asíncrono: la App pide que se cree un análisis y recibe de inmediato un identificador; el Backend hace el trabajo en segundo plano; y la App pregunta periódicamente cómo va hasta que termina. Si la conexión se corta, el análisis sigue existiendo en el servidor y la App puede volver a preguntar por él.

## Las etapas del recorrido

![Diagrama de secuencia del recorrido con cuenta](assets/diagramas/p4-secuencia-con-cuenta.svg)

El recorrido tiene cinco etapas, cada una con su propia petición.

En la primera, la App envía la foto a `POST /analisis` del Backend, con el access token en el encabezado. El Backend valida la imagen, crea un registro de análisis en estado `PENDIENTE` junto con el registro de la imagen y responde con el identificador del análisis y una dirección de subida.

En la segunda, la App sube los bytes de la foto a esa dirección de subida con una petición `PUT`. Volveremos enseguida sobre por qué la foto se sube aparte.

En la tercera, la App pide al Backend que procese el análisis con `POST /analisis/{id}/submit`. El Backend cambia el estado a `PROCESSING`, responde de inmediato con el código 202, que significa "aceptado, pero todavía no terminado", y encarga en segundo plano la inferencia a la API de IA.

En la cuarta, la App consulta el estado con `GET /analisis/{id}/status` una vez por segundo. Mientras el Backend trabaja, la respuesta sigue diciendo `PROCESSING`. Cuando termina, dice `COMPLETADO`, o bien `RECHAZADO` si la foto no era una hoja, o `ERROR` si algo falló.

En la quinta, cuando el estado es `COMPLETADO`, la App pide el resultado con `GET /analisis/{id}/resultado`. La respuesta trae la enfermedad principal con su información del catálogo, la probabilidad, las tres alternativas, el modelo usado y una dirección para descargar el mapa de calor, que la App descarga a continuación.

## URL firmadas

La segunda etapa merece una explicación aparte, porque introduce una idea muy usada en sistemas que manejan archivos. En lugar de recibir la foto a través de su propia ruta, el Backend entrega a la App una URL firmada: una dirección temporal de un servicio de almacenamiento de archivos, que incluye una firma criptográfica que autoriza una sola operación, subir ese archivo, durante un tiempo limitado, en este caso quince minutos.

La ventaja es que los archivos, que son lo más pesado del sistema, no pasan por el servidor del Backend. La App los sube directamente al almacenamiento, que está diseñado para eso, y el Backend solo maneja datos livianos. La firma garantiza que nadie más pueda usar esa dirección para subir otra cosa, y su vencimiento limita el daño si la dirección se filtra. El mapa de calor se descarga con el mismo mecanismo, mediante una URL firmada de lectura.

:::note
Este mecanismo supone que el almacenamiento de archivos es un servicio que entiende URL firmadas, como S3. En un entorno de desarrollo con almacenamiento local, el Backend entrega un token en lugar de una dirección real, y no hay dónde subir la foto. La App detecta ese caso y lo informa con un mensaje claro en lugar de fallar de forma confusa.
:::

## Seguir el análisis hasta el final

La cuarta etapa, la consulta repetida del estado, tiene sus propias decisiones de diseño. La App consulta una vez por segundo, con un máximo de sesenta consultas. Si el análisis no termina en ese tiempo, la App deja de esperar y muestra un error de tiempo agotado; el análisis puede seguir procesándose en el servidor, y aparecerá en el historial del servidor cuando termine.

Cada estado final se traduce en una reacción concreta de la App. `COMPLETADO` lleva a pedir el resultado. `RECHAZADO` se muestra igual que el error "no parece una hoja" del camino directo, con un botón para volver a la cámara. `ERROR` se muestra como un error del servidor, con la opción de reintentar.

Hay un último detalle que permite que todo lo anterior conviva con el resto de la App. El resultado del Backend tiene una forma distinta de la respuesta de la API de IA, pero el cliente del Backend lo convierte al mismo modelo de resultado que usa el camino directo. Gracias a esa conversión, la pantalla de análisis, el historial del teléfono, las fichas y la pregunta "¿Acertó?" funcionan igual con ambos caminos, sin saber cuál se usó.

:::warning
Al cambiar de camino directo a camino con cuenta, la App no cambia de pantallas, solo de cliente. Si agregas una funcionalidad al resultado, asegúrate de que ambos clientes entreguen la información que necesita, o la funcionalidad aparecerá en un camino y no en el otro.
:::

:::autoevaluacion
? ¿Por qué el camino con cuenta no espera el resultado con la conexión abierta?
= Porque el Backend hace más trabajo y puede tardar, y una conexión móvil larga puede cortarse; con el procesamiento asíncrono el análisis sigue existiendo en el servidor y la App puede volver a consultarlo. → #por-que-asincrono
? Nombra los estados por los que puede pasar un análisis en el Backend.
= `PENDIENTE`, `PROCESSING`, y al final `COMPLETADO`, `RECHAZADO` o `ERROR`. → #las-etapas-del-recorrido
? ¿Qué autoriza una URL firmada y qué la hace segura?
= Autoriza una sola operación sobre un archivo, como subirlo o descargarlo; su firma impide usarla para otra cosa y su vencimiento limita el daño si se filtra. → #url-firmadas
? ¿Qué hace la App si el análisis no termina tras sesenta consultas?
= Deja de esperar y muestra un error de tiempo agotado; el análisis puede terminar después en el servidor y aparecer en el historial del servidor. → #seguir-el-analisis-hasta-el-final
:::

:::comision
? ¿Por qué el análisis con cuenta es tan distinto del análisis directo? ¿No es complicar las cosas?
Es distinto porque resuelve un problema distinto. El camino directo no guarda nada y la API de IA responde en menos de un segundo, así que una sola llamada basta. El camino con cuenta registra el análisis, guarda la imagen, llama a la IA con reintentos y deja todo en la base de datos y en la auditoría; hacerlo con la conexión abierta sería frágil en redes móviles. Por eso el Backend usa procesamiento asíncrono, con un identificador que la App consulta hasta que el análisis termina, y URL firmadas para que las fotos vayan directo al almacenamiento sin cargar al servidor. Para el usuario la diferencia es invisible: el cliente convierte el resultado al mismo modelo y las pantallas son las mismas.
! Decir que el proceso es asíncrono "porque la IA es lenta": la API de IA responde en menos de un segundo.
:::

## Para profundizar

- `cropeye-api/app/routers/analisis.py`: las rutas de creación, envío, estado y resultado.
- `cropeye-api/app/services/analysis.py`: el procesamiento en segundo plano y las URL firmadas.
- `cropeye-app/lib/services/backend.dart`: el método `analizar` del cliente y la conversión del resultado.
