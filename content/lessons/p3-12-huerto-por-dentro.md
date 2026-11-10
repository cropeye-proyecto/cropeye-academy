# Las funciones del huerto por dentro

En la lección 5 explicamos para qué existen las funciones de huerto. Ahora miramos cómo están construidas. No todas tienen la misma complejidad técnica, pero comparten tres decisiones que vale la pena entender porque se repiten en todo el proyecto: separar el contenido agronómico del código, mostrar siempre la fuente de los datos y aplicar reglas simples y explícitas en lugar de cálculos opacos. Estudiaremos esas decisiones a través de tres funciones: las fichas de manejo, la calculadora de diseño y el aviso de clima.

:::objetivos
- explicar por qué el contenido agronómico vive en archivos JSON y no en el código;
- describir cómo se vincula una clase del modelo con su ficha de manejo;
- explicar el cálculo de la calculadora de diseño y la decisión de usar el máximo del rango;
- describir cómo funciona el aviso de clima y cómo protege la ubicación del usuario.
:::

## El contenido fuera del código

Las fichas de manejo y la tabla de distancias no están escritas dentro del código Dart de la app. Viven en dos archivos de datos, `fichas.json` y `distancias.json`, dentro de la carpeta `assets/datos/` del repositorio, y la app los lee al momento de mostrarlos.

Esta separación tiene una razón práctica y una de principio. La práctica es que el contenido agronómico lo produce la investigación del equipo, no quien programa. Si una ficha tiene un error o aparece una fuente mejor, se corrige el archivo JSON sin tocar la lógica de la app. La razón de principio es que obliga a que cada dato tenga su fuente: el archivo define primero una lista de publicaciones, con su título y su enlace, y cada ficha o cada fila de distancias apunta a una de ellas. Es imposible agregar un dato sin decir de dónde viene.

```json assets/datos/fichas.json
"tomate_tizon_temprano": {
  "nombre": "Tizón temprano",
  "cientifico": "Alternaria solani",
  "sintomas": "Manchas redondas café a negras ...",
  "manejo": ["Rota con cultivos que no sean solanáceas.", "..."],
  "fuente": "inia_376",
  "paginas": "pp. 35–36"
}
```

El archivo también impone una restricción que se verifica con pruebas automáticas: ninguna ficha puede nombrar productos comerciales ni dosis. Si alguien agregara por error el nombre de un fungicida, una prueba fallaría antes de que el cambio llegara a la app. Cuando hace falta un producto, la ficha remite a los autorizados por el SAG para ese cultivo, que es la autoridad en Chile.

## De la clase del modelo a la ficha

El modelo de IA responde con identificadores internos, como `Tomato___Early_blight`, que no coinciden con los nombres de las fichas. El archivo de fichas incluye por eso una tabla de correspondencia que vincula cada clase del modelo con su ficha. Cuando la app muestra un resultado confiable, busca la clase en esa tabla y, si encuentra una ficha, la presenta junto con su fuente.

Esta correspondencia tiene dos casos especiales. Si la hoja está sana, no hay enfermedad que mostrar, y la app presenta en su lugar los cuidados básicos del cultivo. Si una clase del modelo no tiene ficha con fuente chilena verificada, la ficha existe pero lleva una marca que la app muestra en color de advertencia: "sin fuente verificada". Preferimos mostrar el límite antes que inventar una fuente.

## La calculadora de diseño

La calculadora responde cuántas plantas caben en un espacio. Para una cama rectangular, el cálculo supone que cada planta ocupa un rectángulo cuyo largo es la distancia entre plantas y cuyo ancho es la distancia entre hileras. El número de plantas por hilera es el largo de la cama dividido por la distancia entre plantas; el número de hileras es el ancho dividido por la distancia entre hileras, con un mínimo de una hilera aunque la cama sea angosta.

Las fuentes suelen entregar rangos, por ejemplo treinta a cuarenta centímetros entre plantas de tomate. La calculadora usa siempre el máximo del rango y lo muestra en pantalla junto con la fuente. La razón es agronómica y conecta con la Parte 1: plantar demasiado junto reduce la ventilación y favorece la humedad que necesitan muchas enfermedades, así que ante la duda conviene dejar más espacio.

Para una maceta, el cálculo cambia de naturaleza. Lo que limita no es la distancia sino el volumen de tierra. La app calcula el volumen de la maceta a partir de su diámetro y su profundidad y lo divide por el mínimo de litros por planta. Para algunos cultivos, como el maíz, no se encontró una fuente con ese mínimo, y la app lo dice en lugar de inventarlo.

