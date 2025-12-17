import { TourStep } from "../typesTour.ts";
import { getPilaTourSteps } from "./pilaTour";
import { getColaTourSteps } from "./colaTour";
import { getColaPrioridadTour } from "./colaPrioridadTour.ts";
import { getSecuenciaTourSteps } from "./secuenciaTour";
import { getListaSimplementeEnlazadaTour } from "./listaSimplementeEnlazadaTour.ts";
import { getListaDoblementeEnlazadaTour } from "./listaDoblementeEnlazadaTour.ts";
import { getListaCircularSimplementeEnlazadaTour } from "./listaCircularSimplementeEnlazadaTour.ts";
import { getListaCircularDoblementeEnlazadaTour } from "./listaCircularDoblementeEnlazadaTour.ts";
import { getTablaHashTour } from "./tablaHashTour.ts";
import { getMemoriaTour } from "./memoriaTour.ts";
import { getArbolBinarioTour } from "./arbolBinarioTour.ts";
import { getArbolBinarioBusquedaTour } from "./arbolBinarioBusquedaTour.ts";
import { getArbolAVLTour } from "./arbolAVLTour.ts";
import { getArbolRojiNegroTour } from "./arbolRojiNegroTour.ts";
import { getArbolNarioTour } from "./arbolNarioTour.ts";
import { getArbol123Tour } from "./arbol123Tour.ts";
import { getArbolBTour } from "./arbolBTour.ts";
import { getArbolBPTour } from "./arbolBPlusTour.ts";
import { getArbolSplayTour } from "./arbolSplayTour.ts";
import { getArbolHeapTour } from "./arbolHeapTour.ts";

// Función para formatear nombres como "lista_simplemente_enlazada" → "Lista Simplemente Enlazada"
function formatStructureName(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Mapa de funciones por estructura
const tourStepLoaders: Record<string, () => TourStep[]> = {
  secuencia: getSecuenciaTourSteps,
  lista_simplemente_enlazada: getListaSimplementeEnlazadaTour,
  lista_doblemente_enlazada: getListaDoblementeEnlazadaTour,
  lista_circular_simplemente_enlazada: getListaCircularSimplementeEnlazadaTour,
  lista_circular_doblemente_enlazada: getListaCircularDoblementeEnlazadaTour,
  tabla_hash: getTablaHashTour,
  pila: getPilaTourSteps,
  cola: getColaTourSteps,
  "cola de prioridad": getColaPrioridadTour,
  arbol_binario: getArbolBinarioTour,
  arbol_binario_busqueda: getArbolBinarioBusquedaTour,
  arbol_avl: getArbolAVLTour,
  arbol_rojinegro: getArbolRojiNegroTour,
  arbol_splay: getArbolSplayTour,
  memoria: getMemoriaTour,
  arbol_nario: getArbolNarioTour,
  arbol_123: getArbol123Tour,
  arbol_b: getArbolBTour,
  arbol_b_plus: getArbolBPTour,
  arbol_heap: getArbolHeapTour,
};

// Devuelve el tour correspondiente, si existe
export const getTourByStructure = (structureType: string): TourStep[] => {
  const loader = tourStepLoaders[structureType];

  if (!loader) return [];

  // Si se trata de memoria, no incluir los pasos generales
  if (structureType === "memoria") {
    return loader(); // getMemoriaTour() ya trae todo
  }

  return getTourSteps(structureType, loader());
};

// Genera los pasos del tour incluyendo la estructura formateada
export const getTourSteps = (
  structureType: string,
  stepsFromStructure: TourStep[]
): TourStep[] => {
  const formattedName = formatStructureName(structureType);

  return [
    // 1. Introducción
    {
      type: "info",
      description: `👋 ¡Bienvenido al simulador de **${formattedName}**!
Este espacio está diseñado para ayudarte a comprender de forma visual e interactiva cómo funciona esta estructura de datos.
Prepárate para una experiencia práctica y educativa. 🚀`,
    },

    // 2. Recorrido general del simulador
    {
      type: "info",
      description: `🔎 Antes de comenzar con la estructura, conozcamos cómo usar el simulador.
En las siguientes pantallas aprenderás a identificar sus secciones principales.`,
    },
    {
      id: "structure-title",
      type: "element",
      description: `📛 Aquí se muestra el nombre de la estructura que estás simulando.
El texto dentro de "<>" representa el tipo de datos que se almacenan, como Integer.`,
    },
    {
      id: "structure-info",
      type: "element",
      description: `🧠 Esta sección presenta detalles importantes como dirección de memoria, tamaño y tipo de datos usados por la estructura.`,
    },
    {
      id: "main-canvas",
      type: "element",
      description: `🖼️ Este es el lienzo visual donde verás animaciones y representaciones gráficas de la estructura al ejecutar operaciones.`,
    },
    {
      id: "command-buttons",
      type: "element",
      description: `🎮 Aquí tienes botones de ayuda rápida. Al hacer clic, verás ejemplos y explicación de los comandos más comunes para esta estructura.`,
    },
    {
      id: "console",
      type: "element",
      description: `⌨️ Esta es la consola principal. Aquí puedes escribir los comandos para interactuar con la estructura.`,
    },
    {
      id: "console",
      type: "element",
      description: `🔁 Puedes navegar por comandos anteriores usando las flechas ↑ y ↓. Si quieres limpiar la consola, escribe \`clear\`.`,
    },
    {
      id: "execution-code",
      type: "element",
      description: `📜 Aquí aparecerá el pseudocódigo correspondiente a cada comando ejecutado. Te ayudará a relacionar la operación visual con el código real.`,
    },

    // 3. Paso a paso específico
    {
      type: "info",
      description: `✅ ¡Listo! Ahora que sabes cómo usar el simulador, vamos a estudiar el funcionamiento de la estructura **${formattedName}** paso a paso.`,
    },
    ...stepsFromStructure,

    // 4. Cierre
    {
      type: "info",
      description: `🎉 ¡Excelente trabajo! Ya conoces cómo funciona la estructura **${formattedName}** y cómo manipularla en el simulador.
Ahora puedes practicar, experimentar y dominar su uso. ¡Éxitos! 💪`,
    },
  ];
};