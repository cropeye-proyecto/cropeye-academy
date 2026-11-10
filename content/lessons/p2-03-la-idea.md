# La idea: diagnosticar desde la foto de una hoja

La Parte 1 terminó con una necesidad bien definida: una opinión inmediata sobre una hoja enferma, que diga cuán segura es, en qué se basa y qué hacer. Esta lección presenta la respuesta que propone CropEye en su forma más simple, antes de entrar en las piezas técnicas que la hacen posible. La idea es tener en la cabeza el recorrido completo de punta a punta, para que cada lección posterior encaje en un lugar conocido.

:::objetivos
- describir el recorrido de un análisis desde que se toma la foto hasta que se muestra el resultado;
- explicar qué agrega cada paso del recorrido y qué riesgo evita;
- distinguir entre un resultado confiable y uno no confirmado, y lo que la app hace en cada caso;
- justificar por qué la solución es una aplicación móvil y no una página web o un servicio de consulta.
:::

## La propuesta en una escena

Imaginemos a una persona que riega su huerto un domingo en la mañana y nota unas manchas oscuras en las hojas de abajo de una planta de tomate. Saca el celular, abre CropEye y toca "Analizar una hoja". La cámara se abre con un marco guía que le pide una sola hoja, de cerca y con luz de día. Antes de tomar la foto, la app le pregunta qué cultivo es; como sabe que es tomate, lo elige. Toma la foto.

Durante un par de segundos la pantalla muestra los pasos del análisis: preparar la foto, revisar que sea una hoja, buscar señales de enfermedad y generar el mapa de calor. Luego aparece el resultado: "Tizón temprano", con una confianza alta, una imagen de su hoja coloreada en las zonas que más influyeron en la decisión y una ficha que explica los síntomas, qué hacer primero sin químicos y de qué publicación del INIA sale esa información.

Si la persona registró esa planta en Mi huerto, el análisis queda guardado en su historia, y la próxima vez podrá comparar las dos fotos para ver cómo evolucionó. Si en cambio la foto hubiera estado borrosa o la hoja hubiera tenido una enfermedad que el modelo no conoce, la app le habría dicho, en lugar de un diagnóstico, que no está segura, que tome otra foto y que consulte a un especialista.

Esa escena contiene toda la propuesta. El resto del curso consiste en entender qué ocurre detrás de cada uno de esos pasos.

## El recorrido paso a paso

![Recorrido de un análisis, de la foto al resultado](assets/diagramas/p2-idea-foto-diagnostico.svg)

El diagrama muestra el recorrido como una secuencia de cinco pasos. Conviene mirar cada uno preguntándonos qué agrega y qué problema evita.

**Capturar.** La foto es la única evidencia con la que trabaja el sistema, así que su calidad condiciona todo lo demás. Por eso la cámara muestra un marco guía y una indicación concreta, y por eso la app pregunta el cultivo: saber que es tomate permite descartar desde el inicio las enfermedades de otros cultivos.

**Preparar.** Antes de enviarla, la app convierte la foto a un formato estándar, reduce su tamaño y le quita los metadatos que guarda el teléfono, entre ellos la ubicación. Esto hace el envío más rápido y protege la privacidad de quien la tomó.

**Filtrar.** El primer trabajo de la inteligencia artificial no es diagnosticar, sino decidir si la imagen es una hoja de un cultivo conocido. Un modelo pequeño revisa la foto y, si no parece una hoja, el sistema responde que no puede analizarla. Este paso evita uno de los errores más peligrosos: que el modelo invente una enfermedad para la foto de una mano, una mesa o un perro.

**Clasificar y medir la confianza.** Si la foto pasa el filtro, el modelo principal estima qué tan probable es cada una de las enfermedades que conoce y elige la más probable. Junto con la respuesta entrega su confianza. Si esa confianza no alcanza un umbral, o si el modelo considera que la hoja tiene algo que no está en su catálogo, el resultado se marca como no confiable.

**Explicar y mostrar.** El sistema genera un mapa de calor que colorea las zonas de la hoja que más pesaron en la decisión. La app muestra el resultado, el mapa, las alternativas que el modelo también consideró y, solo si el resultado es confiable, la ficha de manejo correspondiente.

:::note
El orden de los pasos no es casual. Filtrar antes de clasificar y medir la confianza antes de mostrar una ficha son decisiones que reflejan el principio de la Parte 1: la apariencia de una hoja es una pista, no una prueba, y el sistema debe reconocer cuándo su pista no alcanza.
:::

