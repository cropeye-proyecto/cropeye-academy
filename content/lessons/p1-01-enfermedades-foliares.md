# Enfermedades foliares: qué son y por qué el tiempo importa

Todo proyecto de software resuelve un problema que existe fuera del computador, y CropEye no es la excepción. Antes de hablar de modelos, servidores o pantallas, conviene detenerse en el fenómeno que le da sentido a todo lo demás: una planta que se enferma y una persona que, mirando sus hojas, tiene que decidir qué hacer. Si no entendemos cómo avanza una enfermedad foliar, no podremos explicar por qué la app insiste tanto en la rapidez, por qué muestra advertencias cuando duda o por qué le importa saber de qué cultivo se trata.

:::objetivos
- explicar qué es una enfermedad foliar y qué tipos de agentes la causan;
- describir cómo avanza una enfermedad desde la infección hasta que se vuelve visible y se propaga;
- argumentar por qué detectar temprano cambia el resultado para quien cultiva;
- reconocer los límites de un diagnóstico hecho solo a partir de la apariencia de una hoja.
:::

## Qué entendemos por enfermedad foliar

Una enfermedad foliar es una alteración de la hoja causada por un organismo vivo que la usa para alimentarse y reproducirse. En los cultivos que nos interesan, esos organismos son principalmente hongos, oomicetos, bacterias y virus. A ellos se suman algunas plagas, como los ácaros, que no son enfermedades en sentido estricto pero dejan en la hoja un daño visible que cualquier persona interpretaría como "la planta está enferma".

La hoja es el órgano donde la planta capta luz y produce su alimento. Cuando una mancha, un moho o una deformación se extiende sobre ella, la superficie que trabaja para la planta disminuye, la planta se debilita y la cosecha se resiente. Por eso la hoja es, al mismo tiempo, el lugar donde el daño se vuelve visible y el lugar donde ese daño empieza a costar.

Conviene distinguir cuatro grandes familias de causas, porque cada una deja una huella distinta. Los hongos suelen producir manchas con bordes definidos, a veces con anillos concéntricos, y en condiciones húmedas forman un polvo o un moho visible; el tizón temprano y el oídio son buenos ejemplos. Los oomicetos, como el que causa el tizón tardío, se parecen a los hongos en su forma de vida, pero avanzan mucho más rápido y prefieren el frío húmedo. Las bacterias producen manchas pequeñas, oscuras y a menudo rodeadas de un halo amarillo. Los virus, en cambio, rara vez forman manchas: deforman, arrugan o amarillean la hoja completa, y no tienen tratamiento una vez que la planta está infectada.

:::note
Que una hoja se vea mal no significa siempre que tenga una enfermedad. La falta de nutrientes, el exceso de sol, una helada o un riego mal hecho producen síntomas parecidos. Esta ambigüedad será importante cuando estudiemos por qué el modelo de CropEye debe saber cuándo no responder.
:::

## Cómo avanza una enfermedad en el tiempo

La mayoría de las enfermedades foliares sigue un ciclo parecido, y entenderlo es la clave para entender el valor del tiempo. Todo comienza cuando el agente causal llega a la hoja: una espora transportada por el viento, una gota de lluvia que salpica desde el suelo, un insecto que pica o una herramienta contaminada. Si las condiciones son favorables, el agente entra en el tejido y comienza a multiplicarse.

Durante los primeros días no ocurre nada que el ojo pueda ver. Este período, llamado de incubación, es silencioso: la planta ya está infectada, pero sus hojas todavía se ven sanas. Recién cuando el agente ha avanzado lo suficiente aparecen los primeros síntomas, casi siempre pequeños y fáciles de confundir: una mancha del tamaño de una lenteja, un borde que cambia de color, un punto acuoso en el envés.

Desde ese momento la enfermedad deja de ser un problema local. Las lesiones producen nuevas esporas, que el viento, el agua o el contacto llevan a otras hojas y a otras plantas. Cada nueva lesión es, a su vez, una fuente de más esporas. El crecimiento deja de ser lineal y se vuelve explosivo: lo que un lunes era una mancha en una hoja puede ser, con varios días de lluvia y temperatura templada, un cultivo entero comprometido.

![Avance de una enfermedad foliar en el tiempo y ventana para actuar](assets/diagramas/p1-avance-enfermedad.svg)

El diagrama resume la idea central de esta lección. La curva de daño crece lentamente mientras la enfermedad es invisible, se acelera cuando aparecen los primeros síntomas y se dispara cuando las lesiones comienzan a producir esporas. La ventana en la que actuar sale barato y funciona bien es corta, y coincide justamente con el momento en que los síntomas son más pequeños y más difíciles de reconocer.

## Por qué el tiempo cambia el resultado

El tizón tardío de la papa y del tomate es el ejemplo más claro del costo de esperar. Según el manual de cultivo de la papa del INIA, esta enfermedad puede destruir una plantación en siete a diez días cuando el clima la favorece, y necesita apenas unas doce horas seguidas de humedad alta y temperatura templada para infectar. Para quien cultiva, la diferencia entre reconocerla el primer día o el quinto es la diferencia entre retirar algunas hojas y perder la temporada.

