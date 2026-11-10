# Cierre: preguntas de la comisión

Esta última parte puso el sistema en movimiento: el contrato entre las piezas, los dos recorridos de un análisis, el manejo de errores y la privacidad. Son los temas donde una comisión comprueba si el equipo entiende el sistema como un todo y no solo sus partes. Estas preguntas son también un buen ensayo general para la defensa completa: respóndelas en voz alta, sin mirar las lecciones.

:::comision
? ¿Qué es el contrato entre la App y la API de IA y por qué es tan importante?
Es el acuerdo explícito sobre el intercambio: la App envía un formulario multiparte a `/analisis` con la foto y, opcionalmente, el cultivo, y la API responde con un JSON de campos fijos, como la clase, el nombre, la confianza, el valor `confiable` y el mapa de calor, o con códigos de error acordados. Es importante porque las piezas no comparten código: mientras el contrato se respete, el equipo de IA puede cambiar el modelo sin tocar la App. Por eso los campos nuevos se agregan como opcionales y la App los lee de forma tolerante.
! Describir el contrato como "la documentación" sin mencionar que está verificado con pruebas.
:::

:::comision
? ¿En qué se diferencian el recorrido directo y el recorrido con cuenta?
El directo es una sola llamada de la App a la API de IA, que responde en menos de un segundo; el resultado queda solo en el teléfono. El recorrido con cuenta pasa por el Backend y es asíncrono: se crea el análisis, la foto se sube a una URL firmada, se envía a procesar, la App consulta el estado hasta que termina y luego pide el resultado. A cambio, el análisis queda asociado al usuario en el servidor y registrado en la auditoría. Para el usuario la experiencia es la misma, porque el cliente convierte ambos resultados al mismo modelo.
! Decir que el recorrido con cuenta es asíncrono porque la IA es lenta.
:::

:::comision
? ¿Qué es una URL firmada y por qué la usan?
Es una dirección temporal de un servicio de almacenamiento que incluye una firma criptográfica y autoriza una sola operación, como subir un archivo, durante un tiempo limitado. La usamos para que las fotos, que son lo más pesado, vayan directamente al almacenamiento sin pasar por el servidor del Backend. La firma impide usarla para otra cosa y su vencimiento limita el daño si se filtra.
! Confundirla con un token de sesión del usuario.
:::

:::comision
? Si algo falla durante un análisis, ¿qué ve el usuario?
Un mensaje comprensible con una acción posible, nunca una pantalla que carga para siempre. La App convierte cualquier fallo, sea del teléfono, de la red, de la API o del servidor, en un tipo de error propio con un título y un mensaje en lenguaje simple. Si el problema no depende de la foto, como una conexión caída, ofrece reintentar; si depende de la foto, como "no parece una hoja", pide tomar otra. Además hay una red de seguridad para errores no previstos.
! Responder que los errores "no deberían ocurrir".
:::

:::comision
? ¿Qué datos personales maneja el sistema y cómo los protege?
La App maneja fotos, sus metadatos, la comuna del clima y el historial del huerto; el Backend, los datos de la cuenta, la IP en la auditoría y los análisis por usuario; la API de IA no guarda nada. Protegemos esos datos con minimización, como el uso sin cuenta, el historial en el teléfono y la comuna redondeada en lugar del GPS; con la eliminación de la ubicación de las fotos; con un consentimiento informado y revocable para "¿Acertó?"; y, en el Backend, con contraseñas en hash, tokens revocables y auditoría. Las medidas siguen los principios de la Ley 19.628 y de la Ley 21.719, sin presentarlas como una certificación de cumplimiento.
! Decir que "no manejamos datos personales" porque son fotos de plantas.
:::

:::comision
? Si tuvieran seis meses más, ¿qué mejorarían primero y por qué?
Una respuesta sólida prioriza según el problema de la Parte 1 y los límites que reconocimos. Primero, ampliar y validar el modelo con fotos de campo reales, aprovechando las respuestas de "¿Acertó?", porque la precisión en campo es lo que más importa al usuario. Segundo, completar el recorrido con cuenta en un entorno con almacenamiento de archivos real y guardar los tokens en el almacenamiento seguro del teléfono. Tercero, explorar un modelo más pequeño que pueda correr en el teléfono, para analizar sin conexión en el huerto.
! Proponer funciones nuevas sin relacionarlas con los límites que el propio equipo reconoció.
:::
