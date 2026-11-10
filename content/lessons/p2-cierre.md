# Cierre: preguntas de la comisión

Esta parte presentó la solución: una aplicación que diagnostica desde la foto de una hoja, un sistema de tres piezas que lo hace posible y un conjunto de funciones que acompañan el huerto durante la temporada. Las preguntas siguientes ponen a prueba si puedes explicar y defender esas decisiones. Respóndelas en voz alta antes de abrir la respuesta modelo.

:::comision
? Describa el recorrido de un análisis, desde la foto hasta el resultado.
La persona toma la foto con un marco guía y, si sabe, indica el cultivo. La app prepara la foto como JPEG reducido y sin metadatos, y la envía al servidor de IA. Allí un filtro revisa si es una hoja de un cultivo conocido; si lo es, el modelo estima la probabilidad de cada enfermedad, elige la más probable, calcula su confianza y genera un mapa de calor. La app muestra el resultado; si es confiable, agrega la ficha de manejo con fuente, y si no, avisa que no está segura y recomienda otra foto o un especialista.
! Saltarse el filtro o la confianza, que son las decisiones que más distinguen al proyecto.
:::

:::comision
? ¿Cuál es la responsabilidad de cada una de las tres piezas?
La App es la cara del sistema: captura, prepara la foto, muestra resultados y guarda el historial y el huerto en el teléfono. La API de IA es el especialista: filtra, clasifica, mide la confianza y genera el mapa de calor, sin saber quién es el usuario ni guardar nada. El Backend aporta identidad y memoria: cuentas, base de datos de análisis, catálogo y auditoría, y encarga los diagnósticos a la API de IA.
! Confundir los repositorios: `cropeye-api` es el Backend y la API de IA está en `cropeye-ia`.
:::

:::comision
? ¿Por qué el modelo no corre directamente en el celular?
Porque el modelo actual es demasiado grande y exigente: combina varios modelos de visión de gran tamaño y necesita una tarjeta gráfica para responder en un tiempo razonable. Llevarlo al teléfono requeriría modelos más pequeños y comprimidos, con una posible pérdida de precisión. Lo dejamos como trabajo futuro y aceptamos, por ahora, que el análisis requiere conexión a internet.
! Decir que "no se puede" sin explicar el compromiso entre tamaño y precisión.
:::

:::comision
? ¿Qué pasa si la persona fotografía algo que no es una hoja, o una enfermedad que el modelo no conoce?
Si no es una hoja, el filtro la rechaza y la app pide otra foto. Si es una hoja con una enfermedad desconocida, el modelo tiende a dar una confianza baja o a elegir la salida "Otra"; en ambos casos el resultado se marca como no confirmado, no se sugiere tratamiento y se recomienda consultar a un especialista. El sistema no elimina los errores, pero los hace visibles en lugar de esconderlos.
! Afirmar que el modelo "detecta cualquier enfermedad".
:::

:::comision
? ¿Por qué los datos del huerto se guardan en el teléfono y no en un servidor?
Porque así la app funciona sin cuenta, no expone información de los huertos de las personas y recolecta solo lo necesario. El costo es que esos datos se pierden si se desinstala la app, algo que la interfaz comunica explícitamente. Quien quiera conservar sus análisis puede crear una cuenta y analizar a través del Backend.
! Presentar el almacenamiento local como una limitación técnica en vez de una decisión.
:::
