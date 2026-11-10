# Explicar la predicción: Grad-CAM

Un diagnóstico que no se puede explicar es difícil de creer y todavía más difícil de defender. Cuando CropEye responde "tizón temprano", la persona tiene derecho a preguntarse en qué se basó el sistema, y una comisión tiene derecho a preguntar cómo sabemos que el modelo mira la hoja y no el fondo. Esta lección estudia la herramienta que usa CropEye para mostrar en qué zonas de la foto se fijó el modelo, cómo se calcula a grandes rasgos, cómo se lee y, sobre todo, qué no demuestra.

:::objetivos
- explicar qué muestra un mapa de calor Grad-CAM y para qué lo usa CropEye;
- describir en términos simples cómo se calcula a partir del modelo;
- leer correctamente un mapa de calor y reconocer las señales de que algo anda mal;
- explicar los límites de Grad-CAM como explicación.
:::

## Para qué sirve explicar

Los modelos de aprendizaje profundo son, en buena medida, cajas negras: millones de parámetros cuya combinación produce una respuesta sin que podamos leer una regla. Para un sistema que acompaña decisiones agronómicas esto plantea dos problemas. El primero es de confianza: una persona que ve un diagnóstico sin ninguna justificación no tiene cómo evaluarlo. El segundo es de control de calidad: el equipo necesita alguna forma de comprobar que el modelo aprendió a mirar las lesiones y no un atajo, como el color del fondo que vimos en la lección 6.

Grad-CAM, sigla en inglés de mapa de activación de clase ponderado por gradientes, es una técnica muy usada para abordar ambos problemas. Produce una imagen del mismo tamaño que la foto en la que las zonas que más influyeron en la decisión aparecen en colores cálidos, rojo y amarillo, y las que menos influyeron en colores fríos, azul. La app la muestra junto a la foto original con un control deslizante, para que la persona pueda comparar ambas.

## Cómo se calcula, sin matemáticas

Para entender Grad-CAM conviene recordar cómo procesa una imagen un modelo de visión. La imagen atraviesa una serie de capas; las primeras detectan rasgos simples, como bordes y colores, y las últimas combinan esos rasgos en patrones complejos, como "mancha con anillos". En las capas finales, cada zona de la imagen está representada por un conjunto de números que describen qué patrones se encontraron en ella.

Grad-CAM hace una pregunta concreta a esas capas finales: si la evidencia de una zona aumentara un poco, ¿cuánto subiría la probabilidad de la enfermedad que el modelo eligió? Esa pregunta se responde con los gradientes, la misma herramienta matemática que se usa para entrenar el modelo. Las zonas donde un pequeño cambio aumentaría mucho la probabilidad de la enfermedad elegida son las que más pesaron en la decisión.

![Cómo se construye el mapa de calor](assets/diagramas/p3-gradcam.svg)

```python cropeye-ia/gradcam.py
with tf.GradientTape() as tape:
    mapas, probs = sub(x, training=False)
    puntaje = tf.gather(probs[0], tf.argmax(probs[0]))
grads = tape.gradient(puntaje, mapas)
pesos = tf.reduce_mean(grads, axis=(0, 1, 2))
cam = tf.nn.relu(tf.reduce_sum(mapas[0] * pesos, axis=-1))
cam = cam / (tf.reduce_max(cam) + 1e-8)
```

El fragmento, de la versión del modelo basada en redes convolucionales, sigue exactamente esos pasos. Calcula la probabilidad de la clase ganadora, obtiene sus gradientes respecto de los mapas de la última capa, promedia esos gradientes para saber cuánto importa cada patrón, suma los mapas ponderados por esa importancia y se queda solo con las contribuciones positivas. Finalmente normaliza el resultado entre cero y uno y lo superpone en colores sobre la foto.

Para los modelos del conjunto actual, que son de un tipo distinto llamado transformadores de visión, la idea es la misma pero se aplica sobre los fragmentos en que el modelo divide la imagen, en un bloque intermedio de la red. Los detalles cambian; el principio, no.

## Cómo leer un mapa de calor

Un mapa de calor bien comportado concentra los colores cálidos sobre las lesiones: las manchas, los bordes necróticos, las zonas con moho. Cuando la persona desliza el control y ve que el rojo coincide con las manchas que ella misma notó, el diagnóstico gana credibilidad. Ese es el uso cotidiano.

