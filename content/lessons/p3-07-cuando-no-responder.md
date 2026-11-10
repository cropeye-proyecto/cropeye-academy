# Saber cuándo no responder: filtro de hoja, confianza y umbral

En la lección anterior vimos que un clasificador siempre elige alguna categoría: si le mostramos la foto de una mesa, devolverá la enfermedad que más se parezca a una mesa. Esta propiedad, inofensiva en un ejercicio académico, es peligrosa en una herramienta que alguien usará para decidir qué hacer con sus plantas. Esta lección estudia los mecanismos que CropEye pone alrededor del modelo para que el sistema sepa cuándo no debe responder. Son, probablemente, las decisiones de diseño que más conviene dominar para la defensa.

:::objetivos
- explicar por qué un clasificador necesita mecanismos externos para abstenerse;
- describir las tres barreras del sistema: el filtro de hoja, la salida "Otra" y el umbral de confianza;
- explicar cómo el cultivo elegido por el usuario restringe las categorías posibles;
- interpretar qué significa el campo `confiable` y qué hace la app con él.
:::

## El problema de responder siempre

Un clasificador transforma cualquier imagen en una distribución de probabilidades que suma uno. No tiene una forma natural de decir "esto no es nada de lo que conozco". Si las categorías son trece enfermedades y estados sanos, la foto de un perro será repartida entre esas trece categorías, y alguna ganará.

El riesgo no es solo teórico. Una persona podría fotografiar una hoja de una especie que el modelo no conoce, una hoja con una enfermedad fuera del catálogo, una foto borrosa o una foto de su mano. En todos esos casos, un sistema ingenuo devolvería un diagnóstico con apariencia de seguridad. CropEye aborda este problema con tres barreras sucesivas, cada una pensada para un tipo distinto de error.

![Las tres barreras antes de mostrar un diagnóstico](assets/diagramas/p3-filtro-confianza-umbral.svg)

## Primera barrera: el filtro de hoja

La primera barrera actúa antes del diagnóstico. Es un modelo pequeño y separado, cuyo único trabajo es responder una pregunta binaria: ¿esta foto es una hoja de un cultivo conocido? Para entrenarlo, el equipo le mostró como ejemplos positivos hojas de tomate y papa, y como ejemplos negativos hojas de otras plantas, fotos de objetos cotidianos, caras e incluso imágenes artificiales como códigos QR o texto.

```python cropeye-ia/nucleo.py
with self.candado:
    if self.filtro is not None and self.es_hoja(img) < self.umbral_filtro:
        raise NoEsHoja()
```

El fragmento muestra la decisión: si la probabilidad de que la foto sea una hoja queda bajo un umbral, el análisis se detiene y la API responde con un error específico. La app recibe ese error y muestra el mensaje "no parece una hoja", con un botón para volver a la cámara. El diagnóstico nunca llega a calcularse.

El filtro es deliberadamente más simple que el modelo principal. No necesita distinguir enfermedades, solo reconocer si hay una hoja de los cultivos que el sistema conoce. Al ser pequeño, agrega muy poco tiempo al análisis.

## Segunda barrera: la salida "Otra"

La segunda barrera está dentro del modelo principal. Además de las enfermedades y los estados sanos, el modelo tiene una salida adicional llamada "Otra", entrenada con imágenes de hojas que no pertenecen a ninguna categoría conocida. Cuando la salida "Otra" es la más probable, el sistema interpreta que la hoja tiene algo que no está en su catálogo.

Esta barrera cubre un caso que el filtro no puede cubrir: la foto sí es una hoja de tomate, pero tiene una enfermedad para la que el modelo no fue entrenado. El filtro la deja pasar, con razón, y es el modelo el que debe reconocer que no sabe.

## Tercera barrera: el umbral de confianza

La tercera barrera es la más sencilla de explicar. Aunque la categoría ganadora sea una enfermedad conocida, si su probabilidad es baja el sistema no la considera confiable. En CropEye ese límite está fijado en el código de la API.

```python cropeye-ia/nucleo.py
UMBRAL = 0.60  # bajo esta confianza, la app pide otra foto

"confiable": bool(probs[i] >= UMBRAL and not otra),
```

La segunda línea resume las dos últimas barreras en un solo valor: el resultado es confiable solo si la confianza alcanza el umbral y si no ganó la salida "Otra". La API devuelve igualmente la enfermedad más probable y su confianza, porque esa información puede ser útil, pero marca explícitamente si merece confianza o no.

