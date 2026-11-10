# Cuando algo falla

Un sistema de tres piezas que se comunican por internet tiene muchos puntos donde algo puede salir mal. El teléfono puede no tener señal, el servidor puede estar apagado, la foto puede estar dañada, el modelo puede rechazar la imagen o una respuesta puede llegar con un formato inesperado. Un buen diseño no intenta impedir todos esos fallos, lo cual es imposible, sino que se asegura de que cada uno termine en un estado comprensible para la persona y útil para el equipo. Esta lección estudia cómo CropEye clasifica los errores, cómo los traduce en mensajes y qué principios guían esas decisiones.

:::objetivos
- clasificar los errores posibles según la pieza donde ocurren;
- explicar cómo la App convierte cualquier fallo en un tipo de error propio;
- distinguir los errores que permiten reintentar de los que piden otra foto;
- explicar los principios de un buen mensaje de error y aplicarlos a un caso nuevo.
:::

## Un mapa de los fallos

El primer paso para manejar errores es saber dónde pueden ocurrir. Si seguimos el recorrido de un análisis, encontramos cuatro zonas.

![Mapa de errores y cómo los presenta la App](assets/diagramas/p4-mapa-errores.svg)

La primera zona es el propio teléfono: la foto puede no poder leerse, estar en un formato que la librería no entiende o superar el tamaño máximo después de prepararla. La segunda zona es la red: el teléfono puede no tener conexión, el servidor puede no estar disponible o la respuesta puede tardar más de lo aceptable. La tercera zona es la API, que puede rechazar la foto por su formato, su tamaño, su contenido o porque no parece una hoja. La cuarta zona es el servidor en sí, que puede sufrir un error interno o devolver una respuesta que no respeta el contrato.

Cada zona produce el fallo de una manera técnica distinta: una excepción de lectura de archivo, una excepción de red, un código HTTP de error o un JSON incompleto. Para la pantalla, en cambio, todas esas formas deben convertirse en algo uniforme que se pueda mostrar.

## Un solo tipo de error para toda la App

La App resuelve esa diversidad con un tipo propio, `ErrorAnalisis`, que tiene tres datos: un tipo, que pertenece a una lista cerrada de ocho categorías; un mensaje pensado para la persona; y, cuando existe, el código HTTP que lo originó. Las ocho categorías son: no es una hoja, imagen inválida, formato no soportado, foto muy grande, sin conexión, tiempo agotado, error del servidor y error de la aplicación.

La traducción ocurre en los clientes de la API, no en las pantallas. El cliente envuelve cada llamada de red en un bloque que convierte las excepciones técnicas en estas categorías: una excepción de tiempo agotado se convierte en "tiempo agotado"; una excepción de red, en "sin conexión". Después interpreta el código HTTP de la respuesta: 413 se convierte en "foto muy grande"; 415, en "formato no soportado"; 422, según su contenido, en "no es una hoja", "imagen inválida" o "error de la aplicación"; cualquier otro, en "error del servidor".

```dart lib/services/error_analisis.dart
bool get sePuedeReintentar => switch (tipo) {
  TipoErrorAnalisis.sinConexion ||
  TipoErrorAnalisis.tiempoAgotado ||
  TipoErrorAnalisis.errorServidor => true,
  _ => false,
};
```

Gracias a esta centralización, la pantalla de análisis no necesita saber nada de HTTP ni de excepciones. Recibe un `ErrorAnalisis` y decide qué mostrar a partir de su tipo, como muestra el fragmento: algunos tipos permiten reintentar con la misma foto y otros no.

## Reintentar o tomar otra foto

La distinción del fragmento anterior es una de las decisiones más útiles de la pantalla de error. Hay fallos que no dependen de la foto: si no había conexión, si el servidor tardó demasiado o si tuvo un problema interno, la misma foto podría funcionar un minuto después. Para esos casos la pantalla ofrece como acción principal "Reintentar", que repite el análisis sin volver a la cámara, y como alternativa "Volver a la cámara".

Hay otros fallos que dependen de la foto: si no parece una hoja, si está dañada, si su formato no es aceptado o si es demasiado grande, reintentar con la misma foto daría el mismo resultado. Para esos casos la única acción es "Tomar otra foto". Ofrecer "Reintentar" ahí sería invitar a la persona a repetir algo que no puede funcionar.

## Mensajes que ayudan