Para el equipo, el mapa de calor es además una herramienta de diagnóstico del propio modelo. Hay señales que conviene reconocer. Si el calor se concentra en el fondo, en el borde de la foto o en un objeto ajeno a la hoja, el modelo probablemente está usando un atajo. Si el calor se reparte de forma difusa por toda la imagen, la decisión no se apoya en una zona concreta, algo frecuente cuando la confianza es baja. Si el calor cae sobre la nervadura sana mientras las manchas quedan en azul, conviene desconfiar del resultado aunque la confianza sea alta.

:::note
El mapa de calor se calcula sobre el cuadrado central de la foto, que es lo que el modelo realmente analiza. Por eso la app recorta la foto original de la misma forma al mostrar el comparador: así las dos imágenes coinciden zona por zona.
:::

## Lo que Grad-CAM no demuestra

Es tentador presentar el mapa de calor como "la razón" del diagnóstico. Sería una exageración, y una comisión atenta lo notará. Grad-CAM muestra dónde la evidencia de la clase elegida es más sensible, no por qué el modelo la eligió ni si la elección es correcta. Un modelo puede mirar exactamente las lesiones correctas y aun así confundir dos enfermedades que producen lesiones parecidas.

Además, el mapa tiene una resolución gruesa. Se calcula en una capa profunda donde la imagen está representada por una grilla pequeña, y luego se amplía al tamaño de la foto, por lo que sus bordes son suaves y no delimitan con precisión cada mancha. No sirve para medir el área afectada ni la severidad de la enfermedad.

Por último, el mapa explica la clase ganadora y nada más. Cuando el resultado no es confiable, el mapa sigue mostrando dónde se fijó el modelo para su mejor apuesta, pero esa apuesta puede estar equivocada. Por eso la app nunca usa el mapa como argumento para sugerir un tratamiento: la decisión de mostrar una ficha depende solo del valor `confiable`.

:::warning
Nunca digas que el mapa de calor "prueba" que el diagnóstico es correcto. Lo correcto es decir que permite verificar que el modelo se apoya en la hoja y no en el fondo, y que ayuda a la persona a contrastar el resultado con lo que ella misma ve.
:::

:::autoevaluacion
? ¿Qué dos problemas ayuda a resolver Grad-CAM en CropEye?
= La confianza del usuario, que puede ver en qué zonas se fijó el modelo, y el control de calidad del equipo, que puede detectar si el modelo usa atajos como el fondo. → #para-que-sirve-explicar
? En palabras simples, ¿qué pregunta responde Grad-CAM sobre cada zona de la imagen?
= Cuánto subiría la probabilidad de la enfermedad elegida si la evidencia de esa zona aumentara un poco. → #como-se-calcula-sin-matematicas
? Nombra dos señales de que un mapa de calor indica un problema.
= Calor concentrado en el fondo o en objetos ajenos a la hoja; calor difuso por toda la imagen; calor sobre tejido sano mientras las manchas quedan en azul. → #como-leer-un-mapa-de-calor
? ¿Por qué Grad-CAM no sirve para medir la severidad?
= Porque tiene una resolución gruesa: se calcula en una grilla pequeña y se amplía, así que no delimita con precisión las manchas. → #lo-que-grad-cam-no-demuestra
:::

:::comision
? ¿Cómo sabemos que el modelo mira la enfermedad y no el fondo de la foto?
Grad-CAM nos permite revisarlo: muestra en qué zonas la decisión es más sensible, y en las fotos de campo que revisamos el calor se concentra en las lesiones y no en el fondo. Esa revisión fue importante porque nuestra primera versión sí aprendía atajos del laboratorio. Ahora bien, el mapa no prueba que el diagnóstico sea correcto: un modelo puede mirar las lesiones correctas y confundir dos enfermedades parecidas. Por eso lo combinamos con una evaluación en fotos de campo que el modelo nunca vio y con el umbral de confianza.
! Afirmar que el mapa de calor demuestra que el diagnóstico es correcto.
:::

## Para profundizar

- `cropeye-ia/gradcam.py`: el cálculo para redes convolucionales y la superposición en colores.
- `cropeye-ia/mapa_calor_vit.py`: la misma idea aplicada a los transformadores de visión del conjunto actual.
- `cropeye-app/lib/widgets/comparador.dart`: el control deslizante que compara la foto con el mapa.
