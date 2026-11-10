# Quién vive el problema y cómo lo resuelve hoy

En la lección anterior vimos que una enfermedad foliar avanza rápido y que la ventana para actuar es corta. Ahora cambiamos el foco desde la planta hacia la persona. Un problema técnico solo justifica un proyecto cuando le ocurre a alguien concreto, en un contexto concreto, y cuando las soluciones que esa persona tiene a mano no alcanzan. Esta lección describe a quién le ocurre el problema que CropEye intenta resolver, qué hace hoy cuando ve una hoja enferma y por qué esas respuestas, siendo razonables, llegan tarde o no llegan.

:::objetivos
- describir a las personas que cultivan y que son el público de CropEye;
- explicar las tres vías que hoy usan para resolver una hoja enferma y sus limitaciones;
- identificar qué necesidad concreta queda sin cubrir;
- conectar esa necesidad con las decisiones de diseño que veremos más adelante.
:::

## Las personas detrás de un huerto

CropEye nació pensando en quienes cultivan a pequeña escala en la zona central de Chile, con especial atención a la Región del Maule. Ahí conviven dos perfiles que comparten el mismo problema con matices distintos.

El primero es la persona con un huerto casero. Cultiva tomates, papas, choclos, pimientos o un par de manzanos en el patio, en camas elevadas o en maceteros. Lo hace por gusto, para comer mejor o para ahorrar, y casi nunca tiene formación agronómica. Conoce sus plantas por el día a día, pero no sabe ponerle nombre a una mancha nueva. Para esta persona, perder una temporada no es una catástrofe económica, pero sí una frustración que muchas veces termina en abandonar el huerto.

El segundo es el agricultor pequeño, que vende parte de lo que produce y para quien una enfermedad sí tiene un costo económico directo. Tiene más experiencia, reconoce las enfermedades más comunes de su zona y muchas veces conoce a un técnico o a un vendedor de insumos. Su problema no es tanto la falta de conocimiento como el tiempo: cuando aparece algo que no reconoce, conseguir una opinión experta puede tardar días.

Lo que une a ambos perfiles es la situación que vimos en la lección anterior: una mancha pequeña, una decisión que conviene tomar pronto y la falta de alguien que confirme qué es.

## Cómo se resuelve hoy

Cuando una de estas personas ve una hoja enferma, recurre a una de tres vías, y cada una tiene un costo que conviene entender.

La primera vía es preguntar a alguien cercano: un vecino con experiencia, un familiar, un grupo de mensajería del barrio o de la feria. Es inmediata y gratuita, y muchas veces acierta, porque las enfermedades más comunes se repiten de un huerto a otro. Su debilidad es que depende de la memoria y la intuición de otra persona, sin ninguna forma de saber cuán segura está esa opinión. Un consejo equivocado dado con confianza puede ser peor que no tener consejo.

La segunda vía es buscar en internet. La persona escribe "manchas cafés en hojas de tomate" y encuentra decenas de fotos, foros y artículos. El problema es que la información disponible rara vez está pensada para su realidad: muchas fuentes son de otros países, mencionan productos que no están autorizados en Chile y recomiendan dosis sin explicar su origen. Además, comparar una foto propia con fotos ajenas es difícil incluso para alguien con experiencia.

La tercera vía es consultar a un especialista: un agrónomo, un técnico de un programa público como los de INDAP, o el vendedor de una tienda agrícola. Es la vía más confiable, pero también la más lenta y la menos accesible para un huerto casero. Conseguir una visita puede tardar días y, en el caso del vendedor, el consejo suele venir acompañado de un producto que quizás no era necesario.

:::note
Las tres vías no son malas; son incompletas. CropEye no pretende reemplazarlas, sino ocupar el espacio que dejan entre ellas: una primera opinión inmediata, que explique en qué se basa y que diga con honestidad cuándo conviene buscar a un especialista.
:::

## La necesidad que queda sin cubrir

Si ordenamos las tres vías según dos criterios, rapidez y confiabilidad, aparece con claridad el hueco que motiva el proyecto. Preguntar a un vecino es rápido pero de confiabilidad desconocida. Buscar en internet es rápido pero difícil de interpretar y a menudo inadecuado para el contexto chileno. Consultar a un especialista es confiable pero lento. Nadie ofrece, al mismo tiempo, una respuesta inmediata y una medida de cuánto confiar en ella.