El último eslabón es el mensaje que lee la persona. Cada tipo de error tiene un título corto y un mensaje que explica qué pasó y qué hacer, en un lenguaje sin términos técnicos. Detrás de esos textos hay tres principios.

El primero es decir qué pasó en términos de la persona, no del sistema. "No parece una hoja" es comprensible; "error 422" no lo es. El segundo es proponer una acción concreta. "Toma una foto de una sola hoja, de cerca" ayuda más que "inténtalo de nuevo". El tercero es no culpar a la persona por algo que quizás no es su culpa.

Este último principio tiene una historia en el proyecto. Al comienzo, cuando la App no lograba conectarse, el mensaje decía que revisara su conexión a internet. El problema es que, desde la App, una conexión caída y un servidor apagado se ven exactamente igual: en ambos casos no hay respuesta. El mensaje culpaba al usuario de un problema que muchas veces estaba en el servidor. Hoy dice que no se pudo conectar con el servidor de CropEye, que revise su conexión y que, si está bien, puede que el servidor no esté disponible.

:::note
Hay un tipo de error que la persona no debería ver nunca: "error de la aplicación". Aparece cuando la App armó mal una petición, por ejemplo si el servidor responde que falta un campo obligatorio. Si un usuario lo ve, el error está en el código, y su mensaje incluye el detalle técnico para que el equipo pueda investigarlo.
:::

## Lo que no se ve: errores inesperados

Todo lo anterior cubre los errores que el equipo previó. Pero siempre puede ocurrir algo que nadie anticipó, como un fallo dentro de un plugin. Para esos casos la pantalla de análisis tiene una última red de seguridad: un bloque que captura cualquier error no clasificado, lo registra para depuración y muestra un mensaje genérico de error inesperado con la opción de tomar otra foto. Como vimos en la lección 9, este bloque existe porque en pruebas se detectó que un fallo del plugin de compresión dejaba la pantalla cargando para siempre.

:::warning
Al agregar una funcionalidad que hace una llamada de red, no captures los errores en la pantalla con mensajes improvisados. Usa los tipos existentes, o agrega uno nuevo si de verdad es distinto, para que todos los errores de la App se comporten de forma coherente.
:::

:::autoevaluacion
? ¿En qué cuatro zonas pueden ocurrir los fallos de un análisis?
= En el teléfono, en la red, en la API (rechazo de la foto) y en el servidor (error interno o respuesta fuera del contrato). → #un-mapa-de-los-fallos
? ¿Dónde se traducen las excepciones y los códigos HTTP a `ErrorAnalisis` y por qué ahí?
= En los clientes de la API, para que las pantallas no necesiten saber nada de HTTP ni de excepciones y decidan solo por el tipo de error. → #un-solo-tipo-de-error-para-toda-la-app
? ¿Por qué "no es una hoja" no ofrece reintentar?
= Porque depende de la foto: reintentar con la misma foto daría el mismo resultado, así que la única acción útil es tomar otra. → #reintentar-o-tomar-otra-foto
? ¿Por qué se cambió el mensaje de "sin conexión"?
= Porque culpaba a la conexión del usuario, cuando desde la App una conexión caída y un servidor apagado se ven igual; ahora menciona ambas posibilidades. → #mensajes-que-ayudan
:::

:::comision
? ¿Qué pasa si el servidor de inteligencia artificial está caído cuando un usuario intenta analizar una hoja?
La App intenta conectarse y, al no obtener respuesta, el cliente convierte la excepción de red en un error de tipo "sin conexión", o "tiempo agotado" si el servidor no responde en veinte segundos. La pantalla muestra un título claro, un mensaje que explica que puede ser la conexión del teléfono o el servidor, y ofrece reintentar con la misma foto, porque el problema no depende de ella. La foto no se pierde y la persona no queda frente a una pantalla cargando. Si usa una cuenta, el Backend además reintenta la llamada a la API de IA antes de marcar el análisis con error.
! Responder que "eso no debería pasar" o que el servidor "siempre está disponible".
:::

## Para profundizar

- `cropeye-app/lib/services/error_analisis.dart`: los tipos, títulos y mensajes.
- `cropeye-app/lib/services/cropeye_api.dart`: la traducción de excepciones y códigos HTTP.
- `cropeye-app/lib/screens/analisis_screen.dart`: la pantalla de error y la red de seguridad.
