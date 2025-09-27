import { TourStep } from "../typesTour";

export const getMemoriaTour = (): TourStep[] => [
  {
    type: "info",
    description:
      "👋 ¡Hola! Bienvenido al **Simulador de Memoria RAM**. Aquí aprenderás de forma visual y práctica cómo se almacenan las **variables, arrays y objetos** en Java. ¡Prepárate para ver la memoria como nunca antes! 🧠",
  },
  {
    id: "casosPrueba",
    description:
      "📦 Desde este panel podrás **crear, editar y ejecutar comandos de prueba**. Ideal para simular operaciones reales en la memoria y ver cómo cambian los datos.",
    type: "element",
  },
  {
    id: "casosPrueba",
    type: "action",
  },
  {
    id: "inputCasos",
    description:
      "✍️ Aquí escribes tu comando. Es como una pequeña consola donde defines variables, arrays u objetos tal como lo harías en Java.",
    type: "element",
  },
  {
    id: "inputCasos",
    text: "int arrayTest[] = {23,12,43,23};",
    type: "write",
  },
  {
    id: "inputCasos",
    description:
      "🎯 Ya escribimos un comando para crear un **array de enteros**. Esto se convertirá en una nueva estructura en memoria.",
    type: "element",
  },
  {
    id: "botonAñadirCasos",
    description:
      "➕ Presiona este botón para **añadir el comando a la lista** de pruebas. Así podrás ejecutarlo junto con otros comandos más adelante.",
    type: "element",
  },
  {
    id: "botonAñadirCasos",
    type: "action",
  },
  {
    id: "comandoCreado.1",
    description:
      "✅ ¡Perfecto! El comando fue añadido. Aquí puedes ver que ya hace parte de la lista de pruebas.",
    type: "element",
  },
  {
    id: "lapiz,equis",
    description:
      "✏️ Usa el **ícono de lápiz** para editar un comando. ❌ Usa el de la equis para eliminarlo si cometiste un error. ¡Todo bajo control!",
    type: "element",
  },
  {
    id: "botonCargarPruebas",
    description:
      "🚀 ¿No quieres escribir todo manualmente? Presiona este botón para **cargar comandos predefinidos** automáticamente.",
    type: "element",
  },
  {
    id: "botonCargarPruebas",
    type: "action",
  },
  {
    id: "comandoCreado.[1,2,3,4]",
    description:
      "🔁 Se añadieron múltiples comandos. Puedes hacer clic sobre ellos para **seleccionarlos** y ejecutarlos juntos.",
    type: "element",
  },
  {
    id: "botonSeleccionarPruebas",
    description:
      "☑️ Si quieres **seleccionar todos los comandos de una sola vez**, este botón es tu mejor aliado.",
    type: "element",
  },
  {
    id: "botonSeleccionarPruebas",
    type: "action",
  },
  {
    id: "botonEjecutarPruebas",
    description:
      "🧪 Ya tienes los comandos listos. ¡Es momento de ejecutarlos y ver cómo se transforman en estructuras dentro de la memoria!",
    type: "element",
  },
  {
    id: "botonEjecutarPruebas",
    type: "action",
  },
  {
    id: "resultadosComandos",
    description:
      "📋 Aquí verás el resultado de cada comando: **verde si fue exitoso** ✅ o **rojo si tuvo errores** ❌. ¡Ideal para aprender de tus intentos!",
    type: "element",
  },
  {
    id: "cerrarModalPruebas",
    type: "action",
  },
  {
    id: "visualizacionVariables",
    description:
      "🧩 Este panel muestra el **estado actual de la memoria RAM**. Cada tarjeta representa una variable u objeto almacenado.",
    type: "element",
  },
  {
    id: "divObjeto.[1,2,3]",
    description:
      "🧱 Estas tarjetas representan objetos almacenados. Observa su dirección, nombre y atributos internos.",
    type: "element",
  },
  {
    id: "engranajeObjeto.[1,2,3]",
    description:
      "⚙️ Usa este engranaje para **cambiar el tipo de dato** (casting). En Java no puedes cambiar el tipo de objetos, pero sí arrays y primitivos.",
    type: "element",
  },
  {
    id: "eliminarObjeto.[1,2,3]",
    description:
      "🗑️ Usa este botón para **eliminar objetos de la memoria**. ¡Pero cuidado! Algunas estructuras están ligadas a otras, como en POO.",
    type: "element",
  },
  {
    id: "segment-buttons",
    description:
      "🧠 Usa estos botones para **explorar diferentes segmentos** de la memoria: variables, arrays y objetos.",
    type: "element",
  },
  {
    id: "botonArray",
    description:
      "🔍 Vamos a analizar los arrays. Presiona este botón para cambiar al segmento correspondiente.",
    type: "element",
  },
  {
    id: "botonArray",
    type: "action",
  },
  {
    id: "visualizacionVariables",
    description:
      "📊 Ahora ves los **arrays activos**. Cada uno muestra su tipo, tamaño y elementos almacenados.",
    type: "element",
  },
  {
    id: "limpiar",
    description:
      "🧹 Usa este botón para **limpiar toda la memoria**. Es como reiniciar la simulación desde cero.",
    type: "element",
  },
  {
    id: "limpiar",
    type: "action",
  },
  {
    id: "consola",
    description:
      "🧠 En la **consola** puedes escribir comandos de texto para interactuar con la memoria. Es como una caja mágica donde puedes declarar, borrar, cambiar tipos y más.",
    type: "element",
  },
  {
    id: "divInputConsola",
    description:
      "⌨️ Aquí es donde vas a **escribir tus comandos**. Puedes usar instrucciones como `delete address`, `convert type`, `address of`, entre muchas otras. ¡Todo comienza escribiendo!",
    type: "element",
  },
  {
    id: "inputConsola",
    text: "int arrayTest[] = {10,20,30,40};",
    type: "write",
  },
  {
    id: "divInputConsola",
    description:
      "📥 Hemos ingresado un comando para **crear un array** llamado `arrayTest`. Ahora lo vamos a ejecutar y ver qué pasa.",
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "divInputConsola",
    description:
      "✅ ¡Listo! El comando se ejecutó **sin errores**, lo que significa que el array fue creado correctamente.",
    type: "element",
  },
  {
    id: "visualizacionVariables",
    description:
      "🧩 Ahora verás los **elementos del array** representados como tarjetas. Cada una muestra su **dirección de memoria**, **tipo de dato** y el **espacio que ocupa**.",
    type: "element",
  },
  {
    id: "comandos",
    description:
      "📚 Si necesitas ayuda, aquí tienes la lista de **comandos disponibles**, cada uno con su descripción y ejemplo. ¡Úsalo como referencia rápida!",
    type: "element",
  },
  {
    type: "info",
    description:
      "🛠️ Recuerda: puedes **modificar valores**, **eliminar variables**, **insertar arrays u objetos**, e incluso **convertir tipos** si es válido. ¡Explora sin miedo!",
  },
  {
    type: "info",
    description:
      "🔄 Todo lo que haces se **refleja en tiempo real**. Aprovecha esta herramienta para entender cómo funciona la memoria de manera **visual, interactiva y divertida**.",
  },
];