De esa observación se desprende la necesidad concreta que CropEye intenta cubrir: una herramienta que, en el momento en que la persona ve la mancha, le entregue una hipótesis razonable sobre qué enfermedad puede ser, le diga cuán segura es esa hipótesis, le muestre en qué parte de la hoja se basó y le ofrezca información de manejo con fuente local, empezando por las medidas que no requieren químicos.

Fijémonos en que esta definición ya contiene varias decisiones de diseño que estudiaremos más adelante. "En el momento en que ve la mancha" justifica que la herramienta sea una aplicación de celular con cámara. "Cuán segura es la hipótesis" justifica que el modelo entregue una confianza y que la app tenga un aviso explícito cuando duda. "En qué parte de la hoja se basó" justifica el mapa de calor. "Información con fuente local" justifica las fichas de manejo basadas en publicaciones del INIA.

## Más allá del diagnóstico

Hay una última observación que explica por qué CropEye creció más allá de un diagnosticador. Quien cultiva no vive su huerto como una sucesión de fotos aisladas, sino como un proceso: siembra, crecimiento, problemas, cuidados y cosecha. Una mancha que hoy parece leve tiene otro significado si la misma planta ya tuvo un problema hace dos semanas, o si la noche anterior heló.

Por eso la necesidad no termina en "¿qué tiene esta hoja?". Continúa con preguntas como "¿esta planta está mejor o peor que la semana pasada?", "¿qué cuidados necesita este cultivo?", "¿cuánto coseché este año?" o "¿esta noche hay riesgo de helada?". Estas preguntas son las que dieron origen a las funciones de huerto que estudiaremos en la Parte 2. Todas ellas parten del mismo principio que hemos desarrollado aquí: acompañar a quien cultiva en el momento en que tiene que decidir, con información clara y con fuente.

:::warning
Al presentar el proyecto conviene no exagerar el problema ni el público. CropEye está pensado para huertos y producción pequeña, no para la agricultura industrial, que tiene sus propios sistemas de monitoreo y asesoría profesional permanente.
:::

:::autoevaluacion
? ¿Cuáles son los dos perfiles de usuario que considera CropEye y en qué se diferencia su problema?
= La persona con huerto casero, que carece de conocimiento para nombrar una mancha nueva, y el agricultor pequeño, que tiene más experiencia pero no consigue una opinión experta a tiempo. → #las-personas-detras-de-un-huerto
? ¿Qué limitación comparten la opinión de un vecino y la búsqueda en internet?
= Ambas son rápidas, pero ninguna dice cuán confiable es la respuesta; internet además suele traer información de otros países y productos no autorizados en Chile. → #como-se-resuelve-hoy
? Formula en una oración la necesidad que queda sin cubrir.
= Una respuesta inmediata, en el momento en que se ve la mancha, que además diga cuán confiable es, en qué se basó y qué hacer con información de fuente local. → #la-necesidad-que-queda-sin-cubrir
? ¿Por qué el proyecto incluye funciones que no son de diagnóstico?
= Porque quien cultiva vive el huerto como un proceso: necesita seguir la evolución de cada planta, saber cómo cuidarla, registrar cosechas y anticipar riesgos del clima. → #mas-alla-del-diagnostico
:::

:::comision
? Ya existen aplicaciones internacionales de diagnóstico de plantas. ¿Por qué hacer una nueva?
Las aplicaciones existentes resuelven bien el diagnóstico general, pero están pensadas para otros contextos: sus recomendaciones suelen nombrar productos y dosis que no corresponden a la normativa chilena, y no siempre explican cuán segura es su respuesta. CropEye se enfoca en cultivos comunes de la zona central, entrega información de manejo basada en publicaciones del INIA, prioriza medidas sin químicos y dice explícitamente cuándo no está segura.

Además, CropEye integra el diagnóstico con el seguimiento del huerto: cada análisis puede asociarse a una planta y ver su evolución en el tiempo, algo que las aplicaciones centradas solo en el diagnóstico no ofrecen.
! Decir que las otras aplicaciones "son malas" o afirmar que CropEye es más preciso sin una comparación medida con las mismas fotos.
:::

## Para profundizar

- `cropeye-app/README.md`: la descripción del producto y sus funciones.
- La investigación del equipo sobre aplicaciones comparables (tema F9) y sobre fuentes chilenas de manejo (tema F2).
