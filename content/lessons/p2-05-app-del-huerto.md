# De herramienta de diagnóstico a app del huerto

Hasta ahora hemos descrito CropEye como un sistema que responde una pregunta: qué tiene esta hoja. Sin embargo, si abrimos la aplicación encontraremos bastante más que una cámara y una pantalla de resultado. Hay un registro de plantas, una línea de tiempo con fotos, fichas de cultivo, un diario de cosecha, una calculadora para diseñar el huerto, un aviso de clima y un botón que pregunta si el diagnóstico acertó. Esta lección explica por qué existe cada una de esas funciones, qué problema resuelve y qué principio común las une.

:::objetivos
- explicar por qué el proyecto pasó de un diagnosticador a una aplicación de acompañamiento del huerto;
- describir el propósito de cada función de huerto y el problema que resuelve;
- justificar por qué los datos del huerto se guardan en el teléfono;
- relacionar las funciones de huerto con la mejora futura del modelo de diagnóstico.
:::

## Del momento al proceso

Al final de la Parte 1 observamos que quien cultiva no vive su huerto como una serie de fotos aisladas, sino como un proceso que va de la siembra a la cosecha. Un diagnóstico aislado responde a un momento; las decisiones reales, en cambio, dependen de la historia. Una mancha leve en una planta que ya estuvo enferma hace dos semanas merece más atención que la misma mancha en una planta que siempre estuvo sana. Una enfermedad que favorece la humedad es más preocupante si se anuncian varios días de lluvia.

Esa observación cambió el centro del proyecto. El diagnóstico sigue siendo la función principal, pero ahora forma parte de algo más amplio: acompañar a la persona durante toda la temporada, con información que le sirva para decidir. Cada función de huerto responde a una pregunta concreta que esa persona se hace en algún momento del proceso.

## Mi huerto y la línea de tiempo

La pregunta que responde Mi huerto es simple: ¿qué estoy cultivando? La persona registra cada planta con su cultivo, un apodo que la identifique, la fecha de siembra, dónde está plantada y, si quiere, una foto de portada. Con esa información la app puede mostrar cuántos días lleva la planta desde la siembra, un dato que ayuda a interpretar cualquier problema según la etapa del cultivo.

El registro de plantas abre una posibilidad que un diagnosticador aislado no tiene: asociar cada análisis a una planta. Cuando la persona analiza una hoja, puede indicar de qué planta es, y ese análisis pasa a formar parte de la línea de tiempo de la planta. La línea de tiempo muestra, fecha por fecha, qué dijo CropEye y con qué confianza, y permite comparar dos fotos con un control deslizante.

Hay una decisión de diseño importante en la línea de tiempo: la app muestra hechos y no interpreta tendencias. No dice que la planta "mejora" o "empeora", porque para afirmarlo necesitaría un modelo que midiera la severidad de la enfermedad, y CropEye no lo tiene. Muestra lo que el modelo dijo en cada fecha y deja que la persona compare las fotos, o que consulte a un especialista si tiene dudas.

## Fichas, cosechas y diseño

Las fichas de cultivo responden a la pregunta ¿cómo cuido esta planta? Cada uno de los cultivos tiene una ficha con sus necesidades de sol, riego, espacio y clima, y con las enfermedades más frecuentes en Chile, sus síntomas en palabras simples y las medidas de manejo, empezando por las que no requieren químicos. Toda la información viene de publicaciones del INIA, y la fuente aparece visible en cada ficha. Las fichas no nombran productos ni dosis: cuando hace falta un producto, se remite a los autorizados por el SAG para ese cultivo.

El diario de cosecha responde a ¿cuánto he cosechado? Permite registrar, para cada planta, la fecha, la cantidad en kilos o en unidades, una nota y una foto, y muestra un resumen por cultivo y en total. Es una función sencilla, pero le da al huerto un sentido de resultado y cierra el ciclo que empezó con la siembra.

La calculadora de diseño responde a ¿cuántas plantas caben en este espacio? A partir de las medidas de una cama o de una maceta y del cultivo elegido, calcula cuántas plantas caben respetando la distancia recomendada, y muestra siempre la distancia usada y su fuente. Plantar demasiado junto favorece la humedad y las enfermedades, de modo que esta función también contribuye, de forma indirecta, a prevenirlas.

## El aviso de clima

