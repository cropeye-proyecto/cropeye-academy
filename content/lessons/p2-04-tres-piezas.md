# El sistema en tres piezas: App, Backend y API de IA

En la lección anterior recorrimos un análisis como una secuencia de pasos, sin preguntarnos dónde ocurre cada uno. Ahora damos ese paso. CropEye no es un programa único, sino tres programas que viven en lugares distintos y que se comunican entre sí. Entender qué responsabilidad tiene cada pieza, y por qué el sistema se dividió de esa manera, es la base para todo lo que viene en las Partes 3 y 4.

:::objetivos
- nombrar las tres piezas del sistema, el repositorio de cada una y su tecnología;
- explicar la responsabilidad de cada pieza y lo que deliberadamente no hace;
- describir los dos caminos que puede seguir un análisis: el directo y el que pasa por una cuenta;
- argumentar las ventajas y los costos de separar el sistema en piezas.
:::

## Una visión de conjunto

![Las tres piezas de CropEye y sus dos caminos](assets/diagramas/p2-tres-piezas.svg)

El diagrama muestra las tres piezas y las flechas que las conectan. A la izquierda está la **App**, la aplicación móvil que la persona instala en su teléfono. A la derecha está la **API de IA**, el servicio que contiene el modelo de inteligencia artificial. En el medio está el **Backend**, el servidor que maneja cuentas de usuario, guarda los análisis en una base de datos y registra lo que ocurre en el sistema.

Hay dos caminos para llegar de la App a la API de IA. En el camino directo, la App envía la foto a la API de IA y recibe el resultado de inmediato. En el camino con cuenta, la App habla con el Backend, que guarda la foto, encarga el análisis a la API de IA y conserva el resultado asociado al usuario. Volveremos sobre estos dos caminos al final de la lección.

## La App: la cara del sistema

La App está escrita en Flutter, el framework de Google para aplicaciones móviles, y su código vive en el repositorio `cropeye-app`. Es la única pieza que el usuario ve, y por eso concentra todo lo relacionado con la experiencia: la cámara con su marco guía, el selector de cultivo, la pantalla de resultado, el historial, Mi huerto, las fichas de manejo, las cosechas, el diseño del huerto y el aviso de clima.

Además de mostrar, la App hace trabajo real. Prepara cada foto antes de enviarla, convirtiéndola a JPEG, reduciendo su tamaño y eliminando sus metadatos. Guarda en el teléfono el historial de análisis, las plantas y las cosechas, usando una técnica de escritura que evita perder datos si la app se cierra a mitad de una operación. Y traduce cualquier error técnico, como una conexión caída o una respuesta inesperada del servidor, en un mensaje que una persona sin conocimientos técnicos pueda entender.

Lo que la App no hace es diagnosticar. No contiene ningún modelo de inteligencia artificial. Esta decisión no es un detalle: el modelo actual pesa más de un gigabyte y necesita una tarjeta gráfica para responder en un tiempo razonable, algo que un celular común no puede ofrecer.

## La API de IA: el especialista

La API de IA está escrita en Python con el framework FastAPI y su código vive en el repositorio `cropeye-ia`. Es, conceptualmente, el especialista del sistema: recibe una foto y, opcionalmente, el cultivo, y responde con un diagnóstico.

Su responsabilidad es estrecha y bien definida. Revisa que el archivo sea una imagen válida y no supere el tamaño máximo, pasa la foto por el filtro que decide si es una hoja, ejecuta el modelo principal, calcula la confianza, decide si el resultado es confiable y genera el mapa de calor. Todo eso lo devuelve en una sola respuesta, en un formato acordado que estudiaremos en detalle en la Parte 4.

Igual de importante es lo que la API de IA no hace. No sabe quién es el usuario, no guarda las fotos, no conserva un historial ni tiene una base de datos. Cada petición se atiende de forma independiente: llega una foto, sale un diagnóstico y la API olvida lo ocurrido. Esta simplicidad tiene una ventaja enorme: el equipo que trabaja en el modelo puede reentrenarlo, cambiarlo por una versión nueva o moverlo a otro servidor sin afectar al resto del sistema, siempre que respete el formato de la respuesta.

## El Backend: la memoria y la identidad

El Backend está escrito en Python con FastAPI, usa una base de datos relacional y su código vive en el repositorio `cropeye-api`. Su responsabilidad es todo aquello que requiere memoria o identidad.

