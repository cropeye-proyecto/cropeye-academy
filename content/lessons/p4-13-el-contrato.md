# El contrato: qué viaja entre App y API de IA

Llegamos a la última parte del curso, la que conecta todo lo estudiado. Para que dos programas escritos en lenguajes distintos, por personas distintas y desplegados en lugares distintos puedan colaborar, tienen que ponerse de acuerdo en algo muy preciso: qué se envía, en qué formato, con qué nombres y qué significa cada respuesta. A ese acuerdo lo llamamos contrato. Esta lección estudia el contrato entre la App y la API de IA, campo por campo, y explica por qué cuidarlo es una de las tareas más importantes de un equipo que trabaja en piezas separadas.

:::objetivos
- describir la petición que la App envía para pedir un análisis;
- explicar cada campo de la respuesta exitosa y cómo lo usa la App;
- describir los códigos de error que puede devolver la API y su significado;
- explicar por qué un contrato estable permite cambiar el modelo sin tocar la App.
:::

## Qué es un contrato y por qué importa

La API de IA y la App no comparten código. Una está escrita en Python y la otra en Dart; una corre en un servidor con tarjeta gráfica y la otra en un teléfono. Lo único que las une es un intercambio de mensajes por HTTP. Si la API cambia el nombre de un campo, por ejemplo de `confianza` a `confidence`, la App no lo sabrá hasta que falle frente a un usuario.

Un contrato es la descripción explícita de ese intercambio. En CropEye está documentado en el archivo `INTEGRACION_API.md` del repositorio de la App y verificado con pruebas automáticas que comprueban que la App interpreta correctamente respuestas con la forma acordada. La regla del equipo es simple: el contrato no se cambia sin acuerdo. Si una pieza necesita un campo nuevo, se propone, se discute y se agrega de forma que la otra pieza pueda ignorarlo mientras no lo conozca.

![El contrato entre la App y la API de IA](assets/diagramas/p4-contrato.svg)

## La petición

Para pedir un análisis, la App envía una petición `POST` a la ruta `/analisis`. El cuerpo no es JSON sino un formulario de tipo multiparte, el mismo formato que usa un navegador para subir archivos. Este formato permite enviar en una sola petición un archivo binario, la foto, junto con campos de texto.

```dart lib/services/cropeye_api.dart
final peticion = http.MultipartRequest('POST', _uri('/analisis'))
  ..files.add(
    http.MultipartFile.fromBytes(
      'imagen',
      jpeg,
      filename: 'hoja.jpg',
      contentType: MediaType('image', 'jpeg'),
    ),
  );
if (cultivo != null) peticion.fields['cultivo'] = cultivo.id;
```

El campo `imagen` lleva la foto ya preparada como JPEG. El campo `cultivo` es opcional: solo se envía si la persona eligió un cultivo en la cámara, y su valor es el identificador del cultivo en minúsculas, como `tomate` o `papa`. Que sea opcional es una decisión de compatibilidad: una versión antigua de la App que no conoce ese campo sigue funcionando, y la API se comporta como antes.

La API ofrece también una ruta `GET /salud`, que responde si el servicio está activo y qué versión del modelo tiene cargada. La App la usa en su modo de desarrollo para probar la conexión.

## La respuesta exitosa

Cuando el análisis termina bien, la API responde con el código 200 y un objeto JSON. Cada campo tiene un propósito preciso en la App.

El campo `cultivo` indica a qué cultivo pertenece la clase detectada. El campo `clase` es el identificador interno de la categoría que ganó, como `Tomato___Early_blight`; la App no lo muestra, pero lo usa para buscar la ficha de manejo y para reconocer si la hoja está sana. El campo `nombre` es el nombre de la enfermedad en español, listo para mostrar. El campo `confianza` es un número entre cero y uno con la probabilidad de la clase ganadora. El campo `confiable` es el valor booleano que estudiamos en la lección 7 y que decide cómo se presenta el resultado.

