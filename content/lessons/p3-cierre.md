# Cierre: preguntas de la comisión

Esta parte recorrió cada pieza por dentro: el modelo de inteligencia artificial y sus barreras, la app con su forma de capturar, enviar y guardar, el backend con su modelo de datos y su seguridad, y las funciones de huerto. Es la parte donde una comisión con formación técnica suele detenerse más. Responde estas preguntas en voz alta, con ejemplos del código cuando sea posible.

:::comision
? ¿Por qué la exactitud en PlantVillage no es una buena medida del desempeño de CropEye?
Porque PlantVillage son fotos de laboratorio, con la hoja sola sobre un fondo uniforme, muy parecidas a las del entrenamiento. Nuestra primera versión acertaba casi siempre con esas fotos y muy poco con fotos de campo, porque había aprendido atajos como el fondo. Por eso la medida que defendemos es la de fotos de campo que el modelo nunca vio, y por eso usamos modelos preentrenados más robustos combinados en un conjunto.
! Citar la exactitud de PlantVillage como resultado principal.
:::

:::comision
? Explique las barreras que impiden que el sistema dé un diagnóstico sin fundamento.
Hay tres. Primero, un filtro de hoja, un modelo pequeño que rechaza fotos que no son hojas de un cultivo conocido. Segundo, la salida "Otra" del modelo principal, que reconoce hojas con algo fuera de su catálogo. Tercero, el umbral de confianza: si la probabilidad de la clase ganadora es baja, el resultado se marca como no confiable. "Otra" y el umbral se combinan en el campo `confiable`, y la app solo muestra fichas de manejo cuando es verdadero.
! Mencionar solo el umbral y olvidar el filtro y la salida "Otra".
:::

:::comision
? ¿Qué muestra el mapa de calor y qué no demuestra?
Muestra en qué zonas de la foto la decisión del modelo es más sensible, calculado con los gradientes de la clase elegida. Sirve para que el usuario contraste el resultado con lo que ve y para que el equipo detecte si el modelo mira el fondo. No demuestra que el diagnóstico sea correcto, porque el modelo puede mirar las lesiones correctas y confundir enfermedades parecidas, y no sirve para medir severidad por su baja resolución.
! Decir que el mapa de calor "prueba" el diagnóstico.
:::

:::comision
? ¿Cómo garantiza la app que los datos guardados en el teléfono no se corrompan?
Con escritura atómica. Nunca escribe directamente en el destino: escribe en un archivo o carpeta temporal y, al terminar, lo renombra al nombre definitivo, operación que el sistema de archivos hace de una sola vez. Si la app se cierra a mitad de camino, queda solo un temporal que los listados ignoran. Hay pruebas automáticas que simulan carpetas a medio escribir.
! Responder que "Flutter se encarga" o que "es poco probable que pase".
:::

:::comision
? ¿Cómo se protegen las contraseñas y por qué usan dos tokens?
Las contraseñas se guardan como hash bcrypt, que no permite recuperarlas y encarece la fuerza bruta, y las cuentas se bloquean tras cinco intentos fallidos en quince minutos. Tras iniciar sesión, la app recibe un access token firmado de quince minutos, que viaja en cada petición, y un refresh token de siete días, guardado solo como hash y revocable al cerrar sesión. Así, robar el token que viaja tiene un daño acotado y la sesión se puede cerrar de verdad.
! Decir que las contraseñas "se encriptan".
:::

:::comision
? ¿Por qué el contenido agronómico está en archivos JSON y no en el código?
Para separar el trabajo de investigación del trabajo de programación y para obligar a que cada dato tenga fuente: el archivo define las publicaciones y cada ficha o distancia apunta a una. Se puede corregir el contenido sin tocar la lógica, y una prueba automática impide que una ficha nombre productos o dosis.
! Decir que "es más ordenado" sin mencionar las fuentes ni la restricción de productos.
:::