Maneja las cuentas de usuario: registro, inicio de sesión y verificación de que cada petición viene de alguien autorizado. Guarda en su base de datos los análisis de cada usuario, con su imagen, el modelo que se usó, la enfermedad detectada y las alternativas. Mantiene un catálogo de cultivos y enfermedades. Y lleva un registro de auditoría de los eventos importantes, como inicios de sesión o análisis creados.

Cuando un usuario con cuenta pide un análisis, el Backend no diagnostica: encarga ese trabajo a la API de IA mediante una llamada interna y, cuando recibe el resultado, lo guarda y se lo entrega a la App. En ese sentido, el Backend es un intermediario que agrega memoria e identidad a un servicio que, por diseño, no tiene ninguna de las dos.

:::note
Los nombres de los repositorios pueden confundir. `cropeye-api` es el Backend, mientras que la "API de IA" vive en `cropeye-ia`. En una defensa conviene hablar de las piezas por su función, no por el nombre del repositorio.
:::

## Dos caminos y por qué existen

Volvamos ahora a los dos caminos del diagrama. El camino directo, de la App a la API de IA, es el más simple: no requiere cuenta, responde en una sola llamada y es el que usa la App por defecto. Su costo es que el análisis solo queda guardado en el teléfono; si la persona cambia de equipo, pierde su historial.

El camino con cuenta pasa por el Backend. Requiere iniciar sesión y es más complejo, porque el análisis se procesa en varias etapas que la App debe seguir. A cambio, el análisis queda asociado al usuario en el servidor, puede consultarse desde otro teléfono y queda registrado para auditoría.

Que existan los dos caminos no es una indecisión, sino una consecuencia de las responsabilidades que acabamos de describir. La API de IA está diseñada para ser simple y sin estado; el Backend agrega lo que falta para un uso con identidad. La App permite elegir: por defecto usa el camino directo, y el usuario puede activar en su perfil la opción de analizar con su cuenta.

:::warning
Separar en piezas tiene costos. Hay que mantener un formato de comunicación estable entre ellas, cada pieza puede fallar por separado y el sistema completo es más difícil de levantar en un computador de desarrollo. Una comisión puede preguntar por qué no se hizo todo en un solo servidor, y la respuesta debe reconocer estos costos.
:::

:::autoevaluacion
? ¿Qué pieza contiene el modelo de inteligencia artificial y en qué repositorio vive?
= La API de IA, en el repositorio `cropeye-ia`. → #la-api-de-ia-el-especialista
? Nombra dos cosas que hace la App además de mostrar pantallas.
= Prepara la foto (JPEG, tamaño, sin metadatos), guarda el historial, las plantas y las cosechas en el teléfono, y traduce errores técnicos en mensajes comprensibles. → #la-app-la-cara-del-sistema
? ¿Por qué se dice que la API de IA no tiene estado?
= Porque no sabe quién es el usuario ni guarda fotos o historial: atiende cada petición de forma independiente. → #la-api-de-ia-el-especialista
? ¿Qué gana y qué pierde el usuario al usar el camino con cuenta?
= Gana un historial en el servidor, accesible desde otro teléfono y registrado; pierde simplicidad, porque necesita iniciar sesión y el análisis pasa por varias etapas. → #dos-caminos-y-por-que-existen
:::

:::comision
? ¿Por qué separaron el sistema en tres piezas en lugar de hacer un solo servidor?
Porque cada pieza tiene una responsabilidad distinta y cambia a un ritmo distinto. El modelo de IA se reentrena y se reemplaza con frecuencia, y conviene que esos cambios no afecten las cuentas de usuario ni la base de datos. Al mantener la API de IA sin estado y con un formato de respuesta estable, podemos cambiar el modelo sin tocar el Backend ni la App. El Backend, por su parte, concentra la identidad y la persistencia, que requieren otras garantías, como contraseñas protegidas y auditoría.

El costo es que hay que mantener los formatos de comunicación y que el sistema tiene más puntos de falla, algo que abordamos con manejo explícito de errores en la App y con reintentos en el Backend.
! Decir que "así se hace en la industria" sin explicar las razones propias del proyecto.
:::

## Para profundizar

- `cropeye-ia/api.py` y `cropeye-ia/nucleo.py`: la API de IA y el análisis de una foto.
- `cropeye-api/app/main.py` y `cropeye-api/app/routers/`: las rutas del Backend.
- `cropeye-app/INTEGRACION_API.md`: cómo la App se conecta con ambas piezas.
