import { TourStep } from "../typesTour";

export const getMemoriaTour = (): TourStep[] => [
  /* ===================== 1. BIENVENIDA ===================== */
  {
    type: "info",
    description:
      "👋 ¡Hola! Bienvenido al **Simulador de Memoria RAM**. Aquí vas a ver cómo se reparten en memoria las **variables, arrays y objetos** de Java: **stack**, **heap** y los bytes reales de la **RAM**. Vamos a recorrerlo paso a paso. 🧠",
  },

  /* ===================== 2. VISTA GENERAL ===================== */
  {
    id: "structure-title",
    type: "element",
    description:
      "🔭 Esta es la vista principal del simulador. Debajo del título encontrarás tres áreas clave: **STACK**, **HEAP** y la combinación de **RAM física + RAM · Índice**, además de la consola y el historial.",
  },

  /* ===================== 3. STACK VIEW ===================== */
  {
    id: "panelStack",
    type: "element",
    description:
      "📚 Este panel muestra el **STACK**. Cada tarjeta representa un **frame de activación** (una llamada a método) con sus **variables locales**. Los **primitivos** viven aquí; las **referencias** son punteros lógicos que apuntan al heap.",
  },

  /* ===================== 4. HEAP VIEW ===================== */
  {
    id: "panelHeap",
    type: "element",
    description:
      "🏗️ Este es el **HEAP**. Aquí se almacenan los **objetos, arrays y strings**. Cada tarjeta muestra su **dirección base**, su tipo y la estructura interna (campos o elementos).",
  },

  /* ===================== 5. RAM FÍSICA (SIMM / DIMM) ===================== */
  {
    id: "panelRamView",
    type: "element",
    description:
      "💾 Este módulo representa un **módulo de RAM físico**. Cada cuadrito es un **byte real**. Los colores indican si el byte pertenece a un **header**, a **datos primitivos**, a **strings**, **arrays** u **objetos**.",
  },
  {
    id: "panelRamView",
    type: "element",
    description:
      "ℹ️ En la parte superior verás la **dirección base**, el **uso de memoria** y una **leyenda de colores**. Si pasas el cursor sobre un byte, puedes ver su dirección, su valor y a qué estructura pertenece.",
  },

  /* ===================== 6. RAM · ÍNDICE ===================== */
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "📖 Aquí tienes el panel **RAM · Índice**. Resume el contenido de la memoria en forma de **tarjetas legibles**: referencias del stack, headers del heap y bloques de datos.",
  },
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "🧷 Cada tarjeta del índice está conectada con uno o varios bytes de la RAM física. Al seleccionarla, el simulador resalta el **rango de bytes** correspondiente en el módulo de memoria.",
  },

  /* ===================== 7. PESTAÑAS DEL ÍNDICE ===================== */
  {
    id: "tabsRamIndex",
    type: "element",
    description:
      "🔎 Usa estas pestañas para elegir qué quieres explorar dentro del índice: **STACK**, **HEADERS** del heap o **DATA** (bloques de datos de objetos, arrays y strings).",
  },
  {
    id: "tabRamStack",
    type: "element",
    description:
      "📌 En la pestaña **STACK** verás las entradas del índice relacionadas con **variables y referencias** que viven en el stack.",
  },
  {
    id: "tabRamHeaders",
    type: "element",
    description:
      "📦 En **HEADERS** se listan las **cabeceras** de objetos, arrays y strings en el heap: tipo, tamaño y otros metadatos.",
  },
  {
    id: "tabRamData",
    type: "element",
    description:
      "🧬 En **DATA** aparecen los **bloques de datos**: el contenido real de arrays, strings y objetos compactados.",
  },
  {
    id: "tabRamData",
    type: "action",
  },
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "🎯 Prueba a seleccionar diferentes tarjetas del índice. Verás cómo se **iluminan los bytes correspondientes en la RAM**, conectando la vista lógica (variables, arrays, objetos) con la vista física (bytes).",
  },

  /* ===================== 8. LOGS / HISTORIAL ===================== */
  {
    id: "panelLogs",
    type: "element",
    description:
      "🛰️ En este panel puedes ver el **historial de acciones y mensajes**: comandos ejecutados, errores y explicaciones generadas por el simulador.",
  },

  /* ===================== 9. BOTÓN LIMPIAR / REINICIAR ===================== */
  {
    id: "limpiar",
    type: "element",
    description:
      "🧹 Este botón limpia **toda la memoria simulada**: stack, heap, RAM y el índice vuelven a un estado inicial. Es como reiniciar la máquina sin cerrar el simulador.",
  },

  /* ===================== 10. CONSOLA: INTRODUCCIÓN ===================== */
  {
    id: "consola",
    type: "element",
    description:
      "🧠 La **consola** es tu puente entre el código y la memoria. Aquí puedes escribir comandos parecidos a Java para **declarar variables**, crear **arrays**, **objetos**, y ejecutar operaciones sobre ellos.",
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      "⌨️ En este input escribes tus comandos. El simulador entiende declaraciones, asignaciones y algunas operaciones especiales (como el comando `clear`).",
  },

  /* ===================== 11. EJEMPLO 1: PRIMITIVO EN EL STACK ===================== */
  {
    id: "inputConsola",
    type: "write",
    text: "int a = 10;",
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      "👣 Empezamos con algo sencillo: un **primitivo**. El comando `int a = 10;` declara una variable `a` de tipo `int` y la inicializa con el valor 10.",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "panelStack",
    type: "element",
    description:
      "📍 En el **STACK** verás ahora la variable `a`. Los primitivos se guardan **directamente** en el stack: el slot de `a` tiene el valor 10 (aunque internamente se guarda como bytes).",
  },
  {
    id: "panelRamView",
    type: "element",
    description:
      "🔬 En la **RAM física** se han reservado algunos bytes para `a`. Si exploras el índice y la RAM, verás que hay un bloque de bytes marcado como dato primitivo.",
  },
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "📑 En **RAM · Índice** aparece una entrada asociada a `a`. Al seleccionarla, la RAM resalta los bytes concretos que representan ese `int`.",
  },

  /* ===================== 12. EJEMPLO 2: ARRAY x ===================== */
  {
    id: "inputConsola",
    type: "write",
    text: "int[] x = new int[]{1,2,3};",
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      "🚀 Ahora vamos con un **array**. El comando `int[] x = new int[]{1,2,3};` crea un arreglo de tres enteros y una referencia `x` que apunta a ese arreglo.",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "panelStack",
    type: "element",
    description:
      "📌 En el **STACK** aparece `x` como una **referencia**: no guarda los 1,2,3 directamente, sino una **dirección** que apunta al header del array en el heap.",
  },
  {
    id: "panelHeap",
    type: "element",
    description:
      "🧱 En el **HEAP** verás una tarjeta que representa el array: su **header** indica el tamaño (`length = 3`) y el tipo de elementos (`int`), seguida de los datos 1, 2 y 3.",
  },
  {
    id: "panelRamView",
    type: "element",
    description:
      "🧬 En la **RAM física** puedes localizar el bloque donde viven esos 3 enteros. Están en una zona contigua de bytes, marcados como datos de array.",
  },
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "📖 En **RAM · Índice**, verás al menos dos tarjetas relacionadas: una para el **header del array** y otra para el **bloque de datos** (1, 2, 3). Al seleccionarlas, la RAM resalta los bytes correspondientes.",
  },

  /* ===================== 13. EJEMPLO 3: ARRAY y ===================== */
  {
    id: "inputConsola",
    type: "write",
    text: "int[] y = new int[]{4,5,6};",
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      "🔁 Creamos otro array: `int[] y = new int[]{4,5,6};`. Así podrás comparar en memoria dos arreglos distintos, cada uno con su propio header y su propio bloque de datos.",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "panelStack",
    type: "element",
    description:
      "📍 En el **STACK** aparece ahora `y`, otra referencia a un array distinto. `x` y `y` apuntan a estructuras separadas en el heap.",
  },
  {
    id: "panelHeap",
    type: "element",
    description:
      "🧊 En el **HEAP** verás **dos arrays**: uno para `x` (1,2,3) y otro para `y` (4,5,6). Cada uno con su header y sus datos.",
  },
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "🧭 En **RAM · Índice** podrás distinguir las tarjetas correspondientes a `x` y `y`. Selecciona cada una para ver qué bytes pertenecen a cada array.",
  },

  /* ===================== 14. DEFINICIÓN DE TIPO: Persona ===================== */
  {
    id: "inputConsola",
    type: "write",
    text: "class Persona(int id, String nombre);",
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      "🏷️ Ahora definimos un **tipo de objeto**. El comando `class Persona(int id, String nombre);` registra un tipo `Persona` con dos campos: un `int` y un `String`.",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "panelLogs",
    type: "element",
    description:
      "ℹ️ La definición de tipo normalmente **no reserva memoria** en stack ni heap. Sólo registra el esquema para que luego puedas crear instancias de `Persona`.",
  },

  /* ===================== 15. EJEMPLO 4: Objeto Persona p ===================== */
  {
    id: "inputConsola",
    type: "write",
    text: 'Persona p = new Persona(7, "Ana");',
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      '👤 Ahora creamos una instancia: `Persona p = new Persona(7, "Ana");`. Esto crea un objeto con `id = 7` y `nombre = "Ana"` y una referencia `p` que apunta a ese objeto.',
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "panelStack",
    type: "element",
    description:
      "📌 En el **STACK** aparece `p` como referencia. Igual que con los arrays, `p` no guarda directamente el objeto, sino la **dirección** del header del objeto en el heap.",
  },
  {
    id: "panelHeap",
    type: "element",
    description:
      "🏠 En el **HEAP** verás una tarjeta que representa el objeto `Persona`. Dentro se muestran los campos `id` y `nombre`. El `String` suele estar a su vez almacenado como estructura aparte en el heap.",
  },
  {
    id: "panelRamIndex",
    type: "element",
    description:
      "📐 En **RAM · Índice** el objeto `Persona` aparece con al menos dos niveles: el **header del objeto** y sus **datos compactados** (incluyendo un puntero hacia el string \"Ana\").",
  },
  {
    id: "panelRamView",
    type: "element",
    description:
      "🧫 En la **RAM física** puedes rastrear el objeto completo: bytes para el header, bytes para el campo `id`, un puntero (o bytes) para `nombre` y, en otra zona, los bytes que componen el texto \"Ana\".",
  },

  /* ===================== 16. AYUDA DE COMANDOS ===================== */
  {
    id: "comandos",
    type: "element",
    description:
      "📚 En esta sección encontrarás la lista de **comandos disponibles**, cada uno con su descripción y ejemplo. Úsalo como referencia para seguir experimentando con primitivos, arrays y objetos.",
  },

  /* ===================== 17. COMANDO clear ===================== */
  {
    id: "inputConsola",
    type: "write",
    text: "clear",
  },
  {
    id: "divInputConsola",
    type: "element",
    description:
      "🧨 El comando `clear` borra todo el contenido de la simulación: **stack**, **heap** y RAM vuelven a un estado casi vacío, conservando sólo la zona protegida y el frame global.",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "panelStack",
    type: "element",
    description:
      "🧼 Tras `clear`, el **STACK** vuelve a estar prácticamente vacío (sólo queda el frame global sin variables).",
  },
  {
    id: "panelHeap",
    type: "element",
    description:
      "🧼 El **HEAP** también se reinicia: desaparecen los arrays, los objetos y los strings creados durante la sesión.",
  },
  {
    id: "panelRamView",
    type: "element",
    description:
      "🧼 La **RAM física** muestra ahora sólo las reservas mínimas internas del simulador (como la zona de null-guard). El resto vuelve a estar libre.",
  },

  /* ===================== 18. CIERRE ===================== */
  {
    type: "info",
    description:
      "🛠️ Ya viste cómo se crean **primitivos**, **arrays** y **objetos**, y cómo cada uno ocupa espacio en **stack**, **heap** y **RAM**. Recuerda que el índice te ayuda a conectar las tarjetas con los bytes reales.",
  },
  {
    type: "info",
    description:
      "🔄 Ahora es tu turno: prueba tus propios comandos, observa qué cambia en cada panel, rompe cosas y usa `clear` o el botón de limpiar para empezar otra vez. Así es como se entiende de verdad cómo se organiza la memoria en Java. 🚀",
  },

  /* ===================== 19. PALETA DE COMANDOS ===================== */
  {
    id: "comandos",
    type: "element",
    description:
      "⌨️ Si no sabes qué comando escribir, usa esta **paleta de ejemplos**. Cada botón te muestra la sintaxis, una descripción y un ejemplo. Puedes hacer click en **\"Probar en consola\"** para auto-llenar el comando.",
  },

  /* ===================== 20. RETOS GUIADOS ===================== */
  {
    type: "info",
    description:
      "🎯 Para practicar paso a paso, activa los **retos guiados** que aparecen encima de la paleta de comandos. Son 8 mini-retos progresivos que te llevan desde declarar un `int` hasta crear objetos complejos. ¡Intenta completarlos todos! 💪",
  },
];