Detectar temprano tiene, además, consecuencias que van más allá de salvar una planta. Una enfermedad identificada a tiempo suele poder manejarse con medidas culturales sencillas: retirar las hojas afectadas, mejorar la ventilación, cambiar la forma de regar. Cuando se identifica tarde, esas medidas ya no alcanzan y la tentación es recurrir a productos químicos, muchas veces sin saber cuál corresponde ni en qué dosis. Un diagnóstico oportuno, por lo tanto, no solo protege la cosecha: también reduce el uso innecesario de plaguicidas.

Hay un tercer efecto, menos evidente. Las enfermedades no respetan los límites de un huerto. Una planta infectada que nadie atiende es una fuente de esporas para los huertos vecinos. Detectar y manejar a tiempo es, en ese sentido, también una forma de cuidar a los demás.

:::warning
Detectar temprano no es lo mismo que diagnosticar con certeza. Una mancha pequeña es, a la vez, el mejor momento para actuar y el peor momento para estar seguro de qué es. Cualquier herramienta que prometa rapidez tiene que convivir con esa tensión, y CropEye la resuelve diciendo explícitamente cuándo no está segura.
:::

## Lo que una hoja puede y no puede decir

La observación de la hoja es la herramienta de diagnóstico más antigua y más accesible. Un agrónomo con experiencia reconoce muchas enfermedades solo mirando el patrón de las manchas, su color, su borde y la parte de la planta donde aparecen. Esa misma experiencia, sin embargo, le enseña a desconfiar de la primera impresión. Varias enfermedades distintas producen manchas parecidas; el tizón temprano y la mancha diana del tomate, por ejemplo, se confunden con frecuencia incluso entre especialistas.

Cuando la observación no basta, el especialista recurre a otras pistas: el historial del cultivo, el clima de los días anteriores, la presencia de insectos, el estado de las raíces o, en último término, un análisis de laboratorio. Ninguna de esas pistas cabe en una fotografía. Por eso un sistema que diagnostica a partir de una foto trabaja con información incompleta por naturaleza, y debe ser honesto sobre ese límite.

Esta lección deja planteadas, entonces, dos ideas que recorrerán todo el curso. La primera es que el tiempo importa: una herramienta que acorte el camino entre ver una mancha y saber qué hacer tiene un valor real. La segunda es que la apariencia de una hoja es una pista y no una prueba: una herramienta responsable tiene que saber cuándo su pista no alcanza.

:::autoevaluacion
? ¿Qué familias de agentes causan enfermedades foliares y cómo se distingue, en general, la huella de un virus de la de un hongo?
= Hongos, oomicetos, bacterias y virus, además de plagas como los ácaros. Los hongos suelen dejar manchas definidas y a veces moho; los virus deforman, arrugan o amarillean la hoja completa sin formar manchas típicas. → #que-entendemos-por-enfermedad-foliar
? ¿Por qué el período de incubación hace difícil la detección temprana?
= Porque la planta ya está infectada pero todavía no muestra síntomas visibles; cuando aparecen, la enfermedad ya avanzó y los primeros síntomas son pequeños y ambiguos. → #como-avanza-una-enfermedad-en-el-tiempo
? Además de salvar la cosecha, ¿qué otros dos beneficios tiene detectar temprano?
= Permite manejar la enfermedad con medidas culturales y reduce el uso innecesario de plaguicidas; además, evita que la planta enferma contagie a huertos vecinos. → #por-que-el-tiempo-cambia-el-resultado
? ¿Por qué un diagnóstico hecho solo con una foto trabaja con información incompleta?
= Porque un especialista usa también el historial del cultivo, el clima, los insectos, las raíces o el laboratorio, y nada de eso aparece en la foto de una hoja. → #lo-que-una-hoja-puede-y-no-puede-decir
:::

:::comision
? Si las enfermedades se pueden reconocer mirando la hoja, ¿qué aporta realmente una aplicación frente a la experiencia de un agricultor?
La experiencia del agricultor es valiosa, pero no está distribuida de forma pareja: quien recién empieza un huerto, o quien cultiva una especie nueva, no tiene esa memoria visual. La aplicación no reemplaza el criterio de un especialista; acorta el tiempo entre ver una mancha y tener una hipótesis razonable, en el momento en que esa rapidez más importa, y además dice cuándo su hipótesis no es confiable para que la persona busque ayuda.

Nuestro aporte, entonces, está en el acceso y en el tiempo, no en superar al experto. Por eso la aplicación muestra su nivel de confianza, explica en qué parte de la hoja se fijó y recomienda consultar a un agrónomo cuando duda.
! Decir que la aplicación "diagnostica mejor que un agrónomo" o que "reemplaza al especialista".
:::

## Para profundizar

- `cropeye-app/assets/datos/fichas.json`: las fichas de manejo de cada enfermedad, con su fuente del INIA.
- INIA, *Manual de cultivo de la papa en Chile* (Boletín 375), capítulo sobre el tizón tardío.
- INIA, *Manual de cultivo del tomate al aire libre* (Boletín 376), capítulo de enfermedades.