Para que este número tenga sentido, las probabilidades del modelo deben estar calibradas, es decir, una confianza de 0,8 debería corresponder a acertar aproximadamente ocho de cada diez veces. Los modelos de aprendizaje profundo tienden a ser demasiado seguros de sí mismos, por lo que el proyecto aplica una corrección llamada calibración por temperatura, que ajusta las probabilidades usando fotos de campo reservadas para ese fin.

:::warning
El umbral no es un número mágico. Bajarlo hace que el sistema responda más veces, pero también que se equivoque más veces sin avisar; subirlo reduce los errores silenciosos, pero deja más fotos sin respuesta. Elegirlo es una decisión sobre qué error es peor, y en un contexto agronómico una falsa tranquilidad suele ser más costosa que pedir otra foto.
:::

## El cultivo como pista

Hay un mecanismo adicional que no es una barrera, sino una ayuda. Cuando el usuario indica en la cámara qué cultivo está fotografiando, la API elimina de la competencia las categorías del otro cultivo y vuelve a repartir las probabilidades entre las restantes. Si la persona dice que es papa, el modelo ya no puede responder una enfermedad del tomate.

Este pequeño gesto tiene un efecto grande, porque varias enfermedades se ven parecidas en ambos cultivos. Pero tiene una contracara: si la persona elige el cultivo equivocado, el modelo queda forzado a elegir entre categorías incorrectas. Por eso la app ofrece la opción "No sé" como valor por defecto, y solo restringe cuando el usuario elige explícitamente.

## Qué hace la app con todo esto

La app recibe de la API la enfermedad más probable, su confianza, las alternativas y el valor `confiable`. Con eso decide cómo presentar el resultado, tal como vimos en la Parte 2. Si el resultado es confiable, muestra la tarjeta destacada y la ficha de manejo. Si no lo es, muestra el aviso de que CropEye no está seguro, marca el resultado como no confirmado, lista las opciones que el modelo consideró y no sugiere ningún tratamiento.

Es importante notar la división de responsabilidades. La decisión de qué es confiable la toma la API, que conoce el modelo y su calibración. La app no recalcula nada: confía en ese valor y se concentra en comunicarlo bien. Si en el futuro el equipo cambia el umbral o el modelo, la app no necesita cambiar.

:::autoevaluacion
? ¿Por qué un clasificador no puede, por sí solo, decir "no sé"?
= Porque reparte siempre las probabilidades entre las categorías que conoce y alguna gana, aunque la foto no tenga nada que ver. → #el-problema-de-responder-siempre
? ¿Qué caso cubre la salida "Otra" que el filtro de hoja no puede cubrir?
= Una foto que sí es una hoja del cultivo, pero con una enfermedad que no está en el catálogo del modelo. → #segunda-barrera-la-salida-otra
? ¿Cuándo es `confiable` verdadero?
= Cuando la confianza de la categoría ganadora alcanza el umbral y no ganó la salida "Otra". → #tercera-barrera-el-umbral-de-confianza
? ¿Por qué la app usa "No sé" como cultivo por defecto?
= Porque elegir un cultivo equivocado fuerza al modelo a escoger entre categorías incorrectas; solo conviene restringir cuando el usuario está seguro. → #el-cultivo-como-pista
:::

:::comision
? ¿Cómo eligieron el umbral de confianza y qué pasa si está mal elegido?
El umbral se fijó considerando qué error es más costoso en este contexto. Un umbral bajo hace que el sistema responda casi siempre, pero con más diagnósticos equivocados que el usuario no puede detectar; uno alto rechaza más fotos, pero los resultados que muestra son más confiables. En agronomía, decirle a alguien que su planta está sana cuando no lo está puede costar la cosecha, mientras que pedir otra foto cuesta unos segundos, así que privilegiamos la prudencia.

Para que el umbral tenga sentido calibramos las probabilidades con fotos de campo reservadas. Si el umbral resultara mal elegido, se puede ajustar en la API sin modificar la aplicación, porque la app solo lee el valor `confiable`.
! Decir que el umbral "se eligió porque es un número estándar".
:::

## Para profundizar

- `cropeye-ia/nucleo.py`: el método `analizar`, con el filtro, la restricción por cultivo y el cálculo de `confiable`.
- `cropeye-ia/filtro.py`: cómo se entrenó el filtro de hoja.
- `cropeye-app/lib/screens/analisis_screen.dart`: el aviso "CropEye no está seguro".
