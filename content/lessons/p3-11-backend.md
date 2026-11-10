# El backend: usuarios, tokens y base de datos

La API de IA no sabe quién la llama ni recuerda nada de lo que respondió. Para que CropEye pueda tener cuentas de usuario, un historial en el servidor y un registro de lo que ocurre en el sistema, hace falta otra pieza: el Backend. Esta lección estudia sus tres responsabilidades centrales, que son también las preguntas que una comisión con formación en ingeniería suele hacer sobre cualquier servidor: cómo se modelan los datos, cómo se sabe quién es cada usuario y cómo se protege lo que se guarda.

:::objetivos
- describir las entidades principales del modelo de datos y cómo se relacionan;
- explicar cómo se guardan las contraseñas y por qué nunca se guardan en texto plano;
- explicar el funcionamiento del access token y del refresh token, y por qué se usan dos;
- describir qué registra la auditoría y para qué sirve.
:::

## Un modelo de datos en once tablas

El Backend guarda su información en una base de datos relacional organizada en once tablas. No es necesario memorizarlas todas, pero sí entender los cuatro grupos que forman.

El primer grupo es la identidad: la tabla `usuario`, con el nombre, el correo, la contraseña protegida, el estado de la cuenta y la fecha del último acceso; la tabla `rol`, que distingue a un usuario común de un administrador; y la tabla `token_sesion`, que guarda las sesiones activas. El segundo grupo es el catálogo: `cultivo` y `enfermedad`, con los nombres, síntomas y recomendaciones de cada enfermedad, y `modelo_ia`, con las versiones del modelo, sus métricas y cuál está activo. El tercer grupo es el análisis propiamente tal: `analisis` registra cada solicitud con su estado y su fecha; `imagen` describe la foto subida, incluido un resumen criptográfico que permite detectar duplicados; `resultado` guarda la enfermedad principal y su probabilidad; y `detalle_prediccion` guarda las tres alternativas más probables. El cuarto grupo es la trazabilidad: `registro_auditoria`, con los eventos importantes del sistema.

La relación que más conviene entender es la de un análisis. Un usuario tiene muchos análisis; cada análisis tiene una imagen, se hizo con un modelo y, cuando termina, tiene un resultado con hasta tres detalles de predicción, cada uno apuntando a una enfermedad del catálogo. Esta estructura permite responder preguntas que el historial del teléfono no puede: qué enfermedades se detectan más en una región, qué modelo generó cada resultado o cuántos análisis fueron rechazados.

## Contraseñas que no se pueden leer

La primera regla de cualquier sistema con cuentas es que la contraseña de un usuario nunca se guarda tal como la escribió. Si la base de datos se filtrara, un atacante obtendría las contraseñas de todos, y como muchas personas repiten contraseñas, el daño llegaría a otros servicios.

El Backend guarda, en lugar de la contraseña, un hash calculado con bcrypt. Un hash es el resultado de una función que transforma la contraseña en una cadena de caracteres de la cual no se puede reconstruir el original. Al iniciar sesión, el Backend calcula el hash de lo que la persona escribió y lo compara con el guardado. Bcrypt tiene además dos propiedades que lo hacen adecuado para contraseñas: agrega un valor aleatorio distinto a cada hash, de modo que dos personas con la misma contraseña tienen hashes distintos, y es deliberadamente lento, lo que encarece los intentos de adivinar contraseñas por fuerza bruta.

El Backend complementa esta protección con un bloqueo temporal. Si una cuenta acumula cinco intentos fallidos de inicio de sesión en quince minutos, queda bloqueada durante un tiempo, y cada intento queda registrado en la auditoría.

## Dos tokens y por qué

Después de iniciar sesión, la App no vuelve a enviar la contraseña en cada petición. En su lugar recibe dos tokens, y entender por qué son dos es una de las ideas más importantes de esta lección.

![Ciclo de vida de los tokens de sesión](assets/diagramas/p3-backend-tokens.svg)

El access token es una credencial de vida corta, de quince minutos, que la App adjunta a cada petición en el encabezado `Authorization`. Es un JWT, un formato que contiene el identificador del usuario y la fecha de expiración, firmado por el Backend. Gracias a la firma, el Backend puede verificar el token sin consultar la base de datos: si la firma es válida y no ha expirado, la petición viene de ese usuario.

El refresh token es una credencial de vida larga, de varios días, que solo sirve para pedir un nuevo access token cuando el anterior expira. No es un JWT sino un valor aleatorio, y el Backend guarda en la tabla `token_sesion` únicamente su hash, igual que con las contraseñas.