:::note
Algunas filas de la tabla, como las distancias del manzano y los litros de maceta, provienen de fuentes extranjeras porque no se encontró una fuente chilena. La app las marca explícitamente como "fuente extranjera".
:::

## El aviso de clima

El aviso de clima es la única función de huerto que consulta un servicio externo. Usa Open-Meteo, un servicio gratuito de pronóstico que no requiere clave y cuyos datos se distribuyen con una licencia que exige citarlos, cosa que la app hace en cada aviso.

El primer paso es saber dónde está el huerto. En lugar de pedir el permiso de ubicación del teléfono, la app le pide a la persona que escriba su comuna y la busca con el servicio de geocodificación de Open-Meteo, restringido a Chile. Antes de hacerlo, explica qué se guardará y para qué. Las coordenadas se guardan redondeadas a dos decimales, lo que equivale a una precisión de alrededor de un kilómetro: suficiente para el pronóstico e insuficiente para ubicar una casa.

Cada vez que se abre la app, Inicio pide el pronóstico por hora de los próximos días y aplica dos reglas con fuente. La de helada avisa si la temperatura mínima de las próximas veinticuatro horas baja de cero grados. La de tizón tardío avisa si en las próximas cuarenta y ocho horas hay al menos doce horas seguidas con humedad relativa igual o superior a 90 % y temperatura entre 7 y 25 grados, las condiciones que el manual de papa del INIA describe como favorables para la infección.

```dart lib/services/clima.dart
final favorable = h.humedad >= humedadTizon &&
    h.temperatura >= minimaTizon &&
    h.temperatura <= maximaTizon;
seguidas = favorable ? seguidas + 1 : 0;
if (seguidas > maximo) maximo = seguidas;
```

El fragmento muestra lo sencilla que es la regla: un contador de horas favorables consecutivas que se reinicia cuando una hora no cumple las condiciones. No hay un modelo predictivo ni un cálculo opaco, y eso es deliberado. Una regla simple, con fuente, se puede explicar, verificar y corregir; un modelo de riesgo propio requeriría datos de validación que el proyecto no tiene.

:::warning
El aviso de clima no reemplaza un sistema de alerta profesional. El INIA mantiene un sistema de alerta de tizón tardío con estaciones meteorológicas propias, más preciso que una regla aplicada sobre un pronóstico general.
:::

:::autoevaluacion
? ¿Qué dos ventajas tiene guardar las fichas en un archivo JSON?
= Se pueden corregir sin tocar el código, y la estructura obliga a que cada dato apunte a una fuente con título y enlace. → #el-contenido-fuera-del-codigo
? ¿Qué muestra la app si el resultado es una hoja sana?
= Los cuidados básicos del cultivo (sol, riego) con su fuente, en lugar de una ficha de enfermedad. → #de-la-clase-del-modelo-a-la-ficha
? ¿Por qué la calculadora usa el máximo del rango de distancias?
= Porque dejar más espacio mejora la ventilación y reduce la humedad que favorece las enfermedades. → #la-calculadora-de-diseno
? ¿Cómo protege el aviso de clima la ubicación del usuario?
= No usa el GPS: la persona escribe su comuna, se explica qué se guarda, y las coordenadas se guardan redondeadas a unos 1 km. → #el-aviso-de-clima
:::

:::comision
? ¿Por qué el aviso de tizón usa una regla tan simple en lugar de un modelo de predicción?
Porque una regla simple con fuente se puede explicar, verificar y corregir. La regla aplica las condiciones que el INIA describe para la infección del tizón tardío: humedad muy alta durante horas seguidas con temperatura templada. Construir un modelo de riesgo propio requeriría datos históricos de brotes y clima para validarlo, que no tenemos, y un modelo sin validar sería menos confiable que la regla. Además, el aviso no pretende reemplazar el sistema de alerta del INIA, que usa estaciones meteorológicas propias.
! Presentar el aviso como "predicción con inteligencia artificial".
:::

## Para profundizar

- `cropeye-app/assets/datos/fichas.json` y `distancias.json`: el contenido con sus fuentes.
- `cropeye-app/lib/data/fichas.dart` y `distancias.dart`: la lectura y los cálculos.
- `cropeye-app/lib/services/clima.dart`: las reglas de helada y tizón.
- `cropeye-app/test/fichas_test.dart`: la prueba que impide nombrar productos o dosis.
