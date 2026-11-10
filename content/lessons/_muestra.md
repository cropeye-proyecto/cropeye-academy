# Lección de muestra

Esta lección existe solo para revisar el diseño. Usa todos los bloques que ofrece el renderizador, de modo que cualquier cambio de estilo se pueda comprobar en un solo lugar antes de escribir el contenido real del curso.

:::objetivos
- reconocer cómo se ve cada bloque de estudio;
- comprobar que el código y los diagramas no rompen el ancho de la pantalla;
- verificar que la autoevaluación enlaza con su sección.
:::

## Un párrafo de lectura

Un texto largo tiene que leerse con calma. Por eso la columna no supera los sesenta y ocho caracteres y el interlineado es generoso. Notemos que los enlaces, como [este a la documentación de Flutter](https://docs.flutter.dev), usan el color salvia de la paleta, y que el `código en línea` se distingue sin gritar.

![Diagrama de prueba con tres cajas conectadas](assets/diagramas/_muestra.svg)

:::note
Una nota aporta contexto sin interrumpir el razonamiento principal.
:::

:::warning
Una advertencia marca una trampa común, por ejemplo confundir la confianza del modelo con la probabilidad de que la planta esté enferma.
:::

## Un fragmento de código

```dart lib/services/preparar_imagen.dart
static Future<Uint8List> aJpeg(String ruta) async {
  final resultado = await FlutterImageCompress.compressWithFile(
    ruta,
    quality: calidad,
    format: CompressFormat.jpeg,
    keepExif: false, // la foto sale sin ubicación
  );
  return resultado!;
}
```

:::autoevaluacion
? ¿Para qué sirve la columna angosta?
= Para que la lectura sea cómoda: líneas cortas se siguen con menos esfuerzo. → #un-parrafo-de-lectura
? ¿Qué hace `keepExif: false`?
= Quita los metadatos de la foto, incluida la ubicación. → #un-fragmento-de-codigo
? ¿Qué diferencia una nota de una advertencia?
= La nota da contexto; la advertencia señala un error frecuente.
:::

:::comision
? Si la app no es un diagnóstico profesional, ¿por qué debería alguien confiar en ella?
No se le pide confianza ciega. La app muestra su nivel de confianza, explica en qué zona de la hoja se fijó y, cuando no está segura, lo dice y no sugiere tratamiento. Es una ayuda para decidir cuándo consultar, no un reemplazo del especialista.
! Decir que la app "siempre acierta" o citar una exactitud sin decir con qué fotos se midió.
:::
