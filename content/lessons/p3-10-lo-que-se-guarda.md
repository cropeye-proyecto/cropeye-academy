# La app: lo que se guarda en el teléfono

En la lección anterior el recorrido terminaba con una frase breve: el resultado se guarda en el historial. Detrás de esa frase hay una de las partes más delicadas de la app. El historial de análisis, las plantas de Mi huerto y las cosechas se guardan en el propio teléfono, sin base de datos y sin servidor, y la app debe garantizar que esos datos no se corrompan aunque se cierre en el peor momento. Esta lección estudia cómo está organizado ese almacenamiento y la técnica que lo hace confiable.

:::objetivos
- describir cómo se organizan en el teléfono el historial, las plantas y las cosechas;
- explicar el problema de la escritura interrumpida y por qué es grave;
- explicar cómo funciona la escritura atómica y por qué la resuelve;
- reconocer cómo las pantallas se enteran de que los datos cambiaron.
:::

## Una carpeta por registro

La app guarda sus datos en la carpeta privada que el sistema operativo asigna a cada aplicación, a la que otras apps no pueden acceder. Dentro de ella, cada tipo de dato tiene su propia carpeta, y cada registro ocupa una subcarpeta con un nombre único derivado de la hora en que se creó.

```text
historial/<id>/foto.jpg          la foto que se envió a la API
historial/<id>/mapa.png          el mapa de calor
historial/<id>/resultado.json    fecha, resultado, planta asociada y "¿Acertó?"
huerto/<id>/planta.json          cultivo, apodo, siembra, ubicación y notas
huerto/<id>/portada_<ms>.jpg     foto de portada (opcional)
huerto/<id>/cosechas/<id>/...    cosechas de esa planta
```

Esta organización tiene varias ventajas frente a una base de datos. Cada registro es independiente: si un archivo se daña, solo se pierde ese registro, y la app puede listar el resto ignorando el que no puede leer. Los archivos se pueden inspeccionar a simple vista durante el desarrollo. Y las relaciones naturales quedan reflejadas en la estructura: las cosechas viven dentro de la carpeta de su planta, de modo que al borrar una planta se borran también sus cosechas.

La relación entre un análisis y una planta, en cambio, se guarda como una referencia: el archivo `resultado.json` del análisis contiene el identificador de la planta. Así, borrar una planta no borra los análisis de sus hojas, que siguen disponibles en el historial general, como la propia app le advierte a la persona.

## El problema de la escritura interrumpida

Escribir un archivo no es instantáneo. Si la app está escribiendo `resultado.json` y en ese preciso momento el sistema operativo la cierra, el teléfono se apaga o se acaba la batería, el archivo puede quedar a medias: con la mitad del contenido, vacío o con datos sin sentido. La próxima vez que la app intente leerlo, encontrará un archivo dañado.

El problema es más serio cuando un registro necesita varios archivos. Un análisis se compone de la foto, el mapa y el resultado. Si la app alcanza a escribir la foto y el mapa pero se interrumpe antes del resultado, queda una carpeta incompleta que no corresponde a ningún análisis válido. En una app que se usa en el campo, con teléfonos que se bloquean y aplicaciones que el sistema cierra para liberar memoria, estas interrupciones no son una rareza.

## Escribir todo o nada

La solución que usa CropEye es una técnica clásica llamada escritura atómica. La palabra "atómica" significa indivisible: la operación ocurre completa o no ocurre, y nunca queda a medias. El truco consiste en no escribir nunca directamente sobre el destino final.

![Escritura atómica: primero un temporal, luego un cambio de nombre](assets/diagramas/p3-almacenamiento-atomico.svg)

Para un archivo, la app escribe el contenido completo en un archivo temporal con el mismo nombre más el sufijo `.tmp`, se asegura de que los datos queden en el disco y, recién entonces, renombra el temporal al nombre definitivo. El cambio de nombre es una operación que el sistema de archivos realiza de una sola vez. Si la app se interrumpe mientras escribe el temporal, el archivo original queda intacto y lo único que sobra es un `.tmp` que se ignora.

```dart lib/services/escritura_atomica.dart
Future<File> escribirArchivoAtomico(File destino, List<int> bytes) async {
  final temporal = File('${destino.path}$sufijoTemporal');
  try {
    await temporal.writeAsBytes(bytes, flush: true);
    return await temporal.rename(destino.path);
  } catch (_) {
    if (temporal.existsSync()) await temporal.delete();
    rethrow;
  }
}
```

