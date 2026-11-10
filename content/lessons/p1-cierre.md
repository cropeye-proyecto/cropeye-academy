# Cierre: preguntas de la comisión

Esta parte presentó el problema que justifica el proyecto: enfermedades que avanzan rápido, una ventana corta para actuar y personas que no tienen una forma inmediata y confiable de saber qué le pasa a su planta. Las preguntas siguientes son del tipo que una comisión suele hacer al comienzo de una defensa, cuando quiere comprobar que el equipo entiende el problema antes de evaluar la solución. Intenta responderlas en voz alta, en uno o dos minutos cada una, antes de abrir la respuesta modelo.

:::comision
? ¿Cuál es, en una frase, el problema que resuelve CropEye?
Quien cultiva a pequeña escala ve una mancha en una hoja y no tiene una forma inmediata y confiable de saber qué enfermedad puede ser ni qué hacer, justo en el momento en que actuar es más barato y más efectivo. CropEye ofrece una primera opinión desde una foto, con su nivel de confianza, una explicación visual y recomendaciones de manejo con fuente.
! Describir la solución técnica (redes neuronales, servidores) en lugar del problema.
:::

:::comision
? ¿Por qué el tiempo de detección es tan importante en las enfermedades foliares?
Porque la mayoría de estas enfermedades crece de forma explosiva: cada lesión produce esporas que infectan nuevas hojas. Mientras los síntomas son pequeños, el manejo suele ser sencillo y sin químicos; cuando la enfermedad ya se propagó, las medidas culturales no alcanzan. El tizón tardío, por ejemplo, puede destruir un cultivo de papa en siete a diez días con clima favorable.
! Dar cifras de pérdidas sin indicar de dónde salen.
:::

:::comision
? ¿Quién es el usuario de CropEye y quién no lo es?
El usuario es la persona con huerto casero y el agricultor pequeño de la zona central, que no tienen asesoría agronómica permanente. No apuntamos a la agricultura industrial, que cuenta con monitoreo y asesores profesionales. Definir así al usuario explica decisiones como usar el celular, dar explicaciones en lenguaje simple y priorizar el manejo sin químicos.
! Decir que la aplicación sirve "para cualquier agricultor" sin distinguir escalas.
:::

:::comision
? Si un diagnóstico por foto trabaja con información incompleta, ¿no es irresponsable ofrecerlo?
Sería irresponsable si se presentara como un diagnóstico definitivo. Por eso el sistema está diseñado alrededor de sus límites: rechaza fotos que no parecen hojas, entrega una confianza, marca como "no confirmado" el resultado cuando duda, no sugiere manejo en ese caso y recomienda siempre consultar a un especialista antes de un tratamiento. Es una ayuda para decidir cuándo y a quién consultar, no un reemplazo.
! Responder que "la inteligencia artificial es muy precisa" sin hablar de cómo el sistema maneja la duda.
:::

:::comision
? ¿Qué hace hoy una persona cuando ve una hoja enferma, y por qué eso no basta?
Pregunta a un conocido, busca en internet o consulta a un especialista. La opinión de un conocido es rápida pero no dice cuán segura es; internet es rápido pero difícil de interpretar y suele traer información de otros países; el especialista es confiable pero lento y poco accesible para un huerto casero. Ninguna vía combina rapidez con una medida de confianza.
! Desacreditar a los especialistas; CropEye los complementa, no los reemplaza.
:::