El aviso de clima responde a una pregunta anticipatoria: ¿hay algún riesgo en los próximos días? Al abrir la app, Inicio consulta el pronóstico de la comuna que eligió la persona y avisa si puede helar o si las condiciones favorecen el tizón tardío.

Las reglas del aviso salen de la investigación del equipo y tienen fuente. Una helada, en sentido meteorológico, es una temperatura bajo cero grados. El tizón tardío necesita horas seguidas de humedad muy alta con temperatura templada, según el manual de papa del INIA. Esta función conecta directamente con la Parte 1: si el tiempo de detección es crítico, anticipar las condiciones que favorecen una enfermedad es todavía mejor que detectarla temprano.

## "¿Acertó?" y la mejora del modelo

La última función mira hacia el futuro del proyecto. Después de cada análisis guardado, la app pregunta si el diagnóstico acertó. La persona puede responder que sí, que no o que no sabe, y si responde que no, puede indicar qué cree que tenía la planta.

Esas respuestas son valiosas porque son fotos reales, tomadas con celulares reales en huertos reales, y etiquetadas por quien conoce la planta. Son exactamente el tipo de datos que más le faltan a un modelo entrenado mayoritariamente con fotos de laboratorio. Desde el perfil, la persona puede exportarlas en un archivo para que el equipo las use al reentrenar el modelo.

Por tratarse de fotos de usuarios, esta función está rodeada de cuidados de privacidad que estudiaremos en la Parte 4: antes de la primera respuesta se muestra un aviso y solo se guarda si la persona acepta; las fotos no llevan ubicación, y el permiso se puede retirar en cualquier momento.

:::note
Todas estas funciones guardan sus datos en el teléfono, no en un servidor. Así la app funciona sin cuenta, no expone el huerto de nadie y respeta el principio de recolectar solo lo necesario. El costo, que la app comunica con claridad, es que esos datos se pierden si se desinstala la aplicación.
:::

:::warning
Al explicar estas funciones conviene no presentarlas como el centro del proyecto. El aporte principal sigue siendo el diagnóstico con su manejo honesto de la incertidumbre; las funciones de huerto lo complementan y le dan continuidad.
:::

:::autoevaluacion
? ¿Qué observación sobre quien cultiva motivó las funciones de huerto?
= Que vive el huerto como un proceso de la siembra a la cosecha y que sus decisiones dependen de la historia de cada planta, no de una foto aislada. → #del-momento-al-proceso
? ¿Por qué la línea de tiempo no dice si la planta mejora o empeora?
= Porque para afirmarlo necesitaría un modelo que mida la severidad de la enfermedad, y CropEye no lo tiene; por eso muestra solo hechos y permite comparar fotos. → #mi-huerto-y-la-linea-de-tiempo
? ¿De dónde sale la información de las fichas y qué no incluyen?
= De publicaciones del INIA, con la fuente visible; no incluyen nombres de productos ni dosis y remiten a los productos autorizados por el SAG. → #fichas-cosechas-y-diseno
? ¿Por qué las respuestas a "¿Acertó?" son valiosas para el modelo?
= Porque son fotos reales de huertos, etiquetadas por quien conoce la planta, justo el tipo de datos que le falta a un modelo entrenado con fotos de laboratorio. → #acerto-y-la-mejora-del-modelo
:::

:::comision
? ¿No se desvía el proyecto de su objetivo al agregar tantas funciones que no son de diagnóstico?
Las funciones de huerto no reemplazan el objetivo, lo completan. El diagnóstico responde a un momento, pero las decisiones de quien cultiva dependen de la historia de cada planta, de sus cuidados y del clima. Mi huerto y la línea de tiempo dan contexto a cada diagnóstico; las fichas convierten el resultado en acciones con fuente; el aviso de clima anticipa riesgos, que es todavía mejor que detectarlos temprano; y "¿Acertó?" genera datos reales para mejorar el modelo.

Además, todas comparten los mismos principios: información con fuente, sin productos ni dosis, datos guardados en el teléfono y honestidad sobre lo que la app no sabe.
! Decir que las funciones se agregaron "porque las otras apps las tienen".
:::

## Para profundizar

- `cropeye-app/lib/screens/huerto_screen.dart` y `planta_screen.dart`: Mi huerto y la línea de tiempo.
- `cropeye-app/assets/datos/`: las fichas y las distancias con sus fuentes.
- `cropeye-app/lib/widgets/aviso_clima.dart` y `acierto.dart`: el aviso de clima y "¿Acertó?".