## Dos tipos de resultado

Una consecuencia importante del recorrido es que el usuario puede recibir dos tipos de resultado muy distintos, y la app los presenta de forma deliberadamente diferente.

Cuando el resultado es confiable, la tarjeta principal se muestra destacada, con el nombre de la enfermedad, el cultivo y la confianza, y debajo aparece la ficha de manejo con su fuente. La app se permite aquí sugerir qué hacer, porque el modelo tiene evidencia suficiente.

Cuando el resultado no es confiable, la pantalla cambia de tono. Aparece primero un aviso que dice que CropEye no está seguro y que el resultado puede estar equivocado. El nombre de la enfermedad se muestra como "resultado no confirmado", se listan las opciones que el modelo consideró más probables y no se muestra ninguna ficha de tratamiento. En su lugar, la app propone pasos concretos: tomar otra foto en mejores condiciones, consultar a un especialista o considerar que puede tratarse de una enfermedad que CropEye todavía no reconoce.

Esta distinción es probablemente la decisión de diseño más importante del proyecto, y la retomaremos varias veces. Un sistema que siempre responde con la misma seguridad enseña a sus usuarios a confiar en él incluso cuando no debería.

## Por qué una aplicación móvil

La propuesta podría haberse implementado como una página web o como un servicio al que se envían fotos por mensajería. Elegimos una aplicación móvil por tres razones que se desprenden directamente del problema.

La primera es el momento de uso. La necesidad aparece en el huerto, frente a la planta, y el celular es el único dispositivo que la persona tiene en la mano en ese momento. Una aplicación puede abrir la cámara directamente, con el marco guía, sin pasos intermedios.

La segunda es la continuidad. Como vimos al final de la Parte 1, quien cultiva vive su huerto como un proceso. Una aplicación puede guardar en el propio teléfono el historial de análisis, las plantas registradas y las cosechas, y funcionar parcialmente incluso sin conexión.

La tercera es la privacidad. Al trabajar en el teléfono, la app puede preparar la foto antes de enviarla, eliminando la ubicación y otros datos personales, y mantener el historial del usuario en su propio dispositivo a menos que decida usar una cuenta.

:::warning
La aplicación no hace el diagnóstico por sí sola: el modelo de inteligencia artificial corre en un servidor, porque es demasiado grande para un celular. Esto implica que el análisis necesita conexión a internet, una limitación que conviene reconocer abiertamente en la defensa.
:::

:::autoevaluacion
? ¿Cuáles son los cinco pasos del recorrido de un análisis?
= Capturar, preparar, filtrar, clasificar con su confianza, y explicar y mostrar el resultado. → #el-recorrido-paso-a-paso
? ¿Qué error evita el paso de filtrado?
= Evita que el modelo invente un diagnóstico para una foto que no es una hoja de un cultivo conocido. → #el-recorrido-paso-a-paso
? ¿Qué cambia en la pantalla cuando el resultado no es confiable?
= Aparece un aviso de que CropEye no está seguro, el resultado se marca como no confirmado, se muestran las opciones más probables, no se muestra ficha de tratamiento y se proponen pasos como tomar otra foto o consultar a un especialista. → #dos-tipos-de-resultado
? ¿Por qué el análisis necesita internet aunque la app esté en el celular?
= Porque el modelo de inteligencia artificial es demasiado grande para el teléfono y corre en un servidor. → #por-que-una-aplicacion-movil
:::

:::comision
? ¿Por qué la aplicación no muestra simplemente la enfermedad más probable, como hacen otros sistemas?
Porque la enfermedad más probable no siempre es una buena respuesta. Un clasificador siempre elige alguna clase, incluso frente a una foto mala o a una enfermedad que no conoce. Si mostráramos siempre esa clase con la misma seguridad, el usuario no podría distinguir un acierto de una adivinanza. Por eso el sistema mide su confianza y presenta de forma distinta los resultados confiables y los no confirmados; en estos últimos no sugiere tratamiento y recomienda consultar a un especialista.
! Decir que el umbral de confianza es "para que el modelo parezca más preciso".
:::

## Para profundizar

- `cropeye-app/lib/screens/camara_screen.dart`: la cámara con el marco guía y el selector de cultivo.
- `cropeye-app/lib/screens/analisis_screen.dart`: los pasos de carga y los dos tipos de resultado.