El campo `gradcam_png` contiene el mapa de calor como una imagen PNG codificada en base64, una forma de representar datos binarios como texto dentro de un JSON. La App lo decodifica y lo guarda como un archivo separado, porque pesa mucho más que el resto de la respuesta. Por último, `modelo` indica qué versión del modelo respondió y `ms` cuántos milisegundos tardó, datos útiles para depurar y para la auditoría.

Existe además un campo opcional, `top3`, con las tres clases más probables y sus confianzas. Es una propuesta de ampliación del contrato: la App ya sabe leerlo y mostrarlo, pero si no viene, o viene con otra forma, lo ignora sin rechazar el resultado. Esta lectura tolerante es la forma práctica de agregar un campo sin romper a nadie.

:::note
La App no confía ciegamente en la respuesta. Si el JSON no tiene los campos obligatorios con los tipos esperados, el cliente lo trata como un error del servidor en lugar de dejar que el problema aparezca más adelante como un fallo extraño en una pantalla.
:::

## Las respuestas de error

El contrato no solo describe el caso feliz. Una parte importante son los errores, porque cada uno requiere una reacción distinta de la App.

El código 415 significa que el archivo no es una foto JPEG ni PNG. El 413 significa que la foto supera los diez megabytes. El 422 agrupa varios problemas de contenido: el archivo no es una imagen válida, el cultivo enviado no existe o, el caso más importante, el filtro decidió que la foto no parece una hoja. Los errores 500 y superiores indican un problema interno del servidor.

Hay un detalle del contrato actual que conviene conocer porque es frágil. La API usa el mismo código 422 para "no es una hoja" y para "imagen inválida", y la App los distingue buscando el texto "no parece una hoja" en el mensaje de error. Si alguien cambia ese texto en la API, la App mostrará el mensaje equivocado. Por eso está propuesto agregar al contrato un código propio, como `"codigo": "no_es_hoja"`, que no dependa de la redacción.

:::warning
Cuando modifiques un mensaje de error en la API, revisa si la App depende de su texto. Es la forma más común de romper un contrato sin darse cuenta.
:::

:::autoevaluacion
? ¿Por qué la petición usa un formulario multiparte y no JSON?
= Porque permite enviar en una sola petición un archivo binario, la foto, junto con campos de texto como el cultivo. → #la-peticion
? ¿Para qué usa la App el campo `clase` si no lo muestra?
= Para buscar la ficha de manejo correspondiente y para reconocer si la hoja está sana. → #la-respuesta-exitosa
? ¿Qué significa que la App lea `top3` de forma tolerante?
= Que si el campo no viene o tiene otra forma, lo ignora y muestra el resultado igual; así el campo se puede agregar sin romper versiones que no lo conocen. → #la-respuesta-exitosa
? ¿Qué parte del contrato actual es frágil y cómo se propone corregirla?
= La App distingue "no es una hoja" de "imagen inválida" por el texto del mensaje del 422; se propone un código propio como `no_es_hoja`. → #las-respuestas-de-error
:::

:::comision
? Si el equipo de IA cambia el modelo, ¿hay que actualizar la aplicación?
No, mientras se respete el contrato. La App no sabe qué modelo hay detrás: solo envía una foto a `/analisis` y espera una respuesta con campos acordados, como la clase, el nombre, la confianza, el valor `confiable` y el mapa de calor. Pasamos de un modelo único a un conjunto de tres modelos sin cambiar la App por esta razón. Solo hace falta actualizarla si el cambio agrega información que queremos mostrar, y aun así los campos nuevos se agregan como opcionales para no romper versiones anteriores.
! Decir que "la app y el modelo son independientes" sin mencionar el contrato que lo hace posible.
:::

## Para profundizar

- `cropeye-app/INTEGRACION_API.md`: el contrato documentado y las propuestas pendientes.
- `cropeye-app/lib/models/analisis.dart`: cómo la App lee la respuesta, incluido `top3`.
- `cropeye-app/test/cropeye_api_test.dart`: las pruebas del cliente contra el contrato.
- `cropeye-ia/api.py`: la otra cara del contrato.