Para un registro de varios archivos, como un análisis, la idea se aplica a la carpeta completa. La app crea una carpeta temporal, escribe dentro la foto, el mapa y el resultado, y solo al final renombra la carpeta temporal al nombre definitivo. Mientras tanto, cualquier listado del historial ignora las carpetas que terminan en `.tmp`. Así, un análisis aparece en el historial completo o no aparece en absoluto.

:::note
Esta lógica vive en un único archivo, `escritura_atomica.dart`, y la usan el historial, Mi huerto, las cosechas y los ajustes. Concentrarla en un solo lugar evita que cada parte de la app reinvente su propia versión, con sus propios errores.
:::

## Cómo se enteran las pantallas

Guardar los datos es solo la mitad del trabajo. La otra mitad es que las pantallas que los muestran se actualicen. Si la persona registra una cosecha, la pantalla de la planta y la pantalla "Mis cosechas" deben reflejarla sin que nadie las recargue manualmente.

Cada servicio de almacenamiento expone un notificador de cambios, un contador que aumenta cada vez que se guarda, se modifica o se borra algo. Las pantallas que muestran esos datos se suscriben al notificador y vuelven a leer cuando el contador cambia. Es un mecanismo sencillo que mantiene sincronizadas pantallas que no se conocen entre sí.

Hay un detalle que conviene conocer porque es una fuente clásica de errores. Si una pantalla pide los datos dos veces seguidas, la segunda respuesta puede llegar antes que la primera, y la pantalla terminaría mostrando datos viejos. Para evitarlo, las pantallas numeran cada lectura y solo aceptan la respuesta de la más reciente.

:::warning
Todo lo que se guarda en el teléfono se pierde si se desinstala la app o se borran sus datos. Es una consecuencia de la decisión de no exigir una cuenta, y la app lo dice explícitamente en Mi huerto y en el formulario de cosechas. En la defensa conviene presentarlo como un compromiso consciente, no como un descuido.
:::

:::autoevaluacion
? ¿Por qué al borrar una planta se borran sus cosechas pero no sus análisis?
= Porque las cosechas viven dentro de la carpeta de la planta, mientras que los análisis están en el historial y solo guardan una referencia a la planta. → #una-carpeta-por-registro
? ¿Qué puede pasar si la app se cierra mientras escribe un archivo directamente en su destino?
= El archivo puede quedar a medias, vacío o dañado; si el registro tiene varios archivos, puede quedar una carpeta incompleta. → #el-problema-de-la-escritura-interrumpida
? ¿Por qué el cambio de nombre es la clave de la escritura atómica?
= Porque el sistema de archivos lo realiza de una sola vez: antes del cambio el destino no se ha tocado, y después está completo. → #escribir-todo-o-nada
? ¿Cómo evita una pantalla mostrar datos viejos cuando pide los datos dos veces seguidas?
= Numera cada lectura y solo acepta la respuesta de la más reciente. → #como-se-enteran-las-pantallas
:::

:::comision
? ¿Por qué no usaron una base de datos en el teléfono, como SQLite?
Porque los datos de la app tienen una estructura simple y casi siempre se leen completos: un análisis con su foto, su mapa y su resultado, o una planta con su portada. Guardar cada registro en su propia carpeta nos da independencia entre registros, archivos fáciles de inspeccionar y un borrado natural de las cosechas junto con su planta. La garantía que normalmente da una base de datos, que las escrituras no queden a medias, la obtenemos con la escritura atómica: escribir en un temporal y renombrarlo al final. Si en el futuro necesitáramos consultas complejas, como filtrar miles de análisis, una base de datos local sería la opción adecuada.
! Decir que "no hacía falta" sin mencionar cómo se garantiza que los datos no se corrompan.
:::

## Para profundizar

- `cropeye-app/lib/services/escritura_atomica.dart`: la escritura de archivos y carpetas.
- `cropeye-app/lib/services/historial.dart`, `huerto.dart` y `cosechas.dart`: los tres almacenes.
- `cropeye-app/test/historial_test.dart`: las pruebas que simulan escrituras interrumpidas.
