# Privacidad y datos personales

Cerramos el curso con un tema que atraviesa todas las piezas y que suele aparecer en las preguntas finales de una defensa: qué datos personales toca CropEye y cómo los protege. Una aplicación que fotografía, guarda historiales, conoce la comuna de la persona y, opcionalmente, maneja cuentas de usuario no puede tratar la privacidad como un detalle. Esta lección identifica los datos personales del sistema, explica las medidas concretas que se tomaron en cada pieza y las relaciona con los principios de la legislación chilena de protección de datos.

:::objetivos
- identificar qué datos personales maneja CropEye y en qué pieza;
- explicar qué son los metadatos EXIF y por qué la App los elimina;
- describir cómo funciona el consentimiento de "¿Acertó?" y cómo se retira;
- relacionar las medidas del proyecto con los principios de la ley chilena de datos personales.
:::

## Qué datos personales toca CropEye

Un dato personal es cualquier información que se refiere a una persona identificada o identificable. La definición es amplia, y conviene recorrer el sistema con ella en mente.

![Qué datos personales toca cada pieza y qué los protege](assets/diagramas/p4-datos-personales.svg)

En la App, los datos personales son las fotos, que pueden mostrar más que una hoja; los metadatos de esas fotos, que pueden incluir la ubicación exacta donde se tomaron; la comuna elegida para el aviso de clima; y el historial completo de análisis, plantas y cosechas, que en conjunto describe el huerto de una persona. En el Backend, los datos personales son evidentes: nombre, apellido, correo, región, la dirección IP registrada en la auditoría y los análisis asociados a cada cuenta. En la API de IA, en cambio, no hay datos personales persistentes: recibe una foto, responde y no guarda nada.

## La ubicación escondida en las fotos

Las fotos de un celular contienen, además de la imagen, un conjunto de metadatos en un formato llamado EXIF: la marca y el modelo del teléfono, la fecha y hora, la orientación y, si la persona tiene activada esa opción, las coordenadas GPS del lugar donde se tomó. Una foto de una hoja tomada en el patio de una casa puede revelar, sin que la persona lo sepa, la dirección exacta de esa casa.

La App elimina todos esos metadatos antes de enviar la foto. Lo hace en el mismo paso en que la convierte a JPEG, con la opción que vimos en la lección 9. La foto que llega al servidor, la que se guarda en el historial y la que se exporta en el archivo de "¿Acertó?" no llevan ubicación. Android, por su parte, oculta por defecto la ubicación de las fotos a las aplicaciones que no piden un permiso especial, y CropEye no lo pide.

## Recolectar solo lo necesario

Varias decisiones que estudiamos en lecciones anteriores son, en el fondo, decisiones de privacidad. El camino directo no requiere cuenta: la persona puede usar todas las funciones sin entregar su nombre ni su correo. El historial, las plantas y las cosechas se guardan en el teléfono y no salen de él. El aviso de clima no usa el GPS: la persona escribe su comuna, se le explica antes qué se guardará y para qué, y las coordenadas se guardan redondeadas a unos mil metros de precisión.

Todas estas medidas responden a un mismo principio, conocido como minimización: recolectar solo los datos necesarios para la finalidad declarada y con la menor precisión que la permita.

## Consentimiento para "¿Acertó?"

La única función que usa datos del usuario con un fin distinto de servirle a él mismo es "¿Acertó?", cuyas respuestas pueden exportarse para mejorar el modelo. Por eso es también la que tiene el tratamiento más cuidadoso.

Antes de guardar la primera respuesta, la App muestra un aviso que explica qué se guardará, para qué y quién lo verá, que las fotos no llevan ubicación ni se asocian al nombre o al correo, que nada sale del teléfono hasta que la persona decida exportarlo, que puede retirar su permiso en cualquier momento y que, si no acepta, la App funciona igual. Solo si la persona elige "Acepto" se guarda la respuesta. Si elige "Ahora no", la App no vuelve a preguntar.

```dart lib/screens/perfil_screen.dart
await _ajustes.definirConsentimientoFotos(false);
final borradas = await Historial.instancia.borrarEvaluaciones();
```