La combinación resuelve un dilema. Si solo existiera un token de vida larga, robarlo daría acceso por días y no habría forma de revocarlo sin consultar la base de datos en cada petición. Si solo existiera uno de vida corta, la persona tendría que iniciar sesión cada quince minutos. Con dos tokens, el que viaja en cada petición expira rápido, y el que permite renovar se puede revocar: al cerrar sesión, el Backend lo marca como revocado y deja de aceptarlo.

```dart lib/services/backend.dart
final r = await _enviar(() => llamada(actual.accessToken));
if (r.statusCode != 401) return r;
final renovada = await _renovar(actual);
return _enviar(() => llamada(renovada.accessToken));
```

El fragmento muestra cómo la App aplica este esquema. Hace la petición con el access token; si el Backend responde 401, que significa no autorizado, pide un token nuevo con el refresh token y repite la petición una sola vez. Si la renovación también falla, la sesión expiró de verdad y la App le pide a la persona que vuelva a iniciar sesión.

:::warning
La App guarda los tokens en el almacenamiento privado de la aplicación, que otras apps no pueden leer, pero sin cifrado adicional. Para una versión de producción convendría usar el almacenamiento seguro del sistema operativo. Reconocerlo en la defensa demuestra que conoces el límite.
:::

## La auditoría

La última responsabilidad del Backend es dejar un rastro de lo que ocurre. La tabla `registro_auditoria` guarda eventos como inicios de sesión exitosos y fallidos, cuentas bloqueadas, análisis creados y análisis enviados, con la fecha, el usuario cuando existe y la dirección IP de origen.

La auditoría sirve para tres cosas. Permite investigar un incidente, por ejemplo una serie de intentos de acceso a una cuenta. Permite cumplir obligaciones legales de trazabilidad sobre datos personales, tema que retomaremos en la lección 17. Y permite entender el uso real del sistema sin mirar el contenido de los análisis.

:::autoevaluacion
? ¿Qué tablas participan en un análisis y cómo se relacionan?
= `analisis` registra la solicitud del usuario; `imagen` describe la foto; `resultado` guarda la enfermedad principal y su probabilidad; `detalle_prediccion` guarda las tres alternativas, cada una apuntando a una `enfermedad`; además se registra el `modelo_ia` usado. → #un-modelo-de-datos-en-once-tablas
? ¿Por qué bcrypt es adecuado para contraseñas?
= Porque produce un hash del que no se puede recuperar la contraseña, agrega un valor aleatorio a cada hash y es deliberadamente lento, lo que encarece la fuerza bruta. → #contrasenas-que-no-se-pueden-leer
? ¿Por qué el sistema usa dos tokens en lugar de uno?
= El access token, de vida corta, viaja en cada petición y limita el daño si se roba; el refresh token, de vida larga, permite renovar sin pedir la contraseña y se puede revocar al cerrar sesión. → #dos-tokens-y-por-que
? ¿Qué hace la App cuando una petición recibe un 401?
= Pide un nuevo access token con el refresh token y repite la petición una vez; si la renovación falla, cierra la sesión y pide iniciar sesión de nuevo. → #dos-tokens-y-por-que
:::

:::comision
? ¿Cómo protegen las contraseñas y las sesiones de los usuarios?
Las contraseñas se guardan como hash bcrypt, con un valor aleatorio por usuario y un costo de cálculo alto, de modo que una filtración de la base de datos no revela las contraseñas. Después de cinco intentos fallidos en quince minutos, la cuenta se bloquea temporalmente. Las sesiones usan dos tokens: un access token firmado de quince minutos que viaja en cada petición, y un refresh token de varios días, guardado solo como hash en la base de datos y revocable al cerrar sesión. Todo inicio de sesión, exitoso o fallido, queda en la auditoría.

Como mejora pendiente, la app debería guardar los tokens en el almacenamiento seguro del sistema operativo.
! Decir que las contraseñas "están encriptadas": un hash no se puede desencriptar, y esa es justamente la idea.
:::

## Para profundizar

- `cropeye-api/app/models/models.py`: las once tablas.
- `cropeye-api/app/core/security.py`: el hash de contraseñas y los tokens.
- `cropeye-api/app/routers/auth.py`: registro, inicio de sesión, renovación y cierre de sesión.
- `cropeye-app/lib/services/backend.dart`: cómo la App guarda y renueva la sesión.
