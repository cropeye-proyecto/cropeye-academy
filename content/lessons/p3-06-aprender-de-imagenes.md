# El modelo: aprender de imágenes

Con esta lección entramos en la Parte 3, donde estudiaremos cada pieza por dentro. Empezamos por el componente que más curiosidad despierta y que más se presta a malentendidos: el modelo de inteligencia artificial. No necesitamos dominar las matemáticas del aprendizaje profundo para explicarlo bien; necesitamos entender qué aprende un modelo, de dónde lo aprende y por qué la procedencia de las imágenes es la decisión más importante de todas. Esa comprensión es la que permite responder con solvencia cuando una comisión pregunta por la precisión del sistema.

:::objetivos
- explicar en términos simples qué aprende un clasificador de imágenes;
- distinguir entre datos de laboratorio y datos de campo, y explicar por qué esa diferencia importa;
- describir qué es un modelo preentrenado y por qué CropEye parte de modelos existentes;
- argumentar por qué el modelo actual combina varios modelos en lugar de usar uno solo.
:::

## Qué aprende un clasificador

Un clasificador de imágenes es un programa que recibe una foto y devuelve, para cada una de las categorías que conoce, un número entre cero y uno que se interpreta como probabilidad. En CropEye esas categorías son las enfermedades de tomate y papa con las que se entrenó el modelo, más las categorías de hoja sana de cada cultivo. La categoría con el número más alto es la respuesta.

Nadie le escribe a ese programa reglas del tipo "si hay manchas con anillos concéntricos, es tizón temprano". En lugar de eso, se le muestran miles de fotos etiquetadas, y durante el entrenamiento el programa ajusta millones de parámetros internos hasta que sus respuestas coinciden, la mayoría de las veces, con las etiquetas. El resultado es un modelo que ha aprendido a reconocer patrones visuales asociados a cada categoría.

La palabra clave en esa descripción es *asociados*. El modelo no aprende qué es una enfermedad; aprende qué rasgos de las imágenes de entrenamiento acompañan a cada etiqueta. Si en las fotos de una enfermedad aparece siempre un fondo gris, el modelo puede aprender que "fondo gris" es parte del patrón. Esta propiedad explica casi todos los problemas que encontró el proyecto, y también casi todas sus decisiones.

## Laboratorio frente a campo

La fuente de imágenes más usada en investigación sobre enfermedades de plantas es PlantVillage, un conjunto público con decenas de miles de fotos de hojas. Es un recurso valioso: está bien etiquetado, cubre muchas enfermedades y es de libre uso. Pero sus fotos se tomaron en condiciones de laboratorio: una hoja arrancada, sobre un fondo uniforme, con luz controlada y sin otras hojas alrededor.

Una foto tomada con un celular en un huerto se ve muy distinta. Tiene sombras, otras hojas detrás, tierra, mallas, reflejos, un encuadre imperfecto y la iluminación que había esa mañana. Para un modelo entrenado solo con fotos de laboratorio, esas fotos son, literalmente, otro mundo.

![Fotos de laboratorio frente a fotos de campo](assets/diagramas/p3-laboratorio-vs-campo.svg)

La primera versión del modelo de CropEye ilustró este problema de forma contundente. Entrenada con fotos de laboratorio, alcanzaba cerca de un 95 % de aciertos al evaluarla con más fotos de laboratorio, pero al probarla con fotos de campo su exactitud caía a menos de un 15 %. No había un error en el código: el modelo había aprendido los atajos del laboratorio, como el fondo limpio, y esos atajos no existen en un huerto.

A este fenómeno se le llama cambio de distribución, y es la razón por la que el proyecto separa con mucho cuidado dos preguntas que parecen iguales: cuánto acierta el modelo con fotos parecidas a las de su entrenamiento, y cuánto acierta con fotos parecidas a las de su uso real. Solo la segunda importa para el usuario.

:::warning
Una cifra de precisión sin decir con qué fotos se midió no significa nada. Cuando presentes resultados, indica siempre si son fotos de laboratorio o de campo, y prefiere las de campo, aunque sean menos favorables.
:::

## Partir de modelos que ya saben ver

Entrenar un modelo de visión desde cero requiere millones de imágenes y mucho cómputo. Ningún proyecto de tesis tiene esos recursos, y tampoco hace falta. La práctica habitual es partir de un modelo preentrenado: un modelo que otro equipo ya entrenó con una enorme cantidad de imágenes generales, y que por lo tanto ya sabe reconocer bordes, texturas, formas y colores.