El retiro del consentimiento está en el perfil, en la sección de privacidad. Al desactivar "Ayudar a mejorar CropEye", la App no solo deja de preguntar: borra todas las respuestas guardadas, como muestra el fragmento. Un consentimiento que no se puede retirar con la misma facilidad con que se dio no es un consentimiento libre.

## Lo que dice la ley

En Chile, el tratamiento de datos personales está regulado por la Ley 19.628, que exige, entre otras cosas, que la persona autorice el tratamiento de sus datos estando informada del propósito, y que pueda solicitar que sus datos se modifiquen o eliminen. Esa ley fue reformada en profundidad por la Ley 21.719, que crea una Agencia de Protección de Datos Personales y fija exigencias más detalladas: un consentimiento libre, informado, específico e inequívoco, revocable por medios gratuitos y siempre disponibles; deberes de información y de seguridad; y reglas específicas para los datos de ubicación.

Las medidas de CropEye se alinean con esos principios: información previa en el aviso de consentimiento y en el de clima, un propósito específico para cada dato, minimización, la posibilidad de retirar el consentimiento y borrar las respuestas, contraseñas protegidas con hash, auditoría en el Backend y eliminación de la ubicación de las fotos.

:::warning
Este curso no es asesoría legal. La fecha de entrada en vigencia de la Ley 21.719 ha sido objeto de discusión legislativa, y los textos de consentimiento de la App son un borrador que debe revisar el profesor guía. En la defensa, presenta las medidas como alineadas con los principios de la ley, no como una certificación de cumplimiento.
:::

:::autoevaluacion
? ¿Qué datos personales maneja la App y cuáles el Backend?
= La App: fotos, sus metadatos, la comuna del clima y el historial del huerto. El Backend: nombre, apellido, correo, región, IP en la auditoría y los análisis de cada cuenta. → #que-datos-personales-toca-cropeye
? ¿Qué riesgo tienen los metadatos EXIF y cómo lo evita la App?
= Pueden contener las coordenadas GPS de donde se tomó la foto; la App los elimina al convertir la foto a JPEG antes de enviarla o guardarla. → #la-ubicacion-escondida-en-las-fotos
? ¿Qué significa el principio de minimización y dónde se aplica en CropEye?
= Recolectar solo lo necesario con la menor precisión posible: uso sin cuenta, datos del huerto en el teléfono y comuna redondeada a un kilómetro en lugar del GPS. → #recolectar-solo-lo-necesario
? ¿Qué ocurre cuando la persona retira su consentimiento de "¿Acertó?"?
= La App deja de preguntar y borra todas las respuestas guardadas. → #consentimiento-para-acerto
:::

:::comision
? ¿Cómo cumple CropEye con la ley chilena de protección de datos personales?
No presentamos una certificación de cumplimiento, pero diseñamos el sistema según los principios de la Ley 19.628 y de su reforma, la Ley 21.719. Minimizamos los datos: la app funciona sin cuenta, el historial queda en el teléfono y para el clima pedimos la comuna, no el GPS. Eliminamos de las fotos los metadatos, incluida la ubicación. La única función que usa datos con un fin distinto, "¿Acertó?", pide un consentimiento informado antes de guardar nada, y ese consentimiento se puede retirar en cualquier momento, borrando las respuestas. En el Backend, las contraseñas se guardan como hash y los eventos de acceso quedan auditados. Los textos de consentimiento son un borrador que revisará el profesor guía.
! Afirmar que la aplicación "cumple con la ley" sin matices, o citar fechas de vigencia de memoria.
:::

## Para profundizar

- `cropeye-app/lib/widgets/acierto.dart`: el aviso de consentimiento.
- `cropeye-app/lib/screens/perfil_screen.dart`: la sección de privacidad.
- `cropeye-app/lib/services/preparar_imagen.dart`: la eliminación de los metadatos.
- Biblioteca del Congreso Nacional: textos de la Ley 19.628 y de la Ley 21.719.
