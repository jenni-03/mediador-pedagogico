import { TourType } from "../tour/CustomTour";
import { getTourSteps } from "./tourStepsSimulatorByStructure";

// types
export type TourStep = {
  id?: string;
  description?: string;
  type: "element" | "info" | "action" | "write" | "enter";
  text?: string; 
};


//Categoría: MEMORIA
export const memoriaDescriptions: TourStep[] = [
  {
    type: "info",
    description:
      "¡Bienvenido al simulador de memoria! Acá puedes aprender cómo se almacenan y funcionan las variables, arrays y objetos en Java y la RAM.",
  },
  {
    id: "buscador",
    description:
      "Puedes buscar una dirección de memoria específica y ver en qué segmento está y qué contiene.",
    type: "element",
  },
  {
    id: "casosPrueba",
    description:
      "Desde aquí puedes gestionar y ejecutar varios comandos de prueba de forma automatizada. Ideal para simular múltiples operaciones en la memoria.",
    type: "element",
  },
  {
    id: "casosPrueba",
    type: "action",
  },
  {
    id: "inputCasos",
    description:
      "Escribe aquí el comando que deseas añadir como caso de prueba. Puedes usar cualquier comando válido de la consola.",
    type: "element",
  },
  {
    id: "botonAñadirCasos",
    description:
      "Una vez escrito el comando, haz clic en este botón para añadirlo a la lista de pruebas que vas a ejecutar.",
    type: "element",
  },
  {
    id: "botonCargarPruebas",
    description:
      "Este botón carga un conjunto de comandos de prueba predefinidos para que no tengas que escribirlos uno por uno. Lo usaremos en este tour.",
    type: "element",
  },
  {
    id: "botonCargarPruebas",
    type: "action",
  },
  {
    id: "listaComandos",
    description:
      "Aquí se muestran todos los comandos añadidos. Puedes editarlos usando el ícono de lápiz ✏️ o eliminarlos con el ícono ❌.",
    type: "element",
  },
  {
    id: "botonSeleccionarPruebas",
    description:
      "Puedes seleccionar manualmente los comandos que deseas ejecutar, o simplemente hacer clic aquí para seleccionar toda la lista de comandos de forma rápida.",
    type: "element",
  },
  {
    id: "botonSeleccionarPruebas",
    type: "action",
  },
  {
    id: "botonEjecutarPruebas",
    description:
      "Perfecto. Ya que tienes los comandos seleccionados, haz clic aquí para ejecutarlos en orden y ver los efectos en la memoria.",
    type: "element",
  },
  {
    id: "botonEjecutarPruebas",
    type: "action",
  },
  {
    id: "resultadosComandos",
    description:
      "Aquí verás el resultado de cada comando ejecutado, junto con un mensaje que indica lo que ocurrió. Si el mensaje aparece en verde, todo salió bien. Si está en rojo, hubo un error que debes revisar.",
    type: "element",
  },
  {
    id: "cerrarModalPruebas",
    type: "action",
  },
  {
    id: "visualizacionVariables",
    description:
      "Aquí puedes visualizar el segmento actual de la memoria. Cada tarjeta representa una variable almacenada. ¡Es increíble cómo todo cobra vida, verdad?",
    type: "element",
  },
  {
    type: "info",
    description:
      "El ícono de engranaje te permite cambiar el tipo de dato (también conocido como *casting* en Java), por ejemplo: de `int` a `long`. En la esquina superior izquierda verás su dirección de memoria, en la esquina superior derecha su tamaño en bytes, y el ícono de X morado sirve para eliminarla de la memoria.",
  },
  {
    id: "segment-buttons",
    description:
      "Usa estos botones para visualizar cada segmento de memoria: primitivos, arrays y objetos. Así entenderás cómo se distribuye la RAM.",
    type: "element",
  },
  {
    id: "botonArray",
    description:
      "Ahora vamos a explorar el segmento dedicado a los arrays. Haz clic en este botón para seleccionarlo.",
    type: "element",
  },
  {
    id: "botonArray",
    type: "action",
  },
  {
    id: "visualizacionVariables",
    description:
      "¡Perfecto! Al seleccionar el botón de arrays, ahora puedes ver todos los arrays almacenados en este segmento de memoria. Cada tarjeta representa un array con su tipo, tamaño y dirección.",
    type: "element",
  },
  {
    id: "limpiar",
    description:
      "Usa este botón para limpiar completamente toda la memoria, incluyendo objetos, arrays, variables y sus registros. Vamos a limpiar para dejarla como estaba desde el inicio del tour",
    type: "element",
  },
  {
    id: "limpiar",
    type: "action",
  },
  {
    id: "consola",
    description:
      "En la consola puedes insertar variables, cambiar tipos, actualizar valores, consultar tamaños, y mucho más usando comandos de texto.",
    type: "element",
  },
  {
    id: "consola",
    type: "action",
  },
  {
    id: "inputConsola",
    text:
      "insert int xd = 243535;",
    type: "write",
  },
  {
    type: "info",
    description:
      "Este comando sirve para insertar una variable de tipo entera en la memoria, o cualquier tipo de variable.",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "comandos",
    description:
      "Haz clic aquí para ver la lista de comandos que puedes usar, con ejemplos y su sintaxis.",
    type: "element",
  },
  {
    type: "info",
    description:
      "Recuerda: puedes limpiar la memoria, modificar valores, insertar arrays u objetos, borrar variables o incluso convertir sus tipos si es válido.",
  },
  {
    type: "info",
    description:
      "¡Todo lo que haces se refleja en tiempo real! Aprovecha para entender cómo funciona la memoria de forma visual y práctica.",
  },
];

//Categoría: ESTRUCTURAS
export const estructurasDescriptions: TourStep[] = [
  {
    type: "info",
    description: "Aquí aprenderás cómo funciona una estructura de árbol.",
  },
  {
    id: "tree-visualizer",
    description: "Visualiza cómo se estructura el árbol.",
    type: "element",
  },
  {
    id: "insert-node",
    description: "Inserta un nuevo nodo en la estructura.",
    type: "element",
  },
  {
    id: "delete-node",
    description: "Elimina un nodo existente.",
    type: "element",
  },
  {
    type: "info",
    description: "¡Muy bien! Ya sabes lo básico para comenzar.",
  },
];

// Función para obtener por tipo
export const getTourDescriptions = (tipo: TourType): TourStep[] => {
  if (tipo === "memoria") {
    return memoriaDescriptions;
  } else {
    return getTourSteps(tipo);
  }
};