Sobre ese modelo se hace un ajuste fino, que consiste en seguir entrenándolo, ahora con las imágenes de hojas enfermas, para que especialice lo que ya sabe ver en la tarea concreta de CropEye. La ventaja es doble: se necesitan muchas menos imágenes y el modelo resultante generaliza mejor, porque su conocimiento visual de base proviene de una variedad de fotos mucho mayor que la que el proyecto podría reunir.

CropEye usa como base modelos preentrenados de distinta procedencia. Uno es DINOv2, entrenado por Meta con imágenes generales. Otro es BioCLIP 2, entrenado específicamente con imágenes de seres vivos y sus nombres científicos. El tercero es un modelo del concurso PlantCLEF, entrenado con fotos de plantas de la plataforma Pl@ntNet. Cada uno trae una forma distinta de "ver", y eso es justamente lo que se aprovecha.

## Por qué combinar varios modelos

El modelo actual de CropEye no es un modelo único, sino un conjunto de tres: cada uno de los modelos de base, ajustado con las imágenes del proyecto, produce su propia distribución de probabilidades, y el sistema las promedia.

```python cropeye-ia/modelo_v4.py
# Tres fundacionales afinados (DINOv2-L, BioCLIP 2 y PlantCLEF ViT-B)
# combinados promediando sus probabilidades. 14 salidas: las 13 clases
# + "Otra" (índice 13).
```

La idea de fondo es sencilla y tiene una larga tradición: modelos distintos tienden a equivocarse en fotos distintas. Si uno de ellos se confunde con una sombra, es probable que los otros dos no, y el promedio corrige parte del error. El conjunto resulta más estable que cualquiera de sus miembros por separado, en especial frente a las fotos de campo que tanto le costaban a las primeras versiones.

Notemos en el comentario del código un detalle que estudiaremos en la próxima lección: además de las enfermedades conocidas, el modelo tiene una salida llamada "Otra". Es la forma que tiene el sistema de decir que lo que ve no corresponde a ninguna de sus categorías.

El costo de combinar modelos es real. Hay que cargar tres modelos en memoria, lo que explica que el sistema necesite una tarjeta gráfica y no pueda correr en un celular, y hay que mantener tres modelos en lugar de uno. El proyecto aceptó ese costo porque la mejora en las fotos de campo era la que justificaba todo el esfuerzo.

:::note
El modelo de IA puede cambiar sin que el resto del sistema lo note. Mientras respete el formato de la respuesta, el equipo puede reemplazar el conjunto de tres modelos por una versión nueva, incluso con más cultivos, sin tocar la App ni el Backend.
:::

:::autoevaluacion
? ¿Qué aprende realmente un clasificador durante el entrenamiento?
= Aprende qué rasgos visuales de las imágenes de entrenamiento acompañan a cada etiqueta, no qué es una enfermedad; por eso puede aprender atajos como el color del fondo. → #que-aprende-un-clasificador
? ¿Qué es el cambio de distribución y cómo se manifestó en CropEye?
= Es la diferencia entre las fotos de entrenamiento y las de uso real. La primera versión acertaba casi siempre con fotos de laboratorio, pero muy poco con fotos de campo. → #laboratorio-frente-a-campo
? ¿Por qué el proyecto parte de modelos preentrenados?
= Porque ya saben reconocer rasgos visuales generales; ajustarlos requiere muchas menos imágenes y generaliza mejor que entrenar desde cero. → #partir-de-modelos-que-ya-saben-ver
? ¿Qué gana y qué cuesta combinar tres modelos?
= Gana estabilidad, porque los modelos se equivocan en fotos distintas y el promedio corrige errores; cuesta más memoria, una tarjeta gráfica y más mantenimiento. → #por-que-combinar-varios-modelos
:::

:::comision
? Su modelo alcanza una precisión muy alta en PlantVillage. ¿Por qué deberíamos creer que funciona en un huerto real?
No pedimos que se crea por la cifra de PlantVillage; de hecho, esa cifra es engañosa, porque son fotos de laboratorio parecidas a las del entrenamiento. Nuestra primera versión acertaba casi siempre con esas fotos y muy poco con fotos de campo, y esa diferencia guió todo el proyecto. Por eso evaluamos con fotos de campo que el modelo nunca vio, elegimos modelos de base más robustos, los combinamos, y diseñamos el sistema para rechazar fotos que no son hojas y avisar cuando no está seguro. La métrica que defendemos es la de campo, con su conjunto de prueba identificado.
! Defender el modelo citando la exactitud en PlantVillage.
:::

## Para profundizar

- `cropeye-ia/modelo_v4.py`: cómo se cargan y combinan los tres modelos.
- `cropeye-ia/conjunto_v4.py`: el promedio de probabilidades y su calibración.
- `cropeye-ia/docs/v4/`: el plan y los reportes de la versión 4.
